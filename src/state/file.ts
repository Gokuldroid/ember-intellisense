import { TextDocument, Position, workspace } from "vscode";
import { dirname } from 'path';

export class FileState {
  rootPath: string | undefined;
  filePath: string;
  textCurrentLine: string;
  currentChar: number;
  cursorLine: number;
  document: TextDocument;
  position: Position;

  constructor(document: TextDocument, position: Position) {
    this.document = document;
    this.position = position;
    this.rootPath = workspace.rootPath;
    this.filePath = dirname(document.fileName);
    this.textCurrentLine = document.lineAt(position).text;
    this.currentChar = position.character;
    this.cursorLine = position.line;
  }

  matchCurrentLine(pattern: string) {
    return this.textCurrentLine.match(pattern);
  }

  matchCurrentWord(pattern: string) {
    let currentWord = this.currentWord();
    return currentWord.match(pattern);
  }

  currentWord(): string {
    //TODO : doesn't work as expected
    let range = this.document.getWordRangeAtPosition(this.position);
    return this.document.getText(range);
  }
}


export function getFileState(document: TextDocument, position: Position): FileState {
  return new FileState(document, position);
}