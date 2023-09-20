import { app, BrowserWindow, Menu, protocol, session } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
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

  mainWindow.maximize();

  // and load the index.html of the app.
  loadApp();

  // Open the DevTools.
  if(!environment.production) {
    mainWindow.webContents.once('dom-ready', installRedux);
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
      pathname: path.join(Protocol.DIST_PATH, 'index.html'),
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
): void {
  // Strip away preload scripts if unused or verify their location is legitimate
  delete webPreferences.preload;

  // Disable Node.js integration
  webPreferences.nodeIntegration = false;

  // Verify URL being loaded
  if(!params['src'].startsWith(`${Protocol.scheme}//rse`)) {
    event.preventDefault();
  }
}

function protectNavigations(event: Electron.Event<Electron.WebContentsWillNavigateEventParams>, navigationUrl: string): void {
  const parsedUrl = new URL(navigationUrl);

  if (parsedUrl.origin !== `${Protocol.scheme}//rse`) {
    event.preventDefault();
  }
}

async function installRedux(): Promise<void> {
  try {
    // check windows first
    let reduxPath = path.join(process.env['LOCALAPPDATA']!, '/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd');

    // check mac
    if(!fs.existsSync(reduxPath)) {
      reduxPath = path.join(process.env['HOME']!, '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd');
    }

    // check linux
    if(!fs.existsSync(reduxPath)) {
      const possiblePaths = [
        path.join(process.env['HOME']!, '/.config/google-chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd'),
        path.join(process.env['HOME']!, '/.config/google-chrome-beta/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd'),
        path.join(process.env['HOME']!, '/.config/google-chrome-canary/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd'),
        path.join(process.env['HOME']!, '/.config/chromium/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd'),
      ];

      // check possible paths until we find one that exists
      for(const p of possiblePaths) {
        if(fs.existsSync(p)) {
          reduxPath = p;
          break;
        }
      }
    }

    // redux devtools isn't installed
    if(!fs.existsSync(reduxPath)) {
      throw new Error('Redux DevTools not installed');
    }

    // find the newest folder in the Chrome extensions directory
    const newestVersion = fs.readdirSync(reduxPath).reduce((prev, curr) => {
      if(fs.statSync(path.join(reduxPath, curr)).isDirectory() && curr > prev) {
        return curr;
      } else {
        return prev;
      }
    }, '');

    reduxPath = path.join(reduxPath, newestVersion);
    await session.defaultSession.loadExtension(reduxPath);
  } catch(e) {
    console.log('Redux DevTools failed to load', e);
  } finally {
    mainWindow!.webContents.openDevTools();
    // for some reason the first time the devtools are opened,
    // redux devtools doesn't load properly. a refresh fixes it.
    mainWindow!.reload();
  }
}
