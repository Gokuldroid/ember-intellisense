import * as vscode from 'vscode';
import * as path from 'path';

export function currentDocument(): vscode.TextDocument | undefined {
  let activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return undefined;
  }
  return activeEditor.document;
}


export function currentDocumentRelativePath(): string | undefined {
  if (currentDocument()) {
    return vscode.workspace.asRelativePath(currentDocument()!.uri);
  }
  return undefined;
}

export function currentDocumentFolder(): string | undefined {
  let doc = currentDocument();
  if (!doc) {
    return undefined;
  }
  return path.dirname(vscode.workspace.asRelativePath(doc.fileName, false));
}


export function currentWorkspaceFolder(): string | undefined {
  if (vscode.workspace.workspaceFolders) {
    if (currentDocument()) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentDocument()!.uri);
      if (workspaceFolder) {
        return workspaceFolder.uri.fsPath;
      }
    }
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  } else {
    return undefined;
  }
}