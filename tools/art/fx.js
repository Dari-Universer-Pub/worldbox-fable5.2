// Effect sources (pipeline C: generated with artist's rules, then looked at on a sheet). Every effect is a function of
// (pixel, frame) quantised on a palette ramp — large clean masses of 3-4 tones, no noise speckle: fields are smooth and
// thresholded, the turbulence is low-frequency value noise that scrolls with the frame.
'use strict';
require('../../src/shared/core.js'); const AL = globalThis.AL;
const { Img } = require('../lib/img'); const { ix } = require('../lib/mats');
const R = (ramp, tones) => tones.map(t => ix(ramp, t));
const FIRE = [ix('red', 2), ix('fire', 1), ix('fire', 2), ix('fire', 3), ix('fire', 4), ix('fire', 5)];
const SMOKE = R('stone', [2, 3, 4]), SOOT = R('stone', [0, 1, 2]), DUST = [ix('earth', 4), ix('sand', 3), ix('sand', 4)];
const nz = (x, y, s) => AL.vnoise(x, y, s);
const sm = (a, b, v) => { const t = AL.clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// paint a scalar field: v<=0 transparent, then tones spread over (0,1]
function field(size, fn, tones, w, h) { const im = new Img(w || size, h || size); for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const v = fn(x + 0.5, y + 0.5); if (v > 0) im.set(x, y, tones[Math.min(tones.length - 1, (v * tones.length) | 0)]); } return im; }
// remove single stray pixels (keeps masses clean)
function clean(im) { const o = im.clone(); for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { if (im.get(x, y) === 255) continue; let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (im.get(x + dx, y + dy) !== 255) n++; if (n === 0) o.set(x, y, 255); } return o; }
const E = {};
// ---- flame: teardrop that leans and licks; hotter toward the base centre
function flame(S, seed, tones) { return (f, n) => clean(field(S, (x, y) => { const u = (x - S / 2) / (S / 2), v = 1 - y / S, t = f / n;
  const lick = (nz(x * 5 / S + seed, y * 3.2 / S + t * 3, 3 + seed) - 0.5) * 0.9 * v, w = (1 - v) * 0.78 * (0.55 + 0.45 * Math.sin(v * 2.4 + 0.6)) + 0.08;
  const tipCut = 0.72 + 0.26 * nz(seed * 3.1, t * n * 0.9, 11 + seed); if (v > tipCut) return 0;
  const d = Math.abs(u - lick) / w; if (d >= 1) return 0; const heat = (1 - d) * (1 - v / tipCut * 0.85) + 0.12; return AL.clamp(heat * 1.25, 0.05, 0.999); }, tones || FIRE)); }
E['fire/a'] = { size: 16, n: 6, fn: flame(16, 1), pivot: [8, 15] }; E['fire/b'] = { size: 16, n: 6, fn: flame(16, 5), pivot: [8, 15] }; E['fire/big'] = { size: 32, n: 6, fn: flame(32, 9), pivot: [16, 31] };
// ---- smoke puff: a soft ball that rises, swells, then breaks up
function puff(S, tones, seed) { return (f, n) => { const t = f / (n - 1); return clean(field(S, (x, y) => { const cx = S / 2 + Math.sin(t * 3 + seed) * S * 0.06, cy = S * (0.68 - t * 0.3), r = S * (0.3 + t * 0.2);
  const d = Math.hypot(x - cx, (y - cy) * 1.1) / r, lump = nz(x * 4 / S + seed, y * 4 / S - t * 1.5, 20 + seed); const edge = 1 - d + (lump - 0.5) * 0.7; if (edge < t * 0.62 - 0.05) return 0;
  const lit = AL.clamp(0.55 - (x - cx) / r * 0.3 - (y - cy) / r * 0.42, 0.02, 0.999); return lit; }, tones)); }; }
