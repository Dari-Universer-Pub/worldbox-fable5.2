// Shared helpers for the music tools (chantier C.11): decode with ffmpeg, onset envelope, tempo and beat phase, levels.
'use strict';
const { execFileSync } = require('child_process');
const SR = 22050, HOP = 256; // analysis rate and hop (11.6 ms)
function decode(file, sr, ch) { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', String(ch || 1), '-ar', String(sr || SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 }); return new Float32Array(b.buffer, b.byteOffset, b.length >> 2); }
// onset strength: half-wave rectified rise of the log energy in 4 bands (cheap one-pole splits), one value per hop
function onsets(x) { const n = Math.floor(x.length / HOP), env = new Float32Array(n), prev = [0, 0, 0, 0], lp = [0, 0, 0], k = [0.03, 0.12, 0.4];
  for (let h = 0; h < n; h++) { const e = [0, 0, 0, 0]; for (let i = h * HOP; i < (h + 1) * HOP; i++) { const s = x[i]; lp[0] += k[0] * (s - lp[0]); lp[1] += k[1] * (s - lp[1]); lp[2] += k[2] * (s - lp[2]); const b0 = lp[0], b1 = lp[1] - lp[0], b2 = lp[2] - lp[1], b3 = s - lp[2]; e[0] += b0 * b0; e[1] += b1 * b1; e[2] += b2 * b2; e[3] += b3 * b3; }
    let v = 0; for (let b = 0; b < 4; b++) { const l = Math.log(1e-7 + e[b] / HOP); if (h) v += Math.max(0, l - prev[b]); prev[b] = l; } env[h] = v; }
  return env; }
// tempo near `want` bpm (within +-tol) by autocorrelation of the onset envelope, refined to a fraction of a hop, then the phase of the beat
function tempo(env, want, tol) { const fps = SR / HOP, n = env.length; let mean = 0; for (const v of env) mean += v; mean /= n; const e = new Float32Array(n); for (let i = 0; i < n; i++) e[i] = env[i] - mean;
  const score = bpm => { const lag = 60 / bpm * fps; let s = 0; for (const m of [1, 2, 4]) { const L = lag * m, li = Math.floor(L), fr = L - li; let a = 0; for (let i = 0; i + li + 1 < n; i++) a += e[i] * (e[i + li] * (1 - fr) + e[i + li + 1] * fr); s += a / (n - li); } return s; };
  let best = want, bs = -1e9; for (let b = want * (1 - tol); b <= want * (1 + tol); b += 0.02) { const s = score(b); if (s > bs) { bs = s; best = b; } }
  // phase: the comb of beats that collects the most onset energy
  const lag = 60 / best * fps; let bp = 0, bps = -1e9; for (let p = 0; p < lag; p += 0.25) { let s = 0, c = 0; for (let t = p; t < n - 1; t += lag) { const i = Math.floor(t); s += env[i] + env[i + 1]; c++; } s /= c; if (s > bps) { bps = s; bp = p; } }
  return { bpm: best, score: bs, beat: 60 / best, first: bp / fps }; }
function rms(x, a, b) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); }
const db = v => 20 * Math.log10(Math.max(1e-9, v));
// integrated loudness and true peak, measured by ffmpeg (EBU R128)
function loudness(file) { const { spawnSync } = require('child_process'); const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }); const t = r.stderr.slice(r.stderr.lastIndexOf('Summary:')); const I = /I:\s+(-?[\d.]+) LUFS/.exec(t), P = /Peak:\s+(-?[\d.]+) dBFS/.exec(t), R = /LRA:\s+(-?[\d.]+) LU/.exec(t); return { lufs: I ? +I[1] : null, peak: P ? +P[1] : null, lra: R ? +R[1] : null }; }
module.exports = { SR, HOP, decode, onsets, tempo, rms, db, loudness };
