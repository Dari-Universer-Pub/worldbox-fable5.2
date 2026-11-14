#!/usr/bin/env node
// node tools/music-build.js [track ...] — makes the shipped music from the sources in tools/art/music-src/raw (chantier C.11).
// For every track of src/data/music.json that has an `audio` block:
//   1. decodes the stems separated from the generated mix, puts them back in time with the mix (measured lag), groups them into the
//      layers of the game (base, melody, pad, rhythm) as music.json says;
//   2. cuts on the bar grid measured on the mix: [intro][loop of a whole number of bars], the tail that follows the loop is cross-faded
//      (equal power) onto the head of the loop, and a short copy of the head is appended so that the loop window stays seamless even
//      when a browser decodes the MP3 a few milliseconds late;
//   3. brings every track to the same integrated loudness (EBU R128) with one gain per track, checks the peak;
//   4. encodes each layer as MP3 (libmp3lame, the one format every browser decodes), writes assets/music/music-<id>.js (base64);
//   5. decodes what it wrote and measures: layers still aligned with each other and with the mix, no click and no level step at the
//      loop seam, weight. Report in shots/musique/mesures.txt, 30 s excerpts (around the seam) and a calm -> night -> war chain.
// The same sources always give the same files (ffmpeg -bitexact, no date written).
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const L = require('./music-lib.js');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'tools/art/music-src/raw'), OUT = path.join(ROOT, 'assets/music'), SHOT = path.join(ROOT, 'shots/musique'), TMP = path.join(require('os').tmpdir(), 'dustcrown-music');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/music.json'), 'utf8')), SR = 44100, TARGET = D.audio.lufs, POST = 0.35, PRE = 0.012, INSIDE = 0.03;
for (const d of [OUT, SHOT, TMP]) fs.mkdirSync(d, { recursive: true });
const only = process.argv.slice(2), report = [], summary = {};
const say = s => { report.push(s); console.log(s); };

