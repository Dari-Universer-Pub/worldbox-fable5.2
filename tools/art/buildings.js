// Building sources (pipeline A): an SDF construction kit with material patterns, and the designs of every building
// type in 3 development stages. One unit = one pixel. x right, y toward the viewer, z up. Front walls face +y.
// Human architecture: stage 0 hides, wattle and thatch — stage 1 timber frame, plaster, wooden shingles — stage 2 stone, red tiles, slate.
'use strict';
const { Scene, rotX, rotY, rotZ } = require('../lib/sdf'); const { mat, team, glow, glass, ix } = require('../lib/mats');
const hash = (x, y, s) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const md = (v, m) => ((v % m) + m) % m;
// ---- material patterns: (x,y,z,nx,ny,nz) -> tone shift. u = the horizontal axis lying in the surface.
const U = (x, y, nx, ny) => Math.abs(nx) > Math.abs(ny) + 0.2 ? y : x;
const PAT = {
  tiles: (sp, jw) => (x, y, z, nx, ny) => { const r = Math.floor(z / sp), f = z / sp - r; if (f < 0.3) return -1; return md(U(x, y, nx, ny) + (r & 1) * jw / 2, jw) < 0.75 ? -1 : 0; },
  thatch: (x, y, z, nx, ny) => { const r = Math.floor(z / 2.7), f = z / 2.7 - r, u = U(x, y, nx, ny); if (f < 0.24) return -1; const h = hash(Math.floor(u * 0.9), r, 5); return h < 0.14 ? 1 : h > 0.9 ? -1 : 0; },
  planksV: (x, y, z, nx, ny) => { const u = U(x, y, nx, ny); return md(u, 2.5) < 0.6 ? -1 : hash(Math.floor(u / 2.5), 0, 3) < 0.25 ? 1 : 0; },
  planksH: (x, y, z) => md(z, 2.3) < 0.55 ? -1 : 0,
  stone: (x, y, z, nx, ny) => { const r = Math.floor(z / 2.4), u = U(x, y, nx, ny) + (r & 1) * 2.2; if (md(z, 2.4) < 0.5 || md(u, 4.4) < 0.65) return -1; return hash(Math.floor(u / 4.4), r, 9) < 0.22 ? 1 : 0; },
  wattle: (x, y, z, nx, ny) => { const u = U(x, y, nx, ny); return hash(Math.floor(u / 1.6), Math.floor(z / 1.6), 4) < 0.2 ? -1 : 0; },
  hide: (x, y, z) => { const a = Math.atan2(y, x); return md(a, 1.05) < 0.11 ? -1 : 0; },
  logs: (x, y, z, nx, ny) => md(U(x, y, nx, ny), 2.2) < 0.6 ? -1 : 0,
  rock: (x, y, z) => { const h = hash(Math.floor((x + z * 0.6) / 3.2), Math.floor((z - x * 0.3) / 2.6), 8); return h < 0.2 ? -1 : h > 0.86 ? 1 : 0; },
  field: (x, y, z) => 0,
};
// ---- materials of a building set
function matsHuman() {
  const P = (m, p) => Object.assign(m, { pattern: p });
  return {
    thatch: P(mat('sand', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), PAT.thatch),
    shingle: P(mat('earth', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.88] } }), PAT.tiles(2.2, 3.4)),
    tile: P(mat('red', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.9] } }), PAT.tiles(2.4, 4.2)),
    slate: P(mat('royal', [1, 2, 3], { extra: { th: [0.0, 0.7] } }), PAT.tiles(2.2, 3.6)),
    copper: mat('teal', [2, 3, 4, 5], { extra: { th: [-0.1, 0.35, 0.82] } }),
    hide: P(mat('sand', [2, 3, 4], { ink: 'earth' }), PAT.hide), hide2: P(mat('earth', [3, 4, 5]), PAT.hide),
    wattle: P(mat('earth', [3, 4, 5]), PAT.wattle), plank: P(mat('earth', [2, 3, 4]), PAT.planksV), plankH: P(mat('earth', [2, 3, 4]), PAT.planksH), logwall: P(mat('earth', [1, 2, 3]), PAT.logs),
    plaster: mat('sand', [3, 4, 5], { ink: 'earth' }), timber: mat('earth', [1, 2, 3]), stoneW: P(mat('stone', [2, 3, 4]), PAT.stone), stoneL: P(mat('stone', [3, 4, 5]), PAT.stone), stoneD: P(mat('stone', [1, 2, 3]), PAT.stone),
    rock: P(mat('stone', [1, 2, 3, 4]), PAT.rock), dark: Object.assign(mat('stone', [0, 0, 1]), { noInner: true }), door: P(mat('earth', [1, 2, 3]), PAT.planksV),
    win: Object.assign(glass([2, 3, 4]), { th: [-2, 0.75] }), fire: Object.assign(glow([3, 4, 5]), { th: [-2, 0.2] }), ember: Object.assign(glow([1, 2, 3]), { th: [-2, 2] }),
    wood: mat('sand', [1, 2, 3], { ink: 'earth' }), log: mat('earth', [2, 3, 4]), logEnd: mat('sand', [2, 3, 4], { ink: 'earth' }), hay: mat('sand', [3, 4, 5], { ink: 'earth' }), straw: mat('sand', [3, 4, 5], { ink: 'earth' }),
    banner: team([2, 3, 4]), bannerD: team([1, 2, 3]), cloth: mat('ice', [3, 4, 5]), gold: mat('fire', [2, 3, 4]), iron: mat('stone', [3, 4, 5]), ironD: mat('stone', [1, 2, 3]),
    barrel: P(mat('earth', [2, 3, 4]), PAT.planksV), crate: mat('sand', [2, 3, 4], { ink: 'earth' }), sack: mat('sand', [3, 4, 5], { ink: 'earth' }), soil: mat('earth', [2, 3, 4]),
    fish: mat('water', [3, 4, 5]), green: mat('grass', [2, 3, 4]), redc: mat('red', [2, 3, 4]), tealc: mat('teal', [2, 3, 4]), ore: mat('fire', [1, 2, 3]), rune: Object.assign(glow([2, 3, 4]), { th: [-2, 2] }),
  };
}
const SETS = { human: matsHuman };
// ---- the kit. Designs are written in "plan units"; the kit stretches heights (ZS), flattens depths (YS) and lowers roofs (RH)
// so that walls stay readable under the 35° camera (a roof must not swallow its facade).
const ZS = 1.25, YS = 0.85, RH = 0.8;
function kit(s) {
  const sc = new Scene(), k = { sc, s, top: 0, smoke: null, light: null };
  const up = z => { if (z > k.top) k.top = z; };
  k.box = (x, y, z, w, d, h, m, o) => { sc.box([x, y * YS, (z + h / 2) * ZS], [w, d * (o && o.rot ? 1 : YS), h / 2 * ZS], m, o); up((z + h) * ZS); return k; };
  k.cyl = (x, y, z, r, h, m, o) => { sc.cyl([x, y * YS, (z + h / 2) * ZS], r, h / 2 * ZS, m, o); up((z + h) * ZS); return k; };
  k.ell = (x, y, z, r, m, o) => { sc.ell([x, y * YS, z * ZS], [r[0], r[1], r[2] * ZS], m, o); up((z + r[2]) * ZS); return k; };
  k.cap = (a, b, ra, rb, m, o) => { sc.cap([a[0], a[1] * YS, a[2] * ZS], [b[0], b[1] * YS, b[2] * ZS], ra, rb, m, o); up(Math.max(a[2], b[2]) * ZS + ra); return k; };
  k.cone = (x, y, z, r, h, m, o) => { sc.cone([x, y * YS, z * ZS], r, h * ZS, m, Object.assign({ pri: 4 }, o)); up((z + h) * ZS); return k; };
  // free prism (dormers, tent doors): ax 0 ridge along x, 1 ridge along y
  k.prism = (x, y, z, ax, L, hw, hh, m, o) => { sc.prism([x, y * YS, z * ZS], ax, ax ? L * YS : L, ax ? hw : hw * YS, hh * ZS, m, o); up((z + hh) * ZS); return k; };
  // roof with its ridge along x: the front slope is fully visible
  k.roofX = (x, y, z, w, d, hh, m, over) => { const ov = over == null ? 1.2 : over, D = d * YS, H = hh * ZS * RH; sc.prism([x, y * YS, z * ZS - H * ov / D], 0, w + ov, D + ov, H * (D + ov) / D, m, { pri: 4 }); up(z * ZS + H); return k; };
  // roof with its ridge along y: a gable faces the viewer; wm = material of the gable wall
  k.roofY = (x, y, z, w, d, hh, m, wm, over) => { const ov = over == null ? 1.4 : over, H = hh * ZS * RH; sc.prism([x, y * YS, z * ZS - H * ov / w], 1, d * YS + 0.4, w + ov, H * (w + ov) / w, m, { pri: 4 }); if (wm) sc.prism([x, y * YS + 0.5, z * ZS], 1, d * YS, w - 0.3, H * (w - 0.3) / w, wm, { pri: 5 }); up(z * ZS + H); return k; };
  k.hip = (x, y, z, w, d, hh, m, over) => { const ov = over == null ? 1.2 : over; sc.pyr([x, y * YS, z * ZS], w + ov, d * YS + ov, hh * ZS, m, { pri: 4 }); up((z + hh) * ZS); return k; };
  // sloped slab (lean-to roof, awning) falling toward the viewer
  k.slab = (x, y, z, w, len, a, m, th) => { sc.box([x, y * YS, z * ZS], [w, len * YS, th || 0.7], m, { rot: rotX(-a), pri: 4 }); up(z * ZS + Math.sin(a) * len + 1); return k; };
  k.door = (x, y, z, w, h, m) => k.box(x, y + 0.25, z, w, 0.45, h, m || 'door', { pri: 6 });
  k.arch = (x, y, z, w, h, m) => { k.box(x, y + 0.25, z, w, 0.45, h - w * 0.8, m || 'door', { pri: 6 }); sc.ell([x, y * YS + 0.25, (z + h - w * 0.8) * ZS], [w, 0.5, w], m || 'door', { pri: 6 }); return k; };
  k.win = (x, y, z, w, h, m) => { k.box(x, y + 0.25, z - (h || 1.2), w || 1, 0.45, (h || 1.2) * 2, m || 'win', { pri: 6 }); if (!k.light) k.light = [x, y * YS, z * ZS]; return k; };
  k.rwin = (x, y, z, r, m) => { sc.ell([x, y * YS + 0.25, z * ZS], [r, 0.5, r], m || 'win', { pri: 6 }); if (!k.light) k.light = [x, y * YS, z * ZS]; return k; };
  k.post = (x, y, z, h, m, r) => k.box(x, y, z, r || 0.65, (r || 0.65) / YS, h, m || 'timber', { pri: 3 });
  k.beamX = (x, y, z, w, m, r) => k.box(x, y + 0.2, z, w, 0.5, (r || 0.6) * 2, m || 'timber', { pri: 5 });
  k.frame = (y, w, h, z, xs) => { for (const x of xs || [-w, w]) k.box(x, y + 0.2, z, 0.6, 0.5, h, 'timber', { pri: 5 }); k.beamX(0, y, z + h - 1.2, w, 'timber'); return k; };
  k.chimney = (x, y, z, h, m, w) => { const W = w || 1.5; k.box(x, y, z, W, W / YS, h, m || 'stoneW', { pri: 7 }); k.box(x, y, z + h, W + 0.4, (W + 0.4) / YS, 0.9, 'stoneD', { pri: 7 }); k.smoke = [x, y * YS, (z + h + 1) * ZS]; return k; };
  k.banner = (x, y, z, h, m) => { k.box(x, y, z, 0.6, 0.7, h, 'timber', { pri: 7 }); k.box(x + 2.5, y + 0.1, z + h - 4.4, 2.1, 0.5, 3.6, m || 'banner', { pri: 8 }); k.box(x + 3.6, y + 0.15, z + h - 5.6, 1.0, 0.5, 1.4, m || 'banner', { pri: 8 }); k.ell(x, y, z + h + 0.5, [1, 1, 0.8], 'gold', { pri: 8 }); return k; };
  k.flag = (x, y, z, h) => { k.box(x, y, z, 0.6, 0.7, h, 'timber', { pri: 7 }); k.box(x + 2.3, y + 0.1, z + h - 3, 1.9, 0.5, 2.6, 'banner', { pri: 8 }); return k; };
  k.barrel = (x, y, z) => { k.cyl(x, y, z || 0, 1.5, 2.8, 'barrel', { round: 0.3 }); k.cyl(x, y, (z || 0) + 2.7, 1.2, 0.4, 'timber'); return k; };
  k.crate = (x, y, z, w) => k.box(x, y, z || 0, w || 1.6, (w || 1.6) / YS, (w || 1.6) * 1.6, 'crate', { round: 0.15 });
  k.sack = (x, y, z) => k.ell(x, y, (z || 0) + 1.1, [1.5, 1.3, 1.2], 'sack');
  k.hay = (x, y, r, h) => k.cone(x, y, 0, r, h, 'hay', { round: 0.8, pri: 2 });
  k.logs = (x, y, len, n) => { let c = 0; for (let row = 0; row < 3 && c < n; row++) for (let i = 0; i < 3 - row && c < n; i++, c++) { const yy = (y - 1.6 + i * 2.2 + row * 1.1) * YS, zz = 1.1 + row * 1.9; sc.cap([x - len, yy, zz], [x + len, yy, zz], 1.1, 1.1, 'log'); sc.ell([x + len + 0.9, yy, zz], [0.45, 0.95, 0.95], 'logEnd', { pri: 3 }); } up(6); return k; };
  k.stake = (x, y, h, r) => { sc.cap([x, y * YS, 0], [x, y * YS, h * ZS], r || 1.0, 0.25, 'log', { pri: 2 }); up(h * ZS); return k; };
  k.palisade = (x0, x1, y, h) => { for (let x = x0; x <= x1 + 0.01; x += 2.2) k.stake(x, y, h + (hash(Math.round(x * 3), 1, 6) - 0.5) * 1.4, 1.15); return k; };
  k.crenel = (x0, x1, y, z, d) => { for (let x = x0; x <= x1 + 0.01; x += 3.4) k.box(x, y, z, 0.9, d || 0.9, 1.7, 'stoneL', { pri: 5 }); return k; };
  k.fire = (x, y, z, r) => { k.ell(x, y, z + r * 0.8, [r, r, r * 1.1], 'fire', { pri: 7 }); k.ell(x, y, z + r * 0.35, [r * 1.25, r * 1.1, r * 0.5], 'ember', { pri: 6 }); k.light = [x, y * YS, (z + r) * ZS]; return k; };
  k.sign = (x, y, z) => { k.beamX(x, y + 1.5, z, 1.8, 'timber', 0.4); k.box(x + 0.6, y + 1.7, z - 2.6, 1.4, 0.4, 2.2, 'gold', { pri: 7 }); return k; };
  return k;
}
// ---- designs. Each returns its kit. fp = footprint in tiles, great = 64x64 cell.
const D = {};
D.house = { fp: [3, 2], make(k) { const s = k.s;
  if (s === 0) { k.cyl(0, 0, 0, 7.6, 5, 'wattle').cone(0, 0, 4.2, 10.4, 11.5, 'thatch', { round: 0.4 }).door(0, 7.2, 0, 1.7, 4.4, 'dark').box(0, 7.5, 4.3, 2.4, 0.5, 0.9, 'timber', { pri: 6 }).cap([0, 0, 15], [0.6, 0, 17.6], 0.5, 0.3, 'timber').sack(8.6, 5).stake(-9.6, 5.5, 4, 0.8); }
  else if (s === 1) { k.box(0, 0, 0, 10, 6, 7.2, 'plaster').box(0, 0, 0, 10.2, 6.2, 1.5, 'stoneD').frame(6, 10, 7.2, 0, [-10, -3.2, 3.2, 10]).roofX(0, 0, 7.2, 10, 6, 8.2, 'thatch').door(0, 6, 0.3, 1.7, 5).win(-6.4, 6, 4.3, 1.3, 1.3).win(6.4, 6, 4.3, 1.3, 1.3).chimney(5.5, -1.5, 9, 7.2); }
  else { k.box(0, 0, 0, 10, 6, 12.5, 'plaster').box(0, 0, 0, 10.2, 6.2, 5.6, 'stoneW').frame(6, 10, 7, 5.6, [-10, -3.4, 3.4, 10]).beamX(0, 6, 5.4, 10).roofX(0, 0, 12.5, 10, 6, 8.2, 'tile').arch(-4.6, 6, 0.2, 1.7, 5.2).win(4.6, 6, 3, 1.5, 1.2).win(-6.6, 6, 9.2, 1.2, 1.3).win(0, 6, 9.2, 1.2, 1.3).win(6.6, 6, 9.2, 1.2, 1.3).chimney(-6, -1.5, 14, 8); }
  return k; } };
