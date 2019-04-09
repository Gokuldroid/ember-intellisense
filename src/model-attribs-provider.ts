import * as vscode from 'vscode';
import { CompletionItemProvider } from 'vscode';
import { getFileState } from './state/file';
import { currentWorkspaceFolder } from './utils/editor';
import { getTask } from './utils/single-task';
import glob from './utils/glob';
import * as path from 'path';
import * as changeCase from 'change-case';
import { getProperties } from './utils/js-parser';
import * as _ from 'lodash';
import { getModelFiles } from './utils/dir-structure';

function canAutoComplete(leftText: string): boolean {
  return /([a-zA-Z=.]{2})$/.test(leftText);
}

class ModelAttribsProvider implements CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    let filestate = getFileState(document, position);
    let currentWord = filestate.currentWord();
    let leftText = filestate.cursorLeftText();
    if (!canAutoComplete(leftText)) {
      return;
    }

    let completionItems: vscode.CompletionItem[] = [];
    if (leftText.endsWith('=')) {

      for (const [key, _] of modelVsAttribs.entries()) {
        completionItems.push({ label: changeCase.camelCase(key), kind: vscode.CompletionItemKind.Variable });
      }
      return completionItems;
    } else if (leftText.endsWith('.')) {
      let matches = /(?<gokul>[a-zA-Z]*\.)$/.exec(leftText);
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
  let currentFolder = currentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }
  modelVsAttribs.clear();
  let modelFiles = await getModelFiles(currentFolder);
  for (const file of modelFiles) {
    let fileName = file.split('/').pop()!!.replace('.js', '');
    let properties = getProperties(file);
    modelVsAttribs.set(changeCase.camelCase(fileName), properties);
  }
  console.log(`model completion cache refreshed :: ${modelFiles.length}`);
}

const refreshModelCompletionsTask = getTask(refreshModelCompletionItems);

function registerFileWatcher(context: vscode.ExtensionContext) {
  refreshModelCompletionsTask.performTask();
  let fileSystemWatcher = vscode.workspace.createFileSystemWatcher(`${currentWorkspaceFolder()}/app/models/**/*.js`);
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