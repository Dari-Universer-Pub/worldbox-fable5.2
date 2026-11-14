#!/usr/bin/env node
// Terrain baker (pipeline C — artist's rules). Produces:
//   assets/terrain.*  : one 32x32 seamless texture per ground type (x4 animation frames for water and lava) = 16 tile variants each
//   assets/tmask.*    : transition masks, 256 neighbour codes (47 unique shapes) x 4 variants, 8x8 each.
//                       mask values: 0 base, 1 overlay, 2 overlay rim on its shadow side, 3 base outer rim (shadow side), 4 base outer rim (lit side)
// Rules: calm masses of 2-3 tones, details are stamps of >= 2 px placed on a jittered grid (no salt-and-pepper noise),
// light from the top-left, every pixel from the palette ramps. Walkable grounds keep a mean relative luminance >= 0.21.
'use strict';
const { Img, T, palette } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix } = require('./lib/mats'); const M = require('./lib/measure');
const N = 32;
function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const mod = (a, n) => ((a % n) + n) % n;
// tileable value noise, period p cells over the 32px texture
function vn(x, y, p, s) { const c = N / p, X = x / c, Y = y / c, xi = Math.floor(X), yi = Math.floor(Y), fx = X - xi, fy = Y - yi, w = v => v * v * (3 - 2 * v);
  const a = hash(mod(xi, p), mod(yi, p), s), b = hash(mod(xi + 1, p), mod(yi, p), s), c2 = hash(mod(xi, p), mod(yi + 1, p), s), d = hash(mod(xi + 1, p), mod(yi + 1, p), s);
  return a + (b - a) * w(fx) + (c2 - a) * w(fy) + (a - b - c2 + d) * w(fx) * w(fy); }
const fbm = (x, y, s) => vn(x, y, 4, s) * 0.6 + vn(x, y, 8, s + 1) * 0.4;
class Tex {
  constructor(base) { this.im = new Img(N, N, base); }
  set(x, y, v) { this.im.d[mod(y, N) * N + mod(x, N)] = v; }
  get(x, y) { return this.im.d[mod(y, N) * N + mod(x, N)]; }
  // soft patches where noise < th (cleaned: single pixels removed afterwards)
  patches(v, th, s, f = fbm) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (f(x, y, s) < th) this.set(x, y, v); return this; }
  // stamps on a jittered grid; stamp = [[dx,dy,value],...]; density 0..1; cell size
  stamps(list, cell, density, s) { const n = N / cell; for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) { if (hash(gx, gy, s) > density) continue;
      const st = list[(hash(gx, gy, s + 1) * list.length) | 0], x = gx * cell + ((hash(gx, gy, s + 2) * (cell - 2)) | 0), y = gy * cell + ((hash(gx, gy, s + 3) * (cell - 2)) | 0);
      for (const [dx, dy, v] of st) this.set(x + dx, y + dy, v); } return this; }
  // remove isolated pixels (wrap-aware)
  clean() { for (let pass = 0; pass < 2; pass++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = this.get(x, y); if (this.get(x - 1, y) !== v && this.get(x + 1, y) !== v && this.get(x, y - 1) !== v && this.get(x, y + 1) !== v) this.set(x, y, this.get(x - 1, y)); } return this; }
}
const R = (r, t) => ix(r, t);
// ---- ground definitions (id order is the data order in src/data/grounds.json)
const G = {};
function tuft(l, d) { return [[[0, 0, l], [0, 1, l], [1, 2, d], [1, 1, d]], [[0, 0, l], [1, -1, l], [0, 1, d]], [[0, 0, l], [0, 1, l], [-1, 1, l], [1, 2, d], [0, 2, d]], [[0, 0, l], [1, 0, l], [1, 1, d], [2, 1, d]]]; }
function pebbles(l, d) { return [[[0, 0, l], [1, 0, l], [0, 1, d], [1, 1, d]], [[0, 0, l], [1, 0, l], [2, 0, l], [1, 1, d], [2, 1, d]], [[0, 0, l], [0, 1, d]]]; }
G.grass = () => [new Tex(R('grass', 4)).patches(R('grass', 3), 0.40, 11).clean().stamps(tuft(R('grass', 5), R('grass', 3)), 8, 0.8, 21).im];
G.forest = () => [new Tex(R('grass', 3)).patches(R('forest', 4), 0.42, 12).clean().stamps(tuft(R('grass', 4), R('forest', 4)), 8, 0.6, 22).stamps([[[0, 0, R('earth', 4)], [1, 0, R('earth', 4)]], [[0, 0, R('earth', 4)], [0, 1, R('earth', 4)]]], 16, 0.7, 23).im];
G.jungle = () => [new Tex(R('jungle', 3)).patches(R('jungle', 2), 0.38, 13).clean().stamps(tuft(R('jungle', 4), R('jungle', 2)), 8, 0.85, 24).stamps([[[0, 0, R('jungle', 5)], [1, 0, R('jungle', 5)], [0, 1, R('jungle', 4)]]], 16, 0.5, 25).im];
G.sand = () => [new Tex(R('sand', 5)).patches(R('sand', 4), 0.44, 14).clean().stamps(pebbles(R('sand', 4), R('sand', 3)), 16, 0.6, 26).im];
G.desert = () => { const t = new Tex(R('sand', 4)); // dune ripples: wavy lit crests with a shadow line under them
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const ph = mod(y + Math.round(2.2 * Math.sin((x + 3) / N * 2 * Math.PI) + 1.2 * Math.sin((x * 2) / N * 2 * Math.PI + 1)), 8), k = vn(x, y, 4, 31);
    if (ph === 0 && k > 0.3) t.set(x, y, R('sand', 5)); else if (ph === 1 && k > 0.42) t.set(x, y, R('sand', 3)); }
  return [t.clean().im]; };
