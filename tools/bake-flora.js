#!/usr/bin/env node
// Flora baker (pipeline C — growth/cluster rules). Trees 24x32 (10 kinds x 3 variants x 4 sway frames + sapling),
// small flora and decor 16x16. Light from the top-left, ramp shading, ink outline (same outline() as the 3D baker).
'use strict';
const { Img, T } = require('./lib/img'); const { Atlas } = require('./lib/atlas'); const { ix, INK } = require('./lib/mats'); const { outline } = require('./lib/sdf');
function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const R = ix, W = 24, H = 32;
const inkOf = ramp => ({ outline: R(INK[ramp], 0), outlineLit: R(INK[ramp], 1) });
// canvas that remembers the material (ramp) of each pixel for the outline
class Cv { constructor(w, h) { this.im = new Img(w, h); this.m = new Array(w * h).fill(null); this.w = w; this.h = h; }
  set(x, y, ramp, tone) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.im.d[y * this.w + x] = R(ramp, tone); this.m[y * this.w + x] = Cv.mats[ramp] || (Cv.mats[ramp] = inkOf(ramp)); }
  get(x, y) { return this.im.get(x, y); }
  done(noOutline) { if (!noOutline) outline(this.im, this.m, {}); return this.im; } }
Cv.mats = {};
// trunk: tapered column from (x0,y0) bottom to (x1,y1) top, lit on the left
function trunk(c, x0, y0, x1, y1, w0, w1, ramp = 'earth', tones = [1, 2, 3]) { const n = Math.max(1, Math.abs(y0 - y1));
  for (let i = 0; i <= n; i++) { const t = i / n, cx = x0 + (x1 - x0) * t, y = y0 - i, hw = (w0 + (w1 - w0) * t) / 2;
    for (let x = Math.round(cx - hw); x <= Math.round(cx + hw - 0.01); x++) { const u = (x + 0.5 - cx) / (hw + 0.01); c.set(x, y, ramp, u < -0.3 ? tones[2] : u > 0.35 ? tones[0] : tones[1]); } } }
// leaf ball cluster shaded as a sphere; tones = 4 tone numbers dark->light; rough = edge raggedness
function ball(c, cx, cy, r, ramp, tones, seed, squash = 1.1, own, id) {
  for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) { const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) * squash, rr = r + (hash(x >> 1, y >> 1, seed) - 0.5) * 1.2, d = Math.hypot(dx, dy); if (d > rr) continue;
    const nz = Math.sqrt(Math.max(0, 1 - (d / rr) ** 2)), l = -(dx / rr) * 0.6 - (dy / rr) * 0.7 + nz * 0.25 + (hash(x, y >> 1, seed + 7) - 0.5) * 0.2;
    c.set(x, y, ramp, l > 0.62 ? tones[3] : l > 0.18 ? tones[2] : l > -0.32 ? tones[1] : tones[0]); if (own && x >= 0 && y >= 0 && x < c.w && y < c.h) own[y * c.w + x] = id; } }
function seams(c, own, ramp, minTone) { for (let y = 1; y < c.h; y++) for (let x = 1; x < c.w; x++) { const o = own[y * c.w + x]; if (o < 0) continue; const a = own[(y - 1) * c.w + x], b = own[y * c.w + x - 1];
    if ((a >= 0 && a > o) || (b >= 0 && b > o)) { const v = c.im.d[y * c.w + x]; if (v > R(ramp, minTone) && v <= R(ramp, 5)) c.im.d[y * c.w + x] = v - 1; } } }
