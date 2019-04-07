import { TextDocument, Position, workspace } from "vscode";
import { dirname } from 'path';
import * as _ from 'lodash';

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

  matchCurrentWord(pattern: string, wordPattern: RegExp, placeHolder: string) {
    let currentWord = this.currentWord(wordPattern ,placeHolder);
    return currentWord.match(pattern);
  }

  currentWord(regex: RegExp = /([\S]+LilyCompletionDummy[\S]+)/, placeHolder = 'LilyCompletionDummy'): string {
    //TODO : doesn't work as expected need to revisit
    let originalText = this.document.getText();
    let cursorOffset = this.document.offsetAt(this.position);
    let text = originalText.slice(0, cursorOffset) + placeHolder + originalText.slice(cursorOffset);
    let match = text.match(regex);
    if(_.isEmpty(match)){
      return '';
    }
    return match!![0].replace(placeHolder,'');
  }
}


export function getFileState(document: TextDocument, position: Position): FileState {
  return new FileState(document, position);
}