// ---- small audio helpers (stereo interleaved Float32 at 44.1 kHz)
function decode(file) { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 }); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); }
function writeRaw(file, x) { fs.writeFileSync(file, Buffer.from(x.buffer, x.byteOffset, x.byteLength)); }
function encodeMp3(x, file, kbps, mono) { const raw = path.join(TMP, 'enc.f32'); writeRaw(raw, x);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', raw, '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-ac', mono ? '1' : '2', '-c:a', 'libmp3lame', '-b:a', kbps + 'k', '-write_xing', '0', '-id3v2_version', '0', file]); }
const mono = x => { const m = new Float32Array(x.length >> 1); for (let i = 0; i < m.length; i++) m[i] = (x[2 * i] + x[2 * i + 1]) * 0.5; return m; };
const rmsDb = (m, a, b) => L.db(L.rms(m, Math.max(0, a | 0), Math.min(m.length, b | 0)));
// lag (in samples) at which b best matches a, searched around 0 on the 12 s window where b is the loudest
function lagOf(a, b, range) { const n = Math.min(a.length, b.length), W = SR * 12; let from = range, be = -1; for (let f = range; f + W < n - range; f += SR) { const e = L.rms(b, f, f + W); if (e > be) { be = e; from = f; } } const to = Math.min(n - range, from + W); let bl = 0, bc = -2;
  for (let lag = -range; lag <= range; lag += 2) { let s = 0, sa = 0, sb = 0; for (let i = from; i < to; i += 3) { const u = a[i], v = b[i + lag]; s += u * v; sa += u * u; sb += v * v; } const c = s / Math.sqrt(sa * sb + 1e-12); if (c > bc) { bc = c; bl = lag; } } return { lag: bl, corr: bc }; }
function lufsOf(x) { const raw = path.join(TMP, 'lufs.f32'); writeRaw(raw, x); const wav = path.join(TMP, 'lufs.wav'); execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', raw, '-c:a', 'pcm_f32le', wav]); return L.loudness(wav); }

function build(id) { const T = D.tracks[id], A = T.audio; if (!A) return; say('\n== ' + id + ' — ' + T.title + ' ==');
  const mixFile = path.join(SRC, id + '.mp3'), mix = decode(mixFile), mixM = mono(mix), bar = 240 / A.bpm;
  // 1. stems: decode, measure the lag of their sum against the mix, shift everything by it
  const names = [...new Set(Object.values(A.stems).flatMap(s => s.from))], st = {}; for (const n of names) st[n] = decode(path.join(SRC, id + '-stems', n + '.mp3'));
  const len = Math.min(mix.length, ...names.map(n => st[n].length)), sum = new Float32Array(len); for (const n of names) for (let i = 0; i < len; i++) sum[i] += st[n][i];
  const lg = lagOf(mixM, mono(sum), 2400), sh = lg.lag * 2; let res = 0, mm = 0, cnt = 0; for (let i = SR; i < len - SR - Math.abs(sh); i++) { const d = mix[i] - (sum[i + sh] || 0); res += d * d; mm += mix[i] * mix[i]; cnt++; }
  say('source: ' + (mix.length / 2 / SR).toFixed(2) + ' s, tempo measured ' + A.bpm + ' bpm (wanted ' + T.bpm + '), bar ' + bar.toFixed(3) + ' s, first beat ' + A.first + ' s');
  say('stems kept: ' + names.join(', ') + ' ; lag of their sum against the mix ' + (lg.lag / SR * 1000).toFixed(1) + ' ms (correlation ' + lg.corr.toFixed(3) + ') ; what the kept stems miss of the mix: ' + (L.db(Math.sqrt(res / cnt)) - L.db(Math.sqrt(mm / cnt))).toFixed(1) + ' dB below the mix');
  // 2. groups, cut and loop
  const O = Math.round((A.skip || 0) * SR), X = Math.round(A.xfade * SR), S = Math.max(0, Math.round((A.first + A.introBars * bar - PRE) * SR)), Ln = Math.round(A.loopBars * bar * SR), P = Math.round(POST * SR), total = S + X + Ln + P;
  if ((O + S + Ln + X) * 2 + sh > len) throw new Error(id + ': the source is too short for intro ' + A.introBars + ' + loop ' + A.loopBars + ' bars + cross-fade');
  const groups = {}; for (const [g, def] of Object.entries(A.stems)) { const o = new Float32Array(total * 2); const at = i => { let v = 0; const k = i + sh + O * 2; if (k >= 0) for (const n of def.from) v += st[n][k] || 0; return v; };
    for (let i = 0; i < (S + Ln) * 2; i++) o[i] = at(i);                                                                 // intro, then the loop once, untouched
    for (let t = 0; t < X; t++) { const a = t / X, gi = Math.sin(a * Math.PI / 2), go = Math.cos(a * Math.PI / 2); for (let c = 0; c < 2; c++) o[(S + Ln + t) * 2 + c] = at((S + Ln + t) * 2 + c) * go + at((S + t) * 2 + c) * gi; } // tail of the loop over its head
    for (let i = 0; i < P * 2; i++) o[(S + X + Ln) * 2 + i] = o[(S + X) * 2 + i];                                           // the head again, for late decoders
    for (let t = 0; t < 220 && t < S; t++) { o[t * 2] *= t / 220; o[t * 2 + 1] *= t / 220; }                              // no click at the very start
    groups[g] = o; }
  const loopStart = (S + X) / SR + INSIDE, loopLen = Ln / SR; // the window the game loops starts a little inside the loop: a decoder that adds its own delay (0 to 30 ms) still reads periodic sound
  // 3. loudness: one gain for the track, measured on the sum of its layers over the loop
  const full = new Float32Array(total * 2); for (const g in groups) for (let i = 0; i < full.length; i++) full[i] += groups[g][i];
  const before = lufsOf(full.subarray((S + X) * 2, (S + X + Ln) * 2)); let gain = Math.pow(10, (TARGET + (A.trim || 0) - before.lufs) / 20); if (before.peak + L.db(gain) > -1) gain = Math.pow(10, (-1 - before.peak) / 20);
  for (const g in groups) for (let i = 0; i < groups[g].length; i++) groups[g][i] *= gain; for (let i = 0; i < full.length; i++) full[i] *= gain;
  const after = lufsOf(full.subarray((S + X) * 2, (S + X + Ln) * 2));
  say('cut: intro ' + loopStart.toFixed(3) + ' s (' + A.introBars + ' bars + cross-fade ' + A.xfade + ' s), loop ' + loopLen.toFixed(3) + ' s (' + A.loopBars + ' bars)');
  say('loudness of the loop: ' + before.lufs + ' LUFS, peak ' + before.peak + ' dBFS -> gain ' + L.db(gain).toFixed(1) + ' dB -> ' + after.lufs + ' LUFS, peak ' + after.peak + ' dBFS (target ' + (TARGET + (A.trim || 0)) + ')');
  // 4. encode
  const js = { id, bpm: A.bpm, bar: +bar.toFixed(5), first: +(A.first).toFixed(4), loopStart: +loopStart.toFixed(5), loop: +loopLen.toFixed(5), seconds: +(total / SR).toFixed(4), stems: {}, layers: {} }; let bytes = 0; const dec = {};
  for (const [g, def] of Object.entries(A.stems)) { const f = path.join(TMP, id + '-' + g + '.mp3'); encodeMp3(groups[g], f, def.kbps, !!def.mono); const b = fs.readFileSync(f); bytes += b.length; js.stems[g] = b.toString('base64'); js.layers[g] = def.layers; dec[g] = decode(f);
    say('  layer ' + g.padEnd(7) + ' <- ' + def.from.join('+').padEnd(18) + ' level ' + rmsDb(mono(groups[g]), 0, total).toFixed(1).padStart(6) + ' dB, ' + def.kbps + ' kbit/s' + (def.mono ? ' mono' : '') + ', ' + (b.length / 1024).toFixed(0) + ' KB'); }
  const file = path.join(OUT, 'music-' + id + '.js'); fs.writeFileSync(file, '/* generated by tools/music-build.js from tools/art/music-src (music generated with ElevenLabs, see PROVENANCE.md) */\n(window.AL_MUSIC=window.AL_MUSIC||{})[' + JSON.stringify(id) + ']=' + JSON.stringify(js) + ';\n');
  const jsBytes = fs.statSync(file).size;
  // 5. measures on what was written
  const lags = Object.keys(dec).map(g => { const r = lagOf(mono(groups[g]), mono(dec[g]), 3000); return { g, ms: r.lag / SR * 1000, corr: r.corr }; });
  say('decoded MP3 against what was encoded (ffmpeg decoder): ' + lags.map(l => l.g + ' ' + l.ms.toFixed(1) + ' ms (corr ' + l.corr.toFixed(3) + ')').join(', ') + ' -> spread between layers ' + (Math.max(...lags.map(l => l.ms)) - Math.min(...lags.map(l => l.ms))).toFixed(2) + ' ms');
  // seam: the loop wrapped on itself, as the game plays it
  const fm = mono(full), a0 = S + X, w = Math.round(0.4 * SR), wrap = i => fm[a0 + ((i % Ln) + Ln) % Ln]; let dmax = 0; for (let i = -64; i < 64; i++) dmax = Math.max(dmax, Math.abs(wrap(i + 1) - wrap(i)));
  const diffs = []; for (let i = a0 + SR; i < a0 + Ln - SR; i += 7) diffs.push(Math.abs(fm[i + 1] - fm[i])); diffs.sort((p, q) => p - q); const p999 = diffs[Math.floor(diffs.length * 0.999)];
  let eb = 0, ea = 0; for (let i = 1; i <= w; i++) { eb += wrap(-i) ** 2; ea += wrap(i - 1) ** 2; } const step = 10 * Math.log10((ea + 1e-12) / (eb + 1e-12));
  // the largest level step between two neighbouring 0.4 s windows anywhere inside the loop, to compare the seam with the music itself
  let worst = 0; for (let i = a0 + w; i + w < a0 + Ln; i += w) { let p = 0, q = 0; for (let k = 0; k < w; k++) { p += fm[i - 1 - k] ** 2; q += fm[i + k] ** 2; } worst = Math.max(worst, Math.abs(10 * Math.log10((q + 1e-12) / (p + 1e-12)))); }
  say('loop seam: largest sample step at the seam ' + dmax.toFixed(4) + ' (99.9 % of the steps inside the loop are under ' + p999.toFixed(4) + ') -> ' + (dmax <= p999 * 1.5 ? 'no click' : 'CLICK?') + ' ; level 0.4 s after against 0.4 s before the seam: ' + step.toFixed(1) + ' dB (largest such step inside the loop: ' + worst.toFixed(1) + ' dB)');
  say('weight: ' + (bytes / 1024).toFixed(0) + ' KB of MP3, ' + (jsBytes / 1024).toFixed(0) + ' KB as ' + path.relative(ROOT, file));
  // 30 s excerpt for the ear: the last 15 s of the loop then its first 15 s (the seam is in the middle)
  const ex = new Float32Array(30 * SR * 2), h = 15 * SR; for (let i = 0; i < 30 * SR; i++) { const k = a0 + (((i - h) % Ln) + Ln) % Ln; ex[i * 2] = full[k * 2]; ex[i * 2 + 1] = full[k * 2 + 1]; }
  for (let t = 0; t < SR / 2; t++) { const g = t / (SR / 2); for (let c = 0; c < 2; c++) { ex[t * 2 + c] *= g; ex[(30 * SR - 1 - t) * 2 + c] *= g; } } encodeMp3(ex, path.join(SHOT, id + '.mp3'), 128, false);
  summary[id] = { title: T.title, bpmWanted: T.bpm, bpm: A.bpm, introSeconds: +loopStart.toFixed(2), loopSeconds: +loopLen.toFixed(2), loopBars: A.loopBars, lufs: after.lufs, peak: after.peak, gainDb: +L.db(gain).toFixed(1), layers: Object.keys(A.stems), stemLagMs: +(lg.lag / SR * 1000).toFixed(1), layerSpreadMs: +(Math.max(...lags.map(l => l.ms)) - Math.min(...lags.map(l => l.ms))).toFixed(2), seamStep: +dmax.toFixed(4), seamP999: +p999.toFixed(4), seamLevelDb: +step.toFixed(1), kb: Math.round(jsBytes / 1024) };
  return { full, a0, Ln, bar, S: S }; }

const made = {}; for (const id of Object.keys(D.tracks)) if (!only.length || only.includes(id)) made[id] = build(id);
// the chain calm -> night -> war as the game does it: the next track starts on the next bar of the one that plays, cross-fade 4 s (1.5 s into war)
if (made.calm && made.night && made.war) { const seg = [['calm', 24, 4], ['night', 22, 4], ['war', 20, 1.5]], parts = []; let n = 0;
  const out = new Float32Array(70 * SR * 2); let at = 0;
  seg.forEach(([id, secs, fade], k) => { const m = made[id], f = Math.round((k ? seg[k][2] : 0.3) * SR), bars = Math.ceil(secs / m.bar), dur = Math.round(bars * m.bar * SR), next = seg[k + 1], fo = Math.round((next ? next[2] : 1) * SR);
    for (let i = 0; i < dur + fo && at + i < 70 * SR; i++) { const src = i < m.a0 ? i : m.a0 + ((i - m.a0) % m.Ln), g = Math.min(1, i / f) * (i < dur ? 1 : Math.max(0, 1 - (i - dur) / fo)); out[(at + i) * 2] += m.full[src * 2] * g; out[(at + i) * 2 + 1] += m.full[src * 2 + 1] * g; }
    parts.push(id + ' from ' + (at / SR).toFixed(1) + ' s'); at += dur; n = at + fo; });
  encodeMp3(out.subarray(0, Math.min(out.length, n * 2)), path.join(SHOT, 'enchainement-calm-night-war.mp3'), 128, false); say('\nchain written: ' + parts.join(', ') + ' (each change falls on a bar line of the track that was playing)'); }
if (!only.length) { let tot = 0; for (const f of fs.readdirSync(OUT)) tot += fs.statSync(path.join(OUT, f)).size; say('\nTOTAL music shipped: ' + (tot / 1048576).toFixed(2) + ' MB in ' + fs.readdirSync(OUT).length + ' files (budget 12 MB)');
  // every music file of the project with its hash: tools/check-provenance.js accepts these files and no other audio file
  const crypto = require('crypto'), mf = {}; const walk = d => { for (const f of fs.readdirSync(path.join(ROOT, d)).sort()) { const p = d + '/' + f; if (fs.statSync(path.join(ROOT, p)).isDirectory()) walk(p); else if (/\.mp3$/.test(f) || /^assets\/music\//.test(p)) mf[p] = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, p))).digest('hex'); } };
  walk('tools/art/music-src/raw'); walk('shots/musique'); walk('assets/music'); fs.writeFileSync(path.join(ROOT, 'tools/art/music-src/manifest.json'), JSON.stringify(mf, null, 1) + '\n');
  fs.writeFileSync(path.join(SHOT, 'mesures.txt'), report.join('\n') + '\n'); fs.writeFileSync(path.join(SHOT, 'mesures.json'), JSON.stringify(summary, null, 1) + '\n'); }
