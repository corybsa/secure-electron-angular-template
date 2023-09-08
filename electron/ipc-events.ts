import { ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export class IpcEvents {
  mainWindow: Electron.BrowserWindow | null;

  constructor(win: Electron.BrowserWindow | null) {
    this.mainWindow = win;
    this.setupHandleInterceptor();
  }
  
  init() {
    ipcMain.handle('open-file-chooser', async (event, args) => {
      return dialog.showOpenDialogSync(this.mainWindow!, { ...args, properties: ['openDirectory'] });
    });
    
    ipcMain.handle('format-separators', (event, args) => {
      const formattedPath = path.join(...args.split('/'));
      return formattedPath;
    });

    ipcMain.handle('get-separator', (event, args) => {
      return path.sep;
    });

    ipcMain.handle('check-file-exists', (event, args) => {
      return fs.existsSync(args);
    });

    ipcMain.handle('write-file', (event, args) => {
      try {
        fs.writeFileSync(args.path, args.payload);
        return true;
      } catch {
        return false;
      }
    });

    ipcMain.handle('create-directory', (event, args) => {
      try {
        fs.mkdirSync(args, { recursive: true });
        return true;
      } catch {
        return false;
      }
    });

    ipcMain.handle('delete-file', (event, args) => {
      try {
        fs.unlinkSync(args);
        return true;
      } catch {
        return false;
      }
    });
  }

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

  private isValidSender(sender: string): boolean {
    if(sender === 'wg://rse') {
      return true;
    }

    return false;
  }
}
