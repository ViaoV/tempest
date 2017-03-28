const EventEmitter = require('events');
const fs = require('fs');
const coffee = require('coffee-script');
const _eval = require('eval');
const path = require('path');
const _ = require('lodash');

class Script extends EventEmitter {

  constructor(name, script, params) {
    super();
    this.params = params || [];
    this.loaded = false;
    this.script = script;
    this.matches = [];
    this.triggers = [];
    this.state = {};
    this.delays = [];
    this.name = name;
    this.matches = [];
    this.commandBuffer = [];
  }

  nextCommand() {
    if (this.commandBuffer.length > 0) {
      this.emit('command', this, this.commandBuffer.shift());
    }
  }

  message(str) {
    try {
      const m = this.matches.find(i => i.test(str));
      if (m) {
        this.matches = [];
        m.run();
      }

      _.remove(this.triggers, (t) =>
        t.once === true && new RegExp(t.pattern).test(str)
      ).forEach(t => t.fn());

      this.triggers.forEach((trigger) => {
        const rgx = new RegExp(trigger.pattern);
        if (rgx.test(str)) {
          trigger.fn();
        }
      });
    } catch (e) {
      this.emit('error', this, e.toString());
    }
  }

  setState(st) {
    this.state = st;
  }

  compile() {
    return new Promise((res, rej) => {
      try {
        var scriptText = coffee.compile(this.script.toString());
        return res(scriptText);
      } catch (e) {
        return rej(e);
      }
    });
  }

  start() {
    this.compile().catch(e => {
      this.emit('error', this, e);
    }).then(scriptText =>  {
      try {
        _eval(scriptText, this.name, this.ScriptEnvironemnt, true);
        this.emit('started', this);
      } catch (e) {
        this.emit('error', this, e.toString());
      }
    });
  }

  send(str) {
    this.commandBuffer.push(str);
  }

  get ScriptEnvironemnt() {
    return {
      load: (name) => {
        const filepath = path.join(path.dirname(this.filename), name + '.coffee');
        var coffeeSource = fs.readFileSync(filepath).toString();
        var jsSource = coffee.compile(coffeeSource);
        return _eval(jsSource, path.basename(filepath, '.coffee'), this.ScriptEnvironemnt, true);
      },

      params: this.params,
      p: (...str) => str.forEach(i=>this.send(i)),
      next: (p, fn) => this.triggers.push({ once: true, pattern: p, fn: fn }),
      trigger: (p, fn) => this.triggers.push({ once: false, pattern: p, fn: fn }),
      match: (p, fn) => this.matches.push(new Match(p, fn)),
      move: (...cmds) => cmds.forEach(cmd => this.emit('move', cmd)),
      wait: (n, fn) => this.delays.push(_.delay(fn, n * 1000)),
      exit: () => this.emit('exit', this),
      notify: (msg) => this.emit('notify', this, msg),
      print: (msg) => this.emit('print', this, msg),
      $: () => this.state,
    };
  }
}

class Match {
  constructor(pattern, fn) {
    this.pattern = pattern;
    this.fn = fn;
  }

  test(str) {
    const rgx = new RegExp(this.pattern);
    return rgx.test(str);
  }

  run() {
    this.fn();
  }

  toString() {
    return `<Match: ${this.pattern}>`;
  }
}

class Trigger {
  constructor(pattern, fn, once) {
    this.pattern = pattern;
    this.fn = fn;
    this.once = (once || false);
  }

  test(str) {
    const rgx = new RegExp(this.pattern);
    return rgx.test(str);
  }

  run() {
    this.fn();
  }

  toString() {
    return `<Trigger: ${this.pattern}>`;
  }
}

module.exports = Script;
