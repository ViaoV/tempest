const EventEmitter = require('events');
const net = require('net');
const fs = require('fs');
const htmlparser = require('htmlparser2');
const SessionStream = require('./SessionStream');
const SessionStreamCollection = require('./SessionStreamCollection');

class GameSession extends EventEmitter {

  constructor() {
    super();
    this.name = '';
    this.streams = new SessionStreamCollection();
    this.socket  = new net.Socket();
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('close', this.onDisconnect.bind(this));
    this.socket.on('end', this.onDisconnect.bind(this));
    this.socket.on('connect', this.onConnect.bind(this));
    this.connected = false;
    this.resetState();
    this.parser = new htmlparser.Parser({
      onopentag: this.onTagOpen.bind(this),
      onclosetag: this.onTagClose.bind(this),
      ontext: this.onText.bind(this),
    }, { xmlMode: true });
  }

  resetState() {
    this.handshook = false;
    this.insideTag = false;
    this.sendBuffer = [];
    this.sentBuffer = [];
    this.moveBuffer = [];
    this.sendWait = false;
    this.tagDepth = 0;
    this.state = {
      name: '',
      time: 0,
      resources: {
        spirit: 0,
        health: 0,
        mana: 0,
        stamina: 0,
        concentration: 0,
      },
      roundTimeSeconds: 0,
      roundTimeEnd: 0,
      indicators: {},
      spell: '',
      left: '',
      right: '',
      queuedCommands: 0,
    };
    this.msgEvent = {
      stream: 'game',
      bold: false,
      style: '',
    };
  }

  onConnect() {
    this.resetState();
    this.streams.clearAll();
    this.timeTicker = setInterval(function () {
      if (this.state.roundTimeEnd > this.state.time) {
        this.state.time += 1;
        this.emit('state', this.state);
      } else {
        this.state.time += 1;
      }
    }.bind(this), 1000);
    this.sendTicker = setInterval(() => this.popSendBuffer(), 2000);
    this.emit('connected');
  }

  onDisconnect() {
    clearInterval(this.timeTicket);
    clearInterval(this.sendTicker);
    this.clearPendingActions();
    this.emit('disconnected');
  }

  onData(data) {
    data = data.toString();
    this.emit('raw-data', data.toString());
    if (!this.handshook && data.slice(0, 9) === '<playerID') {
      this.handshook = true;
      this.socket.write('<c>\r\n');
      this.socket.write('<c>\r\n');
    } else {
      this.parse(data.toString());
    }
  }

  connect(key) {
    this.socket.connect(11024, 'storm.dr.game.play.net', () => {
      this.socket.write(key);
      this.socket.write('/FE:STORMFRONT /VERSION:1.0.1.26 /P:WINXP  /XML');
      this.socket.write('<c>\r\n');
      this.socket.write('<c>\r\n');
    });
  }

  disconnect() {
    this.socket.destroy();
    this.onDisconnect();
  }

  popSendBuffer(ignoreRt) {
    if (this.sendWait) {
      return;
    }

    if (!ignoreRt && (this.state.roundTimeEnd + 1) > this.state.time) {
      return;
    }

    if (this.sendBuffer.length == 0) {
      return;
    }

    var str = this.sendBuffer.shift();

    if (!str || str.trim() == '') {
      return;
    }

    this.emit('message', {
      stream: 'game',
      text: '> ' + str + '\n',
      style: 'user-cmd',
    });
    this.streams.push({
      stream: 'game',
      text: '> ' + str + '\n',
      style: 'user-cmd',
    });
    this.socket.write(str);
    this.sentBuffer.push(str);
  }

  popMoveBuffer() {
    if (this.sendWait) {
      return;
    }

    if (this.state.roundTimeEnd + 1 > this.state.time) {
      return;
    }

    if (this.moveBuffer.length > 0) {
      var str = this.moveBuffer.shift();
      this.emit('message', {
        stream: 'game',
        text: '> ' + str + '\n',
        style: 'user-cmd',
      });
      this.streams.push({
        stream: 'game',
        text: '> ' + str + '\n',
        style: 'user-cmd',
      });
      this.socket.write(str + '\n');
      this.sentBuffer.push(str);
    }
  }

  parse(str) {
    this.parser.write(str);
  }

  onTagOpen(name, attr) {
    this.insideTag = name;
    this.tagDepth += 1;

    if (name == 'app') { this.state.name = attr.char; }

    if (name == 'pushBold') { this.msgEvent.bold = true; }

    if (name == 'indicator') {
      var indicator = attr.id.substring(4).toLowerCase();
      this.state.indicators[indicator] = (attr.visibile == 'y');
    }

    if (name == 'popBold') { this.msgEvent.bold = false; }

    if (name == 'output') { this.msgEvent.style = attr.class; }

    if (name == 'style') { this.msgEvent.style = attr.id; }

    if (name == 'prompt') {
      this.state.time = parseInt(attr.time);
      clearInterval(this.sendTicker);
      this.popSendBuffer();
      this.sendWait = false;
      this.sendTicker = setInterval(() => this.popSendBuffer(), 2000);
      this.emit('state', this.state);
    }

    if (name == 'clearStream') {
      this.emit('clear', attr.id);
      this.streams.clear(attr.id);
    }

    if (name == 'progressBar') { this.state.resources[attr.id] = attr.value; }

    if (name == 'preset') {
      this.msgEvent.style = attr.id;
      this.insideTag = false;
      this.tagDepth -= 1;
    }

    if (name == 'component' && attr.id == 'room desc') {
      this.insideTag = 'roomdesc';
    }

    if (name == 'd') {
      this.msgEvent.style = 'direction';
      this.insideTag = false;
      this.tagDepth -= 1;
    }

    if (name == 'pushStream') { this.msgEvent.stream = attr.id; }

    if (name == 'popStream') { this.msgEvent.stream = 'game'; }

    if (name == 'roundTime') {
      var tick = parseInt(attr.value);
      this.state.roundTimeSeconds = tick - this.state.time;
      this.state.roundTimeEnd = tick;
      this.emit('state', this.state);
    }

  }

  onTagClose(name) {
    if (name == 'preset') {
      this.msgEvent.style = '';
      return;
    }

    if (name == 'd') {
      this.msgEvent.style = '';
      return;
    }

    this.insideTag = false;
    this.tagDepth = this.tagDepth - 1;
  }

  onText(text) {
    if (this.insideTag == 'spell') { this.state.spell = text; }

    if (this.insideTag == 'right') { this.state.right = text; }

    if (this.insideTag == 'left') { this.state.left = text; }

    if (this.insideTag == 'roomdesc') {
      this.state.roomDesc = text;
      this.emit('room.change');
      this.popMoveBuffer();
    }

    if (!this.insideTag && text.trim() !== '' && this.tagDepth == 0) {
      var msg = Object.assign({ text: text }, this.msgEvent);
      this.addMessage(msg);
      if (msg.text.indexOf('...wait') > -1) {
        this.sendBuffer.unshift(this.sentBuffer.pop());
      }

      if (msg.text.indexOf('Sorry, you may only type ahead') > -1) {
        this.sendBuffer.unshift(this.sentBuffer.pop());
        this.sendWait = true;
      }
    }
  }

  move(str) { this.moveBuffer.push(str); }

  clearPendingActions() {
    this.moveBuffer = [];
    this.sendBuffer = [];
  }

  addMessage(msg) {
    this.streams.push(msg);
    this.emit('message',  msg);
  }

  send(str) { this.sendBuffer.push(str); }

  sendNow(str) {
    this.sendBuffer.push(str);
    this.popSendBuffer(true);
  }

}

module.exports = GameSession;
