#!/usr/bin/env node
// Sheet viewer. Writes an enlarged PNG of atlas frames so that they can be LOOKED at.
//   node tools/sheet.js <atlas> [--match <regex>] [--scale 4|8] [--cols N] [--silhouette] [--diff] [--bg ramp:tone[,ramp:tone…]]
//                        [--team ramp] [--frames] [--labels] [--out file.png] [--max N]
//   --silhouette : black shapes on white (readability test)        --diff : frame-to-frame flicker map of each animation
//   --frames     : also export every matched frame as its own PNG into shots/frames/<atlas>/…
'use strict';
const path = require('path'); const { Img, T, palette } = require('./lib/img'); const { Atlas, groups } = require('./lib/atlas'); const text = require('./lib/text'); const M = require('./lib/measure'); const { ix } = require('./lib/mats');
const args = process.argv.slice(2), opt = {}; let name = null;
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['silhouette', 'diff', 'frames', 'labels'].includes(k)) opt[k] = true; else opt[k] = args[++i]; } else name = a; }
if (!name) { console.log('usage: node tools/sheet.js <atlas> [options]'); process.exit(1); }
const at = Atlas.load(name), re = opt.match ? new RegExp(opt.match) : null, scale = +opt.scale || 4;
let keys = at.keys(re); if (opt.max) keys = keys.slice(0, +opt.max);
if (!keys.length) { console.log('no frame matches'); process.exit(1); }
const g = groups(keys), bases = Object.keys(g);
const cw = Math.max(...keys.map(k => at.frames[k][2])) + 2, ch = Math.max(...keys.map(k => at.frames[k][3])) + 2;
const bgs = (opt.bg || 'grass:3').split(',').map(s => { const [r, t] = s.split(':'); return ix(r, +t); });
const lab = opt.labels ? 9 : 0;
const rows = [];
if (opt.cols) { for (let i = 0; i < keys.length; i += +opt.cols) rows.push({ label: keys[i], keys: keys.slice(i, i + +opt.cols) }); }
else for (const b of bases) rows.push({ label: b, keys: g[b] });
const W = Math.max(...rows.map(r => r.keys.length)) * cw + 2, H = rows.length * (ch + lab) * (opt.diff ? 2 : 1) + 2;
const sheet = new Img(W, H, opt.silhouette ? ix('ice', 5) : bgs[0]);
const teamRamp = opt.team ? palette().ramps[opt.team] : null;
let y = 1;
rows.forEach((r, ri) => {
  const bg = opt.silhouette ? ix('ice', 5) : bgs[ri % bgs.length]; sheet.rect(0, y - 1, W, ch + lab + (opt.diff ? ch : 0), bg);
  if (lab) text.draw(sheet, r.label.slice(-Math.floor(W / 5)), 2, y, opt.silhouette ? ix('stone', 0) : ix('ice', 5)), y += lab;
  r.keys.forEach((k, i) => { let f = at.frame(k); if (opt.silhouette) { f = f.clone(); for (let j = 0; j < f.d.length; j++) if (f.d[j] !== T) f.d[j] = ix('stone', 0); } sheet.blit(f, 1 + i * cw + 1, y + 1); });
  y += ch;
  if (opt.diff) { r.keys.forEach((k, i) => { const a = at.frame(k), b = at.frame(r.keys[(i + 1) % r.keys.length]), fl = M.flicker(a, b), d = new Img(a.w, a.h);
      for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) { const p = a.get(xx, yy), q = b.get(xx + fl.sx, yy + fl.sy); if (p === T) continue; d.set(xx, yy, q !== T && p !== q ? ix('fire', 4) : ix('stone', 1)); }
      sheet.blit(d, 1 + i * cw + 1, y + 1); }); y += ch; }
});
const out = opt.out || path.join(__dirname, '../shots', 'sheet-' + name + (opt.silhouette ? '-sil' : '') + (opt.diff ? '-diff' : '') + '.png');
if (teamRamp != null) sheet.savePNG(out, { scale, teamRamp }); else sheet.savePNG(out, { scale });
console.log('sheet ' + out + '  ' + W * scale + 'x' + H * scale + '  frames ' + keys.length + '  rows ' + rows.length);
if (opt.frames) { for (const k of keys) at.frame(k).savePNG(path.join(__dirname, '../shots/frames', name, k.replace(/\//g, '_') + '.png'), { scale, bg: palette().rgb[bgs[0]] }); console.log('frames exported to shots/frames/' + name); }