D.hall = { fp: [4, 3], great: true, make(k) { const s = k.s;
  if (s === 0) { k.cone(0, 0, 0, 13.5, 20, 'hide', { round: 0.3 }); for (const a of [-0.5, 0.1, 0.6]) k.cap([a * 2, 0, 18.6], [a * 5.5, -1, 23.2], 0.5, 0.35, 'timber', { pri: 5 });
    k.prism(0, 12.2, 0, 1, 1.6, 3.4, 9.5, 'dark', { pri: 6 }); k.box(-4.4, 12.6, 0, 0.5, 0.5, 9, 'timber', { pri: 6 }).box(4.4, 12.6, 0, 0.5, 0.5, 9, 'timber', { pri: 6 });
    k.cone(0, 0, 11, 6.9, 9.6, 'hide2', { pri: 5, round: 0.2 }).banner(14.5, 6, 0, 19).fire(-13.5, 12, 0, 1.7).ell(-13.5, 12, 0.5, [3, 2.4, 0.9], 'stoneD').logs(12, 13.4, 2.4, 3); }
  else if (s === 1) { k.box(0, 0, 0, 15, 8, 8, 'plank').box(0, 0, 0, 15.2, 8.2, 1.6, 'stoneD').roofX(0, 0, 8, 15, 8, 13, 'thatch').box(0, 9.5, 0, 5, 2.2, 8, 'plank').roofY(0, 9, 8, 5.6, 3, 6.4, 'thatch', 'plank').door(0, 11.7, 0.2, 2.3, 6.2).box(0, 12, 6.6, 3, 0.5, 0.9, 'timber', { pri: 7 })
      .win(-10, 8, 4.6, 1.4, 1.4).win(10, 8, 4.6, 1.4, 1.4).rwin(0, 12.2, 10.8, 1.2).post(-5.4, 12, 0, 8).post(5.4, 12, 0, 8).banner(-13.5, 2, 12, 15).banner(11, 2, 12, 15).chimney(8.5, -3, 14, 9.5).barrel(13, 10.5).crate(-13, 10.8); }
  else { k.box(2, 0, 0, 13, 8, 14, 'stoneW').box(2, 0, 0, 13.2, 8.2, 2, 'stoneD').roofX(2, 0, 14, 13, 8, 10, 'tile').box(-11, 3, 0, 5, 5.4, 19, 'stoneL').hip(-11, 3, 20.4, 5, 5.4, 7, 'slate', 1.6).crenel(-15.2, -6.8, 8.2, 19, 0.8).flag(-11, 3, 27, 5.5)
      .arch(2, 8, 0.2, 2.6, 7.6).box(2, 8.6, 8.3, 3.6, 0.5, 0.8, 'gold', { pri: 7 }).win(-5, 8, 5, 1.2, 1.7).win(9, 8, 5, 1.2, 1.7).win(-5, 8, 10.6, 1.2, 1.4).win(2, 8, 11, 1.2, 1.2).win(9, 8, 10.6, 1.2, 1.4).win(-11, 8.4, 14, 1.1, 1.6).win(-11, 8.4, 7, 1.1, 1.4)
      .chimney(10, -3, 17, 9.5).banner(13, 4, 14, 14).box(2, 10.6, 0, 4.6, 1.8, 1.1, 'stoneL').barrel(-3.2, 10.8).crate(13.6, 10.6); }
  return k; } };
D.farm = { fp: [3, 2], make(k) { const s = k.s;
  if (s === 0) { for (const x of [-9, -1]) { k.post(x, 5.5, 0, 6.5).post(x, -3.5, 0, 10); } k.slab(-5, 1, 8.6, 6.4, 6.6, 0.42, 'thatch', 0.9).hay(-5, 1.5, 3.4, 4.6).hay(5.5, 2, 4.6, 6.8).sack(1.6, 6.4).box(9.6, 6, 0, 0.5, 0.5, 4, 'timber').box(4.5, 6.2, 2.4, 5.4, 0.4, 0.8, 'timber').box(4.5, 6.2, 0.6, 5.4, 0.4, 0.7, 'timber').box(-0.6, 6, 0, 0.5, 0.5, 4, 'timber'); }
  else if (s === 1) { k.box(-3, 0, 0, 7.6, 6, 8, 'plank').box(-3, 0, 0, 7.8, 6.2, 1.4, 'stoneD').roofY(-3, 0, 8, 7.6, 6, 8.4, 'thatch', 'plank').door(-3, 6.3, 0.2, 2.8, 6.2, 'dark').box(-5.3, 6.6, 0.2, 1.1, 0.4, 6.2, 'door', { pri: 7 }).box(-3, 6.7, 6.5, 3.4, 0.5, 0.8, 'timber', { pri: 7 }).rwin(-3, 6.6, 11.4, 1.1, 'dark')
      .hay(7.6, 1.5, 3.6, 6.4).hay(8.6, 5.8, 2.2, 3.4).sack(3.6, 6.6).box(10.6, 7.6, 0, 0.5, 0.5, 3.6, 'timber'); }
  else { k.box(-3.4, 0, 0, 7.4, 6, 9.5, 'plank').box(-3.4, 0, 0, 7.6, 6.2, 3.4, 'stoneW').roofY(-3.4, 0, 9.5, 7.4, 6, 8.6, 'tile', 'plank').door(-3.4, 6.3, 0.2, 2.9, 7, 'door').box(-3.4, 6.6, 0.2, 0.35, 0.4, 7, 'timber', { pri: 7 }).box(-3.4, 6.7, 7.3, 3.5, 0.5, 0.8, 'timber', { pri: 7 }).rwin(-3.4, 6.6, 12.6, 1.2, 'dark')
      .cyl(7.4, 0.5, 0, 3.4, 14, 'stoneL').cone(7.4, 0.5, 13.6, 4.4, 5.6, 'tile').win(7.4, 3.9, 9, 0.8, 1.2, 'dark').hay(8.2, 6.4, 2.3, 3.4).sack(3.2, 7); }
  return k; } };
