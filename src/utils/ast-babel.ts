import * as vscode from 'vscode';


function toLocation(node: any): any{
  return node.key.loc;
}

function toStartPosition(node: any): vscode.Position{
  let loc = toLocation(node);
  return new vscode.Position(loc.start.line, loc.start.column);
}

function toEndPosition(node: any): vscode.Position{
  let loc = toLocation(node);
  return new vscode.Position(loc.end.line, loc.end.column);
}

export function toRange(node: any): vscode.Range {
  return new vscode.Range(toStartPosition(node), toEndPosition(node));
}