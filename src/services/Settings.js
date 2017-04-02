const appSettings = window.require('electron').remote.require('electron-settings');

const defaults = [
  ['game.resourceBars', true],
  ['game.statusIndicators', true],
  ['notifications.whisper', true],
  ['notifications.scripts', true],
  ['game.roundTimeRequeue', true],
  ['game.roundTimeDelay', true],
];

defaults.forEach(i => {
  if (!appSettings.has(i[0])) {
    appSettings.set(i[0], i[1]);
  }
});

export const settings = appSettings;
