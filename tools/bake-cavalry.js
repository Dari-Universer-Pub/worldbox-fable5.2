#!/usr/bin/env node
// Cavalry baker (chantier B.4): tools/art/cavalry.js -> atlas `cavalry` (32x32 cells, '<people>/rider/<anim>/<dir>/<i>').
//   node tools/bake-cavalry.js [people…]
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { render, despeckle, stabilize, finish } = require('./lib/sdf'); const { Img } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix } = require('./lib/mats');
const CV = require('./art/cavalry'); const { PEOPLES } = require('./art/peoples');
const YAWQ = { down: -0.75, left: -Math.PI / 2, up: Math.PI + 0.75, right: Math.PI / 2 }, DIRS4 = ['down', 'left', 'up', 'right'];
function bake(pid) { const P = PEOPLES[pid], { mats } = CV.specOf(pid), out = [];
  for (const [anim, n, nd] of CV.ANIMS) for (const dir of nd === 4 ? DIRS4 : ['left', 'right']) { const raws = [];
    for (let i = 0; i < n; i++) { const { scene, decals } = CV.frame(pid, anim, i);
      const dd = decals.filter(d => dir !== 'up' && d.tag !== 'sideeye' && (dir === 'left' || dir === 'down' ? !/R$/.test(d.tag) : !/L$/.test(d.tag))).map(d => Object.assign({}, d, { idx: d.idx === 'eye' ? (d.rider ? P.eye : ix('stone', 0)) : d.idx === 'tusk' ? P.tusk : ix('stone', 0) }));
      raws.push(render(scene, { w: CV.CELL, h: CV.CELL, ox: CV.CELL / 2, oy: CV.OY + 0.2, yaw: YAWQ[dir], mats, decals: dd, ss: 4, raw: true })); }
    for (const r of raws) despeckle(r.img, r.matAt, r.protect); stabilize(raws, !/death|hit|attack/.test(anim));
    raws.forEach((r, i) => out.push({ key: `${pid}/rider/${anim}/${dir}/${i}`, d: Buffer.from(finish(r).d) })); }
  return out; }
if (!isMainThread) parentPort.postMessage(workerData.names.map(n => ({ name: n, frames: bake(n) })));
else (async () => { const t0 = Date.now(), want = process.argv.slice(2).filter(a => CV.MOUNT[a]), all = want.length ? want : Object.keys(CV.MOUNT), NW = Math.min(4, all.length), parts = Array.from({ length: NW }, () => []); all.forEach((n, i) => parts[i % NW].push(n));
  const res = (await Promise.all(parts.map(names => new Promise((ok, ko) => { const w = new Worker(__filename, { workerData: { names } }); w.on('message', ok); w.on('error', ko); })))).flat(), by = {}; for (const r of res) by[r.name] = r.frames;
  const at = new Atlas('cavalry', { maxW: 1024 }); let nf = 0; for (const n of all) for (const f of by[n]) { const im = new Img(CV.CELL, CV.CELL); im.d.set(f.d); const bb = im.bounds(); if (bb && (bb.y <= 0 || bb.x <= 0 || bb.x + bb.w >= CV.CELL)) console.log('WARNING ' + f.key + ' touches the cell border'); at.add(f.key, im, CV.CELL / 2, CV.OY); nf++; }
  at.save(); console.log(`cavalry: ${nf} frames, atlas ${at.img.w}x${at.img.h}, ${((Date.now() - t0) / 1000).toFixed(1)}s`); })();
