#!/usr/bin/env node
// Boats baker (chantier B.2, pipeline A): tools/art/boats.js -> assets/boats.*   node tools/bake-boats.js
// Frame keys: boat/<fishboat|ship>/<down|left|up|right>/<0..3>. The hull is cut at the water line (z < 0 is not drawn).
'use strict';
const { render, despeckle, stabilize, finish } = require('./lib/sdf'); const { Atlas } = require('./lib/atlas'); const BT = require('./art/boats');
const YAW = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
const at = new Atlas('boats', { maxW: 512 }); let nf = 0;
for (const name in BT.BOATS) { const b = BT.BOATS[name];
  for (const dir of ['down', 'left', 'up', 'right']) { const raws = [];
    for (let i = 0; i < b.frames; i++) raws.push(render(BT.frame(name, i), { w: b.cell, h: b.cell, ox: b.cell / 2, oy: b.oy, yaw: YAW[dir], mats: BT.MATS, ss: 4, raw: true, clip: (x, y, z) => -z }));
    for (const r of raws) despeckle(r.img, r.matAt, r.protect); stabilize(raws, false);
    raws.forEach((r, i) => { const im = finish(r), bb = im.bounds(); if (bb && (bb.x <= 0 || bb.y <= 0 || bb.x + bb.w >= b.cell || bb.y + bb.h >= b.cell)) console.log(`WARNING boat/${name}/${dir}/${i} touches the cell border`); at.add(`boat/${name}/${dir}/${i}`, im, b.cell / 2, b.oy); nf++; }); } }
at.save(); console.log(`boats: ${nf} frames, atlas ${at.img.w}x${at.img.h}`);
