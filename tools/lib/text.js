// Draw text into an indexed Img with the game's font (used by sheet tools).
'use strict';
const F = require('./font'); const cache = {};
function g(ch, big) { const k = ch + (big ? 'B' : ''); if (!(k in cache)) { let x = F.glyph(ch) || F.glyph('?'); if (big) x = F.enlarge(x); cache[k] = x; } return cache[k]; }
function draw(img, str, x, y, idx, big) { let cx = x; for (const ch of String(str)) { const gl = g(ch, big); for (let j = 0; j < gl.h; j++) for (let i = 0; i < gl.w; i++) if (gl.bits[j * gl.w + i]) img.set(cx + i, y + j, idx); cx += gl.w + (big ? 2 : 1); } return cx - x; }
function width(str, big) { let w = 0; for (const ch of String(str)) w += g(ch, big).w + (big ? 2 : 1); return w; }
module.exports = { draw, width, LINE: F.H + 1 };
