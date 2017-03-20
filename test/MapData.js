require 'jasmine';

const MapData = require('../lib/mapdata'); 

describe('#loadMap', function () {
	it('should load nodes', function () {
		var md = new MapData();
	    const map = md.loadMap('Map1_Crossing');
	    expect(map.nodes.length).toNotBe(0);
    })
});