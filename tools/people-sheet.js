#!/usr/bin/env node
// Compact people overview: one row per look: idle 4 directions + a few key frames. node tools/people-sheet.js human,orc [out.png] [--sil]
'use strict';
const { Img, T } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix } = require('./lib/mats');
const ps = (process.argv[2] || 'human,orc').split(','), out = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'shots/people-overview.png', sil = process.argv.includes('--sil');
const cols = [['idle', 'down', 0], ['idle', 'left', 0], ['idle', 'up', 0], ['idle', 'right', 0], ['walk', 'down', 2], ['walk', 'right', 1], ['walk', 'right', 3], ['work', 'right', 1], ['work', 'right', 3], ['attack', 'right', 1], ['attack', 'right', 3], ['hit', 'down', 0], ['pray', 'left', 2], ['joy', 'down', 3], ['death', 'right', 4], ['death', 'right', 7], ['sleep', 'left', 0]];
const rows = []; for (const p of ps) { const at = Atlas.load('people_' + p), looks = [...new Set(Object.keys(at.frames).map(k => k.split('/')[1]))]; for (const l of looks) rows.push([at, p, l]); }
const bgs = [ix('grass', 4), ix('forest', 4), ix('sand', 4), ix('ice', 5), ix('stone', 3)];
const sh = new Img(cols.length * 25 + 1, rows.length * 25 + 1, sil ? ix('ice', 5) : bgs[0]);
rows.forEach(([at, p, l], r) => { if (!sil) sh.rect(0, r * 25, sh.w, 25, bgs[r % bgs.length]); cols.forEach(([a, d, i], c) => { let f = at.frame(`${p}/${l}/${a}/${d}/${i}`); if (!f) return; if (sil) { f = f.clone(); for (let j = 0; j < f.d.length; j++) if (f.d[j] !== T) f.d[j] = ix('stone', 0); } sh.blit(f, c * 25 + 1, r * 25 + 1); }); });
sh.savePNG(out, { scale: +(process.argv.find(a => /^--scale=/.test(a)) || '--scale=3').split('=')[1] }); console.log(out, rows.map(r => r[1] + '/' + r[2]).join(' '));
