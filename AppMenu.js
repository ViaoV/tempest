const { app, shell } = require('electron');
const path = require('path');

const menu = [
  {
    label: 'Tempest Client',
    submenu: [
      {
        label: 'Open Data Directory',
        click() {
          const dir = path.join(app.getPath('userData'), '.');
          console.log(dir);
          shell.openItem(dir);
        },
      },
      {
        role: 'quit',
      },
    ],
  },
  {
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
  },
  {
    label: 'Scripts',
    submenu: [
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
    ],
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize',
      },
      {
        role: 'close',
      },
    ],
  },
];

module.exports = menu;
