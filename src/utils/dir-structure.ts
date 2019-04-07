import * as path from 'path';
import glob from './glob';
import * as fs from 'fs';

export function getComponentFolders(rootDir: string): string[] {
  //Ember app
  let podTemplatesFolder = path.join(rootDir, 'app', 'components');
  let templatesFolder = path.join(rootDir, 'app', 'templates', 'components');
  
  //Addons
  let addonPodTemplatesFolder = path.join(rootDir, 'addon', 'components');
  let addonTemplatesFolder = path.join(rootDir, 'addon', 'templates', 'components');
  
  return [podTemplatesFolder, templatesFolder, addonPodTemplatesFolder, addonTemplatesFolder];
}


export async function getTemplateFiles(rootDir: string): Promise<string[]> {
  let result: string[] = [];
  for (const folder of getComponentFolders(rootDir)) {
    result = [...result, ...await glob('**/*.hbs', { cwd: folder })];
  }
  return result;
}

export function getPackageJson(rootDir: string): any {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json')).toString());
}