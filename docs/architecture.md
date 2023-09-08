# Architecture
This template is laid out in order to maintain a clear separation-of-concerns (SoC) and composability in order for you to take the template in any way you need to build your app. At the root level we have a few folders:

```
src/
electron/
docs/
```

#### src
Contains everything for your Angular app. All of your ts/scss files will go here.

#### electron
Contains all of the electron-specific code. All of the code that configures Electron goes here. This also contains some config files for the Electron side of the app.

#### docs
Houses documentation pages such as this one.

## configs
At the root level we also have some configuration files.

```
package.json
electron/config/
```

#### package.json
Where all the NPM modules are stored, as well as build and package scripts. If you want more detail on these scripts, [head over here](https://github.com/reZach/secure-electron-template/blob/master/docs/scripts.md).

#### electron/config
Contains an environment file that is used to tell Electron if it's in development or production mode. You can also find the file to setup to menu here.