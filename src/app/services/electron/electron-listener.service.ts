import { Injectable } from '@angular/core';
import { IWindow } from 'electron/preload';

declare const window: IWindow;

@Injectable({
  providedIn: 'root'
})
export class ElectronListenerService {
  constructor() { }

  public onDarkModeToggled(callback: () => void): void {
    window.electronApi.receive('toggle-dark-mode', callback);
  }
}
