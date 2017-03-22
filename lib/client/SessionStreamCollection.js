const SessionStream = require('./SessionStream');

class SessionStreamCollection {
  constructor() {
    this.streams = {};
  }

  get(name) {
    if (name in this.streams) {
      return this.streams[name].stream;
    }

    return [];
  }

  clear(stream) {
    if (this.streams[stream]) {
      this.streams[stream].clear();
    }
  }

  clearAll() {
    Object.keys(this.streams).forEach(this.clear.bind(this));
  }

  push(msg) {
    if (msg.stream) {
      if (!(msg.stream in this.streams)) {
        this.streams[msg.stream] = new SessionStream();
      }

      this.streams[msg.stream].push(msg);
    }
  }
}

module.exports = SessionStreamCollection;