G.savanna = () => [new Tex(R('sand', 3)).patches(R('swamp', 5), 0.36, 15).patches(R('sand', 4), 0.3, 35).clean().stamps(tuft(R('sand', 4), R('swamp', 4)), 8, 0.7, 27).im];
G.swamp = () => [new Tex(R('swamp', 4)).patches(R('swamp', 5), 0.36, 16).clean().stamps([[[0, 0, R('teal', 2)], [1, 0, R('teal', 2)], [2, 0, R('teal', 2)], [0, 1, R('teal', 2)], [1, 1, R('teal', 3)], [2, 1, R('teal', 2)], [1, 2, R('teal', 2)], [1, -1, R('swamp', 3)], [0, -1, R('swamp', 3)]], [[0, 0, R('teal', 2)], [1, 0, R('teal', 3)], [0, 1, R('teal', 2)], [1, 1, R('teal', 2)], [0, -1, R('swamp', 3)]]], 16, 0.75, 28).stamps(tuft(R('swamp', 5), R('swamp', 3)), 8, 0.4, 29).im];
G.hills = () => [new Tex(R('grass', 3)).patches(R('grass', 4), 0.36, 17).clean().stamps(pebbles(R('stone', 4), R('stone', 3)), 8, 0.45, 30).stamps(tuft(R('grass', 4), R('grass', 2)), 8, 0.4, 36).im];
G.mountain = () => { const t = new Tex(R('stone', 4)).patches(R('stone', 3), 0.40, 18); // facets + cracks
  for (let i = 0; i < 9; i++) { let x = (hash(i, 1, 40) * N) | 0, y = (hash(i, 2, 40) * N) | 0; const len = 4 + ((hash(i, 3, 40) * 5) | 0); for (let k = 0; k < len; k++) { t.set(x, y, R('stone', 2)); if (k > 0 && k < len - 1) t.set(x - 1, y - 1, R('stone', 5)); x += hash(i, k, 41) < 0.6 ? 1 : 0; y += hash(i, k, 42) < 0.7 ? 1 : 0; } }
  return [t.clean().im]; };
