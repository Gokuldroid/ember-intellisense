import * as vscode from 'vscode';
import { CompletionItemProvider } from 'vscode';
import { getFileState } from './state/file';
import { getCurrentWorkspaceFolder } from './utils/editor';
import { getTask } from './utils/single-task';
import glob from './utils/glob';
import * as path from 'path';
import * as changeCase from 'change-case';
import { getProperties } from './utils/js-parser';
import * as _ from 'lodash';

function canAutoComplete(currentWord: string): boolean {
  return /{{[a-zA-Z]{2,6}}}/.test(currentWord) || currentWord.endsWith('.') || /=[a-zA-Z]{1,5}/.test(currentWord);
}

class ModelAttribsProvider implements CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    let filestate = getFileState(document, position);
    let currentWord = filestate.currentWord();
    if (!canAutoComplete(currentWord)) {
      return;
    }

    let completionItems: vscode.CompletionItem[] = [];
    if (currentWord.includes('=') && !currentWord.includes('.')) {

      for (const [key, _] of modelVsAttribs.entries()) {
        completionItems.push({ label: changeCase.camelCase(key), kind: vscode.CompletionItemKind.Variable });
      }
      return completionItems;
    } else if (currentWord.endsWith('.')) {
      let matches = /(?<gokul>[a-zA-Z]*\.)$/.exec(currentWord);
      if (_.isEmpty(matches)) {
        return [];
      }
      let word = matches!![0].replace('.', '');
      for (const [key, values] of modelVsAttribs.entries()) {
        if (currentWord.includes(key)) {
          completionItems.push({ label: changeCase.camelCase(key), kind: vscode.CompletionItemKind.Variable });
        }
        if (word.toLocaleLowerCase().includes(key.toLocaleLowerCase())) {
          let attribs = values.map((attribute) => {
            return { label: attribute, kind: vscode.CompletionItemKind.Variable }
          });
          completionItems = [...completionItems, ...attribs];
        }
      }
    }
    return completionItems;
  }
}

const modelVsAttribs: Map<string, string[]> = new Map();

async function refreshModelCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }
  modelVsAttribs.clear();
  let modelFolder = path.join(currentFolder, 'app', 'models');
  let modelFiles = await glob('**/*.js', { cwd: modelFolder });
  for (const file of modelFiles) {
    let fileName = file.split('/').pop()!!.replace('.js', '');
    let properties = getProperties(path.join(modelFolder, file));
    modelVsAttribs.set(changeCase.camelCase(fileName), properties);
  }
  console.log(`model completion cache refreshed :: ${modelFiles.length}`);
}

const refreshModelCompletionsTask = getTask(refreshModelCompletionItems);

function registerFileWatcher(context: vscode.ExtensionContext) {
  refreshModelCompletionsTask.performTask();
  let fileSystemWatcher = vscode.workspace.createFileSystemWatcher(`${getCurrentWorkspaceFolder()}/app/models/**/*.js`);
  fileSystemWatcher.onDidChange((filePath) => {
    console.log(`file changed :: ${filePath}`);
    refreshModelCompletionsTask.performTask();
  });
  context.subscriptions.push(fileSystemWatcher);
}

function registerModelAttribProvider(context: vscode.ExtensionContext) {
  const triggers = ['{', '=', '.'];
  const componentPathProvider = new ModelAttribsProvider();
  let completionProvider = vscode.languages.registerCompletionItemProvider([{ scheme: "file", language: "handlebars" }, { scheme: "file", language: "javascript" }], componentPathProvider, ...triggers);
  context.subscriptions.push(completionProvider);
}


export default function activate(context: vscode.ExtensionContext) {
  registerModelAttribProvider(context);
  registerFileWatcher(context);
}