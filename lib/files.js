const fs = require('fs');
const path = require('path');
const glob = require('glob');
const IsThere = require('is-there');

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

  listDirectory(dir) {
    return new Promise((res, rej) => {
      glob(dir, {}, (err, files) => {
        if (err) {
          rej(err);
        } else {
          res(files);
        }
      });
    });
  }

  checkFile(path, cb) {
    fs.stat(path, (err, stats) => {
      cb(!err);
    });
  }

  readFileForExt(filePath, extList) {
    return new Promise((res, rej) => {
      const filePaths = extList.map(i => filePath + i);
      const fPath = filePaths.find(IsThere);
      if (fPath) {
        fs.readFile(fPath, (err, data) => {
          if (err) {
            rej(err);
          } else {
            res({ filePath: fPath, data: data, ext: path.extname(fPath) });
          }
        });
      } else {
        rej('Script not found.');
      }
    });
  }
}

module.exports = new FileManager();
