#!/usr/bin/env node
// People baker (pipeline A + D): every people x look x animation x direction from the single humanoid rig.
//   node tools/bake-people.js [people…] [--looks a,b] [--no-cache]
// Passes per animation: raw render -> despeckle -> temporal stabilise -> outline -> pixel patches (tools/art/patches/people.json).
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { render, despeckle, stabilize, finish } = require('./lib/sdf'); const { Img } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { mat, ix } = require('./lib/mats');
const H = require('./art/rigs/humanoid'); const { PEOPLES, LOOKS, ANIMS } = require('./art/peoples');
const YAW = { down: 0, left: -Math.PI / 2, up: Math.PI, right: Math.PI / 2 }, DIRS4 = ['down', 'left', 'up', 'right'], CELL = 24, OX = 12, OY = 21.2;
function lookSpec(pid, lid) {
  const P = PEOPLES[pid], L = LOOKS[lid], spec = Object.assign({}, P.spec, L.spec || {}), mats = P.mats();
  if (spec.scaleMul) spec.scale *= spec.scaleMul;
  if (L.mats) for (const k in L.mats) mats[k] = mats[L.mats[k]];
  if (L.hair === 'grey') mats.hair = mat('stone', [3, 4, 5]);
  let acc = (P.spec.acc0 || []).concat(L.acc);
  if (P.swap) acc = acc.map(a => { if (!(a.kind in P.swap)) return a; const s = P.swap[a.kind]; if (!s) return null; const [k, opt] = s.split(':'); const o = Object.assign({}, a, { kind: k }); if (opt === 'horns') o.horns = 1; else if (opt) o.mat = opt; return o; }).filter(Boolean);
  spec.acc = acc.filter(a => H.ACC[a.kind]);
  return { spec, mats, P, L };
}
function bakeLook(pid, lid) {
  const { spec, mats, P, L } = lookSpec(pid, lid), out = [];
  for (const [name, src, nd] of ANIMS) {
    const anim = src || L.work, A = H.ANIMS[name === 'attack' && L.attack ? L.attack : anim], dirs = nd === 4 ? DIRS4 : ['left', 'right'];
    for (const dir of dirs) {
      const raws = [];
      for (let i = 0; i < A.n; i++) { const { scene, decals } = H.build(spec, A.f(i));
        const side = dir === 'left' || dir === 'right'; const dd = decals.filter(d => dir !== 'up' && (d.tag === 'sideeye' ? side : /^eye/.test(d.tag) ? !side : (dir === 'down' || (dir === 'left' ? !/R$/.test(d.tag) : !/L$/.test(d.tag))))).map(d => Object.assign({}, d, { idx: d.idx === 'eye' ? P.eye : P.tusk }));
        raws.push(render(scene, { w: CELL, h: CELL, ox: OX, oy: OY, yaw: YAW[dir], mats, decals: dd, ss: 4, raw: true })); }
      for (const r of raws) despeckle(r.img, r.matAt, r.protect);
      stabilize(raws, !/death|hit|attack|work/.test(name));
      raws.forEach((r, i) => out.push({ key: `${pid}/${lid}/${name}/${dir}/${i}`, d: Buffer.from(finish(r).d) }));
    }
  }
  return out;
}
if (!isMainThread) { const res = []; for (const [p, l] of workerData.jobs) res.push({ p, l, frames: bakeLook(p, l) }); parentPort.postMessage(res); }
else (async () => {
  const args = process.argv.slice(2), wantP = args.filter(a => !a.startsWith('--') && PEOPLES[a]), looksArg = args.includes('--looks') ? args[args.indexOf('--looks') + 1].split(',') : null, noCache = args.includes('--no-cache');
  const peoples = wantP.length ? wantP : Object.keys(PEOPLES), cacheDir = path.join(__dirname, '.cache'); fs.mkdirSync(cacheDir, { recursive: true });
  const srcHash = crypto.createHash('sha1').update(['lib/sdf.js', 'lib/mats.js', 'art/rigs/humanoid.js', 'art/peoples.js', 'art/palette.json', 'bake-people.js', 'lib/measure.js'].map(f => fs.readFileSync(path.join(__dirname, f))).join('')).digest('hex').slice(0, 12);
  const jobs = [], done = {};
  for (const p of peoples) for (const l of (looksArg || (PEOPLES[p].provisional ? ['villager', 'soldier', 'child'] : Object.keys(LOOKS)))) { const cf = path.join(cacheDir, `people-${p}-${l}-${srcHash}.json`);
    if (!noCache && fs.existsSync(cf)) done[p + '/' + l] = JSON.parse(fs.readFileSync(cf, 'utf8')).map(f => ({ key: f.key, d: Buffer.from(f.d, 'base64') })); else jobs.push([p, l]); }
  const t0 = Date.now(), NW = Math.min(4, jobs.length);
  if (jobs.length) { const parts = Array.from({ length: NW }, () => []); jobs.forEach((j, i) => parts[i % NW].push(j));
    const res = await Promise.all(parts.map(js => new Promise((ok, ko) => { const w = new Worker(__filename, { workerData: { jobs: js } }); w.on('message', ok); w.on('error', ko); })));
    for (const r of res.flat()) { const fr = r.frames.map(f => ({ key: f.key, d: Buffer.from(f.d) })); done[r.p + '/' + r.l] = fr; fs.writeFileSync(path.join(cacheDir, `people-${r.p}-${r.l}-${srcHash}.json`), JSON.stringify(fr.map(f => ({ key: f.key, d: f.d.toString('base64') })))); } }
  const pf = path.join(__dirname, 'art/patches/people.json'), patches = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : {}; let np = 0;
  for (const p of peoples) { const at = new Atlas('people_' + p, { maxW: CELL * 40, meta: { cell: CELL, provisional: !!PEOPLES[p].provisional } });
    for (const k of Object.keys(done).filter(k => k.startsWith(p + '/')).sort()) for (const f of done[k]) { const im = new Img(CELL, CELL); im.d.set(f.d);
      const pk = patches[f.key]; if (pk) for (const [x, y, v] of pk) { im.set(x, y, v); np++; } at.add(f.key, im, 12, 21); }
    at.save(); console.log(`people_${p}: ${Object.keys(at.frames).length} frames, atlas ${at.img.w}x${at.img.h}`); }
  console.log(`baked ${jobs.length} looks in ${((Date.now() - t0) / 1000).toFixed(1)}s (cached ${Object.keys(done).length - jobs.length}), patch pixels applied ${np}`);
})();
