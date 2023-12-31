import { AfterContentInit, Component, OnInit } from '@angular/core';
import { IWindow } from 'electron/preload';
import { ElectronListenerService } from './services/electron/electron-listener.service';

declare const window: IWindow;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentInit {
  title = 'secure-electron-angular-template';
  private readonly darkModeKey = 'darkMode';

  constructor(
    public electronListenerService: ElectronListenerService
  ) {}

  ngAfterContentInit(): void {
    this.electronListenerService.onDarkModeToggled(this.toggleDarkMode.bind(this));

    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    const darkMode = (window.localStorage.getItem(this.darkModeKey) ?? 'off') === 'off' ? 'on' : 'off';
    window.localStorage.setItem(this.darkModeKey, darkMode);
    this.applyDarkMode(darkMode);
  }

  applyDarkMode(darkMode?: string): string {
    darkMode = darkMode || (window.localStorage.getItem(this.darkModeKey) ?? 'off');

    if(darkMode === 'on') {
      document.querySelector('body')?.classList.add('dark-mode');
    } else {
      document.querySelector('body')?.classList.remove('dark-mode');
    }

    return darkMode;
  }
}
