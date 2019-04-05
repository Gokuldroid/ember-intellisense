import { workspace } from "vscode";

export class WorkspaceState {
  rootPath: string | undefined;
  constructor() {
    this.rootPath = workspace.rootPath;
  }
}


export function getWorkspace(): WorkspaceState {
  return new WorkspaceState();
}