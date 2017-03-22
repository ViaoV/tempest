const { GameSession, AuthHandler } = window.require('electron').remote.require('./lib/client');
const { ScriptEngine } = window.require('electron').remote.require('./lib/script_engine');
const MapData = window.require('electron').remote.require('./lib/mapdata');
const { app }  = window.require('electron').remote.require('electron');
const path = window.require('electron').remote.require('path');

export const session = GameSession;
export const auth = AuthHandler;
export const scriptEngine = ScriptEngine;
scriptEngine.scriptsPath = path.join(app.getPath('userData'), 'scripts');
export const mapData = new MapData();

session.on('message', (msg) => {
  if (msg.stream === 'game') {
    scriptEngine.message(msg.text);
  }
});

session.on('state', (st) => scriptEngine.setState(st));

scriptEngine.on('script.error', (script, msg) => {
  session.addMessage({
    stream: 'game',
    text: '[' + script.name + '] - ' + msg + '\n',
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
  new Notification('Tempest Client', {
    title: script.name,
    body: script.name + ': ' + msg,
  });
});

scriptEngine.on('script.command', (script, msg) => session.send(msg + '\n'));