D.warehouse = { fp: [3, 3], make(k) { const s = k.s;
  if (s === 0) { for (const x of [-9.5, 9.5]) { k.post(x, 7, 0, 7.5).post(x, -5, 0, 9.5); } k.roofX(0, 1, 7.6, 10.4, 6.6, 4.6, 'thatch').crate(-5, 3, 0, 2).crate(-5.4, 2.6, 4, 1.5).barrel(-0.6, 5).barrel(2.8, 3.4).sack(6.4, 5.6).sack(4.8, 7.4).sack(6.6, 3).crate(-8, 7.4, 0, 1.3); }
  else if (s === 1) { k.box(0, 0, 0, 10, 8, 8.4, 'plankH').box(0, 0, 0, 10.2, 8.2, 1.5, 'stoneD').frame(8, 10, 8.4, 0, [-10, 10]).roofX(0, 0, 8.4, 10, 8, 8.4, 'shingle').door(-1.6, 8, 0.2, 3.6, 6.4).box(-1.6, 8.6, 0.2, 0.35, 0.4, 6.4, 'timber', { pri: 7 }).box(-1.6, 8.6, 6.7, 4.3, 0.5, 0.8, 'timber', { pri: 7 }).win(6.6, 8, 5, 1.2, 1.1, 'dark')
      .barrel(6.2, 10.6).barrel(9, 9.6).crate(-8.4, 10.6, 0, 1.7).sack(-5.4, 11.2); }
  else { k.box(0, 0, 0, 10, 8, 10, 'stoneW').box(0, 0, 0, 10.2, 8.2, 1.8, 'stoneD').roofY(0, 0, 10, 10, 8, 9.6, 'tile', 'plaster').arch(0, 8.4, 0.2, 3.2, 7.4).box(0, 8.8, 0.2, 0.35, 0.4, 6, 'timber', { pri: 7 }).rwin(0, 8.7, 13.4, 1.3, 'dark').beamX(0, 9.4, 16.6, 0.5, 'timber', 0.5).box(0, 10.4, 15, 0.3, 0.3, 1.6, 'timber', { pri: 7 })
      .win(-6.6, 8, 5.4, 1.1, 1.3, 'dark').win(6.6, 8, 5.4, 1.1, 1.3, 'dark').barrel(7, 10.8).crate(-7.6, 10.8, 0, 1.8).crate(-7.2, 10.6, 3.6, 1.3).sack(4, 11.4); }
  return k; } };
D.sawmill = { fp: [3, 2], make(k) { const s = k.s;
  if (s === 0) { k.logs(-5.5, 1.5, 4.4, 6).box(3.4, 3, 0, 0.5, 2, 3.4, 'timber').box(8.6, 3, 0, 0.5, 2, 3.4, 'timber').cap([1.5, 3, 4.3], [10.5, 3, 4.3], 1.2, 1.2, 'log').ell(10.6, 3, 4.3, [0.5, 1.1, 1.1], 'logEnd', { pri: 3 }).cyl(6, 7.6, 0, 1.7, 1.8, 'log').cyl(6, 7.6, 1.8, 1.5, 0.2, 'logEnd').box(7, 7.4, 2, 0.4, 0.4, 3.6, 'timber', { rot: rotY(0.5) }).box(8.4, 7.4, 4.8, 1.2, 0.4, 0.9, 'iron', { pri: 4 }); }
  else if (s === 1) { for (const x of [-1.5, 10]) { k.post(x, 5.5, 0, 8).post(x, -4.5, 0, 8); } k.roofX(4.2, 0.5, 8, 6.6, 5.6, 6, 'shingle').box(4.2, 3, 0, 4.4, 1.6, 3, 'wood').cap([0.4, 3, 4], [8.2, 3, 4], 1.1, 1.1, 'log').ell(4.6, 3.4, 4.6, [2.4, 0.4, 2.4], 'iron', { pri: 5 }).logs(-7.2, 2.5, 3.2, 6).box(-7.4, 7.4, 0, 2.6, 1.3, 1.2, 'wood').box(-7.4, 7.4, 1.2, 2.6, 1.3, 1.0, 'crate'); }
  else { k.box(4, -1, 0, 7, 5, 8.6, 'plank').box(4, -1, 0, 7.2, 5.2, 1.6, 'stoneD').roofX(4, -0.5, 8.6, 7, 5.8, 6.6, 'tile').door(4, 4.2, 0.2, 3.4, 6.2, 'dark').box(4, 4.5, 0, 3, 1.2, 2.6, 'wood', { pri: 7 }).ell(4, 5, 4.4, [2.5, 0.4, 2.5], 'iron', { pri: 8 }).cap([1.4, 5.4, 3.4], [6.6, 5.4, 3.4], 1, 1, 'log', { pri: 7 })
      .logs(-7.4, 1, 3, 6).box(-7.4, 7, 0, 2.8, 1.5, 1.1, 'wood').box(-7.4, 7, 1.1, 2.8, 1.5, 1.0, 'crate').box(-7.4, 7, 2.1, 2.8, 1.5, 1.0, 'wood').chimney(9, -3, 10, 7.4); }
  return k; } };
D.mine = { fp: [3, 2], make(k) { const s = k.s;
  k.ell(-1, -1.5, 0, [11, 6.8, s === 0 ? 10.5 : 12], 'rock').ell(-7.5, 1, 0, [4.6, 4.6, 6.4], 'rock', { k: 1.5, g: 1 }).ell(6.6, 0.6, 0, [5, 4.6, 7.4], 'rock', { k: 1.5, g: 1 });
  k.box(0, 5.4, 0, 3.4, 2.2, 7, 'rock', { round: 0.8 }).door(0, 7.5, 0, 2.5, 5.6, 'dark').box(-3, 7.9, 0, 0.7, 0.5, 6.6, 'timber', { pri: 7 }).box(3, 7.9, 0, 0.7, 0.5, 6.6, 'timber', { pri: 7 }).box(0, 8, 6, 3.9, 0.5, 1.3, 'timber', { pri: 7 });
  k.ell(8.4, 8.6, 0.7, [1.8, 1.4, 1.2], 'rock').ell(9.6, 9.6, 0.5, [1, 0.9, 0.8], 'ore');
  if (s >= 1) { k.box(-7.2, 8.4, 1.2, 2.3, 1.4, 2.2, 'wood', { pri: 7 }).ell(-8.6, 9.6, 0.9, [0.9, 0.4, 0.9], 'ironD', { pri: 8 }).ell(-5.8, 9.6, 0.9, [0.9, 0.4, 0.9], 'ironD', { pri: 8 }).ell(-7.2, 7.8, 3.6, [1.9, 1.1, 0.9], 'ore', { pri: 8 }).box(4.6, 8.2, 3.4, 0.4, 0.4, 2.4, 'timber', { pri: 8 }).ell(4.6, 8.5, 6.2, [0.9, 0.5, 0.8], 'fire', { pri: 8 }); k.light = [4.6, 8.5 * YS, 6.2 * ZS]; }
  if (s === 2) { k.post(-3.6, 1, 6, 13).post(3.6, 1, 6, 13).box(0, 1, 16, 4.6, 2.6, 1, 'plank', { pri: 5 }).roofX(0, 1, 18.5, 4.6, 2.6, 4, 'tile').ell(0, 1.6, 14.4, [2.6, 0.9, 0.9], 'log', { pri: 6 }).box(0, 1.8, 8, 0.25, 0.25, 6, 'ironD', { pri: 6 }); }
  return k; } };
D.market = { fp: [4, 3], make(k) { const s = k.s;
  const stall = (x, y, w, m1, m2, h) => { k.post(x - w, y + 3, 0, h).post(x + w, y + 3, 0, h).post(x - w, y - 3, 0, h + 2.4).post(x + w, y - 3, 0, h + 2.4);
    const n = Math.round(w / 1.3); for (let i = 0; i < n; i++) k.slab(x - w + (i + 0.5) * (2 * w / n), y, h + 1.6, w / n + 0.05, 4.2, 0.5, i & 1 ? m2 : m1, 0.6); k.box(x, y + 2.4, 0, w - 0.4, 1.2, 2.8, 'wood'); };
  if (s === 0) { stall(-7.5, 0, 5.2, 'hide', 'hide2', 6.4); k.box(-9.4, 2.6, 2.8, 1.2, 0.9, 1.2, 'redc', { pri: 5 }).ell(-6, 2.6, 3.4, [1, 0.8, 0.8], 'green', { pri: 5 }).box(6.5, 3, 0, 5.4, 3.6, 0.6, 'banner').sack(4, 2.4).sack(8.4, 4.4).crate(8.2, 0.6, 0.5, 1.4).barrel(3.6, 6).ell(6.4, 5.6, 1.2, [1.2, 1, 0.8], 'hay').post(13.4, -2, 0, 9).flag(13.4, -2, 0, 12); }
  else if (s === 1) { stall(-9, -1, 5, 'banner', 'cloth', 7); stall(4, -3.5, 5, 'cloth', 'redc', 7.6); stall(9.5, 5, 4.4, 'banner', 'cloth', 6.4);
    k.ell(-11, 1.4, 3.4, [1, 0.8, 0.9], 'redc', { pri: 5 }).ell(-8.6, 1.4, 3.4, [1, 0.8, 0.9], 'green', { pri: 5 }).ell(-6.4, 1.4, 3.4, [1, 0.8, 0.8], 'hay', { pri: 5 }).box(4, -1, 2.8, 2.6, 0.8, 1, 'fish', { pri: 5 }).barrel(-3, 7.6).crate(-7, 8.4, 0, 1.6).sack(-10.4, 8.6).sack(1.6, 9); }
  else { k.box(0, -2, 0, 14, 6, 9, 'dark').box(0, -4, 0, 14, 4, 9, 'stoneW'); for (const x of [-14, -7, 0, 7, 14]) k.box(x, 3.4, 0, 1, 1, 9, 'stoneL', { pri: 3 }); k.box(0, 3.4, 7.4, 14.6, 1, 1.8, 'stoneL', { pri: 3 }).roofX(0, -1.4, 9.2, 14.2, 6, 8.4, 'tile');
    for (let i = 0; i < 4; i++) { const x = -10.5 + i * 7; k.slab(x, 6.6, 5.6, 2.9, 2.4, 0.6, i & 1 ? 'cloth' : 'banner', 0.5); k.box(x, 6, 0, 2.6, 1, 2.4, 'wood', { pri: 4 }); k.ell(x - 1, 6.4, 3, [0.9, 0.7, 0.8], i & 1 ? 'redc' : 'green', { pri: 6 }).ell(x + 1.1, 6.4, 3, [0.9, 0.7, 0.8], i & 1 ? 'hay' : 'fish', { pri: 6 }); }
    k.banner(0, -1.4, 17, 8).barrel(13.4, 9.6).crate(-13.4, 9.4, 0, 1.6); }
  return k; } };
