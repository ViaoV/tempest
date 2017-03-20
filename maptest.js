
const MapData = require('./lib/mapdata');

var maps = new MapData();

const startTime = new Date();


// Maps.loadMap('Map1_Crossing.xml', (map) => {
//   var path = map.shortestPath('1', '231');
//   console.log(path)
//   // Console.log(map.getNode(1));
//   // console.log(map.findPath(map.getNode(1), map.getNode(231)));
//   console.log(new Date() - startTime);
// });

var desc = 'Several blood splatters down the wall are framed on either side by a series of bloody hand prints.  Drag marks line the sand, and irregular dark droplets follow the trail back towards the triage area.';

var fs = require('fs');
fs.readFile('roomtext.json', (err, data) => {
    var nodes = JSON.parse(data.toString());
    var node = nodes.find(n => n.description == desc);
    console.log('***** FLAT FILE *******');
    console.log(node);
    console.log(new Date() - startTime);
  });
