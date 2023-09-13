import { Menu } from "electron";
import { IpcMainToRendererMessage } from '../preload';

interface IWebContents extends Electron.WebContents {
  send(channel: IpcMainToRendererMessage, ...args: any[]): void;
}

interface IBrowserWindow extends Electron.BrowserWindow {
  webContents: IWebContents;
}

export const appMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      { label: 'Quit', accelerator: 'CmdOrCtrl+Q', role: 'quit' },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      { type: 'separator' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Toggle Dark Mode', accelerator: 'CmdOrCtrl+D', click: toggleDarkMode },
    ]
  },
]);

function toggleDarkMode(menuItem: Electron.MenuItem, browserWindow: IBrowserWindow | undefined, event: Electron.KeyboardEvent) {
  // send message to renderer process
  browserWindow?.webContents.send('toggle-dark-mode');
}
