// Stage definitions: the run crosses farmyard, barn, then the dreaded kitchen.
var STAGES = [
  { name: 'FARMYARD', from: 0, sky: '#ffd9a0', far: '#e8a558', ground: '#b5793a', speed: 5.2, gapMs: 1500, kinds: ['fence', 'haybale', 'knife'] },
  { name: 'THE BARN', from: 400, sky: '#f4b183', far: '#c97b3f', ground: '#8f5a2b', speed: 6.4, gapMs: 1250, kinds: ['fence', 'haybale', 'knife', 'crate'] },
  { name: 'THE KITCHEN', from: 900, sky: '#f2c94c', far: '#d9a05b', ground: '#7a4a21', speed: 7.6, gapMs: 1050, kinds: ['oven', 'knife', 'crate', 'fence'] }
];
var ESCAPE_DISTANCE = 1500; // metres to freedom

function stageAt(distance) {
  var s = STAGES[0];
  for (var i = 0; i < STAGES.length; i++) if (distance >= STAGES[i].from) s = STAGES[i];
  return s;
}