D.temple = { fp: [4, 3], great: true, make(k) { const s = k.s;
  if (s === 0) { const st = [[-11, 2, 9], [-6.5, -4.5, 12], [0, -6.5, 13.5], [6.5, -4.5, 11], [11, 2, 9.5]]; for (const [x, y, h] of st) k.box(x, y, 0, 1.9, 1.5, h, 'stoneW', { round: 0.7, rot: rotY((hash(x, 2, 2) - 0.5) * 0.16) });
    k.box(-3.2, -6.3, 12.6, 5.6, 1.6, 1.3, 'stoneL', { round: 0.4, pri: 5 }).box(0, 4, 0, 3.2, 2.2, 2.6, 'stoneL', { round: 0.3 }).fire(0, 4, 2.6, 1.6).ell(-7.5, 8, 0.7, [1.6, 1.2, 0.9], 'stoneD').ell(8, 8.4, 0.6, [1.3, 1, 0.8], 'stoneD'); k.ell(0, -6.3, 9, [0.8, 0.9, 1.6], 'rune', { pri: 6 }); }
  else if (s === 1) { k.box(0, 0, 0, 8.4, 8, 10, 'plank').box(0, 0, 0, 8.6, 8.2, 1.8, 'stoneD').roofY(0, 0, 10, 8.4, 8, 11, 'shingle', 'plaster').arch(0, 8.4, 0.2, 2.2, 6.6).rwin(0, 8.7, 12.4, 1.7).win(-5.6, 8, 5.6, 0.9, 1.8).win(5.6, 8, 5.6, 0.9, 1.8)
      .box(0, -2, 17, 2.6, 2.6, 5, 'plank', { pri: 5 }).hip(0, -2, 22, 2.6, 2.6, 7.5, 'shingle', 1.3).ell(0, -2, 30, [1.1, 1.1, 0.9], 'gold', { pri: 8 }).win(0, 0.7, 19.6, 0.8, 1.1, 'dark').box(0, 10.6, 0, 3.6, 1.6, 1, 'stoneL').stake(-12.6, 6, 6, 0.8).ell(-12.6, 6, 6.6, [1, 1, 1], 'fire', { pri: 7 }).stake(12.6, 6, 6, 0.8).ell(12.6, 6, 6.6, [1, 1, 1], 'fire', { pri: 7 }); }
  else { k.box(0, 0, 0, 8.5, 8, 14, 'stoneL').box(0, 0, 0, 8.7, 8.2, 2, 'stoneW').roofY(0, 0, 14, 8.5, 8, 9.5, 'slate', 'stoneL').box(-11.5, 1, 0, 3.2, 6.6, 8.5, 'stoneW').box(11.5, 1, 0, 3.2, 6.6, 8.5, 'stoneW');
    k.prism(-11.5, 1, 8.5, 1, 7, 3.6, 3.6, 'slate', { pri: 4 }); k.prism(11.5, 1, 8.5, 1, 7, 3.6, 3.6, 'slate', { pri: 4 });
    k.arch(0, 8.4, 0.2, 2.4, 8).rwin(0, 8.7, 13.6, 2.1).box(0, 8.9, 13.6, 0.3, 0.4, 2, 'stoneD', { pri: 7 }).box(0, 8.9, 13.6, 2, 0.4, 0.3, 'stoneD', { pri: 7 }).win(-11.5, 7.6, 4.6, 0.9, 2).win(11.5, 7.6, 4.6, 0.9, 2).win(-5.2, 8, 6, 0.8, 2.2).win(5.2, 8, 6, 0.8, 2.2)
      .box(0, -4, 16, 3.2, 3.2, 7, 'stoneL', { pri: 5 }).win(0, -0.7, 20, 0.9, 1.4, 'dark').hip(0, -4, 23, 3.2, 3.2, 6, 'slate', 1.4).ell(0, -4, 29.6, [1.2, 1.2, 1], 'gold', { pri: 8 }).box(0, 11, 0, 4.6, 1.8, 1.2, 'stoneL').box(0, 12.4, 0, 5.6, 1, 0.6, 'stoneL'); }
  return k; } };
D.barracks = { fp: [4, 3], make(k) { const s = k.s;
  if (s === 0) { k.palisade(-14.5, -5, 7.5, 9).palisade(5, 14.5, 7.5, 9).cone(-1, -2, 0, 8.4, 12.5, 'hide', { round: 0.3 }); k.prism(-1, 5.8, 0, 1, 1.4, 2.4, 6.5, 'dark', { pri: 6 });
    k.banner(9.5, -2, 0, 17).box(-10.5, 2, 0, 0.5, 0.5, 5.6, 'timber').box(-6.5, 2, 0, 0.5, 0.5, 5.6, 'timber').box(-8.5, 2, 4.6, 2.6, 0.4, 0.8, 'timber').cap([-9.6, 2.6, 0.4], [-9.2, 2.6, 7], 0.4, 0.3, 'iron', { pri: 5 }).cap([-7.6, 2.6, 0.4], [-7.9, 2.6, 7], 0.4, 0.3, 'iron', { pri: 5 }).fire(3.5, 9.6, 0, 1.4); }
  else if (s === 1) { k.box(0, -1, 0, 12, 7, 8.5, 'logwall').roofX(0, -1, 8.5, 12, 7, 7, 'shingle').door(0, 6, 0.2, 2.6, 6.2).box(0, 6.6, 6.4, 3.3, 0.5, 0.9, 'timber', { pri: 7 }).ell(-6.2, 6.3, 5, [1.7, 0.5, 1.7], 'banner', { pri: 6 }).ell(-6.2, 6.6, 5, [0.6, 0.4, 0.6], 'iron', { pri: 7 }).ell(6.2, 6.3, 5, [1.7, 0.5, 1.7], 'banner', { pri: 6 }).ell(6.2, 6.6, 5, [0.6, 0.4, 0.6], 'iron', { pri: 7 })
      .palisade(-15, -11, 9.6, 8.5).palisade(11, 15, 9.6, 8.5).banner(-12.6, 2, 0, 19).banner(11.4, 2, 0, 19).box(8.4, 10, 0, 0.5, 0.5, 5, 'timber').box(5, 10, 0, 0.5, 0.5, 5, 'timber').box(6.7, 10, 4, 2.2, 0.4, 0.8, 'timber').cap([6, 10.6, 0.4], [6.3, 10.6, 6.6], 0.4, 0.3, 'iron', { pri: 5 }).cap([7.6, 10.6, 0.4], [7.3, 10.6, 6.6], 0.4, 0.3, 'iron', { pri: 5 }); }
  else { k.box(0, 0, 0, 11, 7.6, 14, 'stoneW').box(0, 0, 0, 11.2, 7.8, 2.2, 'stoneD').box(0, 0, 14, 11.6, 8.2, 1.2, 'stoneL', { pri: 3 }).crenel(-10.2, 10.3, 7.4, 15.2).box(0, 0, 14.6, 9.6, 6.2, 1, 'stoneD', { pri: 2 })
      .cyl(-12, 5, 0, 3.6, 19, 'stoneL').cyl(12, 5, 0, 3.6, 19, 'stoneL').cyl(-12, 5, 19, 4.2, 1.2, 'stoneW', { pri: 3 }).cyl(12, 5, 19, 4.2, 1.2, 'stoneW', { pri: 3 }).cone(-12, 5, 20.2, 4.6, 6.6, 'tile').cone(12, 5, 20.2, 4.6, 6.6, 'tile')
      .arch(0, 7.6, 0.2, 2.8, 8.2, 'dark'); for (const x of [-1.6, 0, 1.6]) k.box(x, 8.1, 0.2, 0.3, 0.3, 7.2, 'ironD', { pri: 7 }); k.box(0, 8.1, 4.6, 2.6, 0.3, 0.6, 'ironD', { pri: 7 }).win(-6, 7.6, 9, 0.6, 1.6, 'dark').win(6, 7.6, 9, 0.6, 1.6, 'dark').win(-12, 8.5, 12.6, 0.6, 1.5, 'dark').win(12, 8.5, 12.6, 0.6, 1.5, 'dark')
      .ell(-5.6, 8, 4.4, [1.6, 0.5, 1.8], 'banner', { pri: 6 }).ell(5.6, 8, 4.4, [1.6, 0.5, 1.8], 'banner', { pri: 6 }).flag(-12, 5, 26, 7).flag(12, 5, 26, 7); }
  return k; } };
