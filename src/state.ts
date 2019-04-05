import { TextDocument, Position, workspace } from "vscode";
import { dirname } from 'path';
import { WorkspaceState } from "./state/workspace";

export class State extends WorkspaceState{
  filePath: string;
  textCurrentLine: string;
  cursorPosition: number;
  cursorLine: number;

  constructor(document: TextDocument, position: Position) {
    super();
    this.filePath = dirname(document.fileName);
    this.textCurrentLine = document.lineAt(position).text;
    this.cursorPosition = position.character;
    this.cursorLine = position.line;
  }
}


export function getState(document: TextDocument, position: Position): State {
  return new State(document, position);
}