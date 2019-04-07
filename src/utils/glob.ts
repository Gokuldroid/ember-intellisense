import * as globObject from 'glob';

export default function (pattern: string, options: Object): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    globObject(pattern, options, (err: any, files: string[]) => {
      err === null ? resolve(files) : reject(err);
    });
  });
};