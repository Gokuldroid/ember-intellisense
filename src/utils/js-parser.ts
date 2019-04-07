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

export function getProperties(file: string): string[] {
  let ast = parseJs(file);
  let attributes: string[] = [];
  traverse(ast, {
    enter(path: any) {
      let node = path.node;
      if (types.isProperty(node)) {
        attributes.push(node.key.name);
      }
    }
  });
  return attributes;
}

const toCompletionItem = function (text: string): vscode.CompletionItem {
  return new vscode.CompletionItem(
    text,
    vscode.CompletionItemKind.Variable
  );
};

export function getCompletionItems(file: string): vscode.CompletionItem[] {
  return getProperties(file).map((attribute: string): vscode.CompletionItem => {
    return toCompletionItem(attribute);
  });
}