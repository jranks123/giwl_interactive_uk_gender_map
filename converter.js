const fs = require('fs');
const topojson = require('topojson-client');

const topojsonData = JSON.parse(fs.readFileSync('./uk_map.json', 'utf8'));
const geojsonData = topojson.feature(topojsonData, topojsonData.objects.lad);

fs.writeFileSync('./uk_map_geo.json', JSON.stringify(geojsonData, null, 2));
