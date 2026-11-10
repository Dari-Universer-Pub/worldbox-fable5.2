#!/usr/bin/env node
// Reference sheet of the art direction: grounds, trees, peoples at true relative scale + measured contrast table.
'use strict';
const { Img, palette } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix } = require('./lib/mats'); const M = require('./lib/measure'); const text = require('./lib/text');
const ter = Atlas.load('terrain'), fl = Atlas.load('flora'), P = palette();
const grounds = ['grass', 'forest', 'jungle', 'sand', 'desert', 'savanna', 'swamp', 'hills', 'mountain', 'snow', 'tundra', 'volcanic'];
const W = grounds.length * 48, sh = new Img(W, 150, ix('stone', 0));
const trees = { grass: 'oak', forest: 'pine', jungle: 'jungle', sand: 'palm', desert: 'cactus', savanna: 'acacia', swamp: 'willow', hills: 'birch', mountain: 'rock', snow: 'snowpine', tundra: 'dead', volcanic: 'dead' };
const ppl = []; for (const p of ['human', 'orc']) { try { const at = Atlas.load('people_' + p); const looks = [...new Set(Object.keys(at.frames).map(k => k.split('/')[1]))]; for (const l of looks) ppl.push([at, `${p}/${l}/idle/down/0`], [at, `${p}/${l}/walk/right/2`]); } catch (e) { } }
let fail = 0; const lines = [];
grounds.forEach((g, i) => { const t = ter.frame(g + '/0'); for (let y = 0; y < 150; y += 32) for (let x = 0; x < 48; x += 32) sh.blit(t.crop(0, 0, Math.min(32, 48 - x), Math.min(32, 150 - y)), i * 48 + x, y, { opaque: true });
  const tr = trees[g]; sh.blit(tr === 'rock' ? fl.frame('rock/0/0') : fl.frame(`tree/${tr}/${i % 3}/0`), i * 48 + 2, 4); sh.blit(fl.frame(['grasstuft', 'flower_red', 'bush', 'mushroom'][i % 4] + '/0/0'), i * 48 + 28, 20);
  // mean colour of the ground
  const h = M.histogram(t); let r = 0, gg = 0, b = 0, n = 0; for (const k in h) { const c = P.rgb[+k]; r += c[0] * h[k]; gg += c[1] * h[k]; b += c[2] * h[k]; n += h[k]; } const mean = [r / n, gg / n, b / n];
  let min = 99; for (let k = 0; k < 4; k++) { const [at, key] = ppl[(i * 4 + k) % ppl.length] || []; if (!at) continue; const f = at.frame(key); sh.blit(f, i * 48 + (k & 1) * 24, 42 + (k >> 1) * 26); }
  for (const [at, key] of ppl) min = Math.min(min, M.spriteContrast(at.frame(key), mean)); lines.push(`${g.padEnd(9)} ground lum ${M.lum(mean).toFixed(3)}  worst unit contrast ${min.toFixed(2)}:1 ${min >= 4 ? 'ok' : 'FAIL'}`); if (min < 4) fail++;
  text.draw(sh, g, i * 48 + 2, 138, M.lum(mean) > 0.4 ? ix('stone', 0) : ix('ice', 5)); });
sh.savePNG('shots/reference-sheet.png', { scale: 3 }); console.log(lines.join('\n')); console.log(fail ? 'REFERENCE: ' + fail + ' contrast failures' : 'REFERENCE OK: every unit >= 4:1 on every ground');