// snow (chantier D.8): windblown drifts. A tileable height field is lit from the top-left: the slopes that face the light are the warm white,
// the flats the cool white, the lee sides a blue shadow with a deeper line at the foot of the steepest ones; a few two-pixel glints.
// No tone covers more than 40 % of the tile, so the snow reads as relief and not as a flat cream sheet.
G.snow = () => { const t = new Tex(R('ice', 4)), h = (x, y) => vn(x, y * 2, 2, 61) * 0.5 + vn(x, y * 2, 4, 62) * 0.36 + vn(x, y, 8, 63) * 0.14; // drifts longer than they are deep (the wind blows along x)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const g = (h(x - 1, y - 1) - h(x + 1, y + 1)) * 6 + (h(x - 2, y) - h(x + 2, y)) * 1.5; t.set(x, y, R('ice', g > 0.24 ? 5 : g > -0.26 ? 4 : g > -1.15 ? 3 : 2)); }
  t.clean(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (t.get(x, y) === R('ice', 2) && t.get(x - 1, y) !== R('ice', 2) && t.get(x + 1, y) !== R('ice', 2)) t.set(x, y, R('ice', 3)); // deep shadow only as lines of 2 px and more
  return [t.stamps([[[0, 0, R('ice', 5)], [1, 0, R('ice', 5)]], [[0, 0, R('ice', 5)], [0, 1, R('ice', 5)]]], 16, 0.75, 31).clean().im]; };
G.ice = () => { const t = new Tex(R('ice', 3)); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const d = mod(x + y * 2, 16), k = vn(x, y, 4, 33); if (d < 2 && k > 0.45) t.set(x, y, R('ice', 4)); else if (d === 8 && k < 0.35) t.set(x, y, R('ice', 2)); }
  return [t.clean().stamps([[[0, 0, R('ice', 5)], [1, 0, R('ice', 5)], [0, 1, R('ice', 4)]]], 16, 0.6, 34).im]; };
G.tundra = () => [new Tex(R('stone', 4)).patches(R('swamp', 5), 0.42, 20).patches(R('swamp', 4), 0.26, 20).clean().stamps([[[0, 0, R('ice', 4)], [1, 0, R('ice', 4)], [0, 1, R('ice', 3)]], [[0, 0, R('ice', 4)], [1, 0, R('ice', 4)]]], 8, 0.35, 32).stamps(pebbles(R('stone', 5), R('stone', 3)), 16, 0.5, 37).im];
G.volcanic = () => { const t = new Tex(R('stone', 3)).patches(R('stone', 2), 0.16, 44);
  for (let i = 0; i < 7; i++) { let x = (hash(i, 1, 45) * N) | 0, y = (hash(i, 2, 45) * N) | 0; const len = 5 + ((hash(i, 3, 45) * 6) | 0); for (let k = 0; k < len; k++) { t.set(x, y, R('stone', 1)); x += hash(i, k, 46) < 0.5 ? 1 : (hash(i, k, 48) < 0.3 ? -1 : 0); y += hash(i, k, 47) < 0.75 ? 1 : 0; } }
  return [t.clean().stamps([[[0, 0, R('fire', 1)], [1, 0, R('fire', 0)]], [[0, 0, R('stone', 4)], [1, 0, R('stone', 4)], [0, 1, R('stone', 2)]]], 16, 0.55, 49).im]; };
G.soil = () => { const t = new Tex(R('sand', 2)); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = mod(y, 4); if (r === 3) t.set(x, y, R('earth', 4)); else if (r === 0 && hash(x >> 1, y, 50) < 0.5) t.set(x, y, R('sand', 3)); } return [t.im]; };
G.road = () => [new Tex(R('sand', 3)).patches(R('sand', 2), 0.42, 51).clean().stamps(pebbles(R('sand', 4), R('earth', 4)), 8, 0.5, 52).im];
// plank deck of a bridge (chantier B.1): boards 4 px wide, dark joints, staggered board ends with a nail, a few worn pale boards
G.bridge = () => { const t = new Tex(R('earth', 4)); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const row = y >> 2, r = y & 3, off = (hash(row, 0, 81) * 16) | 0, bx = mod(x + off, 16), board = (hash(row, (x + off) >> 4, 82) * 3) | 0;
    let v = R(board === 0 ? 'sand' : 'earth', board === 0 ? 2 : 4); if (r === 3) v = R('earth', 2); else if (r === 0) v = R('sand', board === 2 ? 2 : 3); if (bx === 0 && r !== 3) v = R('earth', 2); else if (bx === 2 && r === 1) v = R('earth', 1); t.set(x, y, v); } return [t.im]; };