function despeckle(im) { for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const v = im.get(x, y); if (v === T) continue; const n = [im.get(x - 1, y), im.get(x + 1, y), im.get(x, y - 1), im.get(x, y + 1)]; if (!n.includes(v)) { const f = n.filter(u => u !== T); if (f.length >= 3) im.set(x, y, f[0]); } } return im; }
// ---- tree kinds. sway = horizontal offset of the top of the tree for this frame (-1,0,1)
const TREES = {
  oak(v, sw) { const c = new Cv(W, H), s = 100 + v, own = new Int8Array(W * H).fill(-1), lean = [0, -1, 1][v];
    trunk(c, 12, 30, 12 + lean, 18, 4.4, 2.6); c.set(9, 30, 'earth', 2); c.set(14, 30, 'earth', 1);
    const cl = [[12, 12.5, 7.8], [6.5, 14.5, 4.8], [17.5, 15, 4.8], [9, 8, 4.8], [15.5, 8.5, 4.4], [12, 18, 5], [7.5, 18.5, 3.2], [16.5, 19, 3]];
    cl.forEach((b, i) => ball(c, b[0] + lean + (hash(i, 1, s) - 0.5) * 2.4 + sw * (b[1] < 13 ? 1 : 0), b[1] + (hash(i, 2, s) - 0.5) * 2, b[2] + (hash(i, 3, s) - 0.5), 'forest', [2, 3, 4, 5], s + i, 1.12, own, i)); seams(c, own, 'forest', 2); return c; },
  birch(v, sw) { const c = new Cv(W, H), s = 130 + v, own = new Int8Array(W * H).fill(-1);
    trunk(c, 12, 30, 12, 12, 2.6, 1.8, 'ice', [3, 4, 5]); for (let y = 15; y < 30; y += 3 + (hash(y, 1, s) * 2 | 0)) { c.set(12, y, 'stone', 1); c.set(11 + (y & 1) * 2, y, 'stone', 1); }
    [[12, 9, 5.6], [8, 12.5, 4], [16, 13, 4], [12, 15, 4.4], [10, 5.5, 3.6], [14.5, 6, 3.3]].forEach((b, i) => ball(c, b[0] + (hash(i, 1, s) - 0.5) * 2 + sw * (b[1] < 10 ? 1 : 0), b[1] + (hash(i, 2, s) - 0.5) * 1.5, b[2], 'grass', [2, 3, 4, 5], s + i, 1.0, own, i)); seams(c, own, 'grass', 2); return c; },
  pine(v, sw) { const c = new Cv(W, H), s = 160 + v, ramp = 'forest', top = 3 + v;
    trunk(c, 12, 30, 12, 24, 3, 2.4);
    const tiers = 4; for (let t = tiers - 1; t >= 0; t--) { const y0 = top + t * 5.6, hw0 = 3 + t * 2.1 + (hash(t, 1, s) - 0.5), hgt = 9; const ox = sw * (t < 2 ? 1 : 0);
      for (let y = 0; y < hgt; y++) { const hw = 0.8 + hw0 * (y / (hgt - 1)), yy = Math.round(y0 + y); for (let x = Math.round(12 + ox - hw); x <= Math.round(12 + ox + hw - 0.5); x++) { const u = (x + 0.5 - 12 - ox) / (hw + 0.2), jag = y === hgt - 1 && ((x + t) % 3 === 0); if (jag) continue;
          const l = -u * 0.8 + (y < 3 ? 0.35 : y > hgt - 3 ? -0.5 : 0) + (hash(x, yy, s) - 0.5) * 0.3; c.set(x, yy, ramp, l > 0.55 ? 4 : l > 0.0 ? 3 : l > -0.6 ? 2 : 1); } } }
    return c; },
  snowpine(v, sw) { const c = TREES.pine(v, sw); // snow caps on the lit upper parts of each tier
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = c.im.get(x, y); if (p === R('forest', 4) || (p === R('forest', 3) && c.im.get(x, y - 1) === T)) c.set(x, y, 'ice', p === R('forest', 4) ? 5 : 4); } return c; },
  palm(v, sw) { const c = new Cv(W, H), s = 190 + v, bend = [2, -2, 3][v];
    for (let i = 0; i <= 18; i++) { const t = i / 18, cx = 12 - bend + bend * 2 * t * t * 0.9 + sw * t * t, y = 30 - i; for (let x = -1; x <= 1; x++) { if (Math.abs(x) === 1 && t > 0.75 && x > 0) continue; c.set(cx + x, y, 'sand', (i % 3 === 0 ? 1 : 2) + (x < 0 ? 1 : x > 0 ? -1 : 0)); } }
    const tx = 12 - bend + bend * 2 * 0.9 + sw, ty = 12;
    const fr = [[-1, -0.25, 9], [1, -0.2, 9], [-0.75, -0.75, 8], [0.8, -0.7, 8], [-1, 0.45, 8], [1, 0.5, 8], [0.1, -1, 6]];
    fr.forEach((f, i) => { const len = f[2] + (hash(i, 1, s) * 2 | 0) - 1; for (let k = 0; k <= len; k++) { const t = k / len, x = tx + f[0] * k * 0.95, y = ty + f[1] * k * 0.7 + t * t * 5.5; const tone = f[1] < -0.5 ? 4 : f[0] < 0 ? (t < 0.6 ? 4 : 3) : (t < 0.5 ? 3 : 2);
        c.set(x, y, 'jungle', tone); c.set(x, y + 1, 'jungle', Math.max(1, tone - 1)); if (k > 1 && k < len && (k & 1)) c.set(x, y + 2, 'jungle', Math.max(1, tone - 2)); } });
    c.set(tx, ty + 1, 'earth', 3); c.set(tx + 1, ty + 2, 'earth', 2); c.set(tx - 1, ty + 2, 'earth', 3); return c; },
  jungle(v, sw) { const c = new Cv(W, H), s = 220 + v, own = new Int8Array(W * H).fill(-1);
    trunk(c, 12, 30, 12, 16, 5, 3, 'earth', [1, 2, 3]); c.set(8, 30, 'earth', 2); c.set(15, 30, 'earth', 1); c.set(9, 29, 'earth', 3); c.set(15, 29, 'earth', 1);
    [[12, 9, 8], [5.5, 12, 4.6], [18.5, 12.5, 4.6], [8.5, 5.5, 4.4], [16, 5.5, 4.2], [12, 15.5, 5.4], [5, 16.5, 3], [19, 17, 3]].forEach((b, i) => ball(c, b[0] + (hash(i, 1, s) - 0.5) * 2 + sw * (b[1] < 10 ? 1 : 0), b[1] + (hash(i, 2, s) - 0.5) * 1.5, b[2] + (hash(i, 3, s) - 0.5), 'jungle', [1, 2, 3, 4], s + i, 1.25, own, i)); seams(c, own, 'jungle', 1);
    for (const vx of [6 + v, 17 - v]) for (let y = 17; y < 23 + (hash(vx, 1, s) * 4 | 0); y++) c.set(vx, y, 'jungle', y & 1 ? 2 : 3); return c; },
  acacia(v, sw) { const c = new Cv(W, H), s = 250 + v, own = new Int8Array(W * H).fill(-1);
    trunk(c, 12, 30, 11 + v, 17, 2.6, 2); for (let i = 0; i < 6; i++) { c.set(11 + v - i, 17 - i * 0.6, 'earth', 3); c.set(12 + v + i, 17 - i * 0.6, 'earth', 1); c.set(11 + v - i, 18 - i * 0.6, 'earth', 2); c.set(12 + v + i, 18 - i * 0.6, 'earth', 1); }
    [[12, 11, 6], [6, 12, 4.4], [18, 12.5, 4.4], [12, 9, 5]].forEach((b, i) => ball(c, b[0] + (hash(i, 1, s) - 0.5) * 2 + sw, b[1], b[2], 'swamp', [2, 3, 4, 5], s + i, 2.0, own, i)); seams(c, own, 'swamp', 2); return c; },
  willow(v, sw) { const c = new Cv(W, H), s = 280 + v, own = new Int8Array(W * H).fill(-1);
    trunk(c, 12, 30, 12, 15, 4.6, 3, 'earth', [0, 1, 2]);
    [[12, 10, 7], [6.5, 12, 4.5], [17.5, 12, 4.5], [12, 6.5, 4.5]].forEach((b, i) => ball(c, b[0] + (hash(i, 1, s) - 0.5) * 2 + sw * (b[1] < 9 ? 1 : 0), b[1], b[2], 'swamp', [1, 2, 3, 4], s + i, 1.1, own, i)); seams(c, own, 'swamp', 1);
    for (let x = 3; x <= 21; x += 2) { const top = 12 + Math.abs(x - 12) * 0.35, len = 6 + (hash(x, 1, s) * 7 | 0) - Math.abs(x - 12) * 0.2; for (let y = top; y < top + len; y++) c.set(x + (y > top + len * 0.6 ? sw : 0), y, 'swamp', (x < 10 ? 4 : x > 15 ? 2 : 3) - ((y | 0) % 4 === 3 ? 1 : 0)); } return c; },
  dead(v, sw) { const c = new Cv(W, H), s = 310 + v; trunk(c, 12, 30, 12 + [0, 1, -1][v], 12, 3.6, 1.6, 'stone', [1, 2, 3]);
    const br = [[-1, -0.9, 7, 17], [1, -1, 6, 15], [-1, -0.5, 5, 21], [1, -0.4, 5, 19 + v]]; br.forEach((b, i) => { for (let k = 0; k < b[2]; k++) { const x = 12 + b[0] * (1 + k), y = b[3] + b[1] * k; c.set(x, y, 'stone', b[0] < 0 ? 3 : 2); if (k < b[2] - 2) c.set(x, y + 1, 'stone', 1); if (k === b[2] - 3) { c.set(x, y - 1, 'stone', 3); c.set(x + b[0], y - 2, 'stone', 2); } } }); return c; },
  cactus(v, sw) { const c = new Cv(W, H), s = 340 + v, h = 15 + v * 2; const col = (cx, y0, y1, hw) => { for (let y = y0; y <= y1; y++) for (let x = -hw; x <= hw; x++) { if (y === y0 && Math.abs(x) === hw) continue; c.set(cx + x, y, 'jungle', x < 0 ? 3 : x === 0 ? ((y & 1) ? 2 : 3) : 1); } };
    col(12, 30 - h, 30, 2); col(6 + (v & 1), 16, 22, 1); for (let x = 7 + (v & 1); x < 11; x++) { c.set(x, 22, 'jungle', 2); c.set(x, 23, 'jungle', 1); } col(18, 13 + v, 19, 1); for (let x = 14; x < 18; x++) { c.set(x, 19, 'jungle', 2); c.set(x, 20, 'jungle', 1); }
    if (v !== 1) { c.set(12, 29 - h, 'pink', 4); c.set(11, 29 - h, 'pink', 3); } return c; },
};
const at = new Atlas('flora', { maxW: 24 * 16 });
const SWAY = [0, 1, 0, -1];
for (const kind in TREES) for (let v = 0; v < 3; v++) for (let f = 0; f < 4; f++) at.add(`tree/${kind}/${v}/${f}`, despeckle(TREES[kind](v, SWAY[f]).done()), 12, 30);
// ---- small flora / decor 16x16 (pivot 8,14)
const S = {};
function small(fn, bare) { const c = new Cv(16, 16); fn(c); return c.done(bare); }
S.sapling = f => small(c => { trunk(c, 8, 14, 8, 9, 1.2, 1); ball(c, 8 + SWAY[f] * 0.6, 7, 3.4, 'forest', [2, 3, 4, 5], 5); });
S.bush = f => small(c => { ball(c, 8, 11, 4.2, 'forest', [2, 3, 4, 5], 6, 1.3); ball(c, 5 + SWAY[f] * 0.5, 12, 2.6, 'forest', [2, 3, 4, 5], 7, 1.2); ball(c, 11, 12.2, 2.6, 'forest', [2, 3, 4, 5], 8, 1.2); });
S.berry = f => small(c => { ball(c, 8, 11, 4.4, 'grass', [1, 2, 3, 4], 9, 1.3); for (const [x, y] of [[6, 10], [9, 9], [10, 12], [7, 12]]) { c.set(x + (f & 1 && y < 10 ? 1 : 0), y, 'red', 3); } c.set(9, 8 + 0, 'red', 4); });
S.grasstuft = f => small(c => { for (const [x, h, t] of [[5, 4, 4], [7, 6, 5], [9, 5, 4], [11, 3, 3], [8, 4, 3]]) for (let y = 0; y < h; y++) c.set(x + (y > h - 3 ? SWAY[f] : 0) * (x > 7 ? 1 : 0.6), 14 - y, 'grass', y === h - 1 ? t : t - 1); }, true);
S.reeds = f => small(c => { for (const [x, h] of [[5, 8], [8, 10], [11, 7]]) { for (let y = 0; y < h; y++) c.set(x + (y > h - 4 ? SWAY[f] : 0), 14 - y, 'swamp', y & 3 ? 4 : 3); c.set(x + SWAY[f], 14 - h, 'earth', 3); c.set(x + SWAY[f], 13 - h, 'earth', 2); } }, true);
const flower = (ramp) => f => small(c => { for (const [x, h] of [[5, 4], [8, 6], [11, 5]]) { for (let y = 0; y < h; y++) c.set(x, 14 - y, 'grass', 2); c.set(x + (SWAY[f] > 0 ? 1 : 0), 14 - h, ramp, 4); c.set(x + 1 + (SWAY[f] > 0 ? 1 : 0), 14 - h, ramp, 3); c.set(x + (SWAY[f] > 0 ? 1 : 0), 13 - h, ramp, 5); } }, true);
S.flower_red = flower('red'); S.flower_gold = flower('fire'); S.flower_blue = flower('royal'); S.flower_pink = flower('pink');
// mushrooms (chantier C.9): one tall and one small, domed spotted caps, dark gills under the rim, pale stems that widen at the foot
S.mushroom = f => small(c => { const cap = (cx, y, hw) => { for (let r = 0; r <= hw; r++) { const w = r === 0 ? Math.max(1, hw - 2) : r === 1 ? hw - 1 : hw; for (let dx = -w; dx <= w; dx++) c.set(cx + dx, y - hw + r, 'red', dx < -w / 3 ? 4 : dx > w / 2 ? 2 : 3); } for (let dx = -hw + 1; dx <= hw - 1; dx++) c.set(cx + dx, y + 1, 'red', 1); };
  for (let y = 10; y <= 14; y++) { c.set(6, y, 'sand', 5); c.set(7, y, 'sand', y > 12 ? 3 : 4); } c.set(5, 14, 'sand', 4); cap(6, 9, 3); c.set(4, 8, 'ice', 5); c.set(7, 7, 'ice', 5); c.set(8, 9, 'ice', 4);
  c.set(12, 13, 'sand', 5); c.set(12, 14, 'sand', 4); cap(12, 12, 2); c.set(11, 11, 'ice', 5); });