E['smoke'] = { size: 16, n: 6, fn: puff(16, SMOKE, 2) }; E['soot'] = { size: 16, n: 6, fn: puff(16, SOOT, 6) }; E['dust'] = { size: 16, n: 5, fn: puff(16, DUST, 4) };
E['cloud'] = { size: 32, n: 6, fn: puff(32, SOOT, 8) }; E['steam'] = { size: 16, n: 5, fn: puff(16, R('ice', [3, 4, 5]), 3) }; E['toxic'] = { size: 16, n: 6, fn: puff(16, R('jungle', [2, 3, 4]), 7) };
// ---- explosion: white-hot ball, then a ring of fire that cools into soot
function boomFrames(S, seed) { return (f, n) => { const t = f / (n - 1), c = S / 2, im = new Img(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const X = x + 0.5, Y = y + 0.5, dx = X - c, dy = (Y - c) * 1.08, d = Math.hypot(dx, dy) / (S / 2), a = Math.atan2(dy, dx);
    const lobes = 0.1 * Math.sin(a * 5 + seed) + 0.07 * Math.sin(a * 9 - seed * 2) + (nz(X * 5 / S, Y * 5 / S, 30 + seed) - 0.5) * 0.25, rad = 0.25 + sm(0, 0.6, t) * 0.66 + lobes * (0.4 + t);
    if (d > rad) continue; if (t > 0.5 && nz(X * 7 / S + seed, Y * 7 / S - t * 2, 55) < (t - 0.5) * 1.85) continue;
    const heat = (1 - d / rad) * (1.2 - t * 1.5) + (0.75 - t) * 0.6;
    if (heat > 0.08) im.set(x, y, FIRE[Math.min(5, (AL.clamp(heat, 0, 0.999) * 6) | 0)]); else im.set(x, y, SOOT[AL.clamp(((0.6 - (X - c) / S - (Y - c) / S * 1.3) * 3) | 0, 0, 2)]); }
  return clean(im); }; }
E['boom'] = { size: 32, n: 8, fn: boomFrames(32, 1) }; E['blast'] = { size: 64, n: 10, fn: boomFrames(64, 4) };
// ---- nuclear mushroom: stem, rolling cap, base surge
E['mushroom'] = { size: 64, n: 12, pivot: [32, 60], fn: (f, n) => { const t = f / (n - 1), S = 64, im = new Img(S, S), rise = sm(0, 0.55, t), fade = sm(0.7, 1, t);
  const capY = 54 - rise * 40, capR = 6 + rise * 16, stemW = 3 + rise * 4;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const X = x + 0.5 - 32, Y = y + 0.5; let heat = -9, lit = 0;
    const lump = nz(x * 0.16, y * 0.16 - t * 2, 41) - 0.5, dc = Math.hypot(X, (Y - capY) * 1.45) / capR + lump * 0.35;           // cap
    if (dc < 1) { heat = (1 - dc) * (1.3 - t * 1.6) + (0.45 - t); lit = 0.6 - X / capR * 0.3 - (Y - capY) / capR * 0.5; }
    const sw = stemW * (1 + 0.5 * Math.pow(AL.clamp((Y - capY) / (56 - capY + 0.01), 0, 1), 3)) + lump * 2;                       // stem
    if (heat < -8 && Y > capY && Y < 58 && Math.abs(X) < sw) { heat = (1 - Math.abs(X) / sw) * (0.9 - t * 1.5); lit = 0.5 - X / sw * 0.4; }
    const br = 8 + sm(0, 0.4, t) * 22, db = Math.hypot(X / br, (Y - 57) / 4.2) + lump * 0.4;                                      // base surge
    if (heat < -8 && db < 1 && Y < 61) { heat = (1 - db) * (0.7 - t * 2); lit = 0.45 - X / br * 0.3; }
    if (heat < -8) continue; if (fade > 0 && nz(x * 0.3, y * 0.3, 43) < fade * 0.9) continue;
    if (heat > 0.06) im.set(x, y, FIRE[Math.min(5, (AL.clamp(heat, 0, 0.999) * 6) | 0)]); else im.set(x, y, (t > 0.5 ? SMOKE : SOOT)[AL.clamp((lit * 3) | 0, 0, 2)]); }
  return clean(im); } };
