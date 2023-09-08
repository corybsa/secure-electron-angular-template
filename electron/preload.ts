import { contextBridge, ipcRenderer } from 'electron';

export const ipcRendererToMainMessages = {
  openFileChooser: 'open-file-chooser',
  formatSeparators: 'format-separators',
  getSeparator: 'get-separator',
  checkFileExists: 'check-file-exists',
  writeFile: 'write-file',
  createDirectory: 'create-directory',
  deleteFile: 'delete-file',
} as const;

export const ipcMainToRendererMessages = {
  toggleDarkMode: 'toggle-dark-mode',
} as const;

const validRendererToMainMessages = Object.values(ipcRendererToMainMessages);
const validMainToRendererMessages = Object.values(ipcMainToRendererMessages);
type IpcRendererToMainMessage = typeof validRendererToMainMessages[0];
type IpcMainToRendererMessage = typeof validMainToRendererMessages[0];

interface IWindowBridge {
  electronApi: {
    invoke: (channel: IpcRendererToMainMessage, data?: any) => Promise<any>;
    receive: (channel: IpcMainToRendererMessage, func: Function) => void;
  };
}

export type IWindow = Window & typeof globalThis & IWindowBridge;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronApi', {
    invoke: (channel: IpcRendererToMainMessage, data?: any) => {
      // whitelist channels
      if (validRendererToMainMessages.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }

      return new Promise(() => {});
    },
    receive: (channel: IpcMainToRendererMessage, func: Function) => {
      if (validMainToRendererMessages.includes(channel)) {
        // Deliberately strip `event` as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  } as IWindowBridge['electronApi']
);