S.glowcap = f => small(c => { for (const [x, y] of [[6, 12], [10, 13], [8, 10]]) { c.set(x, y + 1, 'ice', 3); c.im.d[(y) * 16 + x] = 146 + (f & 1); c.im.d[y * 16 + x - 1] = 146; c.im.d[y * 16 + x + 1] = 145; c.m[y * 16 + x] = c.m[y * 16 + x - 1] = c.m[y * 16 + x + 1] = inkOf('magic'); } });
function rock(v, ramp = 'stone') { return small(c => { const pts = [[8, 10, 5.4, 4.6], [7.5, 11, 4.2, 3.8], [8.5, 11, 6, 3.6]][v]; for (let y = 3; y < 15; y++) for (let x = 1; x < 15; x++) { const dx = (x + 0.5 - pts[0]) / pts[2], dy = (y + 0.5 - pts[1]) / pts[3]; const d = Math.abs(dx) + Math.abs(dy) * 0.9 + Math.max(Math.abs(dx), Math.abs(dy)) * 0.5; if (d > 1.35 || y > 14) continue;
      const facet = dx + dy * 1.4; c.set(x, y, ramp, dy < -0.35 && dx < 0.3 ? 5 : facet < -0.25 ? 4 : facet < 0.55 ? 3 : 2); } c.set(pts[0] + 1, pts[1], ramp, 2); c.set(pts[0] + 1, pts[1] + 1, ramp, 2); }); }