// ---- lightning bolt: a jagged path from the sky to the pivot, forked; frame 0 thick and white, then thinner, then a ghost
function bolt(seed) { return (f, n) => { const im = new Img(32, 64), pts = []; let x = 16 + (AL.hash2(seed, 0, 5) - 0.5) * 16; for (let y = 0; y <= 63; y += 4) { pts.push([x, y]); x += (16 - x) * (y / 63) * 0.5 + (AL.hash2(seed, y, 6) - 0.5) * 9 * (1 - y / 80); } pts[pts.length - 1] = [16, 63];
  const core = ix('ice', 5), glow = ix('royal', 5), halo = ix('royal', 4), wd = f === 0 ? 1.6 : f === 1 ? 0.9 : 0.5;
  const seg = (a, b, w, c, c2) => { const L = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]) * 2); for (let k = 0; k <= L; k++) { const px = a[0] + (b[0] - a[0]) * k / L, py = a[1] + (b[1] - a[1]) * k / L; for (let dx = -Math.ceil(w + 1); dx <= Math.ceil(w + 1); dx++) { const X = Math.round(px + dx), Y = Math.round(py), d = Math.abs(X - px); if (d <= w * 0.55) im.set(X, Y, c); else if (d <= w + 0.45 && im.get(X, Y) === 255 && c2) im.set(X, Y, c2); } } };
  for (let k = 0; k < pts.length - 1; k++) seg(pts[k], pts[k + 1], wd, f === 2 ? halo : core, f === 2 ? 0 : f === 0 ? glow : halo);
  if (f < 2) for (const k of [3, 7]) { let p = pts[k].slice(); const dir = AL.hash2(seed, k, 9) < 0.5 ? -1 : 1; for (let s = 0; s < 4; s++) { const q = [p[0] + dir * (2 + AL.hash2(seed, k + s, 3) * 3), p[1] + 3]; seg(p, q, 0.4, f === 0 ? glow : halo, 0); p = q; } }
  return im; }; }
E['bolt/a'] = { w: 32, h: 64, n: 3, fn: bolt(1), pivot: [16, 63] }; E['bolt/b'] = { w: 32, h: 64, n: 3, fn: bolt(7), pivot: [16, 63] }; E['bolt/c'] = { w: 32, h: 64, n: 3, fn: bolt(13), pivot: [16, 63] };
// ---- tornado: a leaning funnel of spinning bands
E['tornado'] = { w: 32, h: 64, n: 6, pivot: [16, 62], fn: (f, n) => { const im = new Img(32, 64), t = f / n, tones = R('stone', [1, 2, 3, 4]);
  for (let y = 2; y < 63; y++) { const v = 1 - (y - 2) / 61, cx = 16 + Math.sin(v * 3.2 + t * 6.283) * 2.6 * (1 - v * 0.4) + Math.sin(t * 6.283) * 1.2, w = 2.2 + v * v * 11 + Math.sin(y * 0.9 + t * 6.283 * 2) * 0.8;
    for (let x = 0; x < 32; x++) { const u = (x + 0.5 - cx) / w; if (Math.abs(u) > 1) continue; const band = Math.sin(y * 0.55 - Math.asin(u) * 2.2 - t * 6.283 * 2), l = 0.55 - u * 0.38 + band * 0.26; if (v < 0.07 && nz(x * 0.6, t * 9, 3) < 0.4) continue; im.set(x, y, tones[AL.clamp((l * 4) | 0, 0, 3)]); } }
  for (let k = 0; k < 7; k++) { const a = t * 6.283 + k * 0.9, r = 5 + k * 1.3; im.set(Math.round(16 + Math.cos(a) * r), Math.round(60 + Math.sin(a) * 2 - (k % 3)), DUST[k % 3]); im.set(Math.round(16 + Math.cos(a) * r) + 1, Math.round(60 + Math.sin(a) * 2 - (k % 3)), DUST[k % 3]); }
  return im; } };
