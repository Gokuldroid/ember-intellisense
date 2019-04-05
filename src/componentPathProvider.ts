import { CompletionItemProvider, TextDocument, Position, CompletionItem, ExtensionContext, CompletionItemKind, languages, workspace } from "vscode";
import * as globObject from 'glob';
import { getFileState } from "./state/file";
import * as Queue from "queue-promise";
import { getCurrentWorkspaceFolder } from "./utils/editor";


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
    if (fileState.matchCurrentWord("\{\{[a-z]+") || fileState.matchCurrentWord("\{\{/")) {
      return cache.get(folder + '/app/components') || (queue.refreshCache());
    }
    return [];
  }
}

let cache: Map<string,CompletionItem[]> = new Map();

async function refreshCompletionItems() {
  let currentFolder = getCurrentWorkspaceFolder();
  if(!currentFolder) {
    return;
  }
  currentFolder = currentFolder + '/app/components';
  let files = await glob('**/*.hbs', { cwd: currentFolder });
  let items = files.map((file) => {
    return toCompletionItem(file.replace('/template.hbs', ''));
  });
  console.log(`cache refreshed :: ${currentFolder} , size:: ${items.length}`);
  cache.set(currentFolder, items);
}


const queue = new Queue({
  concurrent: 1,
  interval: 5000,
});

queue.refreshCache = function () {
  if (!this.isEmpty) {
    return;
  }
  this.enqueue(refreshCompletionItems);
  return [];
};

function registerFileWatcher(context: ExtensionContext) {
  queue.refreshCache();
  let fileSystemWatcher = workspace.createFileSystemWatcher(`${getCurrentWorkspaceFolder()}/**/*.hbs`);
  fileSystemWatcher.onDidChange((filePath) => {
    console.log('file changed ::' + filePath);
    queue.refreshCache();
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