for (let v = 0; v < 3; v++) { at.add(`rock/${v}/0`, rock(v), 8, 14); at.add(`ore_copper/${v}/0`, (() => { const r = rock(v); for (const [x, y] of [[5, 10], [9, 12], [10, 8]]) { if (r.get(x, y) !== T) { r.set(x, y, R('fire', 2)); r.set(x + 1, y, R('fire', 1)); } } return r; })(), 8, 14);
  at.add(`ore_iron/${v}/0`, (() => { const r = rock(v); for (const [x, y] of [[5, 10], [9, 12], [10, 8]]) if (r.get(x, y) !== T) { r.set(x, y, R('red', 2)); r.set(x + 1, y, R('earth', 2)); } return r; })(), 8, 14);
  at.add(`ore_gold/${v}/0`, (() => { const r = rock(v); for (const [x, y] of [[5, 10], [9, 12], [10, 8]]) if (r.get(x, y) !== T) { r.set(x, y, R('fire', 4)); r.set(x + 1, y, R('fire', 3)); } return r; })(), 8, 14);
  at.add(`ore_aether/${v}/0`, (() => { const r = rock(v, 'stone'); for (const [x, y] of [[6, 10], [9, 12], [10, 9], [8, 8]]) if (r.get(x, y) !== T) { r.set(x, y, R('teal', 5)); r.set(x + 1, y, R('teal', 3)); r.set(x, y - 1, R('teal', 4)); } return r; })(), 8, 14); }
