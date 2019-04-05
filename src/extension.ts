// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const triggers = ['{','/'];

	let disposable = vscode.languages.registerCompletionItemProvider({ scheme: "file", language: "handlebars" },
		{
			provideCompletionItems(
				document: vscode.TextDocument,
				position: vscode.Position
			) {
				let completionItem = new vscode.CompletionItem(
					`gokul`,
					vscode.CompletionItemKind.Text
				);
				return [completionItem];
			}
		}, ...triggers);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
