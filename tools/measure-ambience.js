#!/usr/bin/env node
// Measures the ambience beds (wind, waves, rain…): each bed is rendered alone by the game's audio engine at full target (1) through an
// OfflineAudioContext in headless Chromium, 10 s, and the last 6 s are measured: level (RMS, dB), peak, spectral centroid, and the share
// of the energy in four bands (under 1 kHz, 1-2 kHz, 2-6 kHz where the ear is the most sensitive, over 6 kHz), plus an A-weighted level.
//   node tools/measure-ambience.js [--json out.json] [name ...]
'use strict';
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), args = process.argv.slice(2), ji = args.indexOf('--json'), jsonOut = ji >= 0 ? args.splice(ji, 2)[1] : null;
(async () => { const sounds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/sounds.json'), 'utf8')), music = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/music.json'), 'utf8'));
  const b = await chromium.launch(), p = await b.newPage(); await p.goto('about:blank');
  await p.addScriptTag({ content: 'self.AL={DATA:{sounds:' + JSON.stringify(sounds) + ',music:' + JSON.stringify(music) + '}};' });
  await p.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'src/client/audio.js'), 'utf8') });
  const res = await p.evaluate(async (names) => { const sr = 44100, out = {}, defs = AL.DATA.sounds._ambience;
    for (const name of (names.length ? names : Object.keys(defs))) { const off = new OfflineAudioContext(2, sr * 10, sr); AL.Audio.init(off); AL.Audio.ambience({ [name]: 1 }); const buf = await off.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), from = sr * 4, n = L.length;
      let sum = 0, peak = 0; for (let i = from; i < n; i++) { const v = (L[i] + R[i]) * 0.5; sum += v * v; if (Math.abs(v) > peak) peak = Math.abs(v); }
      const N = 4096, re = new Float32Array(N), im = new Float32Array(N), band = [0, 0, 0, 0]; let cs = 0, ms = 0, aw = 0;
      for (let s = from; s + N <= n; s += N) { for (let i = 0; i < N; i++) { re[i] = (L[s + i] + R[s + i]) * 0.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); im[i] = 0; }
        for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; } }
        for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
        for (let k = 1; k < N / 2; k++) { const m = re[k] * re[k] + im[k] * im[k], f = k * sr / N, f2 = f * f; cs += m * f; ms += m; band[f < 1000 ? 0 : f < 2000 ? 1 : f < 6000 ? 2 : 3] += m;
          const ra = 148693636 * f2 * f2 / ((f2 + 424.36) * Math.sqrt((f2 + 11599.29) * (f2 + 544496.41)) * (f2 + 148693636)); aw += m * ra * ra * 1.585; } }
      const db = v => +(20 * Math.log10(v + 1e-9)).toFixed(1), rms = Math.sqrt(sum / (n - from));
      out[name] = { rmsDb: db(rms), peak: +peak.toFixed(3), centroidHz: Math.round(cs / ms), under1k: +(band[0] / ms * 100).toFixed(0), k1to2: +(band[1] / ms * 100).toFixed(0), k2to6: +(band[2] / ms * 100).toFixed(0), over6k: +(band[3] / ms * 100).toFixed(0), aWeightedDb: +(db(rms) + 10 * Math.log10(aw / ms + 1e-12)).toFixed(1) }; }
    return out; }, args);
  await b.close(); if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(res, null, 1));
  console.log('bed'.padEnd(8) + ' RMS dB   peak  centroid   <1k  1-2k  2-6k  >6k   A-weighted dB'); for (const k in res) { const r = res[k]; console.log(k.padEnd(8) + String(r.rmsDb).padStart(7) + String(r.peak).padStart(7) + String(r.centroidHz).padStart(9) + ' Hz' + String(r.under1k).padStart(5) + '%' + String(r.k1to2).padStart(5) + '%' + String(r.k2to6).padStart(5) + '%' + String(r.over6k).padStart(4) + '%' + String(r.aWeightedDb).padStart(10)); } })();
