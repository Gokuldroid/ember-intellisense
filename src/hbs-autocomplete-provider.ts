import { findRelatedFiles } from 'ember-find-related-files';
import * as _ from 'lodash';
import * as path from 'path';
import { CompletionItem, CompletionItemProvider, ExtensionContext, languages, Position, TextDocument } from "vscode";
import { getFileState } from "./state/file";
import { currentDocumentRelativePath, currentWorkspaceFolder } from "./utils/editor";
import { getCompletionItems } from './utils/js-parser';
import { getActionHandlers } from './utils/dir-structure';

class HbsAutocompleteProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let currentFolder = currentWorkspaceFolder();
    let currentFilePath = currentDocumentRelativePath();
    let relatedFiles = getActionHandlers(currentFolder!!, currentFilePath!!);
    return _.flatten(relatedFiles.map((file: string) => getCompletionItems(path.join(currentFolder!!, file))));
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