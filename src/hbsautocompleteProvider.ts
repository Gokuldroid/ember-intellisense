import { CompletionItemProvider, CompletionItemKind, TextDocument, Position, CompletionItem, ExtensionContext, languages } from "vscode";
import { getFileState } from "./state/file";
import { findRelatedFiles } from 'ember-find-related-files';
import { getCurrentWorkspaceFolder, currentDocumentFolder, currentDocumentRelativePath } from "./utils/editor";
import * as path from 'path';
import * as _ from 'lodash';
import { getCompletionItems } from './utils/jsParser';

class HbsAutocompleteProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    if (fileState.matchCurrentWord("[a-z]+") || fileState.currentWord().endsWith("=")) {
      let currentFolder = getCurrentWorkspaceFolder();
      let currentFilePath = currentDocumentRelativePath();
      let relatedFiles = findRelatedFiles(currentFolder, currentFilePath).filter((file: any) => {
        return file.label === 'Component' || file.label === 'Controller';
      }).map((file: any) => file.path);
      var items = relatedFiles.map((file: string) => getCompletionItems(path.join(currentFolder!!, file)));
      items = _.flattenDeep(items);
      console.log(items);
      return items;
    }
    return [];
  }
}

function registerHbsAutocompleteProvider(context: ExtensionContext) {
  const triggers = ['{', '='];
  const componentPathProvider = new HbsAutocompleteProvider();
  let completionProvider = languages.registerCompletionItemProvider({ scheme: "file", language: "handlebars" }, componentPathProvider, ...triggers);
  context.subscriptions.push(completionProvider);
}

export default function activate(context: ExtensionContext) {
  registerHbsAutocompleteProvider(context);
}