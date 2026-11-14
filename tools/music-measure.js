// node tools/music-measure.js <file> <bpm wanted> [tolerance=0.08] — measured tempo, first beat, bar grid, level per bar, loudness (chantier C.11)
'use strict';
const L = require('./music-lib.js'); const [file, want, tol] = [process.argv[2], +process.argv[3], +(process.argv[4] || 0.08)];
const x = L.decode(file), env = L.onsets(x), T = L.tempo(env, want, tol), dur = x.length / L.SR, bar = T.beat * 4;
console.log(JSON.stringify({ file, seconds: +dur.toFixed(2), wanted: want, bpm: +T.bpm.toFixed(2), firstBeat: +T.first.toFixed(3), bar: +bar.toFixed(3), bars: +((dur - T.first) / bar).toFixed(2), ...L.loudness(file) }));
// which beat of the bar is the downbeat: the phase (0..3) whose beats carry the most low-band energy and onset strength
const fps = L.SR / L.HOP; const ph = [0, 0, 0, 0]; let k = 0; for (let t = T.first; t < dur - 0.1; t += T.beat, k++) { const i = Math.round(t * fps); let v = 0; for (let j = -2; j <= 2; j++) v += env[i + j] || 0; ph[k % 4] += v; }
console.log('onset strength by beat of the bar (phase 0..3):', ph.map(v => +(v / (k / 4)).toFixed(2)).join(' '));
let line = ''; for (let b = 0, t = T.first; t + bar <= dur; b++, t += bar) line += L.db(L.rms(x, Math.floor(t * L.SR), Math.floor((t + bar) * L.SR))).toFixed(0) + ' '; console.log('RMS dB per bar:', line);
