// Indexed-image library + PNG codec (own code; uses only Node's zlib for DEFLATE).
'use strict';
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const T = 255; // transparent index
let _pal = null;
function palette() {
  if (!_pal) _pal = JSON.parse(fs.readFileSync(path.join(__dirname, '../art/palette.json'), 'utf8'));
  return _pal;
}
// index -> [r,g,b]; team (128..133) shown with the team preview ramp, emissive (144..149) with fire ramp
function rgbOf(i, teamRamp) {
  const p = palette();
  if (i >= 128 && i < 134) i = (teamRamp == null ? p.teamPreviewRamp : teamRamp) * 6 + (i - 128);
  else if (i >= 144 && i < 150) i = p.emissiveRamp * 6 + (i - 144);
  return p.rgb[i] || [255, 0, 255];
}

class Img {
  constructor(w, h, fill = T) { this.w = w; this.h = h; this.d = new Uint8Array(w * h).fill(fill); }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? T : this.d[y * this.w + x]; }
  set(x, y, v) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = v; }
  clone() { const o = new Img(this.w, this.h); o.d.set(this.d); return o; }
  blit(src, dx, dy, opt = {}) {
    const sx = opt.sx || 0, sy = opt.sy || 0, sw = opt.sw || src.w, sh = opt.sh || src.h;
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const v = src.get(sx + (opt.flip ? sw - 1 - x : x), sy + y);
      if (v !== T || opt.opaque) this.set(dx + x, dy + y, v);
    }
    return this;
  }
  crop(x, y, w, h) { const o = new Img(w, h); o.blit(this, 0, 0, { sx: x, sy: y, sw: w, sh: h, opaque: true }); return o; }
  rect(x, y, w, h, v) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, v); return this; }
  bounds() {
    let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[y * this.w + x] !== T) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
  // -> RGBA Buffer
  toRGBA(opt = {}) {
    const s = opt.scale || 1, W = this.w * s, H = this.h * s, out = Buffer.alloc(W * H * 4);
    const bg = opt.bg || null; // [r,g,b] or null (transparent); checker if opt.checker
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = this.d[((y / s) | 0) * this.w + ((x / s) | 0)], o = (y * W + x) * 4;
      if (v === T) {
        if (opt.checker) { const c = ((((x / s) | 0) >> 2) + (((y / s) | 0) >> 2)) & 1 ? 58 : 50; out[o] = c; out[o + 1] = c + 2; out[o + 2] = c + 8; out[o + 3] = 255; }
        else if (bg) { out[o] = bg[0]; out[o + 1] = bg[1]; out[o + 2] = bg[2]; out[o + 3] = 255; }
      } else if (opt.silhouette) { out[o] = out[o + 1] = out[o + 2] = 20; out[o + 3] = 255; }
      else { const c = rgbOf(v, opt.teamRamp); out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255; }
    }
    return { w: W, h: H, data: out };
  }
  savePNG(file, opt) { const r = this.toRGBA(opt); writePNG(file, r.w, r.h, r.data); return this; }
  // from rows of characters with a key map {char: paletteIndex}
  static fromGrid(rows, key) {
    const h = rows.length, w = Math.max(...rows.map(r => r.length)), o = new Img(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x]; if (ch === '.' || ch === ' ') continue;
      if (!(ch in key)) throw new Error('grid key missing: ' + ch);
      o.d[y * w + x] = key[ch];
    }
    return o;
  }
}

// ---- PNG ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy ? rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4) : raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function writePNG(file, w, h, rgba) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, encodePNG(w, h, rgba)); }
function readPNG(file) {
  const b = Buffer.isBuffer(file) ? file : fs.readFileSync(file); let p = 8, w, h, ct, bd; const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; }
    else if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error('readPNG: only 8-bit RGB/RGBA');
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], o = y * (stride + 1) + 1;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, bb = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = raw[o + i];
      if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1;
      else if (f === 4) { const pp = a + bb - c, pa = Math.abs(pp - a), pb = Math.abs(pp - bb), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { out[(y * w + x) * 4] = cur[x * bpp]; out[(y * w + x) * 4 + 1] = cur[x * bpp + 1]; out[(y * w + x) * 4 + 2] = cur[x * bpp + 2]; out[(y * w + x) * 4 + 3] = bpp === 4 ? cur[x * bpp + 3] : 255; }
    const t = prev; prev = cur; cur = t;
  }
  return { w, h, data: out };
}
// RGBA canvas helper for composing sheets
class RGBA {
  constructor(w, h, bg = [34, 32, 44]) { this.w = w; this.h = h; this.data = Buffer.alloc(w * h * 4); for (let i = 0; i < w * h; i++) { this.data[i * 4] = bg[0]; this.data[i * 4 + 1] = bg[1]; this.data[i * 4 + 2] = bg[2]; this.data[i * 4 + 3] = 255; } }
  put(r, dx, dy) { for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { const o = (y * r.w + x) * 4; if (r.data[o + 3] < 128) continue; const X = dx + x, Y = dy + y; if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue; r.data.copy(this.data, (Y * this.w + X) * 4, o, o + 4); } return this; }
  save(file) { writePNG(file, this.w, this.h, this.data); }
}
module.exports = { Img, RGBA, T, palette, rgbOf, writePNG, readPNG, encodePNG };
