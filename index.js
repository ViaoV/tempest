const {ipcMain} = require('electron')
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');


app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  var mainWindow = new BrowserWindow({
    height: 768,
    width: 1024,
    frame: false,
  });

  mainWindow.webContents.openDevTools({mode: 'undocked'});

  // MainWindow.setMenu(null);
  mainWindow.loadURL('file://' + __dirname + '/build/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
