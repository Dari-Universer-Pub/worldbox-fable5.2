#!/usr/bin/env node
// Sprite measurements on an atlas: isolated pixels, outline uniformity, saturation, size, flicker per animation, contrast vs grounds.
//   node tools/measure-sprite.js <atlas> [--match regex] [--flicker-max 0.12] [--idle-flicker-max 0.05] [--json] [--contrast]
'use strict';
const { Atlas, groups } = require('./lib/atlas'); const M = require('./lib/measure'); const { palette } = require('./lib/img'); const { ix } = require('./lib/mats');
const args = process.argv.slice(2), opt = {}; let name = null;
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['json', 'contrast', 'quiet'].includes(k)) opt[k] = true; else opt[k] = args[++i]; } else name = a; }
const at = Atlas.load(name), keys = at.keys(opt.match ? new RegExp(opt.match) : null), g = groups(keys), P = palette();
const flMax = +(opt['flicker-max'] || 0.10), idleMax = +(opt['idle-flicker-max'] || 0.03);
let fail = 0, isoT = 0, opT = 0, worst = { v: 0 }, satSum = 0, n = 0, uniform = 0; const rows = [];
for (const base in g) {
  const fr = g[base].map(k => at.frame(k)); let iso = 0, op = 0, fl = 0, fAll = 0, both = 0, flMaxPair = 0;
  for (const f of fr) { iso += M.isolated(f); op += M.opaque(f); satSum += M.saturationMean(f); n++; const os = M.outlineStats(f); if (os.border > 12 && os.topShare > 0.92) uniform++; }
  if (fr.length > 1) for (let i = 0; i < fr.length; i++) { const r = M.flickerShade(fr[i], fr[(i + 1) % fr.length]); fl += r.fs; fAll += r.fl; both += r.both; flMaxPair = Math.max(flMaxPair, r.both ? r.fs / r.both : 0); }
  // the flicker counted here is SHADING flicker (same material, other tone). A pixel that becomes another material is a limb moving, so it is not counted; calm loops (idle, sleep, walk) get the strict limit, action animations the loose one
  const ratio = both ? fl / both : 0, lim = /idle|sleep|sway|stand|walk/.test(base) ? idleMax : flMax, bad = ratio > lim;
  if (bad) fail++; if (ratio > worst.v) worst = { v: ratio, base };
  isoT += iso; opT += op; rows.push({ base, frames: fr.length, isolated: iso, isoPct: +(100 * iso / Math.max(1, op)).toFixed(2), flicker: +(100 * ratio).toFixed(2), colourChange: +(100 * (both ? fAll / both : 0)).toFixed(2), flickerMaxPair: +(100 * flMaxPair).toFixed(2), bad });
}
if (opt.json) console.log(JSON.stringify(rows));
else if (!opt.quiet) for (const r of rows) if (r.bad || rows.length < 40) console.log((r.bad ? 'FAIL ' : 'ok   ') + r.base.padEnd(44) + ' frames ' + String(r.frames).padStart(2) + '  isolated ' + String(r.isoPct).padStart(5) + '%  flicker ' + String(r.flicker).padStart(5) + '% (max pair ' + r.flickerMaxPair + '%)');
console.log(`[${name}] animations ${rows.length}, frames ${n}, isolated pixels ${isoT} (${(100 * isoT / Math.max(1, opT)).toFixed(2)}% of opaque), mean saturation ${(satSum / Math.max(1, n)).toFixed(1)}%, uniform-outline frames ${uniform}, worst flicker ${(100 * worst.v).toFixed(2)}% (${worst.base || '-'}), flicker failures ${fail}`);
if (opt.contrast) { const grounds = { grass: ix('grass', 3), forest: ix('forest', 2), sand: ix('sand', 4), snow: ix('ice', 4), stone: ix('stone', 3), swamp: ix('swamp', 2), earth: ix('earth', 3), jungle: ix('jungle', 3) };
  for (const gn in grounds) { let min = 99, mk = ''; for (const k of keys) { const c = M.spriteContrast(at.frame(k), P.rgb[grounds[gn]]); if (c < min) { min = c; mk = k; } } console.log(`  contrast vs ${gn.padEnd(7)} min ${min.toFixed(2)}:1 ${min < 4 ? 'FAIL' : 'ok'} (${mk})`); if (min < 4) fail++; } }
process.exit(fail ? 1 : 0);
