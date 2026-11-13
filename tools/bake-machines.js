#!/usr/bin/env node
// Siege machines baker (chantier B.4): tools/art/machines.js -> assets/machines.*   node tools/bake-machines.js
// Frame keys: machine/<ram|catapult>/<move|attack|wreck>/<down|left|up|right>/<i>. Side views are turned a little so that the roof and the arm read.
'use strict';
const { render, despeckle, stabilize, finish } = require('./lib/sdf'); const { Atlas } = require('./lib/atlas'); const MC = require('./art/machines');
const YAW = { right: 0.12, down: Math.PI / 2 - 0.5, left: Math.PI - 0.12, up: -Math.PI / 2 - 0.5 };
const at = new Atlas('machines', { maxW: 960 }); let nf = 0;
for (const name in MC.MACHINES) { const b = MC.MACHINES[name];
  for (const [anim, n] of MC.ANIMS) for (const dir of ['down', 'left', 'up', 'right']) { const raws = [];
    for (let i = 0; i < n; i++) raws.push(render(MC.frame(name, anim, i), { w: b.cell, h: b.cell, ox: b.cell / 2, oy: b.oy, yaw: YAW[dir], mats: MC.MATS, ss: 4, raw: true, scale: 1.12 }));
    for (const r of raws) despeckle(r.img, r.matAt, r.protect); stabilize(raws, false);
    raws.forEach((r, i) => { const im = finish(r), bb = im.bounds(); if (bb && (bb.x <= 0 || bb.y <= 0 || bb.x + bb.w >= b.cell || bb.y + bb.h >= b.cell)) console.log(`WARNING machine/${name}/${anim}/${dir}/${i} touches the cell border`); at.add(`machine/${name}/${anim}/${dir}/${i}`, im, b.cell / 2, b.oy); nf++; }); } }
at.save(); console.log(`machines: ${nf} frames, atlas ${at.img.w}x${at.img.h}`);