D.forge = { fp: [3, 2], make(k) { const s = k.s;
  const anvil = (x, y) => { k.cyl(x, y, 0, 1.3, 2, 'log').box(x, y, 2, 1.9, 0.9, 1.5, 'ironD', { round: 0.2 }).box(x + 1.4, y, 2.7, 1.5, 0.6, 0.7, 'ironD'); };
  if (s === 0) { k.box(-4.5, 0, 0, 4.4, 4, 6, 'stoneW', { round: 0.6 }).box(-4.5, 0, 6, 2.6, 2.6, 5, 'stoneD', { round: 0.4 }).door(-4.5, 4, 0.8, 2, 3.2, 'fire').box(-4.5, 4.4, 4.2, 2.6, 0.4, 0.7, 'stoneD', { pri: 7 }); k.light = [-4.5, 4.4 * YS, 2.4 * ZS]; k.smoke = [-4.5, 0, 12 * ZS]; anvil(4.4, 4.6);
    for (const x of [1, 9.6]) k.post(x, -3.6, 0, 9.5); k.slab(5.3, -0.4, 8.2, 5.6, 4.6, 0.36, 'hide', 0.6).box(8.6, 7.4, 0, 1.6, 1.1, 1.5, 'wood').ell(8.6, 7.4, 1.6, [1.3, 0.9, 0.5], 'ore'); }
  else if (s === 1) { k.box(-4, -1, 0, 6.4, 5.6, 8, 'stoneW').box(4, -4, 0, 6.6, 2.6, 8, 'plank').post(9.8, 4.4, 0, 8).post(2.4, 4.4, 0, 8).roofX(0, -0.6, 8, 10.4, 5.6, 6.6, 'shingle').door(-4, 4.6, 0.6, 2.3, 4.2, 'fire').box(-4, 5, 4.8, 3, 0.4, 0.9, 'stoneD', { pri: 7 }).box(6, 0, 0, 3.6, 2.4, 7, 'dark', { pri: 1 }); k.light = [-4, 5 * YS, 2.6 * ZS];
    k.chimney(-5.5, -2.5, 9, 9.5, 'stoneW', 1.9); anvil(6, 4.2); k.barrel(11, 7).box(1.4, 7.6, 0, 1.4, 0.9, 1.3, 'wood'); }
  else { k.box(0, -1, 0, 10, 5.6, 9.5, 'stoneW').box(0, -1, 0, 10.2, 5.8, 2, 'stoneD').roofX(0, -1, 9.5, 10, 5.6, 7, 'tile').arch(-4.4, 4.6, 0.4, 2.6, 6, 'fire').box(-4.4, 5, 0.3, 2.9, 0.4, 1.5, 'stoneD', { pri: 7 }).door(4.6, 4.6, 0.2, 2.2, 6.2, 'dark').box(4.6, 5.2, 6.4, 2.8, 0.5, 0.8, 'timber', { pri: 7 }); k.light = [-4.4, 5 * YS, 3 * ZS];
    k.chimney(-5.6, -3, 11, 10, 'stoneL', 2).chimney(7, -3.4, 12, 6.4, 'stoneL', 1.4); k.smoke = [-5.6, -3 * YS, 22 * ZS]; anvil(0.4, 7.4); k.box(8.6, 8, 0, 2.2, 1.2, 1.6, 'stoneL', { round: 0.2 }).box(8.6, 8, 1.4, 1.7, 0.8, 0.3, 'fish', { pri: 4 }).box(4.6, 5.4, 9.4, 1.6, 0.4, 1.3, 'gold', { pri: 7 }); }
  return k; } };
D.watchtower = { fp: [2, 2], make(k) { const s = k.s;
  if (s === 0) { for (const [x, y] of [[-5, 4], [5, 4], [-5, -4], [5, -4]]) k.cap([x, y, 0], [x * 0.8, y * 0.8, 17], 0.7, 0.6, 'log'); k.box(0, 0, 16.4, 5.4, 4.4, 1, 'plankH', { pri: 3 }).box(0, 4.2, 17.4, 5.4, 0.4, 2.6, 'plank', { pri: 5 }).box(0, 3.4, 8, 5, 0.4, 0.7, 'timber', { pri: 3 });
    k.post(-4.6, 3.8, 17.4, 6.5, 'timber', 0.5).post(4.6, 3.8, 17.4, 6.5, 'timber', 0.5).roofX(0, 0, 23.6, 5.2, 4.2, 4.4, 'thatch').cap([1, 5, 0], [1, 4.4, 16], 0.4, 0.4, 'wood', { pri: 6 }).cap([3.6, 5, 0], [3.6, 4.4, 16], 0.4, 0.4, 'wood', { pri: 6 }); for (let z = 2.4; z < 16; z += 2.7) k.box(2.3, 5, z, 1.3, 0.3, 0.5, 'wood', { pri: 6 }); }
  else if (s === 1) { k.box(0, 0, 0, 4.4, 4, 17, 'plank').box(0, 0, 0, 4.6, 4.2, 2, 'stoneD').box(0, 0, 17, 6, 5.2, 4, 'plankH', { pri: 3 }).win(0, 5.2, 19.4, 1.6, 1, 'dark').hip(0, 0, 21, 6, 5.2, 7.4, 'shingle').door(0, 4, 0.2, 1.6, 4.6).win(0, 4, 10, 0.7, 1.4, 'dark').flag(0, 0, 28, 6); for (const x of [-5.2, 5.2]) k.cap([x * 0.75, 4.4, 12], [x, 5.2, 17], 0.45, 0.45, 'timber', { pri: 5 }); }
  else { k.cyl(0, 0, 0, 5, 22, 'stoneW').cyl(0, 0, 0, 5.3, 2.4, 'stoneD').cyl(0, 0, 22, 6, 1.6, 'stoneL', { pri: 3 }); for (let a = 0; a < 6.28; a += 0.785) k.box(Math.sin(a) * 5.4, Math.cos(a) * 5.4, 23.6, 1, 1, 1.8, 'stoneL', { pri: 5 });
    k.cyl(0, 0, 23.4, 4.6, 0.6, 'stoneD', { pri: 2 }).arch(0, 4.9, 0.2, 1.5, 5).win(0, 4.9, 12, 0.6, 1.6, 'dark').win(0, 5.9, 18.6, 0.7, 1.2).flag(0, 0, 24, 9); }
  return k; } };
D.port = { fp: [4, 3], make(k) { const s = k.s;
  const boat = (x, y, l, m) => { k.ell(x, y, 1, [l, 2.1, 1.7], m || 'wood').ell(x, y, 1.9, [l - 0.9, 1.3, 1], 'dark', { pri: 3 }); };
  if (s === 0) { k.post(-12, 0, 0, 8, 'timber', 0.5).post(-3, 0, 0, 8, 'timber', 0.5).beamX(-7.5, 0, 7.2, 5, 'timber', 0.4); for (const x of [-10.4, -8.4, -6.4, -4.4]) k.ell(x, 0.5, 5.2, [0.6, 0.4, 1.5], 'fish', { pri: 6 });
    boat(6, 4, 7); k.cap([2, 5.6, 2.4], [10.6, 2.2, 3.6], 0.35, 0.35, 'timber', { pri: 5 }).box(-8, 7.6, 0, 3.6, 2.6, 0.5, 'straw').barrel(-12.6, 8).sack(0.4, 9).stake(13.5, -3, 6, 0.7).stake(11, -5.5, 5, 0.7); }
  else if (s === 1) { k.box(-6.5, -1, 0, 7.4, 6, 7.6, 'plank').box(-6.5, -1, 0, 7.6, 6.2, 1.5, 'stoneD').roofX(-6.5, -1, 7.6, 7.4, 6, 7, 'shingle').door(-8.6, 5, 0.2, 2.6, 5.8, 'dark').win(-2.6, 5, 4.4, 1.1, 1.2).box(8, 4, 0, 6.6, 5, 1.4, 'plankH'); for (const [x, y] of [[2.4, 8.4], [13.6, 8.4], [13.6, 0]]) k.post(x, y, 0, 3.4, 'log', 0.8);
    boat(8, 2.4, 5.4); k.post(13, -3.4, 0, 14, 'timber', 0.6).cap([13, -3.4, 13.4], [7, -2.4, 16.5], 0.45, 0.45, 'timber', { pri: 5 }).box(7.2, -2.3, 12.4, 0.25, 0.25, 4, 'ironD', { pri: 6 }).barrel(-13.2, 9).crate(-1.2, 8.6, 0, 1.5).box(-12, 6.6, 3, 2.4, 0.4, 2, 'cloth', { pri: 7 }); }
  else { k.box(-6.5, -1, 0, 7.6, 6.4, 12, 'plaster').box(-6.5, -1, 0, 7.8, 6.6, 5.4, 'stoneW').frame(5.4, 7.6, 6.6, 5.4, [-14.1, -6.5, 1.1]).roofX(-6.5, -1, 12, 7.6, 6.4, 7.6, 'tile').arch(-9.6, 5.4, 0.2, 2.2, 5).win(-3.2, 5.4, 3, 1.3, 1.1).win(-10.2, 5.4, 9, 1.1, 1.2).win(-2.8, 5.4, 9, 1.1, 1.2).chimney(-11, -3, 13.6, 7.4)
      .box(8.4, 4, 0, 6.4, 5.2, 1.6, 'stoneL'); for (const [x, y] of [[2.6, 8.6], [14.2, 8.6]]) k.post(x, y, 0, 3.6, 'log', 0.8);
    k.ell(8.6, 0, 1.6, [6, 2.4, 2.2], 'wood').ell(8.6, 0, 2.8, [5, 1.5, 1.2], 'dark', { pri: 3 }).post(8.6, 0, 2, 16, 'timber', 0.5).box(8.6, 0.3, 8.4, 3.6, 0.3, 4.6, 'cloth', { pri: 6 }).box(8.6, 0.4, 13.4, 3.9, 0.4, 0.5, 'timber', { pri: 7 }).box(9.8, 0.4, 17, 1.4, 0.4, 1, 'banner', { pri: 7 })
      .barrel(3.4, 6.4, 1.6).crate(12.6, 6.6, 1.6, 1.5).crate(-0.8, 9.4, 0, 1.5); }
  return k; } };
D.tavern = { fp: [3, 2], make(k) { const s = k.s;
  if (s === 0) { for (const x of [-9, 9]) { k.post(x, -4, 0, 10).post(x, 4, 0, 6.4); } k.slab(0, 0, 8.6, 10.4, 5.6, 0.4, 'hide', 0.6).fire(0, 3, 0, 1.6).ell(0, 3, 0.5, [2.8, 2.2, 0.9], 'stoneD').cap([-7.5, 6, 1], [-3.4, 7.4, 1], 1, 1, 'log').cap([3.4, 7.4, 1], [7.5, 6, 1], 1, 1, 'log').barrel(-6.4, -1).barrel(6.2, -1.6).box(6.2, -1.4, 3.4, 0.9, 0.9, 1.1, 'gold'); }
  else if (s === 1) { k.box(0, 0, 0, 10.4, 6, 7.4, 'plaster').box(0, 0, 0, 10.6, 6.2, 1.5, 'stoneD').frame(6, 10.4, 7.4, 0, [-10.4, -5.2, 5.2, 10.4]).roofX(0, 0, 7.4, 10.4, 6, 9, 'thatch').door(0, 6, 0.2, 1.9, 5.2).win(-7.6, 6, 4.3, 1.5, 1.3).win(7.6, 6, 4.3, 1.5, 1.3).sign(-3.6, 6, 7).chimney(-6.6, -1.5, 10, 7.6).barrel(4, 8.4).barrel(7, 8.8).box(-8.4, 8.6, 0, 2.2, 1, 1.4, 'wood'); }
  else { k.box(0, 0, 0, 10.4, 6, 13, 'plaster').box(0, 0, 0, 10.6, 6.2, 5.8, 'stoneW').frame(6, 10.4, 7.2, 5.8, [-10.4, -3.6, 3.6, 10.4]).roofX(0, 0, 13, 10.4, 6, 8.4, 'tile').box(0, 7.2, 5.6, 7.6, 1.3, 0.8, 'timber', { pri: 6 }); for (const x of [-7.2, -3.6, 0, 3.6, 7.2]) k.box(x, 8.2, 6.4, 0.35, 0.3, 2, 'timber', { pri: 7 }); k.box(0, 8.3, 8.2, 7.6, 0.3, 0.4, 'timber', { pri: 7 });
    k.arch(0, 6, 0.2, 2, 5.2).win(-7, 6, 3, 1.5, 1.2).win(7, 6, 3, 1.5, 1.2).win(-6.6, 6, 10, 1.2, 1.3).win(6.6, 6, 10, 1.2, 1.3).door(0, 6, 6.4, 1.3, 4.2).sign(-10.6, 7.4, 6).chimney(6.4, -1.5, 15, 8).barrel(11, 8.6).barrel(8.4, 9.4); k.prism(0, 2.6, 15.6, 1, 3, 2.3, 3.4, 'tile', { pri: 5 }); k.rwin(0, 5.7, 17, 0.9); }
  return k; } };
