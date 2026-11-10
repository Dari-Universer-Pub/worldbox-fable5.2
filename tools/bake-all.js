#!/usr/bin/env node
// Regenerates every asset from its source, in order, then builds the game. node tools/bake-all.js
'use strict';
const { execFileSync } = require('child_process'), path = require('path');
for (const t of ['make-palette', 'bake-terrain', 'bake-flora', 'bake-people', 'bake-creatures', 'bake-buildings', 'bake-ui', 'build']) { console.log('== ' + t); execFileSync(process.execPath, [path.join(__dirname, t + '.js')], { stdio: 'inherit' }); }
