const Script = require('./Script');

class StormScript extends Script {

  init() {
    this.matches = [];
    this.counter = 0;
    this.lines = this.script.split('\n').map(i => i.trim());
    this.currentLine = 0;
    this.variables = {};
    this.labels = {};
    this.waitFor = undefined;
    this.getLabels();
  }

  message(str) {
    const match = this.matches
    .find((i) => str.indexOf(i.text) > -1);
    if (match) {
      this.matches = [];
      this.currentLine = this.labels[match.label];
      this.start();
    }
  }

  getLabels() {
    this.lines.forEach((line, i) => {
      if (line.trim().length > 0) {
        if (line[line.length - 1] === ':' && line.trim().indexOf(' ') === -1) {
          this.labels[line.substring(0, line.length - 1)] = i;
        }
      }
    });
  }

  evalLine(line) {

    // Skip empty lines
    if (line.trim() === '') {
      return false;
    }

    // Replace all variables in this line.
    Object.keys(this.variables).forEach(k => {
      line = line.replace(new RegExp('%' + k, 'ig'), this.variables[k]);
    });

    line = line.replace(new RegExp('%c', 'ig'), this.counter);

    for (var i = 1; i < this.params.length + 1; i++) {
      line = line.replace(new RegExp('%' + i, 'ig'), this.params[i]);
    }

    // Ignore line if it's a label definition
    if (line[line.length - 1] === ':' && line.trim().indexOf(' ') === -1) {
      return false;
    }

    const tokens = line.split(' ');

    // Handle IF_# syntax
    if (tokens[0].substring(0, 3).toLowerCase() === 'if_') {
      const ifToken = tokens.shift();
      const paramIndex = parseInt(ifToken.split('_')[1]);
      if (!this.params[paramIndex]) {
        return;
      }
    }

    const command = tokens.shift().toLowerCase();

    if (command === 'put') {
      this.send(tokens.join(' '));
      return false;
    }

    if (command === 'move') {
      this.send(tokens.join(' '));
      return false;
    }

    if (command === 'match') {
      const label = tokens.shift();
      const text = tokens.join(' ');
      this.matches.push({ label, text });
      return false;
    }

    if (command === 'matchwait') {
      return true;
    }

    if (command === 'goto') {
      this.currentLine = this.labels[tokens.join(' ')];
      this.start();
      return true;
    }

    if (command === 'pause') {
      var pauseTime = 1;
      pauseTime = parseInt(tokens[0]);
      setTimeout(this.start.bind(this), pauseTime);
      return false;
    }

    if (command === 'setvariable') {
      const name = tokens.shift().toLowerCase();
      const value = tokens.join(' ');
      this.variables[name] = value;
      return false;
    }

    if (command === 'counter') {
      const subcommand = tokens.shift().toLowerCase();

      if (subcommand ===  'set') {
        this.counter = parseInt(tokens[0]);
      }

      if (subcommand ===  'add') {
        this.counter += parseInt(tokens[0]);
      }

      if (subcommand ===  'subtract') {
        this.counter -= parseInt(tokens[0]);
      }

      if (subcommand ===  'multiply') {
        this.counter *= parseInt(tokens[0]);
      }

      if (subcommand ===  'multiply') {
        this.counter *= parseInt(tokens[0]);
      }

      return false;
    }

    if (command === 'shift') {
      this.params.shift();
      return false;
    }

    if (command === 'echo') {
      this.print(tokens.join(' '));
      return false;
    }

    this.error(`Unknown command: (${command}) - ${line}`);
  }

  start() {
    for (var i = this.currentLine; i < this.lines.length; i++) {
      if (this.evalLine(this.lines[i])) {
        return;
      }

      this.currentLine = i + 1;
    }

    this.exit();

  }
}

module.exports = StormScript;
