const fs = require('fs');
const files = require('./lib/files');
const path = require('path');
var parse = require('xml2js').parseString;
const _ = require('lodash');

function loadFile(filepath) {
  return new Promise((res, rej) => {
    fs.readFile(filepath, 'ucs2', (err, raw) => {
      if (err) {
        return rej(err);
      }

      parse(raw, { trim: true, strict: true }, (err, data) => {
          if (err) {
            console.log(err);
            return rej(err);
          }

          res(data);
        });
    });
  });
}

function convertNode(rawNode) {
  return {
    x: rawNode.position[0].$.x,
    y: rawNode.position[0].$.y,
    color: rawNode.$.color,
    id: rawNode.$.id,
    arcs: (rawNode.arc || []).map(i => convertArc(i)),
    notes: (rawNode.$.note || '').split('|'),
  };
}

function convertArc(rawArc) {
  return {
    destId: rawArc.$.destination,
    dir: rawArc.$.exit,
    move: rawArc.$.move,
  };
}

function convertLabel(rawLabel) {
  var position = rawLabel.position[0];
  return {
    x: position.$.x,
    y: position.$.y,
    text: rawLabel.$.text,
  };
}

function extractDescriptions(filename) {
  return new Promise((res, rej) => {
    var cache = [];
    loadFile(filename).then((data) => {
      data.zone.node.forEach(n => {
        if ((n.$.note || '').indexOf('.xml') == -1) {
          cache.push({
            mapName: path.basename(filename, '.xml'),
            id: n.$.id,
            description: n.description[0],
          });
        }
      });
      res(cache);
    }).catch(console.log);
  });
}

files.listDirectory('maps/*.xml', {}, (files) => {
  Promise.all(files.map(extractDescriptions)).then((results) => {
    const flatResults = _.flatten(results);
    console.log('Room quick lookup records: ' + flatResults.length.toString());
    fs.writeFile('./lib/maps/cache.json', JSON.stringify(flatResults), function() {});
  });

  files.forEach(file => {
    loadFile(file).then((data) => {
      var zone = {
        nodes: (data.zone.node || []).map(convertNode),
        labels: (data.zone.label || []).map(convertLabel),
      };
      fs.writeFile('./lib/maps/' + path.basename(file, '.xml') + '.json', JSON.stringify(zone), function() {});
    });
  });

});
