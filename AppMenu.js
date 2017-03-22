const { app, shell } = require('electron');
const path = require('path');
const { GameSession } = require('./lib/client');

const osxAppMenu = {
  label: 'File',
  submenu: [
    {
      label: 'Open Data Folder',
      click() {
        const dir = path.join(app.getPath('userData'), '.');
        shell.openItem(dir);
      },
    },
    {
      label: 'Open Scripts Folder',
      click() {
        const scriptsFolder = path.join(
          app.getPath('userData'),
          'scripts'
        );
        shell.openItem(scriptsFolder);
      },
    },
    { type: 'separator' },
    {
      label: 'Disconnect Session',
      enabled: false,
      click() {
        GameSession.disconnect();
      },
    },
    { type: 'separator' },
    {
      role: 'quit',
    },
  ],
};

const editMenu = {
  label: 'Edit',
  submenu: [
    {
      role: 'undo',
    },
    {
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      role: 'cut',
    },
    {
      role: 'copy',
    },
    {
      role: 'paste',
    },
    {
      role: 'pasteandmatchstyle',
    },
    {
      role: 'delete',
    },
    {
      role: 'selectall',
    },
  ],
};

const windowMenu = {
  role: 'window',
  submenu: [
    {
      role: 'minimize',
    },
    {
      role: 'close',
    },
  ],
};

const menu = [
  osxAppMenu,
  editMenu,
  windowMenu,
];

module.exports.appMenu = menu;
