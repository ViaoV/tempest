const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const _ = require('lodash');
const files = require('../files');
const Script = require('./script');

require('coffee-script/register');

class ScriptEngine extends EventEmitter {
  constructor(scriptDir) {
    super();
    this.scripts = [];
    this.state = {};
    this.scriptsPath = scriptDir;
  }

  message(str) {
    this.scripts.forEach(s => s.message(str));
  }

  setState(st) {
    this.state = st;
    this.scripts.forEach(i => i.setState(st));
  }

  scriptPath(name) { return path.join(this.scriptsPath, name + '.coffee'); }

  onScriptCommand(script, str) { this.emit('script.command', script, str); }

  onScriptPrint(script, msg) { this.emit('script.print',  script, msg); }

  onScriptError(script, err) {
    this.emit('script.error', script, err);
    this.unloadScript(script.name);
  }

  onScriptNotify(script, msg) { this.emit('script.notify', script, msg); }

  onScriptStarted(script) { this.emit('script.started', script); }

  readScript(name) {
    return new Promise((res, rej) => {
      fs.readFile(this.scriptPath(name), (err, data) => {
        if (err) {
          return rej(err);
        }

        if (!data) {
          return rej('No data loaded');
        }

        if (!data.toString().trim()) {
          return rej('Empty file');
        }

        res(data);
      });
    });
  }

  addScript(script) {
    script.setState(this.state);
    script.on('command', this.onScriptCommand.bind(this));
    script.on('error', this.onScriptError.bind(this));
    script.on('print', this.onScriptPrint.bind(this));
    script.on('notify', this.onScriptNotify.bind(this));
    script.on('started', this.onScriptStarted.bind(this));
    script.once('exit', () => this.unloadScript(script.name));
    this.scripts.push(script);
    script.start();
    this.emit('script.loaded', script);
  }

  loadScript(name, params) {
    const scriptPath = this.scriptPath(name);
    files.checkFile(scriptPath, (exists) => {
      if (!exists) {
        this.emit('script.error', undefined,
          'Script not found. Expected to be at ' + scriptPath);
        return;
      }

      fs.readFile(scriptPath, (err, data) => {
        const script = new Script(name, data.toString(), params || []);
        this.addScript(script);
      });
    });
  }

  listScripts(cb) {
    files.scriptsDirectory((scriptsDir) => {
      files.listDirectory(path.join(scriptsDir, '*.coffee'), {}, cb);
    });
  }

  listScriptNames(cb) {
    this.listScripts((scripts) =>
      cb(scripts.map(i => path.basename(i, '.coffee')))
    );
  }

  saveScript(name, data) {
    return new Promise((res, rej) => {
      fs.writeFile(this.scriptPath(name), data, res);
    });
  }

  newScript(name) {
    return new Promise((res, rej) => {
      fs.writeFile(this.scriptPath(name), '', res);
    });
  }

  renameScript(old, name) {
    return new Promise((res, rej) => {
      const scriptPath = this.scriptPath(old);
      const newPath = path.join(path.dirname(scriptPath), name + '.coffee');
      console.log(scriptPath, newPath);
      fs.rename(scriptPath, newPath, res);
    });
  }

  deleteScript(name) {
    return new Promise((res, rej) => {
      fs.unlink(this.scriptPath(name), res);
    });
  }

  unloadScript(name) {
    var script = this.scripts.find((i) => i.name == name);
    if (script) {
      script.removeListener('command', this.onScriptCommand);
      script.removeListener('script.error', this.onScriptError);
      _.remove(this.scripts, (i) => i.name == name);
      script = null;
      this.emit('script.unloaded');
    } else {
      this.emit('script.error', 'Script "' + name + '" not found.');
    }
  }
}

module.exports = ScriptEngine;
