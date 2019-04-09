import * as vscode from 'vscode';

export function simpleCompletion(kind: vscode.CompletionItemKind): (text :string) => vscode.CompletionItem {
  return function(text: string): vscode.CompletionItem {
    return new vscode.CompletionItem(
      text,
      kind
    );
  };
}
