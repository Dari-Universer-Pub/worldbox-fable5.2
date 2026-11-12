// Logo and game icon sources (pipeline B: painted in data). The word AEONLOOM in its own 9x13 capitals (drawn here, not
// the text font), gold tones from the fire ramp lit from the top-left, dark ink outline, a shadow, and the Weaver's thread
// running under the word to a shuttle. The icon: the Weft (a small round world) crossed by the golden thread.
//   logo() -> Img (word mark),  icon() -> Img 32x32,  appIcon(size) -> Img (icon on a rounded night-blue tile, for web app icons)
'use strict';
const { Img, T } = require('../lib/img'); const { ix } = require('../lib/mats');
const G = {
  A: ['...###...', '..#####..', '.###.###.', '.##...##.', '###...###', '###...###', '#########', '#########', '###...###', '###...###', '###...###', '###...###', '###...###'],
  E: ['#########', '#########', '###......', '###......', '###......', '#######..', '#######..', '###......', '###......', '###......', '###......', '#########', '#########'],
  O: ['..#####..', '.#######.', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '.#######.', '..#####..'],
  N: ['###...###', '####..###', '####..###', '#####.###', '#####.###', '###.#####', '###.#####', '###..####', '###..####', '###...###', '###...###', '###...###', '###...###'],
  L: ['###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '#########', '#########'],
  M: ['###...###', '####.####', '#########', '#########', '###.#.###', '###.#.###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###'],
};
const WORD = 'AEONLOOM', LW = 9, LH = 13, GAP = 2;
function logo() {
  const w = WORD.length * LW + (WORD.length - 1) * GAP, W = w + 8, H = LH + 12, im = new Img(W, H), ox = 4, oy = 3, fill = new Uint8Array(W * H);
  [...WORD].forEach((ch, k) => G[ch].forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') fill[(oy + y) * W + ox + k * (LW + GAP) + x] = 1; })));
  const F = (x, y) => x >= 0 && y >= 0 && x < W && y < H && fill[y * W + x];
  // the thread: behind the word, a slow wave that dips under the letters and ends in a shuttle on the right
  const ty = x => Math.round(oy + LH + 3 + Math.sin(x * 0.19) * 1.6);
  for (let x = 1; x < W - 9; x++) { im.set(x, ty(x), ix('teal', 4)); if (x % 7 === 3) im.set(x, ty(x) - 1, ix('teal', 5)); im.set(x, ty(x) + 1, ix('teal', 1)); }
  { const sx = W - 9, sy = ty(W - 10); for (const [dx, dy, c] of [[0, 0, 'earth:2'], [1, -1, 'earth:3'], [1, 0, 'sand:3'], [1, 1, 'earth:1'], [2, -1, 'earth:3'], [2, 0, 'fire:4'], [2, 1, 'earth:1'], [3, -1, 'earth:3'], [3, 0, 'fire:4'], [3, 1, 'earth:1'], [4, -1, 'earth:3'], [4, 0, 'sand:3'], [4, 1, 'earth:1'], [5, 0, 'earth:2'], [6, 0, 'earth:1']]) { const [r, t] = c.split(':'); im.set(sx + dx, sy + dy, ix(r, +t)); } }
  // shadow, then outline, then the gold letters
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (F(x - 1, y - 2) && !F(x, y)) im.set(x, y, ix('royal', 0));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (F(x, y)) continue; let n = false; for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if (F(x + dx, y + dy)) { n = true; break; } if (n) im.set(x, y, ix('earth', 0)); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!F(x, y)) continue; const r = y - oy; let t = r < 3 ? 5 : r < 7 ? 4 : r < 11 ? 3 : 2;
    if (!F(x - 1, y) || !F(x, y - 1)) t = Math.min(5, t + 1); else if (!F(x + 1, y) || !F(x, y + 1)) t = Math.max(1, t - 1); im.set(x, y, ix('fire', t)); }
  return im;
}
function icon() {
  const S = 32, im = new Img(S, S), cx = 15.5, cy = 16.5, R = 12.2;
  const land = (x, y) => { const a = Math.sin(x * 0.55 + 1.3) + Math.cos(y * 0.62 - 0.4) + Math.sin((x + y) * 0.31 + 2.2) * 0.8; return a > 0.55; }, forest = (x, y) => Math.sin(x * 0.9 + y * 0.4) + Math.cos(y * 0.8 - x * 0.3) > 0.9;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy); if (d > R + 1) continue; if (d > R) { im.set(x, y, ix('royal', 0)); continue; }
    const lit = (-dx * 0.6 - dy * 0.75) / R, edge = d / R; let v;
    if (land(x, y)) v = forest(x, y) ? ix('forest', lit > 0.25 ? 3 : 2) : ix('grass', lit > 0.3 ? 4 : lit > -0.3 ? 3 : 2); else v = ix('water', lit > 0.45 ? 4 : lit > -0.2 ? 3 : 2);
    if (edge > 0.86 && lit < 0.1) v = land(x, y) ? ix('forest', 1) : ix('water', 1); im.set(x, y, v); }
  for (const [x, y] of [[9, 8], [10, 7], [11, 7]]) im.set(x, y, ix('ice', 5)); // glint
  // the golden thread crosses the world and ends in a needle at the top right
  const pts = []; for (let k = 0; k <= 60; k++) { const u = k / 60, x = 2 + u * 25, y = 26 - u * 19 + Math.sin(u * Math.PI * 2.2) * 3.2; pts.push([Math.round(x), Math.round(y)]); }
  for (const [x, y] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (im.get(x + dx, y + dy) !== undefined && x + dx >= 0 && y + dy >= 0 && x + dx < S && y + dy < S) im.set(x + dx, y + dy, ix('earth', 0));
  for (const [x, y] of pts) im.set(x, y, ix('fire', 4)); for (let k = 0; k < pts.length; k += 6) im.set(pts[k][0], pts[k][1], ix('fire', 5));
  for (const [x, y, c] of [[26, 7, 'earth:0'], [27, 6, 'earth:0'], [28, 5, 'earth:0'], [29, 4, 'earth:0'], [30, 3, 'earth:0'], [27, 7, 'earth:0'], [28, 6, 'ice:4'], [29, 5, 'ice:5'], [30, 4, 'ice:5'], [31, 3, 'earth:0'], [30, 2, 'earth:0'], [31, 2, 'earth:0'], [29, 6, 'earth:0'], [30, 5, 'earth:0'], [31, 4, 'earth:0'], [27, 5, 'earth:0'], [28, 4, 'earth:0'], [29, 3, 'earth:0']]) { const [r, t] = c.split(':'); if (x < S && y >= 0) im.set(x, y, ix(r, +t)); }
  for (const [x, y] of [[28, 6], [29, 5], [30, 4]]) im.set(x, y, ix('ice', x === 28 ? 4 : 5));
  return im;
}
// web app icon: the 32x32 icon enlarged (nearest) on a rounded night-blue tile with a margin (safe zone of maskable icons)
function appIcon(size) { const k = Math.floor(size * 0.72 / 32), ic = icon(), im = new Img(size, size), r = Math.round(size * 0.18), o = (size - 32 * k) >> 1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const qx = Math.min(x, size - 1 - x), qy = Math.min(y, size - 1 - y); if (qx < r && qy < r && Math.hypot(r - qx - 0.5, r - qy - 0.5) > r) continue; const g = y / size; im.set(x, y, ix('royal', g < 0.5 ? 1 : 0)); }
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const v = ic.get(x, y); if (v === T) continue; for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) im.set(o + x * k + a, o + y * k + b, v); }
  return im; }
module.exports = { logo, icon, appIcon };
