#!/usr/bin/env node
// Buildings baker (pipeline A + D). For every set x type x stage: finished sprite, 2 construction frames (clip plane +
// scaffolding), 1 ruin (jagged clip, rubble, soot). Plus one site marker per footprint.   node tools/bake-buildings.js [--no-cache]
// Frame keys: bld/<set>/<type>/<stage>/<0 done|1|2 construction|3 ruin>, bld/site/<w>x<h>/0. Frame extra: {smoke:[dx,dy], light:[dx,dy]} relative to the pivot.
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { render, despeckle, outline, project, SP } = require('./lib/sdf'); const { Img, T } = require('./lib/img'); const { Atlas } = require('./lib/atlas');
const BL = require('./art/buildings');
const S = 1.3; // model scale: a 3-tile house is ~30 px wide (STYLE.md)
function bakeOne(job, cellForce) {
  const [set, type, stage, variant] = job, isSite = set === 'site'; let k, fp, cell;
  if (isSite) { fp = type.split('x').map(Number); k = BL.site(fp[0], fp[1]); cell = 48; }
  else { const d = BL.DSETS[set][type]; fp = d.fp; k = d.make(BL.kit(stage)); cell = d.great ? 64 : 48; }
  if (cellForce) cell = cellForce;
  const mats = BL.SETS[isSite ? 'human' : set](), ox = cell / 2, oy = cell - 4 - fp[1] * 4, top = k.top / BL.ZS, X = fp[0] * 4 / S + 1.5;
  let clip = null;
  if (isSite) { } else if (variant === 1 || variant === 2) { if (fp[0] === 1) k.sc.p.length = 0; const cut = Math.max(3, top * (variant === 1 ? 0.34 : 0.7)), cz = cut * BL.ZS;
    for (const x of [-X - 0.6, X + 0.6]) k.box(x, 7.5, 0, 0.55, 0.55, cut + 2.5, 'wood', { pri: 9 });
    k.box(0, 8.3, cut - 1.4, X + 1.4, 0.7, 0.9, 'wood', { pri: 9 }); if (variant === 2) k.box(0, 8.3, cut * 0.45, X + 1.4, 0.7, 0.9, 'wood', { pri: 9 });
    k.cap([X - 3, 9.6, 0], [X - 1, 8.6, cut - 1], 0.4, 0.4, 'wood', { pri: 9 });
    clip = (x, y, z) => (Math.abs(x) > X - 0.2 || y > 7.4 * BL.YS && z > cz * 0.4 - 1.2 ? -1 : z - cz); }
  else if (variant === 3) { const hr = (x, y) => 2.6 + 9.5 * BL.hash(Math.floor((x + 40) / 4.2), Math.floor((y + 40) / 5), 11) * (0.45 + 0.55 * BL.hash(Math.floor((x + 40) / 9), 3, 12));
    for (let i = 0; i < 7; i++) { const h1 = BL.hash(i, 1, 21), h2 = BL.hash(i, 2, 21), h3 = BL.hash(i, 3, 21); k.ell((h1 - 0.5) * 2 * (X - 3), 3 + h2 * 7, 0.6, [1.4 + h3 * 1.6, 1.2 + h3, 0.9 + h3], i % 3 ? 'stoneD' : 'timber', { pri: 9 }); }
    k.cap([-X * 0.5, 6, 0.6], [X * 0.2, 9, 3.6], 0.6, 0.6, 'timber', { pri: 9 });
    clip = (x, y, z) => z - hr(x, y); }
  const userClip = clip; clip = userClip ? (x, y, z) => Math.max(-z, userClip(x, y, z)) : (x, y, z) => -z; // nothing below the ground
  const raw = render(k.sc, { w: cell, h: cell, ox, oy, mats, ss: 4, innerDepth: 3, raw: true, clip, scale: S });
  if (variant === 3) { const w = cell; for (let i = 0; i < raw.img.d.length; i++) { const m = raw.matAt[i]; if (!m || raw.img.d[i] >= 128) continue; const kx = i % w, ky = (i / w) | 0; if (BL.hash(kx >> 1, ky >> 1, 31) < 0.6) { const t = m.tones.indexOf(raw.img.d[i]); if (t > 0) raw.img.d[i] = m.tones[t - 1]; } }
    for (let i = 0; i < raw.img.d.length; i++) if (raw.img.d[i] >= 144 && raw.img.d[i] < 156) raw.img.d[i] = mats.dark.tones[1]; }
  despeckle(raw.img, raw.matAt, raw.protect); outline(raw.img, raw.matAt, {});
  const b = raw.img.bounds(); let warn = null; if (b && (b.x <= 0 || b.y <= 0 || b.x + b.w >= cell || b.y + b.h >= cell)) { if (cell === 48 && !isSite) return bakeOne(job, 64); warn = `touches the cell border (${b.x},${b.y}) ${b.w}x${b.h}`; }
  const extra = {}; const pj = p => { const q = project([p[0] * S, p[1] * S, p[2] * S], 0, ox, oy); return [Math.round(q[0] - ox), Math.round(q[1] - (cell - 4))]; };
  if (variant === 0 && !isSite) { if (k.smoke) extra.smoke = pj(k.smoke); if (k.light) extra.light = pj(k.light); extra.h = b ? cell - 4 - b.y : 0; }
  return { key: isSite ? `bld/site/${type}/0` : `bld/${set}/${type}/${stage}/${variant}`, cell, d: Buffer.from(raw.img.d).toString('base64'), extra: Object.keys(extra).length ? extra : null, warn };
}
if (!isMainThread) { parentPort.postMessage(workerData.jobs.map(j => bakeOne(j))); }
else (async () => {
  const noCache = process.argv.includes('--no-cache'), cacheDir = path.join(__dirname, '.cache'); fs.mkdirSync(cacheDir, { recursive: true });
  const srcHash = crypto.createHash('sha1').update(['lib/sdf.js', 'lib/mats.js', 'art/buildings.js', 'art/buildings2.js', 'art/palette.json', 'bake-buildings.js'].map(f => fs.readFileSync(path.join(__dirname, f))).join('')).digest('hex').slice(0, 12);
  const cf = path.join(cacheDir, `buildings-${srcHash}.json`); let res;
  if (!noCache && fs.existsSync(cf)) res = JSON.parse(fs.readFileSync(cf, 'utf8'));
  else { const jobs = [], fps = {}; for (const set of Object.keys(BL.SETS)) for (const type of Object.keys(BL.D)) { fps[BL.D[type].fp.join('x')] = 1; for (let s = 0; s < 3; s++) for (let v = 0; v < 4; v++) jobs.push([set, type, s, v]); }
    for (const f in fps) jobs.push(['site', f, 0, 0]);
    const NW = 4, parts = Array.from({ length: NW }, () => []); jobs.forEach((j, i) => parts[i % NW].push(j)); const t0 = Date.now();
    res = (await Promise.all(parts.map(js => new Promise((ok, ko) => { const w = new Worker(__filename, { workerData: { jobs: js } }); w.on('message', ok); w.on('error', ko); })))).flat();
    res.sort((a, b) => a.key < b.key ? -1 : 1); fs.writeFileSync(cf, JSON.stringify(res)); console.log(`rendered ${jobs.length} building sprites in ${((Date.now() - t0) / 1000).toFixed(1)}s`); }
  const pf = path.join(__dirname, 'art/patches/buildings.json'), patches = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, 'utf8')) : {}; let np = 0;
  const at = new Atlas('buildings', { maxW: 1024, meta: { cell: 48, great: 64 } });
  for (const r of res) { const im = new Img(r.cell, r.cell); im.d.set(Buffer.from(r.d, 'base64')); const pk = patches[r.key]; if (pk) for (const [x, y, v] of pk) { im.set(x, y, v); np++; } at.add(r.key, im, r.cell / 2, r.cell - 4, r.extra || undefined); if (r.warn) console.log('WARNING ' + r.key + ' ' + r.warn); }
  at.save(); console.log(`buildings: ${Object.keys(at.frames).length} frames, atlas ${at.img.w}x${at.img.h}, patch pixels ${np}`);
})();