// ---- shockwave: a flat ring on the ground
function ring(S, tones, thick) { return (f, n) => { const t = (f + 1) / n, c = S / 2; return field(S, (x, y) => { const d = Math.hypot(x - c, (y - c) * 1.9) / (S / 2), r = 0.18 + t * 0.78, w = thick * (1.15 - t); const e = Math.abs(d - r); if (e > w || d > 0.99) return 0; if (t > 0.6 && nz(Math.atan2(y - c, x - c) * 3, 1, 5) < (t - 0.6) * 1.6) return 0; return AL.clamp(1 - e / w, 0.05, 0.999) * (y < c ? 0.7 : 1); }, tones); }; }
E['shock'] = { size: 64, n: 6, fn: ring(64, [ix('sand', 3), ix('sand', 4), ix('sand', 5)], 0.1), pivot: [32, 32] }; E['ripple'] = { size: 32, n: 5, fn: ring(32, R('water', [4, 5]), 0.12), pivot: [16, 16] };
E['holy'] = { size: 32, n: 6, fn: ring(32, R('fire', [3, 4, 5]), 0.12), pivot: [16, 16] }; E['dark'] = { size: 32, n: 6, fn: ring(32, R('magic', [2, 3, 4]), 0.14), pivot: [16, 16] };
// ---- droplets thrown up and falling back (splash, blood, acid, sparks, embers)
function spray(S, tones, k, o) { o = o || {}; return (f, n) => { const im = new Img(S, S), t = (f + 0.6) / n; for (let p = 0; p < k; p++) { const a = -Math.PI * (0.15 + 0.7 * (p + 0.5) / k) + (AL.hash2(p, 1, o.seed || 3) - 0.5) * 0.3, sp = (0.55 + AL.hash2(p, 2, o.seed || 3) * 0.45) * S * (o.reach || 0.5);
    const x = S / 2 + Math.cos(a) * sp * t, y = S - 3 + Math.sin(a) * sp * t * (o.up || 1.5) + (o.g == null ? 1 : o.g) * S * 0.75 * t * t; if (t > 0.7 && AL.hash2(p, 3, 1) < (t - 0.7) * 3) continue;
    const c = tones[Math.min(tones.length - 1, ((1 - t) * tones.length + AL.hash2(p, 4, 1) * 0.8) | 0)]; im.set(Math.round(x), Math.round(y), c); if (o.big && t < 0.8) { im.set(Math.round(x) + 1, Math.round(y), c); im.set(Math.round(x), Math.round(y) + 1, tones[0]); im.set(Math.round(x) + 1, Math.round(y) + 1, tones[0]); }
    if (o.trail) im.set(Math.round(x - Math.cos(a) * 1.2), Math.round(y - Math.sin(a) * 1.4), tones[0]); }
  if (o.base && f < 3) for (let x = -3 + f; x <= 3 - f; x++) im.set(S / 2 + x, S - 2, tones[tones.length - 1]); return im; }; }
