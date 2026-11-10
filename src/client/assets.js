// AL.Assets — decodes the baked indexed atlases (RLE + base64, no image decoding), packs sprite atlases into one page.
(function (AL) {
  'use strict';
  const A = AL.Assets = { frames: {}, atlas: {}, PAGE: 4096 };
  function b64(s) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function unrle(src, len) { const out = new Uint8Array(len); let o = 0; for (let i = 0; i < src.length; i += 2) { out.fill(src[i + 1], o, o + src[i]); o += src[i]; } return out; }
  A.load = function () {
    const R = self.AL_ASSETS, pal = A.palette = R.palette; A.raw = {};
    for (const name in R.atlases) { const a = R.atlases[name]; A.raw[name] = { w: a.w, h: a.h, d: unrle(b64(a.d), a.w * a.h), frames: a.frames, meta: a.meta || {} }; }
    // one page for every sprite atlas (terrain and masks keep their own textures)
    const P = A.PAGE; let ph = 0, x = 0, y = 0, rowH = 0; const place = [];
    for (const name in A.raw) { if (name === 'terrain' || name === 'tmask') continue; const a = A.raw[name]; if (x + a.w > P) { x = 0; y += rowH; rowH = 0; } place.push([name, x, y]); x += a.w; rowH = Math.max(rowH, a.h); ph = Math.max(ph, y + a.h); }
    A.pageH = Math.min(P, 1 << Math.ceil(Math.log2(Math.max(64, ph)))); if (ph > P) throw new Error('sprite page overflow ' + ph);
    const page = A.page = new Uint8Array(P * A.pageH).fill(255);
    for (const [name, ox, oy] of place) { const a = A.raw[name]; for (let r = 0; r < a.h; r++) page.set(a.d.subarray(r * a.w, (r + 1) * a.w), (oy + r) * P + ox);
      for (const k in a.frames) { const f = a.frames[k]; A.frames[k] = [f[0] + ox, f[1] + oy, f[2], f[3], f[4], f[5]]; } A.atlas[name] = { ox, oy, w: a.w, h: a.h, meta: a.meta }; }
    // palette as RGBA bytes (256 entries)
    const pb = A.palBytes = new Uint8Array(256 * 4); pal.rgb.forEach((c, i) => { pb[i * 4] = c[0]; pb[i * 4 + 1] = c[1]; pb[i * 4 + 2] = c[2]; pb[i * 4 + 3] = 255; });
    A.css = pal.rgb.map(c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
    A.ix = (ramp, tone) => pal.ramps[ramp] * 6 + tone;
  };
  // animation lookup: frames 'base/0', 'base/1', ... -> array
  const animCache = {};
  A.anim = function (base) { let a = animCache[base]; if (a) return a; a = []; for (let i = 0; ; i++) { const f = A.frames[base + '/' + i]; if (!f) break; a.push(f); } return (animCache[base] = a); };
  // render a frame into a 2D canvas (UI use). team = ramp index
  A.toCanvas = function (f, team, scale) { const c = document.createElement('canvas'); c.width = f[2]; c.height = f[3]; const g = c.getContext('2d'), im = g.createImageData(f[2], f[3]), P = A.PAGE, pb = A.palBytes, er = A.palette.ramps[A.palette.emissiveRamp] !== undefined ? A.palette.emissiveRamp : 10;
    for (let y = 0; y < f[3]; y++) for (let x = 0; x < f[2]; x++) { let v = A.page[(f[1] + y) * P + f[0] + x]; if (v === 255) continue; if (v >= 144) v = (typeof er === 'number' ? er : 10) * 6 + (v - 144) % 6; else if (v >= 128) v = (team == null ? 9 : team) * 6 + (v - 128); const o = (y * f[2] + x) * 4; im.data[o] = pb[v * 4]; im.data[o + 1] = pb[v * 4 + 1]; im.data[o + 2] = pb[v * 4 + 2]; im.data[o + 3] = 255; }
    g.putImageData(im, 0, 0); return c; };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
