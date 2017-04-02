const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const _ = require('lodash');
const files = require('../files');
const Script = require('./Script');
const CoffeeScript = require('./CoffeeScript');
const StormScript = require('./StormScript');
const { Settings } = require('../Settings');

require('coffee-script/register');

const scriptExtenions = ['.coffee', '.storm'];

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

  nextCommand() {
    this.scripts.forEach(i => i.nextCommand());
  }

  scriptPath(name) { return path.join(this.scriptsPath, name + '.coffee'); }

  onScriptCommand(script, str) { this.emit('script.command', script, str); }

  onScriptPrint(script, msg) { this.emit('script.print',  script, msg); }

  onScriptError(script, err) {
    this.emit('script.error', script, err);
    this.unloadScript(script.name);
  }

  onScriptNotify(script, msg) {
    this.emit('script.notify', script, msg);
  }

  onScriptStarted(script) { this.emit('script.started', script); }

  readScript(name) {
    return new Promise((res, rej) => {
      const scriptPath = path.join(this.scriptsPath, name);
      files.readFileForExt(scriptPath, scriptExtenions)
      .catch(rej)
      .then((result) => {
        if (!result.data) {
          return rej('No data loaded');
        }

        if (!result.data.toString().trim()) {
          return rej('Empty file');
        }

        res({
          type: this.getScriptType(result.filePath),
          data: result.data.toString(),
        });
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
    const scriptPath = path.join(this.scriptsPath, name);
    files.readFileForExt(scriptPath, scriptExtenions)
    .then((result) => {
      if (path.extname(result.filePath) === '.coffee') {
        this.addScript(new CoffeeScript(name, result.data.toString(), params || []));
      }

      if (path.extname(result.filePath) === '.storm') {
        this.addScript(new StormScript(name, result.data.toString(), params || []));
      }
    })
    .catch((err) => {
      this.emit('script.error', undefined, err);
    });
  }

  getScriptType(filename) {
    switch (path.extname(filename)) {
      case '.coffee': return 'Coffee Script';
      case '.storm': return 'StormFront Script';
    }
  }

  listScripts() {
    return new Promise((res, rej) => {
      const promises = ['*.coffee', '*.storm']
      .map(i => path.join(this.scriptsPath, i))
      .map(i => files.listDirectory(i));

      Promise.all(promises)
      .catch(rej)
      .then(results => {
        res(_.flatten(results).map((filename) => {
          const ext = path.extname(filename);
          const name = path.basename(filename, ext);
          const format = this.getScriptType(filename);
          return { name, ext, format, filename };
        }));
      });
    });
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
      script.removeAllListeners();
      _.remove(this.scripts, (i) => i.name == name);
      script = null;
      this.emit('script.unloaded');
    } else {
      this.emit('script.error', 'Script "' + name + '" is not running.');
    }
  }
}

module.exports = ScriptEngine;