// animated liquids: 4 frames. Waves are short lit dashes drifting along a diagonal; phase offsets per row keep it organic.
function water(base, hi, lo, s, dens) { const fr = []; for (let f = 0; f < 4; f++) { const t = new Tex(base);
    for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 4; gx++) { if (hash(gx, gy, s) > dens) continue; const len = 3 + ((hash(gx, gy, s + 1) * 3) | 0), x0 = gx * 8 + ((hash(gx, gy, s + 2) * 6) | 0) + f * 2 * (gy & 1 ? 1 : -1), y0 = gy * 4 + ((hash(gx, gy, s + 3) * 3) | 0), ph = (f + ((hash(gx, gy, s + 4) * 4) | 0)) & 3;
      const L = ph === 3 ? len - 2 : ph === 0 ? len - 1 : len; for (let k = 0; k < L; k++) { t.set(x0 + k, y0 + (k > L / 2 ? 1 : 0), hi); if (lo != null) t.set(x0 + k + 1, y0 + 1 + (k > L / 2 ? 1 : 0), lo); } }
    fr.push(t.im); } return fr; }
G.deep = () => water(R('water', 1), R('water', 2), null, 60, 0.5);
G.shallow = () => water(R('water', 3), R('water', 4), R('water', 2), 61, 0.6);
G.lava = () => { const fr = []; for (let f = 0; f < 4; f++) { const t = new Tex(R('fire', 2));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n = vn(x + f * 2, y + f, 4, 70) * 0.6 + vn(x - f, y + f * 2, 8, 71) * 0.4; if (n < 0.3) t.set(x, y, R('red', 2)); else if (n < 0.36) t.set(x, y, R('fire', 1)); else if (n > 0.66) t.set(x, y, R('fire', 4)); else if (n > 0.58) t.set(x, y, R('fire', 3)); }
    fr.push(t.clean().im); } return fr; };

// burnt ground (chantier C.3): charcoal masses, black hearts, pale ash drifts, heat cracks, a few embers still red
G.scorch = () => { const t = new Tex(R('stone', 1)).patches(R('stone', 0), 0.40, 91).patches(R('earth', 1), 0.24, 92, (x, y, s) => vn(x, y, 8, s)).clean();
  for (let i = 0; i < 8; i++) { let x = (hash(i, 1, 93) * N) | 0, y = (hash(i, 2, 93) * N) | 0; const len = 4 + ((hash(i, 3, 93) * 5) | 0); for (let k = 0; k < len; k++) { t.set(x, y, R('earth', 0)); x += hash(i, k, 94) < 0.6 ? 1 : (hash(i, k, 96) < 0.3 ? -1 : 0); y += hash(i, k, 95) < 0.6 ? 1 : 0; } }
  return [t.stamps([[[0, 0, R('stone', 3)], [1, 0, R('stone', 3)], [2, 0, R('stone', 2)], [1, 1, R('stone', 2)], [0, 1, R('stone', 2)]], [[0, 0, R('stone', 3)], [1, 0, R('stone', 2)], [0, 1, R('stone', 2)]], [[0, 0, R('stone', 2)], [1, 0, R('stone', 2)]]], 8, 0.5, 97).stamps([[[0, 0, R('fire', 2)], [1, 0, R('fire', 1)], [0, 1, R('red', 2)], [1, 1, R('red', 2)]], [[0, 0, R('fire', 1)], [1, 0, R('red', 2)]]], 16, 0.5, 98).im]; };
const ORDER = ['deep', 'shallow', 'lava', 'sand', 'soil', 'road', 'desert', 'savanna', 'grass', 'swamp', 'forest', 'jungle', 'tundra', 'hills', 'mountain', 'volcanic', 'snow', 'ice', 'bridge', 'scorch'];
const atlas = new Atlas('terrain', { maxW: 128, meta: { order: ORDER, size: N } }); const P = palette(); const rows = [];
ORDER.forEach((name) => { const frames = G[name](); for (let f = 0; f < 4; f++) atlas.add(name + '/' + f, frames[f % frames.length], 0, 0);
  // measures: mean luminance, dominant tone share, isolated pixels
  const im = frames[0], hist = M.histogram(im); let lum = 0, top = 0; for (const k in hist) { lum += M.lum(P.rgb[+k]) * hist[k]; top = Math.max(top, hist[k]); }
  rows.push(`${name.padEnd(9)} mean lum ${(lum / 1024).toFixed(3)}  tones ${Object.keys(hist).length}  dominant ${(100 * top / 1024).toFixed(0)}%  isolated ${M.isolated(im)}`); });
