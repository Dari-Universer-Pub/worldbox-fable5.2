// Atlas of named indexed frames. Shelf packing. Saved as assets/<name>.png (for looking), .bin (indices), .json (frames).
'use strict';
const fs = require('fs'), path = require('path'); const { Img, T } = require('./img');
const DIR = path.join(__dirname, '../../assets');
class Atlas {
  constructor(name, opt = {}) { this.name = name; this.items = []; this.meta = opt.meta || {}; this.maxW = opt.maxW || 1024; this.pad = opt.pad == null ? 0 : opt.pad; }
  // key 'a/b/c/3'; px,py = pivot inside the frame (default bottom centre)
  add(key, img, px, py, extra) { this.items.push({ key, img, px: px == null ? img.w >> 1 : px, py: py == null ? img.h - 1 : py, extra }); return this; }
  pack() {
    let x = 0, y = 0, rowH = 0, W = 0; const frames = {};
    for (const it of this.items) { if (x + it.img.w > this.maxW) { x = 0; y += rowH + this.pad; rowH = 0; } it.x = x; it.y = y; x += it.img.w + this.pad; rowH = Math.max(rowH, it.img.h); W = Math.max(W, x); }
    const H = y + rowH, img = new Img(W, H);
    for (const it of this.items) { img.blit(it.img, it.x, it.y, { opaque: true }); frames[it.key] = it.extra ? [it.x, it.y, it.img.w, it.img.h, it.px, it.py, it.extra] : [it.x, it.y, it.img.w, it.img.h, it.px, it.py]; }
    this.img = img; this.frames = frames; return this;
  }
  save() {
    if (!this.img) this.pack(); fs.mkdirSync(DIR, { recursive: true });
    this.img.savePNG(path.join(DIR, this.name + '.png'));
    fs.writeFileSync(path.join(DIR, this.name + '.bin'), Buffer.from(this.img.d));
    fs.writeFileSync(path.join(DIR, this.name + '.json'), JSON.stringify({ w: this.img.w, h: this.img.h, frames: this.frames, meta: this.meta }));
    return this;
  }
  static load(name) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8')), img = new Img(j.w, j.h); img.d.set(fs.readFileSync(path.join(DIR, name + '.bin')));
    const a = new Atlas(name); a.img = img; a.frames = j.frames; a.meta = j.meta; return a;
  }
  frame(key) { const f = this.frames[key]; return f ? this.img.crop(f[0], f[1], f[2], f[3]) : null; }
  keys(re) { return Object.keys(this.frames).filter(k => !re || re.test(k)); }
}
// group frame keys into animations: key minus its last numeric segment
function groups(keys) { const g = {}; for (const k of keys) { const m = k.match(/^(.*)\/(\d+)$/); const base = m ? m[1] : k; (g[base] = g[base] || []).push(k); } for (const b in g) g[b].sort((a, c) => +a.split('/').pop() - +c.split('/').pop()); return g; }
module.exports = { Atlas, groups, DIR };
