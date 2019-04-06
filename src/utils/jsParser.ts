import * as vscode from 'vscode';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import * as types from '@babel/types';
import traverse from '@babel/traverse';

export function parseJs(file: string): types.File {
  let content = fs.readFileSync(file).toString();
  return parser.parse(content, {
    allowImportExportEverywhere: true,
    sourceType: 'module'
  });
}

const toCompletionItem = function (text: string): vscode.CompletionItem {
  return new vscode.CompletionItem(
    text,
    vscode.CompletionItemKind.Variable
  );
};

export function getCompletionItems(file: string): vscode.CompletionItem[] {
  let ast = parseJs(file);
  let items: vscode.CompletionItem[] = [];
  traverse(ast, {
    enter(path: any){
      let node = path.node;
      if(types.isProperty(node)){
        items.push(toCompletionItem(node.key.name));
      }
    }
  });
  return items;
}