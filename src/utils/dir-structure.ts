import * as path from 'path';
import glob from './glob';
import * as fs from 'fs';
import { findRelatedFiles } from 'ember-find-related-files';

export function getComponentFolders(rootDir: string): string[] {
  //Ember app
  let podTemplatesFolder = path.join(rootDir, 'app', 'components');
  let templatesFolder = path.join(rootDir, 'app', 'templates', 'components');
  
  //Addons
  let addonPodTemplatesFolder = path.join(rootDir, 'addon', 'components');
  let addonTemplatesFolder = path.join(rootDir, 'addon', 'templates', 'components');
  
  return [podTemplatesFolder, templatesFolder, addonPodTemplatesFolder, addonTemplatesFolder];
}

/**
 * Gets all template files in the given directory
 * @param rootDir Ember root directory
 * @returns array of relative template files relative paths to the given directory
 */
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
/**
 * Gets all action handlers of the template file
 * @param rootDir Ember root directory
 * @returns array of relative action handler files relative paths to the given directory
 */
export function getActionHandlers(currentFolder: string, templateFile:string): string[]{
  return findRelatedFiles(currentFolder, templateFile).filter((file: any) => {
    return file.label === 'Component' || file.label === 'Controller';
  }).map((file: any) => file.path);
}