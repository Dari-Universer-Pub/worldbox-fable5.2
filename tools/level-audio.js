#!/usr/bin/env node
// Level calibration: measures every sound (tools/measure-audio.js --json) and writes a "vol" factor into
// src/data/sounds.json so that every sound sits within 3 dB of the median loudness of its category
// (the measurement requires: none more than 6 dB above the median). Run after tools/art/sounds.py.   node tools/level-audio.js
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), file = path.join(ROOT, 'src/data/sounds.json'), tmp = path.join(require('os').tmpdir(), 'aeonloom-audio.json');
for (let pass = 0; pass < 3; pass++) {
  spawnSync(process.execPath, [path.join(__dirname, 'measure-audio.js'), '--quiet', '--json', tmp], { encoding: 'utf8' });
  const res = JSON.parse(fs.readFileSync(tmp, 'utf8')), S = JSON.parse(fs.readFileSync(file, 'utf8')), cats = {}; let changed = 0;
  for (const n in res.sounds) { const l = Math.max(...res.sounds[n].filter(m => !m.silent).map(m => m.loudDb)); (cats[S[n].cat] = cats[S[n].cat] || []).push([n, l]); }
  for (const c in cats) { const l = cats[c].map(x => x[1]).sort((a, b) => a - b), med = l[l.length >> 1];
    for (const [n, v] of cats[c]) { const d = v - med; if (Math.abs(d) > 3) { const tgt = d > 0 ? 2 : -2, k = Math.pow(10, (tgt - d) / 20); S[n].vol = +(((S[n].vol == null ? 1 : S[n].vol) * k).toFixed(3)); changed++; } } }
  fs.writeFileSync(file, JSON.stringify(S, null, 1)); console.log('pass ' + (pass + 1) + ': ' + changed + ' level(s) adjusted'); if (!changed) break;
}
