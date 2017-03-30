const { GameSession, AuthHandler } = window.require('electron').remote.require('./lib/client');
const { ScriptEngine } = window.require('electron').remote.require('./lib/ScriptEngine');
const { MapData } = window.require('electron').remote.require('./lib/maps');
const { app }  = window.require('electron').remote.require('electron');
const path = window.require('electron').remote.require('path');
const { Settings } = window.require('electron').remote.require('./lib/Settings');

export const session = GameSession;
export const auth = AuthHandler;
export const scriptEngine = ScriptEngine;
export const settings = Settings;
export const mapData = new MapData();

scriptEngine.scriptsPath = path.join(app.getPath('userData'), 'scripts');

session.on('message', (msg) => {
  if (msg.stream === 'game') {
    scriptEngine.message(msg.text);
  }
});

session.on('message.empty', () => {
  console.log('Send buffer is empty');
  scriptEngine.nextCommand();
});

session.on('state', (st) => scriptEngine.setState(st));

scriptEngine.on('script.error', (script, msg) => {
  var scriptName = (script) ? script.name : '*unknown*';
  session.addMessage({
    stream: 'game',
    text: '[' + scriptName + '] - ' + msg + '\n',
    style: 'script-error', });
});

scriptEngine.on('script.print', (script, msg) => {
  session.addMessage({
    stream: 'game',
    text: `[${script.name}] - ${msg}`,
    style: 'script-print',
  });
});

scriptEngine.on('script.notify', (script, msg) => {
  session.addMessage({
    stream: 'game',
    text: script.name + ': ' + msg + '\n',
    style: 'script-notify',
  });
  if (Settings.get('notifications.scripts') === true) {
    new Notification('Tempest Client', {
      title: script.name,
      body: script.name + ': ' + msg,
    });
  }
});

scriptEngine.on('script.command', (script, msg) => {
  session.send(msg + '\n');
  console.log('pushing command ' + msg);
});
