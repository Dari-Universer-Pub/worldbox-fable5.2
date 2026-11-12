#!/usr/bin/env node
// Quick look at building SOURCES without baking the atlas: every type of one set, finished state, for the given stages.
//   node tools/building-sheet.js <out.png> <set> [stages, default 0,1,2,3,4] [scale] [sil]
'use strict';
const { render, despeckle, outline } = require('./lib/sdf'); const { Img, T } = require('./lib/img'); const { ix } = require('./lib/mats'); const BL = require('./art/buildings');
const set = process.argv[3], stages = (process.argv[4] || '0,1,2,3,4').split(',').map(Number), S = 1.3, types = Object.keys(BL.D), sil = process.argv[6] === 'sil', C = 66;
const sh = new Img(types.length * C, stages.length * C, sil ? ix('ice', 5) : ix('grass', 3));
types.forEach((type, c) => stages.forEach((s, r) => { const d = BL.DSETS[set][type], k = BL.finishHi(set, type, d.make(BL.kit(s)), d.fp), cell = 64, fp = d.fp, ox = cell / 2, oy = cell - 4 - fp[1] * 4;
  const raw = render(k.sc, { w: cell, h: cell, ox, oy, mats: BL.SETS[set](), ss: 3, innerDepth: 3, raw: true, clip: (x, y, z) => -z, scale: S }); despeckle(raw.img, raw.matAt, raw.protect); outline(raw.img, raw.matAt, {});
  const b = raw.img.bounds(); if (b && (b.x <= 0 || b.y <= 0 || b.x + b.w >= cell || b.y + b.h >= cell)) console.log('does not fit 64: ' + set + ' ' + type + ' stage ' + s + '  y' + b.y + ' ' + b.w + 'x' + b.h);
  if (sil) for (let t = 0; t < raw.img.d.length; t++) if (raw.img.d[t] !== T) raw.img.d[t] = ix('stone', 0); sh.blit(raw.img, c * C + 1, r * C + 1); }));
sh.savePNG(process.argv[2], { scale: +process.argv[5] || 2 }); console.log('sheet ' + process.argv[2]);
