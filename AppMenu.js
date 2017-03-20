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
];

module.exports = menu;
