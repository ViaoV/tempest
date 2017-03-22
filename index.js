const { ipcMain } = require('electron');
const { app, BrowserWindow, shell, Menu } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;

const fs = require('fs');
const path = require('path');
const url = require('url');
const files = require('./lib/files');
const DataConfig = require('./lib/data/DataConfig');
DataConfig.dataPath = path.join(app.getPath('userData'), 'data');
const { appMenu } =  require('./AppMenu');
files.ensureDirectory(DataConfig.dataPath);

const { AuthHandler, GameSession } = require('./lib/client');

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

autoUpdater.on('update-downloaded', (ev, info) => {
  autoUpdater.quitAndInstall();
});

app.on('ready', function () {
  autoUpdater.checkForUpdates();
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenu));
  var mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    frame: false,
    backgroundColor: '#262626',
  });

  mainWindow.webContents.openDevTools({ mode: 'undocked' });

  // MainWindow.setMenu(null);
  mainWindow.loadURL('file://' + __dirname + '/build/index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

GameSession.on('connected', () => {
  Menu.getApplicationMenu().items[0].submenu.items[3].enabled = true;
});

GameSession.on('disconnected', () => {
  Menu.getApplicationMenu().items[0].submenu.items[3].enabled = false;
});