D.library = { fp: [3, 3], make(k) { const s = k.s;
  if (s === 0) { k.cyl(-3, -1, 0, 6.4, 5, 'wattle').cone(-3, -1, 4.2, 8.8, 10, 'thatch', { round: 0.4 }).door(-3, 5.2, 0, 1.6, 4.2, 'dark').box(7.5, 3, 0, 1.7, 1.4, 12, 'stoneW', { round: 0.7 }); k.ell(7.5, 4.5, 8.6, [0.8, 0.5, 0.8], 'rune', { pri: 6 }); k.box(7.5, 4.5, 3.7, 0.3, 0.5, 3, 'rune', { pri: 6 }); k.light = [7.5, 4.5 * YS, 7 * ZS];
    k.box(9.6, 8, 0, 1.2, 1, 5.5, 'stoneW', { round: 0.5 }).box(3.6, 8.6, 0, 1.1, 0.9, 3.6, 'stoneD', { round: 0.5 }); }
  else if (s === 1) { k.box(-2.4, 0, 0, 8, 7.6, 8.4, 'plaster').box(-2.4, 0, 0, 8.2, 7.8, 1.6, 'stoneD').frame(7.6, 8, 8.4, 0, [-10.4, 5.6]).box(-2.4, 7.75, 0, 0.6, 0.45, 8.4, 'timber', { pri: 5 }).roofY(-2.4, 0, 8.4, 8, 7.6, 8.6, 'shingle', 'plaster').door(-6, 7.6, 0.2, 1.7, 5).win(1.6, 7.6, 4.6, 1.3, 1.6).rwin(-2.4, 8.3, 11.4, 1.5)
      .cyl(7.6, 1, 0, 3.6, 16, 'stoneW').cone(7.6, 1, 15.6, 4.8, 8.6, 'shingle').win(7.6, 4.6, 11, 0.8, 1.6).win(7.6, 4.6, 4.6, 0.8, 1.4).ell(7.6, 1, 25, [0.9, 0.9, 0.9], 'gold', { pri: 8 }); }
  else { k.box(0, 0, 0, 10.2, 7.6, 11.5, 'stoneL').box(0, 0, 0, 10.4, 7.8, 2, 'stoneW').box(0, 0, 11.5, 10.8, 8.2, 1.4, 'stoneW', { pri: 3 }).ell(0, -0.6, 12.4, [7, 6, 8.2], 'copper', { pri: 4 }).ell(0, -0.6, 21, [1, 1, 1.6], 'gold', { pri: 8 })
      .box(0, 8.6, 0, 6.2, 1.6, 1.2, 'stoneL'); for (const x of [-5.4, -1.8, 1.8, 5.4]) k.cyl(x, 9, 1.2, 0.85, 8.4, 'stoneL', { pri: 6 }); k.prism(0, 8.2, 9.6, 1, 2, 6.6, 3.6, 'stoneL', { pri: 6 }); k.arch(0, 7.6, 1.2, 2.2, 7.4, 'win').win(-8, 7.6, 5.4, 0.8, 2.2).win(8, 7.6, 5.4, 0.8, 2.2).ell(0, 10.4, 11, [0.9, 0.4, 0.9], 'gold', { pri: 8 }); k.light = [0, 8 * YS, 4 * ZS]; }
  return k; } };
D.hospital = { fp: [3, 3], provisional: true, make(k) { const s = k.s; k.box(0, 0, 0, 10, 7.6, s ? 8.6 : 7, s === 2 ? 'stoneL' : s ? 'plaster' : 'wattle').box(0, 0, 0, 10.2, 7.8, 1.6, 'stoneD').roofX(0, 0, s ? 8.6 : 7, 10, 7.6, 8, s === 2 ? 'copper' : s ? 'shingle' : 'thatch').door(0, 7.6, 0.2, 2, 5.4).win(-6.4, 7.6, 4.6, 1.2, 1.3).win(6.4, 7.6, 4.6, 1.2, 1.3)
    .box(0, 9, 9.6, 0.7, 0.4, 2.2, 'tealc', { pri: 8 }).box(0, 9, 9.6, 2.2, 0.4, 0.7, 'tealc', { pri: 8 }).ell(0, 8.6, 9.6, [3, 0.4, 3], 'cloth', { pri: 7 }); return k; } };
D.wall = { fp: [1, 1], make(k) { const s = k.s; if (s < 2) { for (const x of [-2.2, -0.75, 0.75, 2.2]) k.stake(x, 0, s ? 10 : 8.5, 0.9); k.box(0, 0.9, s ? 6 : 5, 3, 0.4, 0.8, 'timber', { pri: 3 }); } else { k.box(0, 0, 0, 3.1, 3, 9, 'stoneW').box(0, 0, 9, 3.2, 3.2, 1, 'stoneL', { pri: 3 }).box(-2, 2.4, 10, 0.9, 0.8, 1.6, 'stoneL', { pri: 5 }).box(2, 2.4, 10, 0.9, 0.8, 1.6, 'stoneL', { pri: 5 }); } return k; } };
D.gate = { fp: [1, 1], make(k) { const s = k.s; if (s < 2) { k.stake(-2.4, 0, 11, 1).stake(2.4, 0, 11, 1).box(0, 0, 8, 3, 0.8, 1.4, 'timber', { pri: 4 }).door(0, 0, 0, 1.7, 7.6, 'door'); } else { k.box(0, 0, 0, 3.1, 3, 11, 'stoneW').box(0, 0, 11, 3.2, 3.2, 1, 'stoneL', { pri: 3 }).box(-2, 2.4, 12, 0.9, 0.8, 1.6, 'stoneL', { pri: 5 }).box(2, 2.4, 12, 0.9, 0.8, 1.6, 'stoneL', { pri: 5 }).arch(0, 3, 0, 1.9, 7.5, 'door'); } return k; } };
// construction site marker per footprint: stakes, string, a pile of planks and stones
function site(fw, fh) { const k = kit(0), W = fw * 4 - 1.5, Dp = fh * 4 - 1; for (const [x, y] of [[-W, Dp], [W, Dp], [-W, -Dp], [W, -Dp]]) k.stake(x, y, 4.6, 0.8); k.box(0, Dp, 3, W, 0.3, 0.45, 'straw', { pri: 3 }).box(0, -Dp, 3, W, 0.3, 0.45, 'straw', { pri: 3 });
  k.box(-W * 0.4, 1, 0, 3.2, 1.6, 0.9, 'wood').box(-W * 0.4 + 0.6, 1.2, 0.9, 3, 1.5, 0.8, 'crate').ell(W * 0.5, 2, 0.9, [2.2, 1.7, 1.5], 'rock').ell(W * 0.5 + 2, 3.2, 0.6, [1.2, 1, 1], 'rock').box(0, 0, 0, W - 1, Dp - 1, 0.35, 'soil', { pri: -2 }); return k; }
// ================= ORC ARCHITECTURE =================
// A different way of building, not a recolour: stage 0 low domes of dark red hide held by bone ribs — stage 1 log longhouses
// under moss roofs with crossed horns on the gables — stage 2 stepped keeps of black rock crowned with iron spikes and braziers.
// Every type = the orc shell for its footprint + the props that tell its trade (meat racks, ore, anvils, skull totems...).
function matsOrc() { const m = matsHuman(), P = (a, p) => Object.assign(a, { pattern: p });
  m.hideO = P(mat('red', [1, 2, 3]), PAT.hide); m.bone = mat('sand', [3, 4, 5], { ink: 'earth' }); m.mud = P(mat('earth', [2, 3, 4]), PAT.wattle); m.moss = P(mat('jungle', [0, 1, 2], { ink: 'earth' }), PAT.thatch); m.thatchD = P(mat('earth', [1, 2, 3]), PAT.thatch); m.hideR = P(mat('red', [1, 2, 3]), PAT.tiles(2.6, 5));
  m.black = P(mat('stone', [0, 1, 2]), PAT.rock); m.blackS = P(mat('stone', [1, 2, 3]), PAT.stone); m.spike = mat('stone', [2, 3, 4]); m.meat = mat('red', [2, 3, 4]); m.war = team([1, 2, 3]); m.warL = team([2, 3, 4]); return m; }
