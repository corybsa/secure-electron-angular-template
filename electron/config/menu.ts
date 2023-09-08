import { Menu } from "electron";

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

function toggleDarkMode(menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow | undefined, event: Electron.KeyboardEvent) {
  // send message to renderer process
  browserWindow?.webContents.send('toggle-dark-mode');
}
