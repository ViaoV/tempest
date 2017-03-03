const EventEmitter = require('events');
const net = require('net');
const fs = require('fs');
var htmlparser = require('htmlparser2');

class GameSession extends EventEmitter {

  constructor() {
    super();
    this.name = '';
    this.socket  = new net.Socket();
    this.socket.on('data', this.onData.bind(this));
    this.connected = false;
    this.handshook = false;
    this.insideTag = false;
    this.tagDepth = 0;
    this.parser = new htmlparser.Parser({
      onopentag: this.onTagOpen.bind(this),
      onclosetag: this.onTagClose.bind(this),
      ontext: this.onText.bind(this),
    }, { xmlMode: true });
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
      indicators: {},
      spell: '',
      left: '',
      right: '',
    };
    this.msgEvent = {
      stream: 'game',
      bold: false,
      style: '',
    };
  }

  parse(str) {
    this.parser.write(str);
  }

  onTagOpen(name, attr) {
    this.insideTag = name;
    this.tagDepth += 1;
    if (name == 'app') {
      this.state.name = attr.char;
    }

    if (name == 'pushBold') {
      this.msgEvent.bold = true;
    }

    if (name == 'indicator') {
      this.state.indicators[attr.id.substring(4).toLowerCase()] = (attr.visibile == 'y');
    }

    if (name == 'popBold') {
      this.msgEvent.bold = false;
    }

    if (name == 'output') {
      this.msgEvent.style = attr.class;
    }

    if (name == 'style') {
      this.msgEvent.style = attr.id;
    }

    if (name == 'prompt') {
      this.state.time = parseInt(attr.time);
      this.emit('state', this.state);
    }

    if (name == 'clearStream') {
      this.emit('clear', attr.id);
    }

    if (name == 'progressBar') {
      this.state.resources[attr.id] = attr.value;
    }

    if (name == 'preset') {
      this.msgEvent.style = attr.id;
      this.insideTag = false;
      this.tagDepth -= 1;
    }

    if (name == 'd') {
      this.msgEvent.style = 'direction';
      this.insideTag = false;
      this.tagDepth -= 1;
    }

    if (name == 'pushStream') {
      this.msgEvent.stream = attr.id;
    }

    if (name == 'popStream') {
      this.msgEvent.stream = 'game';
    }

  }

  onTagClose(name) {
    if (name == 'preset') {
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
    if (this.insideTag == 'spell') {
      this.state.spell = text;
    }

    if (this.insideTag == 'right') {
      this.state.right = text;
    }

    if (this.insideTag == 'left') {
      this.state.left = text;
    }

    if (!this.insideTag && text.trim() !== '' && this.tagDepth == 0) {
      this.emit('message',  Object.assign({}, this.msgEvent), text);
    }
  }

  connect(key) {
    this.socket.connect(11024, 'storm.dr.game.play.net', () => {
      this.send(key);
      this.send('/FE:STORMFRONT /VERSION:1.0.1.26 /P:WINXP  /XML');
      this.send('<c>\r\n');
      this.send('<c>\r\n');
      this.emit('connected');
    });
  }

  debugLoad() {
    fs.readFile('log.txt', ((err, data) => {
      this.parse(data.toString());
    }));
  }

  onData(data) {
    data = data.toString();
    this.emit('raw-data', data.toString());
    if (!this.handshook && data.slice(0, 9) === '<playerID') {
      this.handshook = true;
      this.send('<c>\r\n');
      this.send('<c>\r\n');
    } else {
      this.parser.write(data.toString());
    }
  }

  send(str) {
    console.log(':> ' + str.trim() + '\n');
    this.socket.write(str);
  }
}

var session = new GameSession();
module.exports = GameSession;
