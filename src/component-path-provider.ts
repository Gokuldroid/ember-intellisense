import { CompletionItemProvider, TextDocument, Position, CompletionItem, ExtensionContext, CompletionItemKind, languages, workspace } from "vscode";
import * as globObject from 'glob';
import { getFileState } from "./state/file";
import * as Queue from "queue-promise";
import { getCurrentWorkspaceFolder } from "./utils/editor";
import * as path from 'path';
import * as _ from 'lodash';
import { getTask } from "./utils/single-task";


const glob = function (pattern: string, options: Object) {
  return new Promise<string[]>((resolve, reject) => {
    globObject(pattern, options, (err: any, files: string[]) => {
      err === null ? resolve(files) : reject(err)
    });
  });
}

const toCompletionItem = function (text: string): CompletionItem {
  return new CompletionItem(
    text,
    CompletionItemKind.Module
  );
};

class ComponentPathProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    let folder = getCurrentWorkspaceFolder()!!;
    if (fileState.matchCurrentLine("\{{2,2}[a-z]{3,6}") || fileState.matchCurrentLine("\{{2,2}\/")) {
      return cache.get(folder) || (queue.refreshCache());
    }
    return [];
  }
}

let cache: Map<string, CompletionItem[]> = new Map();

async function refreshCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if (!currentFolder) {
    return;
  }
  let podTemplatesFolder = path.join(currentFolder, 'app', 'components');
  let podFiles = await glob('**/*.hbs', { cwd: podTemplatesFolder });
  let templatesFolder = path.join(currentFolder, 'app', 'templates');
  let templateFiles = await glob('**/*.hbs', { cwd: templatesFolder });
  let allTemplateFiles = [...podFiles, ...templateFiles];
  let items = _.uniq(allTemplateFiles).map((file: string) => {
    return toCompletionItem(file.replace('/template.hbs', '').replace('.hbs', ''));
  });
  console.log(`cache refreshed :: ${currentFolder} , size:: ${items.length}`);
  cache.set(currentFolder, items);
}


const queue = getTask(refreshCompletionItems);

function registerFileWatcher(context: ExtensionContext) {
  queue.performTask();
  let fileSystemWatcher = workspace.createFileSystemWatcher(`${getCurrentWorkspaceFolder()}/**/*.hbs`);
  fileSystemWatcher.onDidChange((filePath) => {
    console.log('file changed ::' + filePath);
    queue.performTask();
  });
  context.subscriptions.push(fileSystemWatcher);
}

function registerHbsProvider(context: ExtensionContext) {
  const triggers = ['{', '/'];
  const componentPathProvider = new ComponentPathProvider();
  let completionProvider = languages.registerCompletionItemProvider({ scheme: "file", language: "handlebars" }, componentPathProvider, ...triggers);
  context.subscriptions.push(completionProvider);
}

export default function activate(context: ExtensionContext) {
  registerFileWatcher(context);
  registerHbsProvider(context);
}