// stump (chantier C.9): a cut face seen from above with its rings, bark lit from the left, two roots, a chip left by the axe
S.stump = f => small(c => { for (let y = 11; y < 15; y++) for (let x = 5; x <= 11; x++) c.set(x, y, 'earth', x < 7 ? 3 : x > 9 ? 1 : 2); for (let x = 6; x <= 10; x++) c.set(x, 8, 'sand', 4); for (let y = 9; y <= 10; y++) for (let x = 5; x <= 11; x++) c.set(x, y, 'sand', x > 9 ? 3 : 4);
  for (const [x, y] of [[7, 9], [8, 9], [9, 9], [7, 10], [9, 10]]) c.set(x, y, 'sand', 3); c.set(8, 10, 'earth', 3); c.set(4, 14, 'earth', 3); c.set(3, 14, 'earth', 2); c.set(12, 14, 'earth', 1); c.set(8, 12, 'earth', 1); c.set(6, 13, 'earth', 4); c.set(13, 13, 'sand', 4); c.set(14, 13, 'sand', 3); });
S.bones = f => small(c => { for (let x = 4; x < 12; x++) c.set(x, 12 + (x > 8 ? 1 : 0), 'sand', 5); c.set(4, 11, 'sand', 5); c.set(11, 12, 'sand', 4); for (const x of [6, 8, 10]) { c.set(x, 11, 'sand', 5); c.set(x, 10, 'sand', 4); } c.set(12, 13, 'sand', 5); c.set(13, 12, 'sand', 5); c.set(13, 14, 'sand', 4); });
S.ember = f => small(c => { for (let x = 5; x < 11; x++) c.set(x, 14, 'stone', 1); c.set(6, 13, 'stone', 1); c.set(9, 13, 'stone', 2); c.im.d[13 * 16 + 7] = 146 + (f & 1); c.im.d[13 * 16 + 8] = 145 + ((f >> 1) & 1); c.m[13 * 16 + 7] = c.m[13 * 16 + 8] = inkOf('red'); });
// crops: wheat in 4 growth stages (stage as variant), roots in 4
for (let st = 0; st < 4; st++) for (let f = 0; f < 4; f++) at.add(`wheat/${st}/${f}`, small(c => { for (let i = 0; i < 5; i++) { const x = 3 + i * 2.5, h = 2 + st * 2.4 + (i & 1); for (let y = 0; y < h; y++) c.set(x + (y > h - 3 && st > 1 ? SWAY[f] : 0), 14 - y, st < 3 ? 'grass' : 'sand', st < 3 ? (y & 1 ? 2 : 1) : 3); if (st >= 2) { c.set(x + SWAY[f], 14 - h, st === 3 ? 'fire' : 'grass', st === 3 ? 4 : 5); c.set(x + SWAY[f], 13 - h, st === 3 ? 'fire' : 'grass', st === 3 ? 3 : 4); if (st === 3) c.set(x + SWAY[f] + 1, 14 - h, 'fire', 3); } } }, true), 8, 14);
for (const k in S) for (let f = 0; f < 4; f++) at.add(`${k}/0/${f}`, S[k](f), 8, 14);
// mountain peaks 24x32: faceted cone, lit left face, shadowed right face, jagged ridge, optional snow cap
function peak(v, snow) { const c = new Cv(W, H), s = 400 + v, top = [5, 9, 7][v], ax = [11, 13, 10][v], base = 30;
  for (let y = top; y <= base; y++) { const t = (y - top) / (base - top), hw = 1 + t * (10.5 - (y > base - 2 ? (base - y) * -0.2 : 0)), l = ax - hw * (1.05 + 0.15 * Math.sin(y * 1.3 + v)) , r = ax + hw * (0.95 + 0.15 * Math.sin(y * 0.9 + v * 2));
    const ridge = ax + Math.sin(y * 0.8 + v * 1.7) * 1.2 * t + t * 1.5;
    for (let x = Math.round(l); x <= Math.round(r); x++) { if (x < 0 || x >= W) continue; const lit = x < ridge, u = lit ? (x - l) / Math.max(1, ridge - l) : (x - ridge) / Math.max(1, r - ridge); let tone;
      if (lit) tone = u > 0.72 ? 5 : (hash(x >> 1, y >> 2, s) < 0.3 ? 3 : 4); else tone = u < 0.25 ? 2 : (hash(x >> 1, y >> 2, s + 1) < 0.35 ? 1 : 2);
      if (y > base - 3 && hash(x, y, s + 2) < 0.45) tone = Math.min(tone + 1, 4);
      const snowLine = top + (snow ? 9 : 4) + Math.sin(x * 1.1 + v) * 2; if ((snow || v === 1) && y < snowLine) c.set(x, y, 'ice', lit ? 5 : 3); else c.set(x, y, 'stone', tone); } }
  const im = c.done();
  // scree at the foot, drawn after the outline (chantier D.8): the peak rises out of loose rock instead of being cut by a straight dark line
  for (let x = 1; x < W - 1; x++) { const hh = 2.2 + 1.1 * Math.sin(x * 0.7 + v * 1.3) + 0.6 * Math.sin(x * 1.9 + v), edge = Math.min(x - 0.5, W - 1.5 - x), hgt = Math.max(1, Math.min(hh, edge * 0.7 + 1)); for (let k = 0; k < hgt; k++) im.set(x, 31 - k, R('stone', k === 0 ? (x < ax ? 3 : 2) : hash(x >> 1, k, s + 9) < 0.3 ? 4 : x < ax ? 4 : 3)); }
  im.set(0, 31, T); im.set(W - 1, 31, T); return im; }