SETS.orc = matsOrc;
const O = {
  tusk(k, x, y, z, h, dir, r) { r = r || 1; k.cap([x, y, z], [x + dir * 1.7 * r, y, z + h * 0.55], 0.95 * r, 0.7 * r, 'bone', { pri: 7 }).cap([x + dir * 1.7 * r, y, z + h * 0.55], [x + dir * 0.3 * r, y, z + h], 0.7 * r, 0.22, 'bone', { pri: 7 }); return k; },
  skull(k, x, y, z, r) { k.ell(x, y, z, [r, r * 0.8, r], 'bone', { pri: 8 }).box(x, y + r * 0.2, z - r * 1.5, r * 0.55, 0.5, r * 0.7, 'bone', { pri: 8 }).box(x - r * 0.42, y + r * 0.85, z - r * 0.25, r * 0.24, 0.3, r * 0.5, 'dark', { pri: 9 }).box(x + r * 0.42, y + r * 0.85, z - r * 0.25, r * 0.24, 0.3, r * 0.5, 'dark', { pri: 9 }); return k; },
  totem(k, x, y, h) { k.stake(x, y, h, 0.9); O.skull(k, x, y + 0.3, h + 0.6, 1.5); return k; },
  spike(k, x, y, z, h) { k.cone(x, y, z, 0.9, h, 'spike', { pri: 6 }); return k; },
  shield(k, x, y, z) { k.ell(x, y + 0.3, z, [1.7, 0.5, 1.7], 'war', { pri: 7 }).ell(x, y + 0.5, z, [0.6, 0.4, 0.6], 'iron', { pri: 8 }); return k; },
  rack(k, x, y, w, h, what) { k.post(x - w, y, 0, h).post(x + w, y, 0, h).beamX(x, y, h - 0.6, w + 0.6, 'timber', 0.45); for (let i = -1; i <= 1; i++) { if (what === 'meat') k.ell(x + i * w * 0.55, y + 0.3, h - 2.6, [0.9, 0.6, 1.6], 'meat', { pri: 7 }); else if (what === 'fish') k.ell(x + i * w * 0.55, y + 0.3, h - 2.4, [0.6, 0.5, 1.5], 'fish', { pri: 7 }); else k.box(x + i * w * 0.55, y + 0.3, 1, 0.35, 0.35, h - 1.4, i ? 'iron' : 'spike', { pri: 7 }); } return k; },
  brazier(k, x, y, z) { k.cyl(x, y, z, 1.5, 1.6, 'ironD', { pri: 6 }); k.fire(x, y, z + 1.4, 1.3); return k; },
  // the shell: W half-width, Dp half-depth, H height scale
  shell(k, s, W, Dp, H, x0, roof) { x0 = x0 || 0;
    if (s === 0) { k.ell(x0, 0, 0, [W, Dp, H], 'hideO'); for (const a of [-1, 1]) k.cap([x0 + a * W * 0.98, Dp * 0.45, 0], [x0 + a * W * 0.3, 0, H + 1.2], 0.75, 0.4, 'bone', { pri: 5 }); k.cap([x0, Dp * 0.98, 0], [x0, 0, H + 0.4], 0.5, 0.4, 'bone', { pri: 5 });
      k.prism(x0, Dp * 0.9, 0, 1, 1.4, 2.1, H * 0.6, 'dark', { pri: 6 }); k.cap([x0 - 1, 0, H], [x0 - 2.4, -0.5, H + 3.4], 0.5, 0.25, 'bone', { pri: 6 }).cap([x0 + 1, 0, H], [x0 + 2.4, -0.5, H + 3.4], 0.5, 0.25, 'bone', { pri: 6 }); }
    else if (s === 1) { const wh = H * 0.6, rh = H * 0.52; H = (wh + rh) / 1.28; k.box(x0, 0, 0, W, Dp, wh, 'logwall').box(x0, 0, 0, W + 0.2, Dp + 0.2, 1.3, 'black').roofX(x0, 0, wh, W, Dp, rh, roof || 'moss', 1.3).cap([x0 - W - 1, 0, wh + rh * 0.82], [x0 + W + 1, 0, wh + rh * 0.82], 0.55, 0.55, 'timber', { pri: 6 });
      for (const a of [-1, 1]) { k.cap([x0 + a * (W + 0.6), 0.5, wh + H * 0.42], [x0 + a * (W + 3.4), 0.5, wh + H * 0.8 + 3.2], 0.7, 0.25, 'bone', { pri: 7 }).cap([x0 + a * (W + 0.6), 0.5, wh + H * 0.42], [x0 + a * (W - 1.6), 0.5, wh + H * 0.8 + 3.6], 0.7, 0.25, 'bone', { pri: 7 }); }
      k.door(x0, Dp, 0.2, 1.9, wh - 1.6, 'dark').box(x0, Dp + 0.4, wh - 1.7, 2.7, 0.5, 0.8, 'bone', { pri: 7 }).win(x0 - W * 0.6, Dp, wh * 0.55, 0.9, 0.9, 'dark').win(x0 + W * 0.6, Dp, wh * 0.55, 0.9, 0.9, 'dark'); }
    else { const h1 = H * 0.62, h2 = H * 0.42; k.box(x0, 0, 0, W + 0.5, Dp + 0.4, 2.2, 'black').box(x0, 0, 0, W, Dp, h1, 'blackS').box(x0, 0, h1, W + 0.5, Dp + 0.5, 1.1, 'black', { pri: 3 }).box(x0, -0.6, h1 + 1, W * 0.62, Dp * 0.62, h2, 'blackS').box(x0, -0.6, h1 + 1 + h2, W * 0.62 + 0.5, Dp * 0.62 + 0.5, 0.9, 'black', { pri: 3 });
      for (const a of [-1, 1]) { O.spike(k, x0 + a * (W - 0.6), Dp - 0.6, h1 + 1, 4.2); O.spike(k, x0 + a * (W * 0.62 - 0.4), Dp * 0.62 - 1, h1 + 1.8 + h2, 3.4); }
      k.arch(x0, Dp, 0.2, 2, h1 * 0.72, 'dark').win(x0 - W * 0.62, Dp, h1 * 0.55, 0.55, 1.5).win(x0 + W * 0.62, Dp, h1 * 0.55, 0.55, 1.5).win(x0, Dp * 0.62 - 0.6, h1 + 1 + h2 * 0.5, 0.6, 1.1); O.skull(k, x0, Dp + 0.5, h1 * 0.72 + 2.4, 1.25); }
    return k; },
};
const dims = fp => [fp[0] * 3.25, fp[1] * 2.9];
const DO = {};
const odef = (type, make) => { DO[type] = { fp: D[type].fp, great: D[type].great, make(k) { const [W, Dp] = dims(D[type].fp); make(k, k.s, W, Dp); return k; } }; };
odef('house', (k, s, W, Dp) => { O.shell(k, s, W - (s ? 0.6 : 0), Dp, [8.6, 13, 15][s]); if (s === 0) O.totem(k, W + 0.2, Dp + 1.5, 5); else if (s === 1) { O.shield(k, -W * 0.55, Dp, 3.6); k.stake(W + 0.6, Dp + 1.5, 5.5, 0.8); } });
odef('hall', (k, s, W, Dp) => { O.shell(k, s, W - 1, Dp - 0.5, [12.5, 16.5, 17][s], 0, 'hideR');
  if (s === 0) { k.ell(-W * 0.72, -2, 0, [5.5, 4.6, 8.4], 'hideO', { pri: -1 }); O.tusk(k, -4.6, Dp + 0.6, 0, 11, -1, 1.2); O.tusk(k, 4.6, Dp + 0.6, 0, 11, 1, 1.2); O.totem(k, W + 0.5, Dp, 9); k.fire(-W + 0.5, Dp + 3, 0, 1.7).ell(-W + 0.5, Dp + 3, 0.5, [3, 2.4, 0.9], 'black'); }
  else if (s === 1) { O.tusk(k, -4.4, Dp + 1, 0, 14, -1, 1.35); O.tusk(k, 4.4, Dp + 1, 0, 14, 1, 1.35); k.banner(-W - 0.5, 3, 0, 17, 'war').banner(W - 2.5, 3, 0, 17, 'war'); O.brazier(k, -W + 2.5, Dp + 3.4, 0); O.shield(k, -8, Dp - 0.5, 4.2); O.shield(k, 8, Dp - 0.5, 4.2); k.chimney(-6, -3, 11, 6, 'blackS'); }
  else { k.cyl(0, -1.5, 18.2, 4.6, 7.5, 'blackS', { pri: 4 }).cone(0, -1.5, 25.4, 5.8, 6, 'hideO', { pri: 5 }); O.tusk(k, -5.2, -1.5, 24.5, 7.5, -1, 1); O.tusk(k, 5.2, -1.5, 24.5, 7.5, 1, 1); k.win(0, 3, 22, 0.7, 1.4); O.brazier(k, -W + 1.5, Dp + 3, 0); O.brazier(k, W - 1.5, Dp + 3, 0); k.banner(-W - 0.2, 4, 10, 13, 'war').banner(W - 3.2, 4, 10, 13, 'war'); } });
odef('farm', (k, s, W, Dp) => { if (s === 0) { k.palisade(-W, -1, -Dp, 3.2).palisade(-W, -1, Dp + 1, 2.6); O.rack(k, 5, 2, 3.6, 7.5, 'meat'); k.hay(-5.4, 1, 3.2, 4.4).ell(4.6, 6, 0.8, [1.6, 1.2, 1.1], 'bone'); }
  else { O.shell(k, s, W * 0.55, Dp - 0.3, s === 1 ? 11 : 13, -W * 0.42); O.rack(k, W * 0.55, 2.5, 3.5, 8, 'meat'); k.palisade(W * 0.1, W, -Dp + 0.5, 3.4).hay(W * 0.62, 6.4, 2.3, 3.4); if (s === 2) O.skull(k, W * 0.55, 3, 9.4, 1.2); } });
odef('warehouse', (k, s, W, Dp) => { O.shell(k, s, W - 0.4, Dp - 1.6, [9.5, 13, 15][s], 0, 'thatchD'); k.crate(-W + 1.2, Dp + 0.9, 0, 1.8).barrel(W - 1.5, Dp + 1.2).sack(W - 5, Dp + 1.8).sack(-W + 5, Dp + 2); if (s) k.crate(-W + 1.6, Dp + 0.7, 3.6, 1.3).barrel(W - 4.6, Dp + 0.4); if (s === 0) k.ell(4.5, Dp + 2.5, 0.7, [1.5, 1.1, 1], 'bone'); });
odef('sawmill', (k, s, W, Dp) => { k.logs(-W * 0.52, 1.5, 3.4, 6); if (s === 0) { k.post(2, 4.5, 0, 6).post(9, 4.5, 0, 6).post(2, -3.5, 0, 9).post(9, -3.5, 0, 9).slab(5.5, 0.5, 8, 4.6, 5.6, 0.4, 'hideO', 0.9).cyl(5.5, 6.5, 0, 1.6, 1.8, 'log').box(6.6, 6.4, 2, 0.4, 0.4, 3.4, 'timber', { rot: rotY(0.5) }).box(7.9, 6.4, 4.6, 1.2, 0.4, 0.9, 'spike', { pri: 4 }); }
  else { O.shell(k, s, W * 0.5, Dp - 0.6, s === 1 ? 11 : 13.5, W * 0.45); k.cap([-W + 1.5, 6.6, 1.2], [-1, 6.6, 1.2], 1.1, 1.1, 'log', { pri: 7 }).ell(-W * 0.45, 7, 2.4, [2.2, 0.4, 2.2], 'spike', { pri: 8 }); } });
odef('mine', (k, s, W, Dp) => { k.ell(0, -1, 0, [W, Dp + 1, [10, 11.5, 13][s]], s === 2 ? 'black' : 'rock').ell(-W * 0.55, 1, 0, [W * 0.5, Dp * 0.8, 6.5], 'rock', { pri: -1 }); k.arch(1, Dp * 0.86, 0, 2.6, 6.4, 'dark');
  if (s === 0) { k.post(-1.8, Dp + 0.2, 0, 6.4).post(3.8, Dp + 0.2, 0, 6.4).beamX(1, Dp + 0.2, 6, 3.4); } else { O.tusk(k, -2.2, Dp + 0.4, 0, 8.6, -1, 1.1); O.tusk(k, 4.2, Dp + 0.4, 0, 8.6, 1, 1.1); }
  k.ell(-W + 2.4, Dp + 1.6, 0.9, [1.7, 1.3, 1.2], 'ore').ell(-W + 5, Dp + 2.4, 0.6, [1.1, 0.9, 0.9], 'ore').ell(W - 2.2, Dp + 1.8, 0.8, [1.6, 1.2, 1.1], 'rock'); if (s === 2) { O.spike(k, -3, -2, 12, 4); O.spike(k, 4, -3, 11.5, 4.6); O.brazier(k, W - 2.5, Dp + 2.6, 0); } });