atlas.save();
// ---- transition masks
const WOB = [[0, 0, 1, 1, 0, -1, -1, 0], [0, 1, 1, 0, 0, 0, -1, 0], [0, -1, -1, 0, 1, 1, 0, 0], [0, 0, -1, 0, 0, 1, 1, 0]];
function maskTile(code, v) { const n = code & 1, e = code & 2, s = code & 4, w = code & 8, ne = code & 16, se = code & 32, sw = code & 64, nw = code & 128, D = 3, im = new Img(8, 8, 0);
  const wN = WOB[v], wE = WOB[(v + 1) & 3], wS = WOB[(v + 2) & 3], wW = WOB[(v + 3) & 3], ins = new Uint8Array(64);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const cx = x + 0.5, cy = y + 0.5; let a = false;
    if (n && cy < D + wN[x]) a = true; if (s && cy > 8 - D - wS[x]) a = true; if (w && cx < D + wW[y]) a = true; if (e && cx > 8 - D - wE[y]) a = true;
    const rc = D + 0.15;
    if (ne && !n && !e && Math.hypot(8 - cx, cy) < rc) a = true; if (nw && !n && !w && Math.hypot(cx, cy) < rc) a = true; if (se && !s && !e && Math.hypot(8 - cx, 8 - cy) < rc) a = true; if (sw && !s && !w && Math.hypot(cx, 8 - cy) < rc) a = true;
    const f = 1.8; // fillets in concave joins of two adjacent edges
    if (n && e && cx > 8 - D - f && cy < D + f && Math.hypot(cx - (8 - D - f), cy - (D + f)) > f) a = true; if (n && w && cx < D + f && cy < D + f && Math.hypot(cx - (D + f), cy - (D + f)) > f) a = true;
    if (s && e && cx > 8 - D - f && cy > 8 - D - f && Math.hypot(cx - (8 - D - f), cy - (8 - D - f)) > f) a = true; if (s && w && cx < D + f && cy > 8 - D - f && Math.hypot(cx - (D + f), cy - (8 - D - f)) > f) a = true;
    ins[y * 8 + x] = a ? 1 : 0; }
  // outside the tile, the overlay is present where the neighbour is the overlay material
  const at = (x, y) => { if (x >= 0 && y >= 0 && x < 8 && y < 8) return ins[y * 8 + x]; const dx = x < 0 ? -1 : x > 7 ? 1 : 0, dy = y < 0 ? -1 : y > 7 ? 1 : 0;
    if (dx === 0) return dy < 0 ? !!n : !!s; if (dy === 0) return dx < 0 ? !!w : !!e; return dx < 0 ? (dy < 0 ? !!nw : !!sw) : (dy < 0 ? !!ne : !!se); };
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const a = ins[y * 8 + x];
    if (a) im.set(x, y, (!at(x + 1, y) || !at(x, y + 1)) ? 2 : 1); // overlay pixel whose right/bottom neighbour is base: shadow-side rim
    else im.set(x, y, (at(x - 1, y) || at(x, y - 1)) ? 3 : (at(x + 1, y) || at(x, y + 1)) ? 4 : 0); }
  return im; }
const mk = new Atlas('tmask', { maxW: 2048, meta: { variants: 4 } }), uniq = new Set();
for (let v = 0; v < 4; v++) for (let c = 0; c < 256; c++) { const im = maskTile(c, v); mk.add(v + '/' + c, im, 0, 0); if (v === 0) uniq.add(Array.from(im.d).join('')); }
mk.save();
console.log(rows.join('\n')); console.log('terrain atlas ' + atlas.img.w + 'x' + atlas.img.h + ', mask shapes (unique, variant 0): ' + uniq.size);
// ---- sample sheet for looking: each ground 2x2 textures (64x64) with transitions demo
if (process.argv.includes('--sheet')) {
  const cols = 6, cell = 68, sheet = new Img(cols * cell + 4, Math.ceil(ORDER.length / cols) * cell + 4, R('stone', 0));
  ORDER.forEach((name, i) => { const im = atlas.frame(name + '/0'); for (let j = 0; j < 4; j++) sheet.blit(im, 4 + (i % cols) * cell + (j & 1) * 32, 4 + ((i / cols) | 0) * cell + (j >> 1) * 32, { opaque: true }); });
  sheet.savePNG('shots/terrain-textures.png', { scale: 3 });
}
