import { contextBridge, ipcRenderer } from 'electron';

export const ipcRequestMessages = {
  openFileChooser: 'open-file-chooser',
  formatSeparators: 'format-separators',
  getSeparator: 'get-separator',
  checkFileExists: 'check-file-exists',
  writeFile: 'write-file',
  createDirectory: 'create-directory',
  deleteFile: 'delete-file'
} as const;

const validRequestMessages = Object.values(ipcRequestMessages);
type IpcRequestMessage = typeof validRequestMessages[0];

interface IWindowBridge {
  electronApi: {
    invoke: (channel: IpcRequestMessage, data?: any) => Promise<any>;
  };
}

export type IWindow = Window & typeof globalThis & IWindowBridge;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronApi', {
    invoke: (channel: IpcRequestMessage, data?: any) => {
      // whitelist channels
      if (validRequestMessages.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }

      return new Promise(() => {});
    }
  }
);