odef('market', (k, s, W, Dp) => { const cov = s === 0 ? 'hideO' : s === 1 ? 'war' : 'warL'; for (const x of [-W * 0.5, W * 0.5]) { k.post(x - 4.6, 5, 0, 7).post(x + 4.6, 5, 0, 7).post(x - 4.6, -3, 0, 10.5).post(x + 4.6, -3, 0, 10.5).slab(x, 1, 9.2, 5.6, 5.4, 0.42, x < 0 ? cov : 'hideO', 0.9); }
  k.crate(-W * 0.5 - 2, 2.5, 0, 1.7).sack(-W * 0.5 + 2.4, 3.4).barrel(W * 0.5 + 2.4, 2.4); O.rack(k, W * 0.5 - 1.6, 4.4, 2.3, 5.6, 'meat'); if (s > 0) { O.totem(k, 0, Dp + 1, 9 + s * 2); k.ell(-W * 0.5, 5.8, 0.8, [1.4, 1, 1], 'ore'); } if (s === 2) { O.brazier(k, -W + 0.5, Dp + 2, 0); O.spike(k, -W * 0.5 - 4.6, -3, 10.5, 3); O.spike(k, W * 0.5 + 4.6, -3, 10.5, 3); } });
odef('temple', (k, s, W, Dp) => { const stones = s === 0 ? 3 : 5; for (let i = 0; i < stones; i++) { const a = Math.PI * (0.12 + 0.76 * i / (stones - 1)), x = Math.cos(a) * (W - 1.5), y = -Math.sin(a) * (Dp + 1) + 2, h = [9, 13, 16][s] + (i % 2) * 2.5; k.box(x, y, 0, 1.7, 1.5, h, s === 0 ? 'rock' : 'black', { round: 0.4 }); if (s === 2) { O.spike(k, x, y, h, 3.6); k.box(x, y + 1.3, h * 0.55, 0.45, 0.3, 1.8, 'rune', { pri: 7 }); } else if (s === 1) k.box(x, y + 1.3, h * 0.6, 0.4, 0.3, 1.4, 'rune', { pri: 7 }); }
  if (s === 0) { O.totem(k, 0, 1, 11); k.fire(0, Dp + 1.5, 0, 1.8).ell(0, Dp + 1.5, 0.5, [3.2, 2.5, 0.9], 'black'); }
  else { k.box(0, 2.5, 0, 6.4, 4.4, s === 1 ? 2.4 : 3.2, 'blackS').box(0, 2.5, s === 1 ? 2.4 : 3.2, 4.4, 3, 1.8, 'black'); const z = (s === 1 ? 4.2 : 5) + 4.6; O.skull(k, 0, 2.5, z + (s - 1), 3.4 + (s - 1) * 0.8); O.tusk(k, -3.6, 2.5, z + 1, 8 + s * 2, -1, 1.2); O.tusk(k, 3.6, 2.5, z + 1, 8 + s * 2, 1, 1.2); O.brazier(k, -W + 3.4, Dp + 2.4, 0); O.brazier(k, W - 3.4, Dp + 2.4, 0); if (s === 2) k.banner(-W + 0.5, 4, 0, 16, 'war').banner(W - 3.5, 4, 0, 16, 'war'); } });
odef('barracks', (k, s, W, Dp) => { O.shell(k, s, W - 3.2, Dp - 1, [10, 13.5, 15.5][s], -2.6, 'hideR'); O.rack(k, W - 3.4, 4.4, 2.6, 7.4, 'arms'); k.banner(W - 1.4, -2, 0, 15, 'war'); k.palisade(-W, -W + 5, Dp + 2.6, 4.6); if (s > 0) { O.shield(k, -2.6 - (W - 3.2) * 0.6, Dp - 1, 4); O.shield(k, -2.6 + (W - 3.2) * 0.6, Dp - 1, 4); } if (s === 2) O.brazier(k, W - 3.4, Dp + 2.8, 0); });
odef('forge', (k, s, W, Dp) => { if (s === 0) { k.ell(-3, 0, 0, [5.4, 4.6, 6.4], 'rock').prism(-3, 4.2, 0, 1, 1, 1.8, 3.6, 'fire', { pri: 6 }); k.smoke = [-3, 0, 8 * ZS]; k.light = [-3, 4.2 * YS, 2 * ZS]; k.cyl(-3, 0, 5.6, 1.6, 2, 'black', { pri: 5 }); }
  else { O.shell(k, s, W * 0.6, Dp - 0.4, s === 1 ? 11.5 : 14, -W * 0.36, 'thatchD'); k.chimney(-W * 0.36 - 3.4, -2, s === 1 ? 9 : 13, 8, 'blackS', 1.9); k.box(W * 0.5, 2, 0, 2.6, 2.2, 3.6, 'blackS').box(W * 0.5, 4.3, 0.6, 1.4, 0.4, 2.2, 'fire', { pri: 7 }); k.light = [W * 0.5, 4.3 * YS, 2 * ZS]; }
  k.box(W * 0.5 + (s ? 0.4 : -0.4), Dp + 1.4, 0, 1.1, 0.9, 1.6, 'log').box(W * 0.5 + (s ? 0.4 : -0.4), Dp + 1.4, 1.6, 2, 1, 1.3, 'ironD', { pri: 5 }); if (s === 2) O.spike(k, -W * 0.36 - 3.4, -2, 22, 3); });
odef('watchtower', (k, s, W, Dp) => { if (s < 2) { const h = s ? 17 : 13; for (const [x, y] of [[-4, 3.6], [4, 3.6], [-4, -3.6], [4, -3.6]]) k.stake(x, y, h, 0.85); k.box(0, 0, h - 5, 5.2, 4.4, 1, 'plankH', { pri: 3 }).box(0, 4, h - 4, 5.2, 0.4, 2.2, 'plank', { pri: 5 }).cone(0, 0, h, 6.6, 5, s ? 'moss' : 'hideO', { pri: 6 }); k.box(0, 4.6, 2, 4.2, 0.3, 0.6, 'timber', { pri: 4 }).box(0, 4.6, 6, 4.2, 0.3, 0.6, 'timber', { pri: 4 }); O.skull(k, 0, 4.6, h - 6.2, 1.2); if (s) { O.tusk(k, -5.6, 0, h + 1, 6, -1, 0.9); O.tusk(k, 5.6, 0, h + 1, 6, 1, 0.9); } }
  else { k.cyl(0, 0, 0, 5.2, 4, 'black').cyl(0, 0, 0, 4.4, 18, 'blackS').cyl(0, 0, 18, 5.6, 1.6, 'black', { pri: 3 }); for (const a of [0.4, 1.57, 2.74, 3.9, 5.5]) O.spike(k, Math.cos(a) * 5, Math.sin(a) * 4.2, 19.4, 3.6); k.arch(0, 4.4, 0, 1.5, 5.4, 'dark').win(0, 4.5, 12, 0.6, 1.5); k.fire(0, 0, 19.4, 1.7); } });
odef('port', (k, s, W, Dp) => { O.shell(k, s, W * 0.5, Dp - 2.4, [8.6, 12, 14][s], -W * 0.45, 'thatchD'); k.box(W * 0.45, 4.5, 0, W * 0.5, 4, 1.3, 'plankH'); for (const x of [W * 0.02, W * 0.9]) for (const y of [1, 8]) k.stake(x, y, 4.4, 0.8); O.rack(k, W * 0.45, 2.6, 3.2, 8, 'fish'); k.barrel(W * 0.2, 6.4, 1.3).crate(W * 0.72, 6.6, 1.3, 1.4); if (s === 2) O.brazier(k, W * 0.86, 1.4, 1.3); });
odef('tavern', (k, s, W, Dp) => { O.shell(k, s, W - 1.6, Dp - 0.4, [9, 13, 15][s], -1.4, 'thatchD'); k.barrel(W - 1.6, Dp + 0.6).barrel(W - 4.6, Dp + 1.6).barrel(W - 2.8, Dp + 1.2, 2.8); k.post(-W + 0.6, Dp + 2, 0, 9).beamX(-W + 2, Dp + 2, 8.6, 2, 'timber', 0.4); O.skull(k, -W + 2.6, Dp + 2.2, 6, 1.3); if (s) k.chimney(-5, -2.5, s === 1 ? 10 : 14, 7, 'blackS'); });
odef('library', (k, s, W, Dp) => { O.shell(k, s, W - 2.4, Dp - 1.4, [9.5, 13, 15.5][s], -2, 'hideR'); for (const [x, y, h] of [[W - 1.6, 1, 8], [W - 3.4, Dp + 1.6, 5.4], [-W + 1, Dp + 2, 4.4]]) { k.box(x, y, 0, 1.4, 1.2, h + s, 'black', { round: 0.4 }).box(x, y + 1.1, (h + s) * 0.5, 0.4, 0.3, 1.6, 'rune', { pri: 7 }); } k.light = [W - 1.6, 2 * YS, 4.5 * ZS]; });
odef('hospital', (k, s, W, Dp) => { O.shell(k, s, W - 1.4, Dp - 1.2, [9.5, 13, 15][s]); k.post(W - 0.6, Dp + 1.4, 0, 9).ell(W - 0.6, Dp + 1.7, 7.6, [1.8, 0.4, 1.8], 'cloth', { pri: 7 }).box(W - 0.6, Dp + 2, 6.6, 0.45, 0.3, 2, 'tealc', { pri: 8 }).box(W - 0.6, Dp + 2, 7.25, 1.2, 0.3, 0.7, 'tealc', { pri: 8 }); k.sack(-W + 1.6, Dp + 1.6); });
odef('wall', (k, s) => { if (s < 2) { for (const x of [-2.2, -0.75, 0.75, 2.2]) { const h = (s ? 10.5 : 9) + (x * x > 2 ? 0 : 1.5); k.stake(x, 0, h, 0.95); } k.box(0, 0.9, 5, 3, 0.4, 0.8, 'bone', { pri: 3 }); } else { k.box(0, 0, 0, 3.1, 3, 9.5, 'blackS').box(0, 0, 9.5, 3.2, 3.2, 1, 'black', { pri: 3 }); O.spike(k, -1.9, 1.5, 10.5, 3.2); O.spike(k, 1.9, 1.5, 10.5, 3.2); } });
odef('gate', (k, s) => { if (s < 2) { k.stake(-2.4, 0, 12, 1.05).stake(2.4, 0, 12, 1.05).box(0, 0, 8.4, 3, 0.8, 1.4, 'timber', { pri: 4 }).door(0, 0, 0, 1.7, 7.8, 'door'); O.skull(k, 0, 1, 10.6, 1.1); } else { k.box(0, 0, 0, 3.1, 3, 11.5, 'blackS').box(0, 0, 11.5, 3.2, 3.2, 1, 'black', { pri: 3 }); O.spike(k, -2, 1.5, 12.5, 3.4); O.spike(k, 2, 1.5, 12.5, 3.4); k.arch(0, 3, 0, 1.9, 7.5, 'door'); O.skull(k, 0, 3.3, 9.6, 1); } });
const DSETS = { human: D, orc: DO };
module.exports = { D, DSETS, SETS, PAT, kit, site, hash, ZS, YS };
// the four provisional peoples register their own sets (elf, dwarf, myrrin, okari)
require('./buildings2')(module.exports, { mat, team, glow, glass, ix, rotX, rotY, rotZ });
