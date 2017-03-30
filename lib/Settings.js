const appSettings = require('electron-settings');

const defaults = [
  ['game.resourceBars', true],
  ['game.localEcho', true],
  ['game.statusIndicators', true],
  ['notifications.whisper', true],
  ['notifications.scripts', true],
  ['game.commandRequeue', true],
  ['game.roundTimeDelay', true],
];

defaults.forEach(i => {
  if (!appSettings.has(i[0])) {
    appSettings.set(i[0], i[1]);
  }
});

module.exports.Settings = appSettings;
