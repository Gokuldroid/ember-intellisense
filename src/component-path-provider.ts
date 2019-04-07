import { CompletionItemProvider, TextDocument, Position, CompletionItem, ExtensionContext, CompletionItemKind, languages, workspace } from "vscode";
import { getFileState } from "./state/file";
import { getCurrentWorkspaceFolder } from "./utils/editor";
import * as path from 'path';
import * as _ from 'lodash';
import { getTask } from "./utils/single-task";
import glob from "./utils/glob";
import * as fs from "fs";

let completionCache: Map<string, string[]> = new Map();

async function getTemplateFiles(folder: string): Promise<string[]> {
  //normal app templates
  let podTemplatesFolder = path.join(folder, 'app', 'components');
  let podFiles = await glob('**/*.hbs', { cwd: podTemplatesFolder });
  let templatesFolder = path.join(folder, 'app', 'templates', 'components');
  let templateFiles = await glob('**/*.hbs', { cwd: templatesFolder });

  //addon templates
  let addonPodTemplatesFolder = path.join(folder, 'addon', 'components');
  let addonPodFiles = await glob('**/*.hbs', { cwd: addonPodTemplatesFolder });
  let addonTemplatesFolder = path.join(folder, 'addon', 'templates', 'components');
  let addonTemplateFiles = await glob('**/*.hbs', { cwd: addonTemplatesFolder });
  
  let allTemplateFiles = [...podFiles, ...templateFiles, ...addonPodFiles, ...addonTemplateFiles].map((file) => {
    return file.replace('/template.hbs', '').replace('.hbs', '');
  });
  return _.uniq(allTemplateFiles);
}

async function refreshCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }
  let allTemplateFiles = await getTemplateFiles(currentFolder);
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

  let packageJson: any = JSON.parse(fs.readFileSync(path.join(currentFolder, 'package.json')).toString());
  let devDependencies = packageJson.devDependencies;
  if (_.isEmpty(devDependencies)) {
    return;
  }

  let addonTempates: string[] = [];
  for (const [key, _] of Object.entries(devDependencies)) {
    let templates = await getTemplateFiles(path.join(currentFolder!!, 'node_modules', key));
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

class ComponentPathProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    let folder = getCurrentWorkspaceFolder()!!;
    let currentWord = fileState.currentWord();
    if (fileState.matchCurrentLine("\{{2,2}[a-z]{3,6}") || fileState.matchCurrentLine("\{{2,2}\/") || fileState.matchCurrentLine("\{{2,2}\#")) {
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

