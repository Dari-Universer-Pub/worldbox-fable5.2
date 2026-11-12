// Pipeline A — implicit-surface (SDF) sprite baker. Own software renderer.
// Fixed settings for the whole game: orthographic camera looking down 35° below the horizontal,
// one light from the top-left of the screen (elevation ~50°), quantization by material RAMPS
// (3-4 tones per material, chosen by a fixed shading index), selective coloured outline.
'use strict';
const { Img, T } = require('./img');

const PITCH = 35 * Math.PI / 180;
const CP = Math.cos(PITCH), SP = Math.sin(PITCH);
// camera basis (world: x right, y toward the viewer, z up)
const VIEW = [0, -CP, -SP];          // ray direction (from camera into the scene)
const UP = [0, -SP, CP];             // screen up
// light: from top-left, slightly toward the camera
const LIGHT = (() => { const l = [-0.62 + 0, 0, 0].map(() => 0); l[0] = -0.60; l[1] = 0.66 * UP[1] - 0.46 * VIEW[1]; l[2] = 0.66 * UP[2] - 0.46 * VIEW[2]; const n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();

class Scene {
  constructor() { this.p = []; }
  // capsule / round cone from a to b with radii ra, rb
  cap(a, b, ra, rb, mat, o = {}) { this.p.push({ t: 0, a, b, ra, rb: rb == null ? ra : rb, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // ellipsoid at c with radii r=[rx,ry,rz], optional rotation matrix (columns = local axes)
  ell(c, r, mat, o = {}) { this.p.push({ t: 1, c, r, m: o.rot ? transpose(o.rot) : null, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // rounded box
  box(c, h, mat, o = {}) { this.p.push({ t: 2, c, h, rd: o.round || 0, m: o.rot ? transpose(o.rot) : null, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // vertical cylinder (axis z) centre c, radius r, half height hh
  cyl(c, r, hh, mat, o = {}) { this.p.push({ t: 3, c, r, hh, rd: o.round || 0, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // triangular prism (roof): base centre c, ridge along x (ax 0) or y (ax 1), half length L, half width hw, height hh
  prism(c, ax, L, hw, hh, mat, o = {}) { this.p.push({ t: 4, c, ax, L, hw, hh, il: 1 / Math.hypot(hw, hh), rd: o.round || 0, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // pyramid (hip roof): base centre c, half sizes hw (x) and hd (y), height hh
  pyr(c, hw, hd, hh, mat, o = {}) { this.p.push({ t: 5, c, hw, hd, hh, ix: 1 / Math.hypot(hw, hh), iy: 1 / Math.hypot(hd, hh), rd: o.round || 0, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  // vertical cone with a flat base: base centre c, radius r, height hh
  cone(c, r, hh, mat, o = {}) { this.p.push({ t: 6, c, r, hh, il: 1 / Math.hypot(r, hh), rd: o.round || 0, mat, k: o.k || 0, g: o.g || 0, pri: o.pri || 0 }); return this; }
  add(s) { for (const q of s.p) this.p.push(q); return this; }
  finalize() {
    for (const q of this.p) {
      if (q.t === 0) { const dx = q.b[0] - q.a[0], dy = q.b[1] - q.a[1], dz = q.b[2] - q.a[2]; q.d = [dx, dy, dz]; q.l2 = dx * dx + dy * dy + dz * dz || 1e-9; q.bc = [(q.a[0] + q.b[0]) / 2, (q.a[1] + q.b[1]) / 2, (q.a[2] + q.b[2]) / 2]; q.br = Math.sqrt(q.l2) / 2 + Math.max(q.ra, q.rb); }
      else if (q.t === 1) { q.bc = q.c; q.br = Math.max(q.r[0], q.r[1], q.r[2]); }
      else if (q.t === 3) { q.bc = q.c; q.br = Math.hypot(q.r, q.hh) + q.rd; }
      else if (q.t === 4) { q.bc = [q.c[0], q.c[1], q.c[2] + q.hh / 2]; q.br = Math.hypot(q.L, q.hw, q.hh / 2) + q.rd; }
      else if (q.t === 5) { q.bc = [q.c[0], q.c[1], q.c[2] + q.hh / 2]; q.br = Math.hypot(q.hw, q.hd, q.hh / 2) + q.rd; }
      else if (q.t === 6) { q.bc = [q.c[0], q.c[1], q.c[2] + q.hh / 2]; q.br = Math.hypot(q.r, q.hh / 2) + q.rd; }
      else { q.bc = q.c; q.br = Math.hypot(q.h[0], q.h[1], q.h[2]) + q.rd; }
    }
    return this;
  }
}
function distPrim(q, x, y, z) {
  if (q.t === 0) {
    const px = x - q.a[0], py = y - q.a[1], pz = z - q.a[2];
    let h = (px * q.d[0] + py * q.d[1] + pz * q.d[2]) / q.l2; h = h < 0 ? 0 : h > 1 ? 1 : h;
    const ex = px - q.d[0] * h, ey = py - q.d[1] * h, ez = pz - q.d[2] * h;
    return Math.sqrt(ex * ex + ey * ey + ez * ez) - (q.ra + (q.rb - q.ra) * h);
  }
  let px = x - q.c[0], py = y - q.c[1], pz = z - q.c[2];
  if (q.t === 4) { const a = Math.abs(q.ax ? py : px) - q.L, b = (Math.abs(q.ax ? px : py) * q.hh + pz * q.hw - q.hw * q.hh) * q.il; return Math.max(a, b, -pz) - q.rd; }
  if (q.t === 5) { const a = (Math.abs(px) * q.hh + pz * q.hw - q.hw * q.hh) * q.ix, b = (Math.abs(py) * q.hh + pz * q.hd - q.hd * q.hh) * q.iy; return Math.max(a, b, -pz) - q.rd; }
  if (q.t === 6) { return Math.max((Math.sqrt(px * px + py * py) * q.hh + pz * q.r - q.r * q.hh) * q.il, -pz) - q.rd; }
  if (q.t === 3) { const dr = Math.sqrt(px * px + py * py) - q.r, dz = Math.abs(pz) - q.hh, ox = Math.max(dr, 0), oz = Math.max(dz, 0); return Math.sqrt(ox * ox + oz * oz) + Math.min(Math.max(dr, dz), 0) - q.rd; }
  if (q.m) { const m = q.m, a = px * m[0] + py * m[1] + pz * m[2], b = px * m[3] + py * m[4] + pz * m[5], c = px * m[6] + py * m[7] + pz * m[8]; px = a; py = b; pz = c; }
  if (q.t === 1) {
    const r = q.r, ax = px / r[0], ay = py / r[1], az = pz / r[2], k0 = Math.sqrt(ax * ax + ay * ay + az * az);
    if (k0 < 1e-6) return -Math.min(r[0], r[1], r[2]);
    const bx = ax / r[0], by = ay / r[1], bz = az / r[2], k1 = Math.sqrt(bx * bx + by * by + bz * bz);
    return k0 * (k0 - 1) / k1;
  }
  const qx = Math.abs(px) - q.h[0], qy = Math.abs(py) - q.h[1], qz = Math.abs(pz) - q.h[2];
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, qy, qz), 0) - q.rd;
}
// scene distance; smooth union between prims of the same group g>0 with their k. Returns distance, sets hit prim.
let _hit = null;
function distScene(P, x, y, z) {
  let d = 1e9, best = null, bd = 1e9;
  for (let i = 0; i < P.length; i++) {
    const q = P[i];
    // cheap bound
    const bx = x - q.bc[0], by = y - q.bc[1], bz = z - q.bc[2];
    const bound = Math.sqrt(bx * bx + by * by + bz * bz) - q.br;
    if (bound > d + 1.5) continue;
    const di = distPrim(q, x, y, z);
    if (di - q.pri * 0.01 < bd) { bd = di - q.pri * 0.01; best = q; }
    if (q.k > 0 && d < 1e8) { const k = q.k, h = Math.max(k - Math.abs(d - di), 0) / k; d = Math.min(d, di) - h * h * k * 0.25; }
    else if (di < d) d = di;
  }
  _hit = best; if (_clip && _clip(x, y, z) > d) return _clip(x, y, z); return d;
}
let _clip = null;

// rotation helpers
function rotZ(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
function rotY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
function mul(m, n) { const o = new Array(9); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = m[r * 3] * n[c] + m[r * 3 + 1] * n[3 + c] + m[r * 3 + 2] * n[6 + c]; return o; }
function app(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function scl(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function lerp(a, b, t) { return a + (b - a) * t; }
function lerp3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
const transpose = m => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];

// project a world point (after yaw) to sprite pixel coordinates
function project(p, yaw, ox, oy) {
  const c = Math.cos(yaw), s = Math.sin(yaw), x = p[0] * c - p[1] * s, y = p[0] * s + p[1] * c, z = p[2];
  return [ox + x, oy + y * SP - z * CP, -(x * VIEW[0] + y * VIEW[1] + z * VIEW[2])];
}

/**
 * Render a scene to an indexed image.
 * opt: {w,h,ox,oy (pixel of world origin), yaw, mats:{name:{tones:[..], th:[..], outline, outlineLit, noOutline}},
 *       ss (supersampling per axis, default 3), cover (min coverage 0..1), decals:[{p:[x,y,z], dx,dy, idx, need:'front'}], scale}
 */
function render(scene, opt) {
  const P = scene.finalize().p, w = opt.w, h = opt.h, ss = opt.ss || 3, S = opt.scale || 1;
  const yaw = opt.yaw || 0, cy = Math.cos(yaw), sy = Math.sin(yaw);
  _clip = opt.clip || null;
  const img = new Img(w, h), depth = new Float32Array(w * h).fill(1e9), matAt = new Array(w * h).fill(null), protect = new Uint8Array(w * h);
  const nS = ss * ss, minCover = Math.max(1, Math.round((opt.cover == null ? 0.42 : opt.cover) * nS));
  const R = 64; // camera distance
  // model-space direction of the view ray and light (rotate by -yaw)
  const vx = VIEW[0] * cy + VIEW[1] * sy, vy = -VIEW[0] * sy + VIEW[1] * cy, vz = VIEW[2];
  const lx = LIGHT[0] * cy + LIGHT[1] * sy, ly = -LIGHT[0] * sy + LIGHT[1] * cy, lz = LIGHT[2];
  const mats = opt.mats, names = Object.keys(mats), cnt = new Float32Array(names.length), lum = new Float32Array(names.length), dep = new Float32Array(names.length), pat = new Int16Array(names.length * 5);
  const nameIdx = {}; names.forEach((n, i) => { nameIdx[n] = i; mats[n].name = n; });
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    cnt.fill(0); lum.fill(0); dep.fill(0); pat.fill(0); let hits = 0;
    for (let sj = 0; sj < ss; sj++) for (let si = 0; si < ss; si++) {
      const sx = (px + (si + 0.5) / ss - opt.ox) / S, syc = (py + (sj + 0.5) / ss - opt.oy) / S; // camera plane coords (x right, y down)
      // camera-space origin: x*right - syc*UP - R*VIEW ; then rotate into model space
      const cxw = sx - R * VIEW[0], cyw = -syc * UP[1] - R * VIEW[1], czw = -syc * UP[2] - R * VIEW[2];
      const ox = cxw * cy + cyw * sy, oy = -cxw * sy + cyw * cy, oz = czw;
      let t = R - 40, hit = false;
      for (let it = 0; it < 48; it++) {
        const d = distScene(P, ox + vx * t, oy + vy * t, oz + vz * t);
        if (d < 0.02) { hit = true; break; }
        t += d < 0.08 ? 0.08 : d; if (t > R + 40) break;
      }
      if (!hit) continue;
      const q = _hit, X = ox + vx * t, Y = oy + vy * t, Z = oz + vz * t, e = 0.12;
      const nx = distScene(P, X + e, Y, Z) - distScene(P, X - e, Y, Z), ny = distScene(P, X, Y + e, Z) - distScene(P, X, Y - e, Z), nz = distScene(P, X, Y, Z + e) - distScene(P, X, Y, Z - e);
      const nl = Math.hypot(nx, ny, nz) || 1; let ndl = (nx * lx + ny * ly + nz * lz) / nl;
      // soft self shadow: one step toward the light
      const occ = distScene(P, X + lx * 1.6, Y + ly * 1.6, Z + lz * 1.6); if (occ < 0.5) ndl -= (0.5 - occ) * 0.5;
      const mi = nameIdx[q.mat]; if (mi === undefined) throw new Error('unknown material ' + q.mat);
      cnt[mi]++; lum[mi] += ndl; dep[mi] += t; hits++;
      const mm = mats[q.mat]; if (mm.pattern) { let dl = mm.pattern(X, Y, Z, nx / nl, ny / nl, nz / nl) | 0; dl = dl < -2 ? -2 : dl > 2 ? 2 : dl; pat[mi * 5 + dl + 2]++; }
    }
    if (hits < minCover) continue;
    let bi = 0; for (let i = 1; i < names.length; i++) if (cnt[i] > cnt[bi]) bi = i;
    const m = mats[names[bi]], l = lum[bi] / cnt[bi], th = m.th || (m.tones.length === 4 ? [-0.05, 0.38, 0.8] : m.tones.length === 3 ? [0.05, 0.62] : m.tones.length === 2 ? [0.3] : []);
    let ti = 0; while (ti < th.length && l > th[ti]) ti++;
    if (m.pattern) { let bd = 2; for (let d = 0; d < 5; d++) if (pat[bi * 5 + d] > pat[bi * 5 + bd]) bd = d; ti = Math.max(0, Math.min(m.tones.length - 1, ti + bd - 2)); }
    img.d[py * w + px] = m.tones[ti]; depth[py * w + px] = dep[bi] / cnt[bi]; matAt[py * w + px] = m;
  }
  // inner contour: where a nearer part overlaps a farther one of a different material, darken the far pixel one tone
  if (opt.inner !== false) {
    const dk = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, m = matAt[i]; if (!m || m.noInner) continue;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const j = Y * w + X, n = matAt[j];
        if (n && depth[j] < depth[i] - (opt.innerDepth || 1.5) && (dx < 0 || dy < 0)) { dk.push(i); break; }
      }
    }
    for (const i of dk) { const m = matAt[i], k = m.tones.indexOf(img.d[i]); if (k > 0) img.d[i] = m.tones[k - 1]; }
  }
  // decals (explicit pixels anchored on 3D points): eyes, buttons, glints
  for (const dc of opt.decals || []) {
    const p = project(scl(dc.p, S), yaw, opt.ox, opt.oy), X = Math.round(p[0] - 0.5) + (dc.dx || 0), Y = Math.round(p[1] - 0.5) + (dc.dy || 0);
    if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const i = Y * w + X;
    if (img.d[i] === T && !dc.force) continue;
    if (dc.on && !(matAt[i] && dc.on.includes(matAt[i].name))) continue;
    img.d[i] = dc.idx; if (dc.mat) matAt[i] = mats[dc.mat]; protect[i] = 1;
  }
  if (opt.raw) return { img, matAt, protect, depth };
  despeckle(img, matAt, protect);
  if (opt.outline !== false) outline(img, matAt, opt);
  return img;
}
// remove isolated fill pixels: a pixel with no 4-neighbour of its colour takes the most frequent colour among its filled neighbours
// (same material first). Decal pixels (eyes...) are protected.
function despeckle(img, matAt, protect, passes = 2) {
  const w = img.w, h = img.h; let changed = 0;
  for (let pass = 0; pass < passes; pass++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, v = img.d[i]; if (v === T || (protect && protect[i])) continue;
    let same = 0; const nb = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const j = Y * w + X, u = img.d[j]; if (u === T) continue; if (u === v) same++; else if (!(protect && protect[j])) nb.push(j); }
    if (same || !nb.length) continue;
    let best = -1, bc = 0; for (const j of nb) { let c = 0; for (const k of nb) if (img.d[k] === img.d[j]) c++; if (matAt[j] === matAt[i]) c += 2; if (c > bc) { bc = c; best = j; } }
    if (best >= 0) { img.d[i] = img.d[best]; matAt[i] = matAt[best]; changed++; }
  }
  return changed;
}
// temporal stabilisation of an animation (array of raw renders): a pixel that keeps its material but flips by one tone
// between consecutive frames keeps the previous tone (hysteresis), after compensating the whole-body shift.
function stabilize(raws, loop = true) {
  const n = raws.length; if (n < 2) return 0; let fixed = 0;
  const M = require('./measure');
  for (let pass = 0; pass < 3; pass++) for (let f = (loop ? 0 : 1); f < n; f++) {
    const cur = raws[f], prev = raws[(f - 1 + n) % n]; if (cur === prev) continue; const sh = M.flicker(prev.img, cur.img), w = cur.img.w, h = cur.img.h;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const X = x - sh.sx, Y = y - sh.sy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const i = y * w + x, j = Y * w + X, a = cur.img.d[i], b = prev.img.d[j];
      if (a === T || b === T || a === b || cur.protect[i] || prev.protect[j]) continue; const m = cur.matAt[i]; if (!m || m !== prev.matAt[j]) continue;
      const ta = m.tones.indexOf(a), tb = m.tones.indexOf(b); if (ta < 0 || tb < 0 || Math.abs(ta - tb) > 2) continue; cur.img.d[i] = b; fixed++; }
  }
  return fixed;
}
// finish a raw render: despeckle + outline -> Img
function finish(raw, opt = {}) { despeckle(raw.img, raw.matAt, raw.protect); if (opt.outline !== false) outline(raw.img, raw.matAt, opt); return raw.img; }
// selective outline: outside the silhouette, colour = dark tone of the adjacent material's ramp;
// edges facing the light (top / left) get the softer tone, bottom/right the darkest.
function outline(img, matAt, opt = {}) {
  const w = img.w, h = img.h, add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (img.d[y * w + x] !== T) continue;
    let m = null, lit = false, n = 0;
    // neighbours: the pixel is on a lit edge only when the body is directly below it (top edge)
    const cand = [[0, 1, true], [1, 0, false], [0, -1, false], [-1, 0, false]];
    for (const [dx, dy, l] of cand) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const mm = matAt[Y * w + X]; if (mm && !mm.noOutline) { if (!m) { m = mm; lit = l; } n++; } }
    if (!m) continue;
    add.push([y * w + x, lit && n < 2 && opt.litOutline !== false ? (m.outlineLit != null ? m.outlineLit : m.outline) : m.outline]);
  }
  for (const [i, v] of add) if (v != null) img.d[i] = v;
  return img;
}
module.exports = { Scene, render, outline, despeckle, stabilize, finish, project, rotX, rotY, rotZ, mul, app, add, sub, scl, lerp, lerp3, transpose, PITCH, CP, SP, VIEW, UP, LIGHT };
