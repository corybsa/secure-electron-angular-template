/*
Reasonably Secure Electron
Copyright (C) 2021  Bishop Fox
Converted to TypeScript by: Cory Sandlin
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-------------------------------------------------------------------------
Implementing a custom protocol achieves two goals:
  1) Allows us to use ES6 modules/targets for Angular
  2) Avoids running the app in a file:// origin
*/

import * as fs from 'fs';
import * as path from 'path';

const DIST_PATH = path.join(__dirname, 'secure-electron-angular-template');
export const scheme = 'app';

// Map of file extensions to mime types
const mimeTypes: { [key: string]: string } = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/vnd.microsoft.icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.map': 'text/plain'
};

/**
 * Returns the charset for a given mime extension
 * @param mimeExt the file extension to get the charset for
 * @returns the charset for the given mime extension or null if none is found
 */
function charset(mimeExt: string) {
  return ['.html', '.htm', '.js', '.mjs', 'css'].some((m) => m === mimeExt) ?
    'utf-8' :
    null;
}

/**
 * Returns mime type and extension for a given filename
 * @param filename name of file to get mime type for
 * @returns object containing mime type and mime extension
 */
function mime(filename: string) {
  const mimeExt = path.extname(`${filename || ''}`).toLowerCase();
  const mimeType = mimeTypes[mimeExt];
  return mimeType ? { mimeExt, mimeType } : { mimeExt: null, mimeType: null };
}

/**
 * Handles requests for the custom protocol
 * @param req The request object
 * @returns A response object with the content type set based on the file extension
 */
export function requestHandler(req: Request) {
  const reqUrl = new URL(req.url);
  let reqPath = path.normalize(reqUrl.pathname);
  
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const reqFilename = path.basename(reqPath);
  const data: Buffer = fs.readFileSync(path.join(DIST_PATH, reqPath));
  const { mimeExt, mimeType } = mime(reqFilename);
  let contentType = `${mimeType}`;
  contentType += mimeExt ? `; charset=${charset(mimeExt)}` : '';

  return new Response(data, {
    headers: { 'Content-Type': contentType },
  });
}
