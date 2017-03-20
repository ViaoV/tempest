const fs = require('fs');
const path = require('path');
const glob = require('glob');

class FileManager {

  ensureDirectory(dir) {
    return new Promise((res, rej) => {
      fs.stat(dir, function (err, stats) {
        if (err) {
          fs.mkdir(dir, (err) => {
            if (err) {
              rej(err);
            } else {
              res(dir);
            }
          });
        } else {
          res(dir);
        }
      });
    });
  }

  listDirectory(dir, pattern, cb) {
    glob(dir, {}, (er, files) => {
      if (cb) {
        cb(files);
      }
    });
  }

  checkFile(path, cb) {
    fs.stat(path, (err, stats) => {
      cb(!err);
    });
  }
}

module.exports = new FileManager();
