var path = require('path');

class DataConfig {
  constructor() {
    this.dataPath = './';
    this.memoryDB = false;
  }

  dbPath(name) {
    if (this.memoryDB) {
      return undefined;
    }

    return path.join(this.dataPath, name + '.db');
  }
}

module.exports = new DataConfig();
