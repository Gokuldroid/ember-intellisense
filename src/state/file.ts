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
  cursorOffset:number;

  constructor(document: TextDocument, position: Position) {
    this.document = document;
    this.position = position;
    this.rootPath = workspace.rootPath;
    this.filePath = dirname(document.fileName);
    this.textCurrentLine = document.lineAt(position).text;
    this.currentChar = position.character;
    this.cursorLine = position.line;
    this.cursorOffset = this.document.offsetAt(this.position);
  }

  matchCurrentLine(pattern: string) {
    return this.textCurrentLine.match(pattern);
  }

  matchCurrentWord(pattern: string, wordPattern: RegExp = /([\S]+LilyCompletionDummy[\S]*)/, placeHolder: string = 'LilyCompletionDummy') {
    let currentWord = this.currentWord(wordPattern ,placeHolder);
    return currentWord.match(pattern);
  }

  currentWord(regex: RegExp = /([\S]+LilyCompletionDummy[\S]*)/, placeHolder = 'LilyCompletionDummy'): string {
    //TODO : doesn't work as expected need to revisit
    let text = this.cursorLeftText() + placeHolder + this.cursorRightText();
    let match = text.match(regex);
    if(_.isEmpty(match)){
      return '';
    }
    return match!![0].replace(placeHolder,'');
  }

  cursorLeftText(){
    return this.document.getText().slice(0, this.cursorOffset);
  }

  cursorRightText(){
    return this.document.getText().slice(this.cursorOffset);
  }
}


export function getFileState(document: TextDocument, position: Position): FileState {
  return new FileState(document, position);
}