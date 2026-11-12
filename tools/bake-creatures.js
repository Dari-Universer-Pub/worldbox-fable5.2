#!/usr/bin/env node
// Animals baker (pipeline A): species x animation x direction from the quadruped, bird, fish, serpent rigs (and the humanoid rig
// for the provisional monsters baked at their own size).  node tools/bake-creatures.js
// Frame keys: <species>/<anim>/<dir>/<i>. Same passes as the people baker (despeckle, temporal stabilise, outline, patches).
'use strict';
const fs = require('fs'), path = require('path');
const { render, despeckle, stabilize, finish } = require('./lib/sdf'); const { Img } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix } = require('./lib/mats');
const CR = require('./art/creatures');
// quadrupeds seen head-on are a pillar: their down/up views are turned three-quarters
const YAW = { down: 0, left: -Math.PI / 2, up: Math.PI, right: Math.PI / 2 }, YAWQ = { down: -0.75, left: -Math.PI / 2, up: Math.PI + 0.75, right: Math.PI / 2 }, DIRS4 = ['down', 'left', 'up', 'right'];
const pf = path.join(__dirname, 'art/patches/creatures.json'), patches = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : {};
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
// one species -> its frames (key, cell, pixels)
function bakeSpecies(name) { const sp = CR.SPECIES[name], cell = sp.cell, out = [];
  for (const [anim, n, nd] of CR.anims(name)) for (const dir of nd === 4 ? DIRS4 : ['left', 'right']) { const raws = [];
    for (let i = 0; i < n; i++) { const { scene, decals } = CR.frame(name, anim, i);
      const side = dir === 'left' || dir === 'right', dd = decals.filter(d => dir !== 'up' && (sp.rig === 'human' ? (d.tag === 'sideeye' ? side : /^eye/.test(d.tag) ? !side : (dir === 'down' || (dir === 'left' ? !/R$/.test(d.tag) : !/L$/.test(d.tag)))) : ((dir === 'down' && sp.rig !== 'quad') || (dir === 'left' || dir === 'down' ? !/R$/.test(d.tag) : !/L$/.test(d.tag))))).map(d => Object.assign({}, d, { idx: d.idx === 'eye' ? sp.eye : d.idx === 'tusk' ? sp.tusk : ix('stone', 0) }));
      raws.push(render(scene, { w: cell, h: cell, ox: cell / 2, oy: sp.oy + 0.2, yaw: (sp.rig === 'quad' ? YAWQ : YAW)[dir], mats: sp.mats, decals: dd, ss: 4, raw: true })); }
    for (const r of raws) despeckle(r.img, r.matAt, r.protect); stabilize(raws, !/death|hit|attack/.test(anim));
    raws.forEach((r, i) => { const key = `${name}/${anim}/${dir}/${i}`, im = finish(r); const pk = patches[key]; if (pk) for (const [x, y, v] of pk) im.set(x, y, v); out.push({ key, cell, d: Buffer.from(im.d) }); }); }
  return out; }
if (!isMainThread) { parentPort.postMessage(workerData.names.map(n => ({ name: n, frames: bakeSpecies(n) }))); }
else (async () => { const t0 = Date.now(), all = Object.keys(CR.SPECIES), NW = 4, parts = Array.from({ length: NW }, () => []);
  // heaviest species first, dealt round-robin, so that the four workers finish together
  all.slice().sort((a, b) => CR.SPECIES[b].cell - CR.SPECIES[a].cell).forEach((n, i) => parts[i % NW].push(n));
  const res = (await Promise.all(parts.map(names => new Promise((ok, ko) => { const w = new Worker(__filename, { workerData: { names } }); w.on('message', ok); w.on('error', ko); })))).flat(), by = {}; for (const r of res) by[r.name] = r.frames;
  for (const prov of [false, true]) { const at = new Atlas(prov ? 'creatures2' : 'creatures', { maxW: 1024 }); let nf = 0;
    for (const name of all.filter(n => !!CR.SPECIES[n].prov === prov)) { const sp = CR.SPECIES[name]; for (const f of by[name]) { const im = new Img(f.cell, f.cell); im.d.set(f.d); at.add(f.key, im, f.cell / 2, sp.oy); nf++; } }
    at.save(); console.log(`${prov ? 'creatures2 (second set)' : 'creatures'}: ${nf} frames, atlas ${at.img.w}x${at.img.h}`); }
  console.log(`baked ${all.length} species in ${((Date.now() - t0) / 1000).toFixed(1)}s`); })();
