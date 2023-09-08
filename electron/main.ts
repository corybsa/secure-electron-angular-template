import { app, BrowserWindow, Menu, protocol, session } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { IpcEvents } from './ipc-events';
import { environment } from './config/environment';
import { appMenu } from './config/menu';
import * as Protocol from './protocol';

let mainWindow: Electron.BrowserWindow | null;

async function createWindow() {
  configureCsp();

  new IpcEvents(mainWindow).init();
  Menu.setApplicationMenu(appMenu);

  if (environment.production) {
    // Needs to happen before creating/loading the browser window;
    // protocol is only used in prod
    protocol.handle(Protocol.scheme, Protocol.requestHandler);
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      devTools: !environment.production,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // and load the index.html of the app.
  loadApp();

  // Open the DevTools.
  if(!environment.production) {
    mainWindow!.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // If the main window fails to load, load index.html
  // This is useful for when the Angular app is refreshed
  mainWindow.webContents.on('did-fail-load', loadApp);
}

// Needs to be called before app is ready;
// gives our scheme access to load relative files,
// as well as local storage, cookies, etc.
// https://electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
protocol.registerSchemesAsPrivileged([{
  scheme: Protocol.scheme,
  privileges: {
    standard: true,
    secure: true
  }
}]);

// Enable global sandboxing
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevents webview from loading external content
app.on('web-contents-created', (_, contents) => {
  contents.on('will-attach-webview', protectWebViews);
  contents.on('will-navigate', protectNavigations);

  // disable opening links in new window
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

function loadApp() {
  if(!environment.production) {
    mainWindow!.loadURL(url.format({
      pathname: path.join(__dirname, 'secure-electron-angular-template', 'index.html'),
      protocol: 'file:',
      slashes: true,
    }));
  } else {
    mainWindow!.loadURL(`${Protocol.scheme}://rse/index.html`);
  }
}

// Configure CSP to mitigate XSS attacks
function configureCsp() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: Object.assign({
      ...details.responseHeaders,
      'Content-Security-Policy': [
        `default-src 'self';
        script-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self' https://fonts.gstatic.com;
        style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
        style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;`
      ]
    }, details.responseHeaders) });
  });
}

function protectWebViews(
  event: { preventDefault: () => void; readonly defaultPrevented: boolean; },
  webPreferences: Electron.WebPreferences,
  params: Record<string, string>
) {
  // Strip away preload scripts if unused or verify their location is legitimate
  delete webPreferences.preload;

  // Disable Node.js integration
  webPreferences.nodeIntegration = false;

  // Verify URL being loaded
  if(!params['src'].startsWith(`${Protocol.scheme}//rse`)) {
    event.preventDefault();
  }
}

function protectNavigations(event: Electron.Event<Electron.WebContentsWillNavigateEventParams>, navigationUrl: string) {
  const parsedUrl = new URL(navigationUrl);

  if (parsedUrl.origin !== `${Protocol.scheme}//rse`) {
    event.preventDefault();
  }
}
