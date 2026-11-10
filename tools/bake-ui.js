#!/usr/bin/env node
// UI baker: pixel font atlases (small "font", large "fontb") from tools/art/font.js. Index 1 = ink, 255 transparent.
'use strict';
const F = require('./lib/font'); const { Img } = require('./lib/img'); const { Atlas } = require('./lib/atlas');
for (const big of [false, true]) { const at = new Atlas(big ? 'fontb' : 'font', { maxW: 512, pad: 1, meta: { line: (F.H + 1) * (big ? 2 : 1), asc: F.ASC * (big ? 2 : 1), gap: big ? 2 : 1 } });
  for (const ch of F.chars()) { let g = F.glyph(ch); if (!g) continue; if (big) g = F.enlarge(g); const im = new Img(g.w, g.h); for (let i = 0; i < g.bits.length; i++) if (g.bits[i]) im.d[i] = 35; at.add('g/' + ch.codePointAt(0), im, 0, 0); }
  at.save(); console.log((big ? 'fontb' : 'font') + ' glyphs ' + Object.keys(at.frames).length + ' atlas ' + at.img.w + 'x' + at.img.h); }
// far-view marks (pipeline B): what a unit looks like when the camera is too far for its sprite
{ const { ix } = require('./lib/mats'); const at = new Atlas('marks', { maxW: 64, pad: 1 }), K = { o: ix('earth', 0), s: ix('skin', 4), T: 132, t: 130 };
  at.add('mark/unit/0', Img.fromGrid(['.o.', 'oso', 'oTo', 'oto', '.o.'], K), 1, 4); at.save(); console.log('marks ' + Object.keys(at.frames).length); }
