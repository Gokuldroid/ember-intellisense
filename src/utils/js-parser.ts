import * as vscode from 'vscode';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import * as _ from 'lodash';

export function parseJs(file: string): types.File {
  let content = fs.readFileSync(file).toString();
  return parser.parse(content, {
    allowImportExportEverywhere: true,
    sourceType: 'module'
  });
}

export function getPropertyNodes(file: string): any[] {
  let ast = parseJs(file);
  let nodes: any[] = [];
  traverse(ast, {
    enter(path: any) {
      let node = path.node;
      if (types.isProperty(node)) {
        nodes.push(node);
      }
    }
  });
  return nodes;
}

export function getProperties(file: string): string[] {
  return _.uniq(getPropertyNodes(file).map((node) => node.key.name));
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

export function getActionNodes(file: string): any[]{
  let ast = parseJs(file);
  let nodes: any[] = [];
  traverse(ast, {
    enter(path: any) {
      let node = path.node;
      if (types.isProperty(node) && types.isIdentifier(node.key) && node.key.name === 'actions') {
        let actions: any = node.value;
        if(actions && actions.properties){
          nodes = [...nodes, ...actions.properties];
        }
      }
    }
  });
  return nodes;
}