// snow-covered peak (chantier D.8): same cone as the rock peak, but the snow is drawn as snow. A cap that follows the ridge and runs down the
// faces in tongues (lower on the lit face), lit side warm white with a cool half-tone, lee side blue with a deeper line under each tongue;
// snow caught on ledges lower down; dark rock showing between; and a drift heaped at the foot, so that the peak stands IN the snow
// instead of being cut by a straight base line.
function snowpeak(v) { const c = new Cv(W, H), s = 430 + v, top = [4, 8, 6][v], ax = [11, 13, 10][v], base = 29, snowAt = new Uint8Array(W * H);
  for (let y = top; y <= base; y++) { const t = (y - top) / (base - top), hw = 1 + t * 10.5, l = ax - hw * (1.05 + 0.15 * Math.sin(y * 1.3 + v)), r = ax + hw * (0.95 + 0.15 * Math.sin(y * 0.9 + v * 2)), ridge = ax + Math.sin(y * 0.8 + v * 1.7) * 1.2 * t + t * 1.5;
    for (let x = Math.round(l); x <= Math.round(r); x++) { if (x < 0 || x >= W) continue; const lit = x < ridge, u = lit ? (x - l) / Math.max(1, ridge - l) : (x - ridge) / Math.max(1, r - ridge);
      const line = (lit ? 0.62 : 0.48) + 0.12 * Math.sin(x * 0.95 + v * 2.1) + 0.06 * Math.sin(x * 2.3 + v);
      // two ledges that hold snow, each a few short spans
      const ledge = (lit && Math.abs(t - (0.72 + 0.04 * v)) < 0.035 && hash(x >> 2, 1, s + 5) < 0.6) || (!lit && Math.abs(t - (0.8 - 0.03 * v)) < 0.03 && hash(x >> 2, 2, s + 5) < 0.55) || (Math.abs(t - 0.9) < 0.03 && hash(x >> 1, 3, s + 5) < 0.3);
      if (t < line || ledge) { snowAt[y * W + x] = 1; c.set(x, y, 'ice', lit ? (t > line - 0.16 && !ledge ? 4 : 5) : (u < 0.22 && t > 0.12 ? 2 : 3)); }
      else c.set(x, y, 'stone', lit ? (u > 0.8 ? 4 : hash(x >> 2, y >> 2, s) < 0.3 ? 2 : 3) : (hash(x >> 2, y >> 2, s + 1) < 0.35 ? 1 : 2)); } }
  // under a tongue of snow the rock is in its shadow, and the last row of the tongue is one tone cooler
  for (let y = top + 1; y <= base; y++) for (let x = 0; x < W; x++) { if (!snowAt[(y - 1) * W + x] || snowAt[y * W + x] || c.get(x, y) === T) continue; if (c.get(x, y - 1) === R('ice', 3)) c.set(x, y - 1, 'ice', 2); c.set(x, y, 'stone', 1); }
  const im = c.done();
  // the drift at the foot, drawn AFTER the outline so that no dark line runs under the peak: an uneven mound across the whole base, lit on the
  // left, blue on the right and along its last row, which melts into the snow of the ground
  for (let x = 1; x < W - 1; x++) { const hh = 3 + 1.2 * Math.sin(x * 0.62 + v * 1.9) + 0.7 * Math.sin(x * 1.7 + v), edge = Math.min(x - 0.5, W - 1.5 - x), hgt = Math.max(1, Math.min(hh, edge * 0.8 + 1)); for (let k = 0; k < hgt; k++) { const y = 31 - k; im.set(x, y, R('ice', k === 0 ? (x < ax ? 4 : 3) : k >= hgt - 1 ? (x < ax + 3 ? 5 : 4) : (x < ax - 2 ? 5 : x < ax + 5 ? 4 : 3))); } }
  im.set(0, 31, T); im.set(W - 1, 31, T); return im; }
for (let v = 0; v < 3; v++) { at.add(`peak/${v}/0`, despeckle(peak(v, false)), 12, 30); at.add(`snowpeak/${v}/0`, despeckle(snowpeak(v)), 12, 30); }
at.save();
console.log('flora atlas ' + at.img.w + 'x' + at.img.h + ', frames ' + Object.keys(at.frames).length);
