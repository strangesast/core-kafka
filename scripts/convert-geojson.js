#!/usb/bin/node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length != 1 || !args[0].endsWith('geojson')) {
  throw new Error('invalid args');
}

const p = path.resolve(args[0]);
const fp = path.parse(p);
const f = fs.readFileSync(p);
const s = f.toString();

const obj = JSON.parse(s);

const grouped = {};
for (const feature of obj.features) {
  const { Layer } = feature.properties;
  if (!(Layer in grouped)) {
    grouped[Layer] = [];
  }
  grouped[Layer].push(feature);
}

for (const [groupId, features] of Object.entries(grouped)) {
  const fileName = `${groupId}.geojson`;
  const fc = {
    type: 'FeatureCollection',
    name: 'entities',
    features: features.map(({type, geometry}) => ({type, geometry})),
  };
  fs.writeFileSync(fileName, JSON.stringify(fc));
}

const topo = execSync(`geo2topo ${Object.keys(grouped).map(id => `${id}=${id}.geojson`).join(' ')}`)
fs.writeFileSync(fp.name + '.json', topo.toString())
