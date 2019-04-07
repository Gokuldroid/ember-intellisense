import * as vscode from 'vscode';
import { getFileState } from './state/file';
import { getCurrentWorkspaceFolder } from './utils/editor';
import { getComponentFolders } from './utils/dir-structure';
import glob from './utils/glob';
import * as path from 'path';


function isComponentDefinition(currentWord: string): boolean {
  return /{{[\/#]{0,1}[a-z-]*/i.test(currentWord);
}

function stripUnwantedChars(currentWord: string) {
  return currentWord.replace('{{/', '').replace('{{#', '').replace('{{', '');
}

async function getRelatedFiles(component: string, currentFolder: string): Promise<string[]> {
  let folders = getComponentFolders(currentFolder);
  let result: string[] = [];
  for (const folder of folders) {
    let files = await glob(`${component}/*.hbs`, { cwd: folder });
    files = files.map((file) => {
      return path.join(folder, file);
    });
    result = [...result, ...files];
  }
  return result;
}

class HbsGoToDefProvider implements vscode.DefinitionProvider {
  async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
    let filestate = getFileState(document, position);
    let currentWord = filestate.currentWord();
    if (!isComponentDefinition(currentWord)) {
      return [];
    }
    let relatedFiles = await getRelatedFiles(stripUnwantedChars(currentWord), getCurrentWorkspaceFolder()!!);
    let result: vscode.Location[] = [];
    relatedFiles.map((file) => {
      result.push(new vscode.Location(vscode.Uri.file(file), new vscode.Range(0, 0, 0, 0)));
    });
    return result;
  }
}


export default function activate(context: vscode.ExtensionContext) {
  let defProvider = new HbsGoToDefProvider();
  context.subscriptions.push(vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'handlebars' }, defProvider));
}