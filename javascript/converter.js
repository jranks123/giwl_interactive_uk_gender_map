// this script will convert a topo file to a geo one

const fs = require('fs');
const topojson = require('topojson-client');

const topojsonData = JSON.parse(fs.readFileSync('./topos/scotland_topo.json', 'utf8'));
const geojsonData = topojson.feature(topojsonData, topojsonData.objects.lad);

fs.writeFileSync('./topos/scotland_map_geo.json', JSON.stringify(geojsonData, null, 2));
