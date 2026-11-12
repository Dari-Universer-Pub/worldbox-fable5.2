// Logo and game icon sources (pipeline B: painted in data). The word DUSTCROWN in its own 9x13 capitals (drawn here, not
// the text font), gold tones from the fire ramp lit from the top-left, dark ink outline, a shadow, a small jewelled crown
// set on the O and a drift of dust under the word. The icon: a small round world wearing the crown, dust motes around.
//   logo() -> Img (word mark),  icon() -> Img 32x32,  appIcon(size) -> Img (icon on a rounded night-blue tile, for web app icons)
'use strict';
const { Img, T } = require('../lib/img'); const { ix } = require('../lib/mats');
const G = {
  D: ['#######..', '########.', '###..####', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###..####', '########.', '#######..'],
  U: ['###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '.#######.', '..#####..'],
  S: ['.########', '#########', '###......', '###......', '###......', '########.', '.########', '......###', '......###', '......###', '......###', '#########', '########.'],
  T: ['#########', '#########', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...', '...###...'],
  C: ['..#######', '.########', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '###......', '.########', '..#######'],
  R: ['########.', '#########', '###...###', '###...###', '###...###', '########.', '#######..', '###.###..', '###..###.', '###..###.', '###...###', '###...###', '###...###'],
  O: ['..#####..', '.#######.', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '.#######.', '..#####..'],
  W: ['###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###...###', '###.#.###', '###.#.###', '#########', '#########', '####.####', '###...###'],
  N: ['###...###', '####..###', '####..###', '#####.###', '#####.###', '###.#####', '###.#####', '###..####', '###..####', '###...###', '###...###', '###...###', '###...###'],
};
const WORD = 'DUSTCROWN', LW = 9, LH = 13, GAP = 2, SPLIT = 4; // DUST | CROWN: a wider gap and the crown sits over the join
// a small crown, 13 wide: three points with jewels
const CROWN = ['......g......', '.g...ggg...g.', '.gg..ggg..gg.', '.ggg.ggg.ggg.', '.ggggggggggg.', '.grggbgbggrg.', '.ggggggggggg.'];
function logo() {
  const w = WORD.length * LW + (WORD.length - 1) * GAP, W = w + 8, top = 9, H = top + LH + 12, im = new Img(W, H), ox = 4, oy = top, fill = new Uint8Array(W * H);
  [...WORD].forEach((ch, k) => G[ch].forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') fill[(oy + y) * W + ox + k * (LW + GAP) + x] = 1; })));
  const F = (x, y) => x >= 0 && y >= 0 && x < W && y < H && fill[y * W + x];
  // dust: a low drifting line of sand under the word, thinning to the right, and a few motes rising
  const ty = x => Math.round(oy + LH + 4 + Math.sin(x * 0.17 + 0.6) * 1.4);
  for (let x = 2; x < W - 2; x++) { const h = ((x * 7919) % 13) / 13; if (h < 0.12 && x > W * 0.5) continue; im.set(x, ty(x), ix('sand', 4)); im.set(x, ty(x) + 1, ix('sand', 2)); if (h > 0.7) im.set(x, ty(x) - 1, ix('sand', 5)); }
  for (const [x, y, t] of [[7, 3, 4], [19, 6, 3], [33, 2, 4], [69, 5, 3], [81, 2, 4], [93, 6, 3], [100, 3, 4], [12, top + LH + 9, 3], [58, top + LH + 9, 4], [88, top + LH + 8, 3]]) if (x < W && y < H) im.set(x, y, ix('sand', t));
  // shadow, then outline, then the gold letters
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (F(x - 1, y - 2) && !F(x, y)) im.set(x, y, ix('royal', 0));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (F(x, y)) continue; let n = false; for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if (F(x + dx, y + dy)) { n = true; break; } if (n) im.set(x, y, ix('earth', 0)); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!F(x, y)) continue; const r = y - oy; let t = r < 3 ? 5 : r < 7 ? 4 : r < 11 ? 3 : 2;
    if (!F(x - 1, y) || !F(x, y - 1)) t = Math.min(5, t + 1); else if (!F(x + 1, y) || !F(x, y + 1)) t = Math.max(1, t - 1); im.set(x, y, ix('fire', t)); }
  // the crown, tilted on the O
  crown(im, ox + 6 * (LW + GAP) - 2, 0);
  return im;
}
function crown(im, x0, y0, k) { k = k || 1; const K = { g: ix('fire', 4), r: ix('red', 3), b: ix('water', 4) }, w = CROWN[0].length, h = CROWN.length, on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && CROWN[y][x] !== '.';
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) { let v = null; if (on(x, y)) { v = K[CROWN[y][x]]; if (CROWN[y][x] === 'g') v = ix('fire', y >= h - 1 ? 2 : x < 4 || y < 2 ? 5 : x > 8 ? 3 : 4); } else if (on(x + 1, y) || on(x - 1, y) || on(x, y + 1) || on(x, y - 1)) v = ix('earth', 0);
    if (v != null) for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) im.set(x0 + (x + 1) * k + a, y0 + (y + 1) * k + b, v); } }
function icon() {
  const S = 32, im = new Img(S, S), cx = 15.5, cy = 19, R = 11.4;
  const land = (x, y) => { const a = Math.sin(x * 0.55 + 1.3) + Math.cos(y * 0.62 - 0.4) + Math.sin((x + y) * 0.31 + 2.2) * 0.8; return a > 0.45; }, dune = (x, y) => Math.sin(x * 0.9 + y * 0.4) + Math.cos(y * 0.8 - x * 0.3) > 0.7;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy); if (d > R + 1) continue; if (d > R) { im.set(x, y, ix('royal', 0)); continue; }
    const lit = (-dx * 0.6 - dy * 0.75) / R, edge = d / R; let v;
    if (land(x, y)) v = dune(x, y) ? ix('sand', lit > 0.25 ? 4 : 3) : ix('grass', lit > 0.3 ? 4 : lit > -0.3 ? 3 : 2); else v = ix('water', lit > 0.45 ? 4 : lit > -0.2 ? 3 : 2);
    if (edge > 0.86 && lit < 0.1) v = land(x, y) ? ix('forest', 1) : ix('water', 1); im.set(x, y, v); }
  for (const [x, y] of [[9, 13], [10, 12], [11, 12]]) im.set(x, y, ix('ice', 5)); // glint
  crown(im, 7, 0); // the crown rests on the world
  for (const [x, y, t] of [[2, 12, 4], [4, 26, 3], [28, 13, 4], [29, 25, 3], [1, 20, 3], [30, 19, 4], [25, 29, 3], [6, 30, 4]]) im.set(x, y, ix('sand', t)); // dust motes
  return im;
}
// web app icon: the 32x32 icon enlarged (nearest) on a rounded night-blue tile with a margin (safe zone of maskable icons)
function appIcon(size) { const k = Math.floor(size * 0.72 / 32), ic = icon(), im = new Img(size, size), r = Math.round(size * 0.18), o = (size - 32 * k) >> 1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const qx = Math.min(x, size - 1 - x), qy = Math.min(y, size - 1 - y); if (qx < r && qy < r && Math.hypot(r - qx - 0.5, r - qy - 0.5) > r) continue; im.set(x, y, ix('royal', 1)); }
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const v = ic.get(x, y); if (v === T) continue; for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) im.set(o + x * k + a, o + y * k + b, v); }
  return im; }
module.exports = { logo, icon, appIcon };
