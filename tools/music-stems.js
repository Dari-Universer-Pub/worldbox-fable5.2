// node tools/music-stems.js <mix> <stem> [<stem> ...] — for stems separated from one mix: level of each, alignment with the mix (lag of the
// best cross-correlation), what is lost (mix minus the sum of the stems), and how much every pair of stems resembles each other (leak).
'use strict';
const L = require('./music-lib.js'); const files = process.argv.slice(2), mix = L.decode(files[0]), stems = files.slice(1).map(f => L.decode(f)), n = Math.min(mix.length, ...stems.map(s => s.length));
const corr = (a, b, lag, from, to) => { let s = 0, sa = 0, sb = 0; for (let i = from; i < to; i++) { const u = a[i], v = b[i + lag] || 0; s += u * v; sa += u * u; sb += v * v; } return s / Math.sqrt(sa * sb + 1e-12); };
const mid = n >> 1, win = Math.min(L.SR * 20, n >> 1), sum = new Float32Array(n);
stems.forEach((s, k) => { let bl = 0, bc = -2; for (let lag = -400; lag <= 400; lag++) { const c = corr(mix, s, lag, mid - (win >> 1), mid + (win >> 1)); if (c > bc) { bc = c; bl = lag; } } for (let i = 0; i < n; i++) sum[i] += s[i];
  console.log(files[k + 1].split('/').pop().padEnd(28), 'rms', L.db(L.rms(s, 0, n)).toFixed(1).padStart(6), 'dB  lag', String(bl).padStart(4), 'samples @22050  corr with mix', bc.toFixed(3)); });
const res = new Float32Array(n); for (let i = 0; i < n; i++) res[i] = mix[i] - sum[i];
console.log('mix rms', L.db(L.rms(mix, 0, n)).toFixed(1), 'dB ; sum of stems', L.db(L.rms(sum, 0, n)).toFixed(1), 'dB ; residue (mix - sum)', L.db(L.rms(res, 0, n)).toFixed(1), 'dB');
console.log('resemblance between stems (correlation of their short-time level curves, 1 = same thing):');
const curve = s => { const m = Math.floor(n / 2205), c = new Float32Array(m); for (let i = 0; i < m; i++) c[i] = L.rms(s, i * 2205, (i + 1) * 2205); return c; }, cs = stems.map(curve);
for (let a = 0; a < stems.length; a++) { let line = ''; for (let b = 0; b < stems.length; b++) { const A = cs[a], B = cs[b]; let ma = 0, mb = 0; for (let i = 0; i < A.length; i++) { ma += A[i]; mb += B[i]; } ma /= A.length; mb /= A.length; let s = 0, sa = 0, sb = 0; for (let i = 0; i < A.length; i++) { s += (A[i] - ma) * (B[i] - mb); sa += (A[i] - ma) ** 2; sb += (B[i] - mb) ** 2; } line += (s / Math.sqrt(sa * sb + 1e-12)).toFixed(2).padStart(6); } console.log(' ', line); }
