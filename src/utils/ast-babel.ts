import * as vscode from 'vscode';


export function toLocation(node: any): any{
  return node.key.loc;
}

export function toStartPosition(node: any): vscode.Position{
  let loc = toLocation(node);
  return new vscode.Position(loc.start.line, loc.start.column);
}

export function toEndPosition(node: any): vscode.Position{
  let loc = toLocation(node);
  return new vscode.Position(loc.end.line, loc.end.column);
}

export function toRange(node: any): vscode.Range {
  return new vscode.Range(toStartPosition(node), toEndPosition(node));
}