E['splash'] = { size: 16, n: 5, fn: spray(16, R('water', [3, 4, 5]), 8, { big: 1, base: 1, up: 2.6, reach: 0.6 }) }; E['blood'] = { size: 16, n: 4, fn: spray(16, R('red', [2, 3]), 4, { reach: 0.4, up: 1.6, big: 1 }) };
E['acid'] = { size: 16, n: 5, fn: spray(16, R('jungle', [3, 4, 5]), 7, { big: 1, base: 1, up: 2.6, reach: 0.6 }) }; E['spark'] = { size: 16, n: 4, fn: spray(16, [ix('fire', 3), ix('fire', 4), ix('fire', 5)], 6, { reach: 0.45, trail: 1, g: 0.5, seed: 8 }) };
E['debris'] = { size: 32, n: 6, fn: spray(32, [ix('earth', 2), ix('earth', 4), ix('stone', 4)], 12, { big: 1, reach: 0.7, up: 2.4, seed: 5 }) }; E['ember'] = { size: 16, n: 5, fn: spray(16, [ix('fire', 2), ix('fire', 4)], 4, { g: -0.25, reach: 0.3, up: 2.2, seed: 12 }) };
// ---- rising signs (heal crosses, poison bubbles, hearts, notes of sleep, skull)
function glyphRise(S, glyphs, key, n0) { return (f, n) => { const im = new Img(S, S); glyphs.forEach((g, k) => { const ph = ((f / n) + k / glyphs.length) % 1, gi = Img.fromGrid(g.rows, key), x = Math.round(g.x + Math.sin(ph * 6.283 + k) * (g.sway || 0)), y = Math.round(S - 2 - gi.h - ph * (S - gi.h - 2)); if (ph > 0.82 && (f + k) % 2) return; im.blit(gi, x, y); }); return im; }; }
const K1 = { a: ix('teal', 3), b: ix('teal', 4), c: ix('teal', 5), g: ix('jungle', 3), h: ix('jungle', 4), i: ix('jungle', 5), r: ix('red', 3), s: ix('red', 4), p: ix('pink', 4), q: ix('pink', 5), w: ix('ice', 5), v: ix('ice', 3), k: ix('stone', 0), m: ix('magic', 3), n: ix('magic', 4), o: ix('magic', 5), y: ix('fire', 4), z: ix('fire', 5), x: ix('fire', 3), d: ix('royal', 4), e: ix('royal', 5) };
E['heal'] = { size: 16, n: 6, fn: glyphRise(16, [{ x: 2, rows: ['.c.', 'cbc', '.a.'], sway: 0.6 }, { x: 10, rows: ['.c.', 'cbc', '.a.'] }, { x: 6, rows: ['..c..', '..b..', 'cbbbc', '..b..', '..a..'], sway: 0.5 }], K1) };
E['poison'] = { size: 16, n: 6, fn: glyphRise(16, [{ x: 2, rows: ['.hh.', 'hiih', 'hihg', '.gg.'], sway: 0.8 }, { x: 10, rows: ['hi', 'gh'], sway: 1 }, { x: 7, rows: ['.h.', 'hig', '.g.'] }], K1) };
E['heart'] = { size: 16, n: 5, fn: glyphRise(16, [{ x: 4, rows: ['.q.q.', 'qpqpp', 'ppppr', '.ppr.', '..r..'], sway: 1 }], K1) };
E['zzz'] = { size: 16, n: 4, fn: glyphRise(16, [{ x: 3, rows: ['www', '.w.', 'www'], sway: 0 }, { x: 9, rows: ['wwww', '..w.', '.w..', 'wwww'] }], K1) };
E['rage'] = { size: 16, n: 4, fn: (f) => { const g = [['s..s.', 'ss.ss', '.....', 'ss.ss', 's..s.'], ['.s.s.', 'sr.rs', '.....', 'sr.rs', '.s.s.']][f % 2]; const im = new Img(16, 16); im.blit(Img.fromGrid(g, K1), 9, 1 + (f % 2)); return im; } };
E['mad'] = { size: 16, n: 4, fn: (f) => { const im = new Img(16, 16), st = ['..o..', '.ono.', 'onmno', '.ono.', '..o..']; for (let k = 0; k < 3; k++) { const a = f / 4 * 6.283 + k * 2.094; im.blit(Img.fromGrid(k ? ['.o.', 'ono', '.o.'] : st, K1), Math.round(6 + Math.cos(a) * 5), Math.round(3 + Math.sin(a) * 2)); } return im; } };
E['skull'] = { size: 16, n: 6, fn: (f, n) => { const im = new Img(16, 16), g = Img.fromGrid(['.wwww.', 'wwwwww', 'wkwwkv', 'wwkwwv', '.wwwv.', '.wvwv.'], K1), y = 9 - f * 1.6; if (f === n - 1) { for (let k = 0; k < g.d.length; k++) if (g.d[k] !== 255 && ((k * 7) % 3) === 0) g.d[k] = 255; } im.blit(g, 5, Math.round(y)); if (f < n - 1) { im.set(6, Math.round(y) + 7, K1.v); im.set(9, Math.round(y) + 8, K1.v); } return im; } };
// ---- light: beams and bursts
E['bless'] = { size: 32, n: 6, pivot: [16, 30], fn: (f, n) => { const t = f / (n - 1); return clean(field(32, (x, y) => { const u = Math.abs(x - 16), v = y / 32, w = 3 + v * 7 + Math.sin(t * 3.14) * 2; if (u > w || v > 0.97) return 0; const ray = Math.sin((x - 16) * 1.1) * 0.5 + 0.5, a = (1 - u / w) * (0.35 + 0.65 * Math.sin(t * 3.14)) * (0.5 + ray * 0.5); if (a < 0.24) return 0; const sweep = Math.abs(v - t * 1.2) < 0.12 ? 0.3 : 0; return AL.clamp(a + sweep, 0, 0.999); }, [ix('fire', 3), ix('fire', 4), ix('fire', 5), ix('ice', 5)])); } };
E['curse'] = { size: 32, n: 6, fn: flame(32, 14, R('magic', [1, 2, 3, 4, 5])), pivot: [16, 30] };
E['magic'] = { size: 32, n: 6, pivot: [16, 16], fn: (f, n) => { const t = (f + 1) / n, im = new Img(32, 32); for (let k = 0; k < 8; k++) { const a = k * 0.785 + 0.3, r0 = t * 5, r1 = 3 + t * 12; for (let r = r0; r < r1; r += 0.7) { const x = 16 + Math.cos(a) * r, y = 16 + Math.sin(a) * r, c = r > r1 - 2.5 ? K1.o : r > r1 - 6 ? K1.n : K1.m; im.set(Math.round(x), Math.round(y), c); } const sx = Math.round(16 + Math.cos(a + 0.39) * (2 + t * 11)), sy = Math.round(16 + Math.sin(a + 0.39) * (2 + t * 11)); if (f < n - 1) { im.set(sx, sy, K1.w); im.set(sx + 1, sy, K1.o); im.set(sx - 1, sy, K1.o); im.set(sx, sy + 1, K1.o); im.set(sx, sy - 1, K1.o); } } if (f < 2) for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 3) im.set(16 + x, 16 + y, K1.w); return im; } };
E['teleport'] = { w: 32, h: 64, n: 6, pivot: [16, 62], fn: (f, n) => { const t = f / (n - 1); return clean(field(0, (x, y) => { const u = Math.abs(x - 16), w = 7 * (1 - t) * (0.8 + 0.2 * Math.sin(y * 0.5 + f)) + 0.6, top = t * 50; if (y < top || u > w) return 0; return AL.clamp((1 - u / w) * 0.9 + 0.1, 0.05, 0.999); }, [ix('royal', 3), ix('royal', 4), ix('royal', 5), ix('ice', 5)], 32, 64)); } };
E['frost'] = { size: 16, n: 5, fn: (f, n) => { const im = new Img(16, 16), t = (f + 1) / n; for (let k = 0; k < 6; k++) { const a = k * 1.047 + 0.52, L = 2 + t * 5; for (let r = 1; r < L; r++) { im.set(Math.round(8 + Math.cos(a) * r), Math.round(9 + Math.sin(a) * r), r > L - 2 ? ix('ice', 5) : ix('ice', 3)); } const bx = 8 + Math.cos(a) * L * 0.6, by = 9 + Math.sin(a) * L * 0.6; if (f > 1 && f < n - 1) { im.set(Math.round(bx + Math.cos(a + 1.2)), Math.round(by + Math.sin(a + 1.2)), ix('ice', 4)); im.set(Math.round(bx + Math.cos(a - 1.2)), Math.round(by + Math.sin(a - 1.2)), ix('ice', 4)); } } return im; } };
// ---- meteor: a rock wrapped in fire, falling down-left→ (drawn falling toward bottom-right, light from top-left keeps the rock's lit face)
E['meteor'] = { size: 32, n: 4, pivot: [22, 24], fn: (f, n) => { const t = f / n, im = field(32, (x, y) => { const px = x - 22, py = y - 23, along = -(px + py) * 0.707, across = (px - py) * 0.707; if (along < -5) return 0; const w = along < 0 ? Math.sqrt(Math.max(0, 25 - along * along)) * 1.1 : 5.6 * (1 - along / 24) + (nz(along * 0.35 - t * 4, across * 0.4, 9) - 0.5) * 2.4; if (Math.abs(across) > w || along > 23) return 0; return AL.clamp((1 - Math.abs(across) / (w + 0.01)) * (1 - along / 26) + 0.1, 0.05, 0.999); }, FIRE);
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const d = Math.hypot(x, y); if (d < 4.3) im.set(22 + x, 23 + y, d > 3.4 ? ix('earth', 0) : (x + y < -2 ? ix('earth', 3) : x + y < 2 ? ix('earth', 2) : ix('earth', 1))); } im.set(21, 21, ix('earth', 4)); im.set(24, 25, ix('earth', 0)); return clean(im); } };
// ---- ground decals and props
E['crack'] = { size: 32, n: 3, pivot: [16, 16], fn: (f) => { const im = new Img(32, 32); const walk = (x, y, a, L, s) => { for (let k = 0; k < L; k++) { im.set(Math.round(x), Math.round(y), ix('earth', 0)); if (k < L * 0.6) im.set(Math.round(x), Math.round(y) + 1, ix('earth', 1)); a += (AL.hash2(k, s, 4) - 0.5) * 1.3; x += Math.cos(a) * 1.1; y += Math.sin(a) * 0.6; if (k === (L >> 1) && L > 6) walk(x, y, a + 1, L >> 1, s + 9); } }; walk(16, 16, 0.2 + f, 12, f * 5 + 1); walk(16, 16, 3.3 + f, 12, f * 5 + 2); walk(16, 16, 1.8 - f, 7, f * 5 + 3); return im; } };
E['scorch'] = { size: 16, n: 2, pivot: [8, 8], fn: (f) => field(16, (x, y) => { const d = Math.hypot(x - 8, (y - 8) * 1.7) / 7 + (nz(x * 0.5 + f * 9, y * 0.5, 2) - 0.5) * 0.5; return d > 1 ? 0 : d > 0.6 ? 0.3 : 0.8; }, [ix('earth', 1), ix('earth', 0)]) };
E['wave'] = { size: 32, n: 4, pivot: [16, 24], fn: (f, n) => { const t = f / n; return clean(field(32, (x, y) => { const crest = 14 + Math.sin(x * 0.4 + t * 6.283) * 2.5, d = y - crest; if (d < -1.5 || d > 9) return 0; if (d < 0.8) return 0.95; if (d < 2.5) return nz(x * 0.8 - t * 5, y, 3) > 0.45 ? 0.95 : 0.7; return d < 6 ? 0.45 : 0.15; }, R('water', [2, 3, 4, 5]).concat([ix('ice', 5)]))); } };
E['arrow'] = { size: 16, n: 3, pivot: [8, 8], fn: (f) => { const im = new Img(16, 16), dx = [1, 0.707, 0][f], dy = [0, 0.707, 1][f]; for (let k = -4; k <= 4; k++) im.set(Math.round(8 + dx * k), Math.round(8 + dy * k), k > 2 ? ix('stone', 4) : k < -2 ? ix('ice', 5) : ix('earth', 3)); return im; } };
// ---- weather particles (tiny, drawn many times)
const part = (rows) => ({ w: Math.max(...rows.map(r => r.length)), h: rows.length, n: 1, pivot: [0, 0], fn: () => Img.fromGrid(rows, K1) });
E['p/rain'] = part(['.e', '.d', 'd.', 'd.']); E['p/rain2'] = part(['.e', 'd.', 'd.']); E['p/snow'] = part(['w']); E['p/snow2'] = part(['.w.', 'wvw', '.w.']); E['p/acid'] = part(['.i', '.h', 'h.', 'g.']);
E['p/ash'] = { w: 2, h: 1, n: 1, pivot: [0, 0], fn: () => { const im = new Img(2, 1); im.set(0, 0, ix('stone', 2)); im.set(1, 0, ix('stone', 3)); return im; } };
E['p/ember'] = { w: 2, h: 2, n: 1, pivot: [0, 0], fn: () => { const im = new Img(2, 2); im.set(0, 0, ix('fire', 5)); im.set(1, 0, ix('fire', 3)); im.set(0, 1, ix('fire', 3)); return im; } };
E['p/leaf'] = part(['.h', 'hg']); E['p/sand'] = { w: 3, h: 1, n: 1, pivot: [0, 0], fn: () => { const im = new Img(3, 1); im.set(0, 0, ix('sand', 3)); im.set(1, 0, ix('sand', 4)); im.set(2, 0, ix('sand', 3)); return im; } };
// ---- rain cloud seen from above: a flat cumulus of 4 lobes, lit from the top-left, slowly breathing (2 frames)
E['nimbus'] = { size: 64, n: 2, pivot: [32, 40], fn: (f) => clean(field(64, (x, y) => { let v = 0; const L = [[20, 34, 13], [33, 29, 15], [46, 35, 12], [31, 40, 13], [14, 40, 8], [52, 41, 8]];
  for (const [cx, cy, r] of L) { const d = Math.hypot(x - cx, (y - cy) * 1.5) / (r + f * 0.6); if (d < 1) v = Math.max(v, 1 - d); } if (v <= 0) return 0; v += (nz(x * 0.16 + f * 0.4, y * 0.2, 31) - 0.5) * 0.25; if (v <= 0.06) return 0;
  const lit = 0.5 - (y - 34) / 26 - (x - 32) / 90 + v * 0.35; return AL.clamp(lit, 0.03, 0.999); }, [ix('stone', 3), ix('ice', 3), ix('ice', 4), ix('ice', 5)])) };
E['p/fog'] = { size: 64, n: 2, pivot: [32, 32], fn: (f) => field(64, (x, y) => { const d = Math.hypot(x - 32, (y - 32) * 2) / 30 + (nz(x * 0.09 + f * 7, y * 0.14, 6) - 0.5) * 0.9; return d > 1 ? 0 : d > 0.62 ? 0.3 : 0.8; }, [ix('ice', 3), ix('ice', 4)]) };
module.exports = E;
