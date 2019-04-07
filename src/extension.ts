// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ComponentPathProvider from './component-path-provider';
import HbsAutocompleteProvider from './hbs-autocomplete-provider';
import HbsGotoDefProvider from './hbs-go-to-def-provider';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	ComponentPathProvider(context);
	HbsAutocompleteProvider(context);
	HbsGotoDefProvider(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
