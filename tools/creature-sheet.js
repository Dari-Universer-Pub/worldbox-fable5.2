#!/usr/bin/env node
// Quick look at creature SOURCES without baking the atlas: renders the named species straight from tools/art/creatures.js.
// One block per species: side view (faces right on screen), three-quarter view, a moving frame; below, the same in silhouette.
//   node tools/creature-sheet.js <out.png> <name,name…|all|second> [scale] [per-row]
'use strict';
const { render, finish } = require('./lib/sdf'); const { Img, T } = require('./lib/img'); const { ix } = require('./lib/mats'); const CR = require('./art/creatures');
const arg = process.argv[3] || 'second', names = arg === 'all' ? Object.keys(CR.SPECIES) : arg === 'second' ? Object.keys(CR.SPECIES).filter(n => CR.SPECIES[n].prov) : arg.split(',');
const YAW = { down: 0, left: -Math.PI / 2, up: Math.PI, right: Math.PI / 2 }, YAWQ = { down: -0.75, left: -Math.PI / 2, up: Math.PI + 0.75, right: Math.PI / 2 };
function one(name, anim, dir, i) { const sp = CR.SPECIES[name], cell = sp.cell, { scene, decals } = CR.frame(name, anim, i), side = dir === 'left' || dir === 'right';
  const dd = decals.filter(d => dir !== 'up' && (sp.rig === 'human' ? (d.tag === 'sideeye' ? side : /^eye/.test(d.tag) ? !side : (dir === 'down' || (dir === 'left' ? !/R$/.test(d.tag) : !/L$/.test(d.tag)))) : ((dir === 'down' && sp.rig !== 'quad') || (dir === 'left' || dir === 'down' ? !/R$/.test(d.tag) : !/L$/.test(d.tag))))).map(d => Object.assign({}, d, { idx: d.idx === 'eye' ? sp.eye : d.idx === 'tusk' ? sp.tusk : ix('stone', 0) }));
  const im = finish(render(scene, { w: cell, h: cell, ox: cell / 2, oy: sp.oy + 0.2, yaw: (sp.rig === 'quad' ? YAWQ : YAW)[dir], mats: sp.mats, decals: dd, ss: 4, raw: true })), b = im.bounds();
  if (b && (b.x <= 0 || b.y <= 0 || b.x + b.w >= cell || b.y + b.h >= cell)) console.log('touches the border: ' + name + ' ' + anim + ' ' + dir + ' ' + i + '  x' + b.x + ' y' + b.y + ' ' + b.w + 'x' + b.h + ' of ' + cell); return im; }
const per = +process.argv[5] || 6, C = Math.max(...names.map(n => CR.SPECIES[n].cell)) + 2, rows = Math.ceil(names.length / per), sh = new Img(per * C * 3, rows * 2 * C, ix('grass', 3));
names.forEach((n, q) => { const sp = CR.SPECIES[n], rest = sp.rig === 'fish' || sp.rig === 'serpent' ? 'swim' : 'idle', mv = sp.rig === 'quad' || sp.rig === 'human' ? 'walk' : sp.rig === 'bird' ? 'fly' : 'swim', c = q % per, r = (q / per) | 0;
  sh.rect(c * C * 3, r * 2 * C + C, C * 3, C, ix('ice', 5));
  [one(n, rest, 'left', 0), one(n, mv, 'down', 1), one(n, mv, 'left', 2)].forEach((im, j) => { sh.blit(im, c * C * 3 + j * C + 1, r * 2 * C + C - 1 - im.h); const s = im.clone(); for (let t = 0; t < s.d.length; t++) if (s.d[t] !== T) s.d[t] = ix('stone', 0); sh.blit(s, c * C * 3 + j * C + 1, r * 2 * C + 2 * C - 1 - im.h); }); });
sh.savePNG(process.argv[2], { scale: +process.argv[4] || 4 }); console.log('sheet ' + process.argv[2] + '  ' + names.join(' '));
