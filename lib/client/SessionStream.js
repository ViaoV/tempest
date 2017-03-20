class SessionStream {
  constructor() {
    this.stream = [];
  }

  push(msg) {
    this.stream.push(msg);
    this.stream = this.stream.slice(Math.max(this.stream.length - 100, 0));
  }

  clear() {
    this.stream = [];
  }
}

module.exports = SessionStream
