export = main;
declare function main(args: any): any;
declare namespace main {
  function detectType(rootPath: any, filePath: any): any;
  function findRelatedFiles(rootPath: any, filePath: any): any;
  function findType(rootPath: any, type: any): any;
  function getPath(sourceType: any, typeKey: any): any;
  function getRelatedTypeKeys(typeKey: any): any;
}
