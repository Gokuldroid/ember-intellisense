import { findRelatedFiles } from 'ember-find-related-files';
import * as _ from 'lodash';
import * as path from 'path';
import { CompletionItem, CompletionItemProvider, ExtensionContext, languages, Position, TextDocument } from "vscode";
import { getFileState } from "./state/file";
import { currentDocumentRelativePath, getCurrentWorkspaceFolder } from "./utils/editor";
import { getCompletionItems } from './utils/js-parser';

class HbsAutocompleteProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    if (fileState.matchCurrentWord("[a-z]+") || fileState.currentWord().endsWith("=")) {
      let currentFolder = getCurrentWorkspaceFolder();
      let currentFilePath = currentDocumentRelativePath();
      let relatedFiles = findRelatedFiles(currentFolder, currentFilePath).filter((file: any) => {
        return file.label === 'Component' || file.label === 'Controller';
      }).map((file: any) => file.path);
      return _.flatten(relatedFiles.map((file: string) => getCompletionItems(path.join(currentFolder!!, file))));
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