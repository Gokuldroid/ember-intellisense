import * as vscode from 'vscode';
import { getFileState, FileState } from './state/file';
import { currentWorkspaceFolder, currentDocumentRelativePath } from './utils/editor';
import { getComponentFolders, getActionHandlers } from './utils/dir-structure';
import glob from './utils/glob';
import * as path from 'path';
import { getActionNodes } from './utils/js-parser';
import { toRange } from './utils/ast-babel';
import * as _ from 'lodash';

const COMPONENT_REGEX = /{{[\/#]{0,1}[a-z-]*/i;

// Component definition
function isComponent(filestate: FileState): boolean {
  let currentWord = filestate.currentWord();
  return COMPONENT_REGEX.test(currentWord);
}

function stripUnwantedChars(currentWord: string) {
  return currentWord.replace('{{/', '').replace('{{#', '').replace('{{', '');
}

async function getRelatedFiles(filestate: FileState, currentFolder: string): Promise<string[]> {
  let component = stripUnwantedChars(filestate.currentWord());
  let folders = getComponentFolders(currentFolder);
  let result: string[] = [];
  for (const folder of folders) {
    let files = [...await glob(`${component}/*.hbs`, { cwd: folder }), ...await glob(`${component}/*.js`, { cwd: folder })];
    files = files.map((file) => {
      return path.join(folder, file);
    });
    result = [...result, ...files];
  }
  return result;
}

async function getComponentDefinition(filestate: FileState): Promise<vscode.Location[]> {
  let relatedFiles = await getRelatedFiles(filestate, currentWorkspaceFolder()!!);
  return relatedFiles.map((file) => {
    return new vscode.Location(vscode.Uri.file(file), new vscode.Range(0, 0, 0, 0));
  });
}

const ACTION_REGEX = /(\{{2,2}|\()action [a-z\- \'\"=]*(\}{2,2}|\))/i;

//Action definition
function isAction(filestate: FileState): boolean {
  let currentWord = filestate.currentWord(ACTION_REGEX);
  return ACTION_REGEX.test(currentWord);
}

async function getActionDefinition(filestate: FileState): Promise<vscode.Location[]> {
  let currentFolder = currentWorkspaceFolder()!!;
  let actionHanlers = getActionHandlers(currentFolder, currentDocumentRelativePath()!!);
  let currentWord = filestate.currentWord(/([a-zA-Z]+LilyCompletionDummy[a-zA-Z]*)/);
  return _.flatten(actionHanlers.map((file) => {
    let actionHandler = vscode.Uri.file(path.join(currentFolder, file));
    let actionNodes = getActionNodes(path.join(currentFolder, file));
    return actionNodes.filter((node) => node.key.name === currentWord).map((node) => {
      return new vscode.Location(actionHandler, toRange(node));
    });
  }));
}

class HbsGoToDefProvider implements vscode.DefinitionProvider {
  async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
    let filestate = getFileState(document, position);
    if (isComponent(filestate)) {
      return await getComponentDefinition(filestate);
    } else if (isAction(filestate)) {
      return await getActionDefinition(filestate);
    }
  }
}


export default function activate(context: vscode.ExtensionContext) {
  let defProvider = new HbsGoToDefProvider();
  context.subscriptions.push(vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'handlebars' }, defProvider));
}