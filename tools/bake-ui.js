#!/usr/bin/env node
// UI baker: pixel font atlases (small "font", large "fontb") from tools/art/font.js. Index 1 = ink, 255 transparent.
'use strict';
const F = require('./lib/font'); const { Img } = require('./lib/img'); const { Atlas } = require('./lib/atlas');
for (const big of [false, true]) { const at = new Atlas(big ? 'fontb' : 'font', { maxW: 512, pad: 1, meta: { line: (F.H + 1) * (big ? 2 : 1), asc: F.ASC * (big ? 2 : 1), gap: big ? 2 : 1 } });
  for (const ch of F.chars()) { let g = F.glyph(ch); if (!g) continue; if (big) g = F.enlarge(g); const im = new Img(g.w, g.h); for (let i = 0; i < g.bits.length; i++) if (g.bits[i]) im.d[i] = 35; at.add('g/' + ch.codePointAt(0), im, 0, 0); }
  at.save(); console.log((big ? 'fontb' : 'font') + ' glyphs ' + Object.keys(at.frames).length + ' atlas ' + at.img.w + 'x' + at.img.h); }
// far-view marks (pipeline B): what a unit looks like when the camera is too far for its sprite
{ const { ix } = require('./lib/mats'); const at = new Atlas('marks', { maxW: 128, pad: 1 }), K = { o: ix('earth', 0), s: ix('skin', 4), T: 132, t: 130 };
  at.add('mark/unit/0', Img.fromGrid(['.o.', 'oso', 'oTo', 'oto', '.o.'], K), 1, 4);
  // war-map markers (chantier B.5): tools/art/marks.js
  const WK = { o: ix('earth', 0), T: 132, t: 130, d: 128, M: ix('stone', 5), S: ix('stone', 3), s: ix('stone', 4), n: ix('stone', 1), w: ix('earth', 3), k: ix('sand', 4), K: ix('sand', 5), F: ix('fire', 4), f: ix('fire', 2) };
  const MG = require('./art/marks').GRIDS; for (const k in MG) { const g = MG[k], im = Img.fromGrid(g, WK); at.add('mark/' + k, im, (im.w / 2) | 0, k.startsWith('army') || k === 'siege' || k === 'taken' ? im.h - 1 : (im.h / 2) | 0); }
  at.save(); console.log('marks ' + Object.keys(at.frames).length); }

// icons (pipeline B): tools/art/icons.js -> atlas 'icons', frames 'ic/<name>'. Outline: tone 0 of the ink ramp of the neighbouring colour.
{ const { ix } = require('./lib/mats'); const { I, RAMP } = require('./art/icons'); const INKR = { grass: 'forest', forest: 'forest', jungle: 'forest', sand: 'earth', earth: 'earth', stone: 'stone', water: 'water', ice: 'water', skin: 'earth', red: 'red', fire: 'red', magic: 'magic', swamp: 'swamp', teal: 'teal', royal: 'water', pink: 'red' };
  const pal = require('./art/palette.json'), names = Object.keys(pal.ramps), at = new Atlas('icons', { maxW: 256, pad: 0 }); const col = c => ix(RAMP[c[0]], +c[1]);
  for (const name in I) { const im = new Img(16, 16), set = (x, y, v) => { x = Math.round(x); y = Math.round(y); if (x >= 1 && y >= 1 && x < 15 && y < 15) im.set(x, y, v); };
    for (const op of I[name]) { const k = op[0];
      if (k === 'C' || k === 'E' || k === 'X' || k === 'O') { const cx = op[1], cy = op[2], rx = op[3], ry = k === 'E' ? op[4] : op[3], v = k === 'X' ? 255 : col(op[op.length - 1]); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = ((x - cx) / (rx + 0.35)) ** 2 + ((y - cy) / (ry + 0.35)) ** 2; if (d <= 1 && (k !== 'O' || ((x - cx) / Math.max(0.1, rx - 1.1)) ** 2 + ((y - cy) / Math.max(0.1, ry - 1.1)) ** 2 > 1)) { if (k === 'X') im.set(x, y, 255); else set(x, y, v); } } }
      else if (k === 'R') { for (let y = 0; y < op[4]; y++) for (let x = 0; x < op[3]; x++) set(op[1] + x, op[2] + y, col(op[5])); }
      else if (k === 'L') { const n = Math.max(Math.abs(op[3] - op[1]), Math.abs(op[4] - op[2]), 1); for (let t = 0; t <= n; t++) set(op[1] + (op[3] - op[1]) * t / n, op[2] + (op[4] - op[2]) * t / n, col(op[5])); }
      else if (k === 'P') { const p = op[1], m = p.length / 2; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { let inside = false; for (let i = 0, j = m - 1; i < m; j = i++) { const xi = p[i * 2], yi = p[i * 2 + 1], xj = p[j * 2], yj = p[j * 2 + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; } if (inside) set(x, y, col(op[2])); } for (let i = 0; i < m; i++) set(p[i * 2], p[i * 2 + 1], col(op[2])); }
      else if (k === 'D') { for (let i = 0; i < op[2].length; i += 2) set(op[2][i], op[2][i + 1], col(op[1])); } }
    const o = im.clone(); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (im.get(x, y) !== 255) continue; let nb = -1; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X > 15 || Y > 15) continue; const v = im.get(X, Y); if (v !== 255) { nb = v; break; } } if (nb >= 0) o.set(x, y, ix(INKR[names[(nb / 6) | 0]] || 'stone', 0)); }
    at.add('ic/' + name, o, 0, 0); }
  at.save(); console.log('icons ' + Object.keys(at.frames).length + ' atlas ' + at.img.w + 'x' + at.img.h); }

// logo and game icon (pipeline B): tools/art/logo.js -> atlas 'logo', frames 'logo/word' and 'logo/icon'
{ const L = require('./art/logo'); const at = new Atlas('logo', { maxW: 256, pad: 1 }); at.add('logo/word', L.logo(), 0, 0); at.add('logo/icon', L.icon(), 0, 0); at.save(); console.log('logo ' + Object.keys(at.frames).length + ' atlas ' + at.img.w + 'x' + at.img.h); }
