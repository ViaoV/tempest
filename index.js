const { ipcMain } = require('electron');
const { app, BrowserWindow, shell, Menu } = require('electron');

const fs = require('fs');
const path = require('path');
const url = require('url');
const files = require('./lib/files');
const DataConfig = require('./lib/data/DataConfig');
DataConfig.dataPath = path.join(app.getPath('userData'), 'data');
files.ensureDirectory(DataConfig.dataPath);

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(require('./AppMenu')));
  var mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    frame: false,
  });

  mainWindow.webContents.openDevTools({ mode: 'undocked' });

  // MainWindow.setMenu(null);
  mainWindow.loadURL('file://' + __dirname + '/build/index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});
