import { Injectable } from '@angular/core';
import { IWindow } from 'electron/preload';

declare const window: IWindow;

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  constructor() { }

  private async formatSeparators(path: string): Promise<string> {
    return await window.electronApi.invoke('format-separators', path);
  }

  public async openFileChooser(defaultPath: string): Promise<string[]> {
    defaultPath = await this.formatSeparators(defaultPath);
    return await window.electronApi.invoke('open-file-chooser', { defaultPath });
  }

  public async checkFileExists(path: string): Promise<boolean> {
    path = await this.formatSeparators(path);
    return await window.electronApi.invoke('check-file-exists', path);
  }

  public async createDirectory(path: string): Promise<boolean> {
    if(!path) {
      return false;
    }
    
    path = await this.formatSeparators(path);

    // if the directory already exists, don't do anything.
    if(await this.checkFileExists(path)) {
      return true;
    }

    return await window.electronApi.invoke('create-directory', path);
  }

  public async writeFile(path: string, payload: string): Promise<boolean> {
    path = await this.formatSeparators(path);

    // get the directory of the file.
    const separator = await window.electronApi.invoke('get-separator');
    const directory = path.substring(0, path.lastIndexOf(separator));

    // if the file's directory doesn't exist, create it.
    const res = await this.createDirectory(directory);

    return res && await window.electronApi.invoke('write-file', { path, payload });
  }

  public async deleteFile(path: string): Promise<boolean> {
    path = await this.formatSeparators(path);
    return await window.electronApi.invoke('delete-file', path);
  }
}
