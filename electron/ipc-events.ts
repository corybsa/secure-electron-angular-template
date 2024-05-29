import { ipcMain, dialog, shell, OpenDialogOptions } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Protocol from './protocol';
import * as os from 'os';
import { IpcRendererToMainMessage } from './preload';

export class IpcEvents {
  mainWindow: Electron.BrowserWindow | null;

  constructor(win: Electron.BrowserWindow | null) {
    this.mainWindow = win;
    this.setupHandleInterceptor();
  }
  
  /**
   * Initialized IPC handlers.
   */
  init() {
    // Open native file chooser dialog
    this.createHandler('open-file-chooser', (event, args: OpenDialogOptions) => {
      return dialog.showOpenDialogSync(this.mainWindow!, { ...args });
    });
    
    // Format path separators to be correct on the current OS
    this.createHandler('format-separators', (event, args: string) => {
      const isRoot = args[0] === '/';
      let formattedPath = path.join(...args.split('/'));

      if(isRoot) {
        formattedPath = `/${formattedPath}`;
      }

      return formattedPath;
    });

    // Get the path separator for the current OS
    this.createHandler('get-separator', (event, args) => {
      return path.sep;
    });

    // Check if a file exists on the disk
    this.createHandler('check-file-exists', (event, args: string) => {
      return fs.existsSync(args);
    });

    // Write a file to the disk
    this.createHandler('write-file', async (event, args: { path: string, payload: string }) => {
      try {
        await fs.promises.writeFile(args.path, args.payload);
        return true;
      } catch {
        return false;
      }
    });

    // Create a directory (folder) on the disk
    this.createHandler('create-directory', async (event, args: string) => {
      try {
        await fs.promises.mkdir(args, { recursive: true });
        return true;
      } catch {
        return false;
      }
    });

    // Delete a file from the disk
    this.createHandler('delete-file', async (event, args: string) => {
      try {
        await fs.promises.unlink(args);
        return true;
      } catch {
        return false;
      }
    });

    // Get the user's home folder
    this.createHandler('get-home-folder', (event, args) => {
      return os.homedir();
    });

    // Open a folder in the OS's file explorer
    this.createHandler('open-folder', (event, args: string) => {
      try {
        shell.showItemInFolder(args);
        return true;
      } catch {
        return false;
      }
    });

    // Read file contents
    this.createHandler('read-file', async (event, args: string) => {
      try {
        const file = await fs.promises.readFile(args);
        return file.toString();
      } catch {
        return '';
      }
    });
  }

  /**
   * Creates a handler for a specific channel.
   * @param channel
   * @param callback 
   */
  private createHandler(channel: IpcRendererToMainMessage, callback: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any): void {
    ipcMain.handle(channel, callback);
  }

  /**
   * Intercepts calls to ipcMain.handle and checks if they came from a trusted source.
   * If the source is trusted then the call is allowed to continue, otherwise it is blocked.
   */
  private setupHandleInterceptor() {
    const originalHandle = ipcMain.handle;
    
    ipcMain.handle = (channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) => {
      originalHandle(channel, (e, a) => {
        if(this.isValidSender(e.senderFrame?.url)) {
          return false;
        }
        
        return listener(e, a);
      });
    };
  }

  /**
   * Checks if the sender of a message is trusted.
   * @param sender The origin of the message
   * @returns true if the sender is trusted or false if it is not
   */
  private isValidSender(sender: string): boolean {
    if(sender === `${Protocol.scheme}//rse`) {
      return true;
    }

    return false;
  }
}
