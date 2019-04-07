import { CompletionItemProvider, TextDocument, Position, CompletionItem, ExtensionContext, CompletionItemKind, languages, workspace } from "vscode";
import { getFileState } from "./state/file";
import { getCurrentWorkspaceFolder } from "./utils/editor";
import * as path from 'path';
import * as _ from 'lodash';
import { getTask } from "./utils/single-task";
import { getTemplateFiles, getPackageJson } from "./utils/dir-structure";

let completionCache: Map<string, string[]> = new Map();

async function getTemplateFileNames(folder: string): Promise<string[]> {
  let templateFiles = await getTemplateFiles(folder);
  let strippedTemplateFiles = templateFiles.map((file) => {
    return file.replace('/template.hbs', '').replace('.hbs', '');
  });
  return _.uniq(strippedTemplateFiles);
}

async function refreshCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }
  let allTemplateFiles = await getTemplateFileNames(currentFolder);
  console.log(`completionCache refreshed :: ${currentFolder} , size:: ${allTemplateFiles.length}`);
  completionCache.set(currentFolder, allTemplateFiles);
}

const refreshCompletionsTask = getTask(refreshCompletionItems);

let addonsCompletionCache: Map<string, string[]> = new Map();

async function refreshAddonCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }

  let packageJson: any = getPackageJson(currentFolder);
  let devDependencies = packageJson.devDependencies;
  if (_.isEmpty(devDependencies)) {
    return;
  }

  let addonTempates: string[] = [];
  for (const [key] of Object.entries(devDependencies)) {
    let templates = await getTemplateFileNames(path.join(currentFolder!!, 'node_modules', key));
    addonTempates = [...addonTempates, ...templates];
  }
  console.log(`addon completionCache refreshed :: ${currentFolder} , size:: ${addonTempates.length}`);
  addonsCompletionCache.set(currentFolder, addonTempates);
}


function toCompletionItems(currentWord:string, folder:string): CompletionItem[]{
  let templateFiles = [...completionCache.get(folder) || refreshCompletionsTask.performTask(), ...addonsCompletionCache.get(folder) || []];
  if(currentWord.startsWith("{{#")){
    return templateFiles.map((templateFile):CompletionItem => {
      return {
        label: `#${templateFile}`,
        kind: CompletionItemKind.Class,
        insertText: `#${templateFile}\}\}\n\{\{/${templateFile}`
      };
    });
  }else if(currentWord.startsWith('{{')){
    return templateFiles.map((templateFile):CompletionItem => {
      return {
        label: templateFile,
        kind: CompletionItemKind.Class,
      };
    });
  }
  return [];
}

function canComplete(currentWord: string) : boolean{
  return /(^(({{)|({{\/)|({{#))[a-z\/]{3,10}\}{0,2})$/.test(currentWord);
}

class ComponentPathProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    let folder = getCurrentWorkspaceFolder()!!;
    let currentWord = fileState.currentWord();
    if (canComplete(currentWord)) {
      return toCompletionItems(currentWord, folder);
    }
    return [];
  }
}

const refreshAddonCompletionsTask = getTask(refreshAddonCompletionItems);



function registerFileWatcher(context: ExtensionContext) {
  refreshCompletionsTask.performTask();
  refreshAddonCompletionsTask.performTask();
  let fileSystemWatcher = workspace.createFileSystemWatcher(`${getCurrentWorkspaceFolder()}/**/*.hbs`);
  fileSystemWatcher.onDidChange((filePath) => {
    console.log(`file changed :: ${filePath}`);
    refreshCompletionsTask.performTask();
  });
  context.subscriptions.push(fileSystemWatcher);
}

function registerHbsProvider(context: ExtensionContext) {
  const triggers = ['{', '/','#'];
  const componentPathProvider = new ComponentPathProvider();
  let completionProvider = languages.registerCompletionItemProvider({ scheme: "file", language: "handlebars" }, componentPathProvider, ...triggers);
  context.subscriptions.push(completionProvider);
}

export default function activate(context: ExtensionContext) {
  registerFileWatcher(context);
  registerHbsProvider(context);
}

