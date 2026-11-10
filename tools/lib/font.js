// Builds glyph bitmaps from tools/art/font.js (small font) and derives the large font (EPX 2x + patches).
'use strict';
const { G, ACC, COMPOSE } = require('../art/font');
const ASC = 2, CAP = 7, DESC = 2, H = ASC + CAP + DESC; // 11 rows: 2 accent rows, 7 cap rows, 2 descender rows
function rowsOf(str) { const r = str.split('/'), w = Math.max(...r.map(s => s.length)); return r.map(s => s.padEnd(w, '.')); }
function glyph(ch) {
  let rows, top = ASC;
  if (G[ch] != null) rows = rowsOf(G[ch]);
  else if (COMPOSE[ch]) {
    const [b, a] = COMPOSE[ch]; rows = rowsOf(G[b]); const w = rows[0].length;
    if (a === 'ced') { while (rows.length < 7) rows.push('.'.repeat(w)); const m = (w >> 1); rows.push('.'.repeat(m) + 'X' + '.'.repeat(w - m - 1)); rows.push('.'.repeat(Math.max(0, m - 1)) + 'X' + '.'.repeat(w - Math.max(0, m - 1) - 1)); }
    else { const acc = ACC[a], aw = acc[0].length, W = Math.max(w, aw), pad = s => { const l = (W - s.length) >> 1; return '.'.repeat(l) + s + '.'.repeat(W - s.length - l); };
      rows = rows.map(pad); const upper = b === b.toUpperCase() && b !== 'ı';
      if (upper) { rows = [pad(acc[0]), pad(acc[1]), ...rows]; top = 0; if (acc[1].replace(/\./g, '') === '') { rows[1] = rows[0]; rows[0] = '.'.repeat(W); } }
      else { rows[0] = pad(acc[0]); rows[1] = pad(acc[1]); if (acc[1].replace(/\./g, '') === '') { rows[1] = rows[0]; rows[0] = '.'.repeat(W); } } }
  } else return null;
  const w = rows[0].length, bits = new Uint8Array(w * H);
  rows.forEach((r, y) => { for (let x = 0; x < w; x++) if (r[x] === 'X' && top + y < H) bits[(top + y) * w + x] = 1; });
  return { w, h: H, bits };
}
function chars() { return [...Object.keys(G), ...Object.keys(COMPOSE)]; }
// EPX (scale2x) enlargement then 1px embolden to the right -> large font
function enlarge(g) {
  const w = g.w, h = g.h, W = w * 2 + 1, Hh = h * 2, o = new Uint8Array(W * Hh), at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : g.bits[y * w + x];
  const tmp = new Uint8Array(w * 2 * Hh);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    let e0 = P, e1 = P, e2 = P, e3 = P; if (C === A && C !== D && A !== B) e0 = A; if (A === B && A !== C && B !== D) e1 = B; if (D === C && D !== B && C !== A) e2 = C; if (B === D && B !== A && D !== C) e3 = D;
    tmp[(y * 2) * w * 2 + x * 2] = e0; tmp[(y * 2) * w * 2 + x * 2 + 1] = e1; tmp[(y * 2 + 1) * w * 2 + x * 2] = e2; tmp[(y * 2 + 1) * w * 2 + x * 2 + 1] = e3; }
  for (let y = 0; y < Hh; y++) for (let x = 0; x < w * 2; x++) if (tmp[y * w * 2 + x]) { o[y * W + x] = 1; }
  return { w: W - 1, h: Hh, bits: (() => { const b = new Uint8Array((W - 1) * Hh); for (let y = 0; y < Hh; y++) for (let x = 0; x < W - 1; x++) b[y * (W - 1) + x] = o[y * W + x]; return b; })() };
}
module.exports = { glyph, chars, enlarge, H, ASC, CAP, DESC };
