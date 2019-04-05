import { CompletionItemProvider, TextDocument, Position, CompletionItem, ExtensionContext, languages} from "vscode";
import { getFileState } from "./state/file";
import { findRelatedFiles } from 'ember-find-related-files';
import { getCurrentWorkspaceFolder } from "./utils/editor";

class HbsAutocompleteProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    let fileState = getFileState(document, position);
    findRelatedFiles(getCurrentWorkspaceFolder(), fileState.filePath);
    
    if (fileState.matchCurrentWord("\{\{\}\}") || fileState.currentWord().endsWith("=")) {
      
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