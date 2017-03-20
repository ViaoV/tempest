const { shell } = require('electron');

const menu = [
  {
    label: 'Tempest Client',
    submenu: [
      {
        label: 'Open Data Directory',
        click() {
          shell.showItemInFolder(app.getPath('userData'));
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
          files.scriptsDirectory((scriptsDir) => {
            shell.showItemInFolder(scriptsDir);
          });
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
