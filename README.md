(taken from [secure-electron-template](https://github.com/reZach/secure-electron-template) because I'm lazy)
# secure-electron-angular-template
A current electron app template configured for use with Angular, designed and built with security in mind. (If you are curious about what makes an electron app secure, please check out [this page](https://github.com/reZach/secure-electron-template/blob/master/docs/secureapps.md)).

## How to get started
To get started, clone the repository by clicking the [![Use this template](https://github.com/reZach/secure-electron-template/blob/master/docs/imgs/usethistemplate.png "Use this template")](https://github.com/corybsa/secure-electron-angular-template/generate) button, or through the command line (`git clone https://github.com/corybsa/secure-electron-angular-template.git`). 

Once cloned, install the dependencies for the repo by running the following commands (you do _not_ have to run the first command if your command line is already inside the newly cloned repository):

```
cd secure-electron-angular-template
npm i
```

To run the app in development mode, run the following command:
```
npm run start
```

When you'd like to test your app in production, you can run the following command:
```
npm run start-prod
```

Or to package it for distribution just run the following command:
```
npm run package
```

and you can find your packaged app in the `dist` folder!

## Features
Taken from the [best-practices](https://electronjs.org/docs/tutorial/security) official page, here is what this repository offers!

1. [Only load secure content](https://www.electronjs.org/docs/latest/tutorial/security#1-only-load-secure-content) - ✅ (But the developer is responsible for loading secure assets only 🙂)
2. [Do not enable Node.js integration for remote content](https://www.electronjs.org/docs/latest/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content) - ✅
3. [Enable Context Isolation](https://www.electronjs.org/docs/latest/tutorial/security#3-enable-context-isolation) - ✅
4. [Enable process sandboxing](https://www.electronjs.org/docs/latest/tutorial/security#4-enable-process-sandboxing) - ✅
5. [Handle session permission requests from remote content](https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content) - ✅
6. [Do not disable webSecurity](https://www.electronjs.org/docs/latest/tutorial/security#6-do-not-disable-websecurity) - ✅
7. [Define a Content Security Policy](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy) - ✅
8. [Do not enable allowRunningInsecureContent](https://www.electronjs.org/docs/latest/tutorial/security#8-do-not-enable-allowrunninginsecurecontent) - ✅
9. [Do not enable experimental features](https://www.electronjs.org/docs/latest/tutorial/security#9-do-not-enable-experimental-features) - ✅
10. [Do not use enableBlinkFeatures](https://www.electronjs.org/docs/latest/tutorial/security#10-do-not-use-enableblinkfeatures) - ✅
11. [Do not use allowpopups for WebViews](https://www.electronjs.org/docs/latest/tutorial/security#11-do-not-use-allowpopups-for-webviews) - ✅
12. [Verify WebView options before creation](https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation) - ✅
13. [Disable or limit navigation](https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation) - ✅
14. [Disable or limit creation of new windows](https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows) - ✅
15. [Do not use shell.openExternal with untrusted content](https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content) - ✅
16. [Use a current version of Electron](https://www.electronjs.org/docs/latest/tutorial/security#16-use-a-current-version-of-electron) - ✅
17. [Validate the sender of all IPC messages](https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages) - ✅

## Included frameworks
Built-in to this template are a number of popular frameworks already wired up to get you on the road running.

- [Electron](https://electronjs.org/)
- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/) (with custom theme, including dark mode)
- [Typescript](https://www.typescriptlang.org)
- [NgRx](https://ngrx.io/)
- [Electron builder](https://www.electron.build/) (for packaging up your app)
- [Jasmine](https://jasmine.github.io/)

## Architecture
For a more detailed view of the architecture of the template, please check out [here](https://github.com/corybsa/secure-electron-angular-template/blob/main/docs/architecture.md). I would _highly_ recommend reading this document to get yourself familiarized with this template.

## FAQ
**NEW TO ELECTRON?** Please visit [reZach's page](https://github.com/reZach/secure-electron-template/blob/master/docs/newtoelectron.md).