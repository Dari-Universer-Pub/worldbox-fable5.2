// Measurements on indexed frames: isolated pixels, flicker, outline, saturation, contrast.
'use strict';
const { T, palette, rgbOf } = require('./img');
function isolated(im) { let n = 0; const w = im.w, h = im.h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = im.d[y * w + x]; if (v === T) continue;
    if (im.get(x - 1, y) !== v && im.get(x + 1, y) !== v && im.get(x, y - 1) !== v && im.get(x, y + 1) !== v) n++; } return n; }
function opaque(im) { let n = 0; for (let i = 0; i < im.d.length; i++) if (im.d[i] !== T) n++; return n; }
// flicker between two frames: pixels opaque in both, whose 4-neighbourhood coverage is unchanged, but whose colour differs.
// best integer shift (|d|<=2) is searched first so that a whole-body bob is not counted.
function flicker(a, b) { let best = null;
  for (let sy = -2; sy <= 2; sy++) for (let sx = -2; sx <= 2; sx++) { let fl = 0, both = 0;
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) { const p = a.get(x, y), q = b.get(x + sx, y + sy); if (p === T || q === T) continue; both++;
      if (p === q) continue; let st = true; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if ((a.get(x + dx, y + dy) === T) !== (b.get(x + dx + sx, y + dy + sy) === T)) { st = false; break; } if (st) fl++; }
    const cost = fl + (Math.abs(sx) + Math.abs(sy)) * 0.01 - both * 1e-4; if (!best || cost < best.cost) best = { cost, fl, both, sx, sy }; }
  return best; }
function lum(c) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
function contrast(c1, c2) { const a = lum(c1), b = lum(c2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
// outline stats: silhouette border pixels, share of the single most frequent colour (uniform line detector), share that is the palette's darkest
function outlineStats(im) { const cnt = {}; let n = 0; const w = im.w, h = im.h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = im.d[y * w + x]; if (v === T) continue; if (im.get(x - 1, y) === T || im.get(x + 1, y) === T || im.get(x, y - 1) === T || im.get(x, y + 1) === T) { cnt[v] = (cnt[v] || 0) + 1; n++; } }
  let top = 0; for (const k in cnt) top = Math.max(top, cnt[k]); return { border: n, colours: Object.keys(cnt).length, topShare: n ? top / n : 0 }; }
function histogram(im) { const h = {}; for (let i = 0; i < im.d.length; i++) { const v = im.d[i]; if (v !== T) h[v] = (h[v] || 0) + 1; } return h; }
function saturationMean(im) { const p = palette(); let s = 0, n = 0; for (let i = 0; i < im.d.length; i++) { const v = im.d[i]; if (v === T || v >= 96) continue; s += p.hsv[v][1]; n++; } return n ? s / n : 0; }
// readable-mass contrast of a sprite against a background colour: the contrast level reached by at least `share` (12%) of its pixels
function spriteContrast(im, bg, teamRamp, share) { const hgm = histogram(im), tot = opaque(im), list = [];
  for (const k in hgm) list.push([contrast(rgbOf(+k, teamRamp), bg), hgm[k]]); list.sort((a, b) => b[0] - a[0]);
  let acc = 0; for (const [c, n] of list) { acc += n; if (acc >= tot * (share || 0.12)) return c; } return 1; }
module.exports = { isolated, opaque, flicker, contrast, lum, outlineStats, histogram, saturationMean, spriteContrast };
