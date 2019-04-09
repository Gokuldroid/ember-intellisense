import * as vscode from 'vscode';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import * as _ from 'lodash';
import { simpleCompletion } from '../transforms/completion-item';

export function parseJs(file: string): types.File {
  let content = fs.readFileSync(file).toString();
  return parser.parse(content, {
    allowImportExportEverywhere: true,
    sourceType: 'module'
  });
}

function filterNodes(file: string, func: (path: any) => boolean): any[] {
  let ast = parseJs(file);
  let result: any = [];
  traverse(ast, {
    enter(path: any) {
      if (func(path.node)) {
        result.push(path.node);
      }
    }
  });
  return result;
}

export function getPropertyNodes(file: string): any[] {
  return filterNodes(file, types.isProperty);
}

export function getProperties(file: string): string[] {
  return _.uniq(getPropertyNodes(file).map((node) => node.key.name));
}

export function getPropertyCompletions(file: string): vscode.CompletionItem[] {
  return _.map(getProperties(file), simpleCompletion(vscode.CompletionItemKind.Variable));
}

export function getActionNodes(file: string): any[] {
  let actionFilter = (node: any) => types.isProperty(node) && types.isIdentifier(node.key) && node.key.name === 'actions' && _.has(node, 'value.properties');
  return _.flatten(filterNodes(file, actionFilter).map((node) => node.value.properties));
}

