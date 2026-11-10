#!/usr/bin/env node
// Effects baker: tools/art/fx.js -> assets/fx.* (frames 'fx/<name>/<i>'). node tools/bake-fx.js
'use strict';
const E = require('./art/fx'); const { Atlas } = require('./lib/atlas');
const at = new Atlas('fx', { maxW: 512, pad: 0 }); let types = 0, frames = 0;
for (const name in E) { const e = E[name]; types++; for (let f = 0; f < e.n; f++) { const im = e.fn(f, e.n), pv = e.pivot || [im.w >> 1, im.h - 1]; at.add('fx/' + name + '/' + f, im, pv[0], pv[1]); frames++; } }
at.save(); console.log('fx types ' + types + ' frames ' + frames + ' atlas ' + at.img.w + 'x' + at.img.h);
