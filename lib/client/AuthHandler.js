var net = require('net');

const { Session } = require('../data');

const EventEmitter = require('events');

class AuthHandler extends EventEmitter {

  constructor () {
    super();
    this.client = new net.Socket();
    this.connected = false;
    this.client.on('close', this.onClose.bind(this));
    this.client.on('data', this.onData.bind(this));
  }

  onData(data) {
    this.emit('data', data);
  }

  onConnect() {
    this.connected = true;
    this.emit('connected');
  }

  requestKey() {
    return new Promise((res, rej) => {
      this.send('K\n').then(res);
    });
  }

  authenticate(user, password) {
    return new Promise((res, rej) => {
      this.connect().then(() => {
        this.requestKey().then((key) => {
          var encryptedKey = this.encryptPassword(new Buffer(password), key);
          const connStr = Buffer.concat([
            new Buffer('A\t' + user + '\t'),
            encryptedKey,
            new Buffer('\n'),
          ]);
          this.send(connStr).then((data) => {
            if (data.toString().indexOf('KEY') > -1) {
              res(true);
            } else {
              this.disconnect();
              rej(data.toString());
            }
          });
        });
      });
    });
  }

  playCharacter(code) {
    return new Promise((res, rej) => {
      this.send('L\t' + code + '\tPLAY\n').then((data) => {
        var tokens = data.toString().split('\t').map(i => i.split('='));
        tokens.forEach(i => {
          if (i[0] == 'KEY') {
            res(i[1]);
          }
        });
        this.disconnect();
        rej(tokens);
      });
    });
  }

  listCharacters() {
    return new Promise((res, rej) => {
      this.send('M\n').then(() => {
        this.send('G\tDR\n').then(() => {
          this.send('P\tDR\n').then(() => {
            this.send('C\n').then((data) => {
              var tokens = data.toString().trim().split('\t');
              tokens.splice(0, 5);
              var list = [];
              for (var i = 0; i < tokens.length; i += 2) {
                list.push({ name: tokens[i + 1], code: tokens[i] });
              }

              res(list);
            });
          });
        });
      });
    });
  }

  onClose() {
    this.connected = false;
    this.emit('disconnected');
  }

  encryptPassword(passwd, hash) {
    var encrypted = new Buffer(passwd.map((p, i) => (((p - 32) ^ hash[i]) + 32)));
    return encrypted;
  }

  connect() {
    return new Promise((res, rej) => {
      this.client.connect(7900, 'eaccess.play.net', () => res());
    });
  }

  disconnect() {
    this.client.destroy();
  }

  send(str) {
    return new Promise((res, rej) => {
      this.client.once('data', res);
      this.client.write(str, 'ascii');
    });
  }

  saveSession(username, password, characterName, characterCode) {
    return new Promise((res, rej) => {
      const session = new Session({
        username,
        password,
        characterName,
        characterCode,
      });
      session.save((e) => {
        if (e) {
          rej(e);
        } else {
          res(session);
        }
      });
    });
  }

  deleteSessionByCode(code) {
    return new Promise((res, rej) => {
      Session.removeAll({ characterCode: code }, (e, r) => {
        res();
      });
    });
  }

  getSavedSessions() {
    return new Promise((res, rej) => {
      Session.query().exec((err, sessions) => {
          if (err) {
            rej(err);
          }

          res(sessions);
        });
    });
  }
}

module.exports = AuthHandler;
