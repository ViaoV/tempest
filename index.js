const { ipcMain } = require('electron');
const { app, BrowserWindow, shell, Menu } = require('electron');

const updater = require('electron-simple-updater');
updater.init({
  url: 'https://raw.githubusercontent.com/ViaoV/tempest/master/updates.json',
});

updater.on('checking-for-update', function () {
  console.log('checking update');
});

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

app.on('ready', function () {
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
