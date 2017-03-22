const fs = require('fs');
var parse = require('xml2js').parseString;
const _ = require('lodash');
const files = require('./files');
const path = require('path');
const { app } = require('electron');

class MapData {

  lookupRoom(desc) {
    return new Promise((res, rej) => {
      const fp = path.join(app.getAppPath(), 'lib', 'maps', 'cache.json');
      fs.readFile(fp, (err, data) => {
        if (err) {
          console.log(err);
          return rej(err);
        }

        var nodes = JSON.parse(data.toString());
        res(nodes.find((n) => n.description.trim() == desc.trim()));
      });
    });
  }

  loadMap(mapName) {
    const filename = path.join(app.getAppPath(), 'lib', 'maps', mapName + '.json');
    return new Promise((res, rej) => {
      fs.readFile(filename, (e, data) => {
          if (e) {
            rej(e);
          }

          res(new Map(JSON.parse(data.toString())));
        });
    });
  }
}

class Node {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Arc {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Label {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Map {

  constructor(data) {
    this.nodes =  (data.nodes || []).map(n => new Node(n));
    this.labels = (data.labels || []).map(n => new Label(n));
    this.minX = _.min(this.nodes.map(i => parseInt(i.x)));
    this.maxX = _.max(this.nodes.map(i => parseInt(i.x)));
    this.minY = _.min(this.nodes.map(i => parseInt(i.y)));
    this.maxY = _.max(this.nodes.map(i => parseInt(i.y)));
  }

  getNode(id) {
    id = id.toString();
    return this.nodes.find(n => n.id == id);
  }

  buildMoveCommands(path) {
    var commands = [];
    for (var i = 0; i < path.length - 1; i++) {
      var node = this.getNode(path[i]);
      var arc = node.arcs.find(a => a.destId === path[i + 1]);
      commands.push(arc.move);
    }

    return commands;
  }

  movePath(source, target) {
    var graph = { neighbors: {} };
    this.nodes.forEach(n => {
      graph.neighbors[n.id] = n.arcs.map(i => i.destId).filter(i=>i);
    });
    if (source == target) {
      return [];
    }

    var queue = [source];
    var visited = { source: true };
    var predecessor = {};
    var tail = 0;
    while (tail < queue.length) {
      var u = queue[tail++];
      var neighbors = graph.neighbors[u];
      for (var i = 0; i < neighbors.length; ++i) {
        var v = neighbors[i];
        if (visited[v]) {
          continue;
        }

        visited[v] = true;
        if (v === target) {
          var path = [v];
          while (u !== source) {
            path.push(u);
            u = predecessor[u];
          }

          path.push(u);
          path.reverse();
          return this.buildMoveCommands(path);
        }

        predecessor[v] = u;
        queue.push(v);
      }
    }
  }
}

module.exports = MapData;
