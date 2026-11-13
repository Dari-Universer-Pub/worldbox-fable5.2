// Architecture of the elves, dwarves, myrrin and okari (pipeline A, same kit as tools/art/buildings.js). Each people has its
// house SHELL in five stages (a way of building, not a recolour), six more shells for the trades (A.<people>.trade: long, tower,
// sacred, work, lodge, study), a signature prop and one building of its own; a building type = the shell of its trade sized for
// its footprint + the props that tell the trade. Looked at on sheets (shots/a9-*.png and silhouettes), not patched by hand.
//   elf    : woven leaf bowers -> trunk houses under a leaf canopy -> pale spires among the leaves
//   dwarf  : burrows under rock slabs -> low stone halls with stepped copper roofs -> carved halls, corner pillars, gold caps
//   myrrin : one small mushroom -> spotted cap with glowing gills -> tall double-capped stalks
//   okari  : reed tents on a raft of poles -> stilt huts under steep reed roofs -> two-tier stilt houses with a mast and a sail
'use strict';
module.exports = function register(BL, lib) {
  const { D, DSETS, SETS, PAT, YS, ZS } = BL, { mat, team, glow, rotY } = lib;
  const P = (a, p) => Object.assign(a, { pattern: p });
  const dims = fp => [fp[0] * 3.25, fp[1] * 2.9];
  const spots = (x, y, z) => { const h = BL.hash(Math.floor((x + 50) / 3.1), Math.floor((y + z * 0.7 + 50) / 2.9), 17); return h < 0.2 ? 1 : 0; };
  // ---------- materials (the human set + the people's own)
  SETS.elf = () => { const m = SETS.human(); m.bark = P(mat('earth', [1, 2, 3]), PAT.planksV); m.leaf = P(mat('forest', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), PAT.thatch); m.leafL = P(mat('grass', [2, 3, 4], { ink: 'forest' }), PAT.thatch);
    m.crystal = Object.assign(glow([2, 3, 4]), { th: [-2, 0.5] }); m.lantern = Object.assign(glow([3, 4, 5]), { th: [-2, 0.2] }); m.pearl = mat('ice', [3, 4, 5], { ink: 'teal' }); m.whitew = mat('sand', [3, 4, 5], { ink: 'earth' }); m.spire = mat('teal', [1, 2, 3, 4], { extra: { th: [-0.1, 0.35, 0.82] } }); m.bloom = mat('pink', [3, 4, 5]); return m; };
  SETS.dwarf = () => { const m = SETS.human(); m.slab = P(mat('stone', [1, 2, 3, 4]), PAT.rock); m.carved = P(mat('stone', [2, 3, 4]), PAT.stone); m.carvedL = P(mat('stone', [3, 4, 5]), PAT.stone); m.verd = mat('teal', [2, 3, 4, 5], { extra: { th: [-0.1, 0.35, 0.82] } }); m.brass = mat('fire', [1, 2, 3]); m.brassL = mat('fire', [2, 3, 4, 5], { extra: { th: [-0.1, 0.35, 0.82] } }); m.runeband = Object.assign(glow([2, 3, 4]), { th: [-2, 2] }); return m; };
  SETS.myrrin = () => { const m = SETS.human(); m.stalk = mat('sand', [3, 4, 5], { ink: 'magic' }); m.capM = P(mat('magic', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), spots); m.capP = P(mat('pink', [2, 3, 4, 5], { extra: { th: [-0.15, 0.3, 0.86] } }), spots);
    m.gill = Object.assign(glow([2, 3, 4]), { th: [-2, 0.4] }); m.spot = mat('ice', [4, 5], { ink: 'magic' }); m.moss = mat('swamp', [2, 3, 4]); m.capT = P(mat('teal', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), spots); m.spore = Object.assign(glow([3, 4, 5]), { th: [-2, 0.2] }); return m; };
  SETS.okari = () => { const m = SETS.human(); m.reed = P(mat('sand', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), PAT.thatch); m.reedD = P(mat('earth', [2, 3, 4]), PAT.thatch); m.pole = mat('earth', [1, 2, 3]); m.deck = P(mat('sand', [1, 2, 3], { ink: 'earth' }), PAT.planksH);
    m.wallO = P(mat('sand', [2, 3, 4], { ink: 'earth' }), PAT.planksV); m.sail = team([2, 3, 4]); m.sailW = mat('ice', [3, 4, 5], { ink: 'stone' }); m.rope = mat('fire', [1, 2, 3]); m.lime = mat('ice', [3, 4, 5], { ink: 'stone' }); m.bluetile = P(team([1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.88] } }), PAT.tiles(2.2, 3.6)); m.lamp = Object.assign(glow([3, 4, 5]), { th: [-2, 0.2] }); return m; };
  // ---------- per people: shell(k, s, W, Dp, H, x0), sig(k, x, y, s) signature prop, H heights per stage, cover = market cloth
  const A = {};
  A.elf = { H: [9, 14, 19], roof: 'leaf', stone: 'bark', pal: 'bark', cover: ['leaf', 'leafL', 'banner'],
    // stage 4: a great tree hall, two tiers of canopy, a ring walkway and hanging lanterns; stage 5: twin pearl spires crowned with crystal among blossom
    shellHi(k, lv, W, Dp, H, x0) { H = Math.min(H * (1.1 + lv * 0.1), lv === 1 ? 21.5 : 25); const r = Math.min(W, Dp * 1.25) * (lv === 1 ? 0.66 : 0.42);
      if (lv === 1) { const th = H * 0.5; k.cyl(x0, 0, 0, r + 0.9, 1.6, 'bark').cyl(x0, 0, 0, r, th, 'bark'); for (const a of [-1, 1]) k.cap([x0 + a * (r + 3), 2.8, 0], [x0 + a * (r - 0.6), 1, 4], 1.1, 0.8, 'bark', { pri: 3 });
        k.cyl(x0, 0, th * 0.55, r + 1.6, 0.8, 'whitew', { pri: 5 }); k.ell(x0, 0, th + H * 0.16, [W * 1.08, Dp * 1.15, H * 0.34], 'leaf', { pri: 4 }).ell(x0, -0.5, th + H * 0.5, [W * 0.72, Dp * 0.8, H * 0.3], 'leaf', { pri: 5 }).ell(x0 - W * 0.4, 1, th + H * 0.36, [W * 0.45, Dp * 0.5, H * 0.2], 'leafL', { pri: 6 }).ell(x0 + W * 0.3, -0.5, th + H * 0.7, [W * 0.36, Dp * 0.4, H * 0.17], 'leafL', { pri: 6 });
        for (const a of [-1, 1]) { k.box(x0 + a * W * 0.78, Dp * 0.5, th * 0.5, 0.25, 0.25, th * 0.42, 'bark', { pri: 6 }); k.ell(x0 + a * W * 0.78, Dp * 0.5, th * 0.45, [0.8, 0.7, 0.9], 'lantern', { pri: 7 }); }
        k.arch(x0, r * 0.8 / YS, 0.2, 1.7, th * 0.62, 'door'); k.rwin(x0 - r * 0.62, r * 0.62 / YS, th * 0.8, 0.9).rwin(x0 + r * 0.62, r * 0.62 / YS, th * 0.8, 0.9); k.light = [x0, Dp * 0.5 * YS, th * 0.5 * ZS]; }
      else { for (const [a, hh] of [[-1, 0.86], [1, 1]]) { const x = x0 + a * W * 0.36, th = H * 0.56 * hh; k.cyl(x, 0, 0, r + 0.7, 1.6, 'bark').cyl(x, 0, 0, r, th, 'pearl').cyl(x, 0, th - 1.2, r + 0.8, 1.2, 'whitew', { pri: 3 }).cone(x, 0, th, r + 1.3, H * 0.5 * hh, 'spire', { pri: 5 }); k.ell(x, 0, th + H * 0.5 * hh + 0.6, [0.9, 0.9, 1.6], 'crystal', { pri: 8 }); k.win(x, r * 0.84 / YS, th * 0.72, 0.55, 1.6).win(x, r * 0.84 / YS, th * 0.4, 0.55, 1.2); }
        k.box(x0, 0, H * 0.3, W * 0.36, 1.2, 1.1, 'whitew', { pri: 4 }).arch(x0, 1.2, H * 0.3 - 3.2, 1.6, 3.2, 'dark'); k.arch(x0 + W * 0.36, r * 0.82 / YS, 0.2, 1.4, H * 0.24, 'door');
        k.ell(x0 - W * 0.85, 1, 4.5, [W * 0.3, Dp * 0.5, 4.2], 'leaf', { pri: 2 }).ell(x0 + W * 0.9, 0, 5, [W * 0.28, Dp * 0.48, 4.6], 'leaf', { pri: 2 }); for (const [x, y, z] of [[-W * 0.85, 1.8, 7], [W * 0.9, 1, 8], [-W * 0.7, 2.6, 4.6], [0, Dp * 0.8, 2]]) k.ell(x0 + x, y, z, [0.9, 0.8, 0.8], 'bloom', { pri: 6 }); k.light = [x0, 1.2 * YS, H * 0.3 * ZS]; }
      return k; },
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; if (k.lvl) return A.elf.shellHi(k, k.lvl, W, Dp, H, x0);
      if (s === 0) { k.ell(x0, 0, 0, [W, Dp, H], 'leaf'); for (const a of [-1, 1]) k.cap([x0 + a * W * 0.95, Dp * 0.5, 0], [x0 + a * W * 0.2, 0, H + 0.6], 0.6, 0.35, 'bark', { pri: 5 }); k.arch(x0, Dp * 0.86, 0, 1.6, H * 0.55, 'dark').ell(x0 + W * 0.45, -Dp * 0.2, H * 0.85, [1.6, 1.4, 1.1], 'leafL', { pri: 5 }); }
      else if (s === 1) { const th = H * 0.5, r = Math.min(W, Dp * 1.25) * 0.62; k.cyl(x0, 0, 0, r, th, 'bark').cyl(x0, 0, 0, r + 0.6, 1.2, 'bark');
        for (const a of [-1, 1]) k.cap([x0 + a * (r + 2.4), 2.5, 0], [x0 + a * (r - 0.6), 1, 3.2], 0.9, 0.7, 'bark', { pri: 3 });
        k.ell(x0, 0, th + H * 0.2, [W * 1.02, Dp * 1.1, H * 0.42], 'leaf', { pri: 4 }).ell(x0 - W * 0.42, 1, th + H * 0.42, [W * 0.5, Dp * 0.6, H * 0.24], 'leafL', { pri: 5 }).ell(x0 + W * 0.5, -1, th + H * 0.36, [W * 0.42, Dp * 0.5, H * 0.2], 'leafL', { pri: 5 });
        k.arch(x0, r * 0.96 / YS * 0.82, 0.2, 1.5, th * 0.8, 'door'); k.rwin(x0 - r * 0.62, r * 0.75 / YS * 0.82, th * 0.62, 0.9).rwin(x0 + r * 0.62, r * 0.75 / YS * 0.82, th * 0.62, 0.9); }
      else { const th = H * 0.56, r = Math.min(W, Dp * 1.25) * 0.5; k.cyl(x0, 0, 0, r + 0.8, 1.6, 'bark').cyl(x0, 0, 0, r, th, 'whitew').cyl(x0, 0, th - 1.4, r + 0.9, 1.3, 'bark', { pri: 3 }).cone(x0, 0, th - 0.2, r + 1.5, H * 0.62, 'spire', { pri: 5 }).ell(x0, 0, th + H * 0.62, [0.7, 0.7, 0.8], 'gold', { pri: 8 });
        k.ell(x0 - W * 0.7, 0.5, 4.5, [W * 0.42, Dp * 0.6, 4.2], 'leaf', { pri: 2 }).ell(x0 + W * 0.72, -0.5, 5.5, [W * 0.4, Dp * 0.55, 5], 'leaf', { pri: 2 }).ell(x0 + W * 0.6, 1.5, 8.2, [W * 0.26, Dp * 0.36, 2.4], 'leafL', { pri: 3 });
        k.arch(x0, r * 0.82 / YS, 0.2, 1.5, th * 0.5, 'door'); k.win(x0, r * 0.84 / YS, th * 0.78, 0.6, 1.5).win(x0 - r * 0.66, r * 0.6 / YS, th * 0.55, 0.5, 1.2).win(x0 + r * 0.66, r * 0.6 / YS, th * 0.55, 0.5, 1.2); }
      return k; },
    sig(k, x, y, s) { k.cap([x, y, 0], [x + 0.4, y, 3.2 + s], 0.5, 0.35, 'bark', { pri: 3 }).ell(x + 0.4, y, 4.4 + s, [2 + s * 0.3, 1.8, 2 + s * 0.3], 'leafL', { pri: 4 }); if (s) k.ell(x - 0.7, y + 0.8, 4 + s, [0.6, 0.5, 0.6], 'bloom', { pri: 6 }); return k; } };
  A.dwarf = { H: [8, 11.5, 14], roof: 'verd', stone: 'slab', pal: 'slab', cover: ['hide2', 'verd', 'brass'],
    // stage 4: a fortress hall under a four-step copper ziggurat, square corner towers with braziers; stage 5: a gold-vaulted hold, brass dome, a glowing band of runes, guardian pillars
    shellHi(k, lv, W, Dp, H, x0) { H = Math.min(H * (1.12 + lv * 0.1), lv === 1 ? 27 : 24); const wh = H * 0.6;
      k.box(x0, 0, 0, W + 0.6, Dp + 0.6, 2.6, 'stoneD').box(x0, 0, 0, W, Dp, wh, lv === 2 ? 'carvedL' : 'carved').box(x0, 0, wh, W + 0.6, Dp + 0.6, 1, 'stoneD', { pri: 3 });
      if (lv === 1) { for (let q = 0; q < 4; q++) k.box(x0, -0.3 * q, wh + 1 + q * 1.5, (W + 0.4) * (1 - q * 0.2), (Dp + 0.4) * (1 - q * 0.2), 1.5, 'verd', { pri: 4 + q }); for (const a of [-1, 1]) { k.box(x0 + a * (W - 0.2), Dp - 0.2, 0, 1.7, 1.6, wh + 3.4, 'carved', { pri: 6 }).box(x0 + a * (W - 0.2), Dp - 0.2, wh + 3.4, 2, 1.9, 0.9, 'stoneD', { pri: 7 }); k.fire(x0 + a * (W - 0.2), Dp - 0.2, wh + 4.3, 1.1); } }
      else { k.ell(x0, -0.3, wh + 1, [W * 0.86, Dp * 0.9, H * 0.42], 'brassL', { pri: 5 }).box(x0, -0.3, wh + 1, W * 0.9, Dp * 0.94, 1.1, 'brass', { pri: 6 }).ell(x0, -0.3, wh + 1 + H * 0.42, [1, 1, 1.4], 'runeband', { pri: 8 });
        k.box(x0, Dp + 0.35, wh * 0.86, W * 0.96, 0.3, 0.9, 'runeband', { pri: 8 }); for (const a of [-1, 1]) { k.box(x0 + a * (W - 0.1), Dp + 0.6, 0, 1.3, 1.2, wh * 0.86, 'carved', { pri: 6 }).ell(x0 + a * (W - 0.1), Dp + 0.6, wh * 0.86 + 1.3, [1.5, 1.3, 1.5], 'carved', { pri: 7 }).box(x0 + a * (W - 0.1), Dp + 1.6, wh * 0.86 + 1.2, 0.9, 0.3, 0.5, 'runeband', { pri: 8 }); } }
      k.arch(x0, Dp, 0.2, 2.3, wh * 0.74, 'door').box(x0, Dp + 0.45, wh * 0.74 + 0.4, 3.2, 0.5, 0.9, 'brass', { pri: 7 }); k.win(x0 - W * 0.52, Dp, wh * 0.56, 0.8, 1.3).win(x0 + W * 0.52, Dp, wh * 0.56, 0.8, 1.3); return k; },
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; if (k.lvl) return A.dwarf.shellHi(k, k.lvl, W, Dp, H, x0);
      if (s === 0) { k.ell(x0, -1, 0, [W, Dp + 0.6, H * 0.82], 'slab').box(x0, -1.5, H * 0.62, W * 0.7, Dp * 0.62, 1.2, 'slab', { round: 0.5, pri: 2 }); k.post(x0 - 2.3, Dp * 0.84, 0, H * 0.62, 'timber', 0.75).post(x0 + 2.3, Dp * 0.84, 0, H * 0.62, 'timber', 0.75).beamX(x0, Dp * 0.84, H * 0.62 - 0.4, 3.1, 'timber', 0.7).door(x0, Dp * 0.84, 0, 1.7, H * 0.55, 'dark'); }
      else if (s === 1) { const wh = H * 0.62; k.box(x0, 0, 0, W + 0.4, Dp + 0.4, 2, 'stoneD').box(x0, 0, 0, W, Dp, wh, 'carved').box(x0, 0, wh, W + 0.8, Dp + 0.8, 1.3, 'verd', { pri: 4 }).box(x0, -0.4, wh + 1.3, W * 0.72, Dp * 0.7, 1.5, 'verd', { pri: 4 }).box(x0, -0.6, wh + 2.8, W * 0.42, Dp * 0.42, 1.3, 'verd', { pri: 4 });
        for (const a of [-1, 1]) k.box(x0 + a * (W - 0.3), Dp - 0.2, 0, 1.3, 1.2, wh * 0.82, 'stoneD', { pri: 3 });
        k.door(x0, Dp, 0.2, 2.1, wh * 0.72, 'door').box(x0, Dp + 0.4, wh * 0.72 + 0.2, 2.9, 0.5, 0.9, 'stoneD', { pri: 7 }).win(x0 - W * 0.55, Dp, wh * 0.56, 0.9, 0.8).win(x0 + W * 0.55, Dp, wh * 0.56, 0.9, 0.8); }
      else { const wh = H * 0.66; k.box(x0, 0, 0, W + 0.5, Dp + 0.5, 2.4, 'stoneD').box(x0, 0, 0, W, Dp, wh, 'carvedL').box(x0, 0, wh, W + 0.5, Dp + 0.5, 0.9, 'stoneD', { pri: 3 }).hip(x0, 0, wh + 0.9, W, Dp, H * 0.42, 'verd', 0.9);
        for (const a of [-1, 1]) { k.box(x0 + a * (W - 0.2), Dp - 0.1, 0, 1.4, 1.3, wh + 2.6, 'carved', { pri: 5 }).box(x0 + a * (W - 0.2), Dp - 0.1, wh + 2.6, 1.7, 1.6, 0.9, 'brass', { pri: 6 }); }
        k.arch(x0, Dp, 0.2, 2.1, wh * 0.74, 'door').box(x0, Dp + 0.45, wh * 0.84, 0.45, 0.3, 1.5, 'rune', { pri: 8 }).win(x0 - W * 0.52, Dp, wh * 0.58, 0.8, 1.2).win(x0 + W * 0.52, Dp, wh * 0.58, 0.8, 1.2); }
      return k; },
    sig(k, x, y, s) { k.box(x, y, 0, 1.3, 1.1, 3.2 + s, 'slab', { round: 0.3 }).box(x, y + 1.0, 1.6 + s * 0.5, 0.4, 0.3, 1.3, 'rune', { pri: 7 }); if (s === 2) k.box(x, y, 4.2 + s, 1.6, 1.4, 0.7, 'brass', { pri: 6 }); return k; } };
  const cap = (k, x, y, z, rx, ry, rz, m, n) => { k.cyl(x, y, z - rz * 0.42, rx * 0.9, rz * 0.36, 'gill', { pri: 5 }); k.sc.ell([x, y * YS, z * ZS], [rx, ry * YS, rz * ZS], m, { pri: 4 }); if (z + rz > k.top / ZS) k.top = (z + rz) * ZS;
    for (let i = 0; i < n; i++) { const a = 0.6 + i * 2.1, q = 0.5 + 0.12 * (i % 3); k.ell(x + Math.cos(a) * rx * q, y + Math.sin(a) * ry * q * 0.8 + ry * 0.2, z + rz * (0.9 - q * 0.42), [1.0 + 0.2 * (i & 1), 0.9, 0.55], 'spot', { pri: 6 }); } return k; };
  A.myrrin = { H: [9, 13, 18], roof: 'capP', stone: 'stalk', pal: 'stalk', cover: ['capP', 'capM', 'capP'],
    // stage 4: a cluster of three mushrooms of different heights joined by a bridge; stage 5: one giant stalk under three stacked caps, glowing gill rings and drifting spores
    shellHi(k, lv, W, Dp, H, x0) { H = Math.min(H * (1.08 + lv * 0.1), 25.5); const r = Math.min(W, Dp * 1.25) * 0.4;
      if (lv === 1) { for (const [dx, dy, hh, rr, m, n] of [[-0.42, -0.5, 1, 1, 'capM', 5], [0.5, -0.2, 0.74, 0.8, 'capP', 4], [0.05, 1.2, 0.5, 0.62, 'capT', 3]]) { const x = x0 + dx * W, sh = H * 0.58 * hh; k.cyl(x, dy, 0, r * rr + 0.6, 1.2, 'stalk', { round: 0.4 }).cyl(x, dy, 0, r * rr, sh + 1, 'stalk'); cap(k, x, dy, sh + H * 0.12 * hh, W * 0.62 * rr, Dp * 0.8 * rr, H * 0.3 * hh, m, n); k.rwin(x, dy + r * rr * 0.8 / YS, sh * 0.6, 0.7); }
        k.box(x0 + W * 0.04, -0.3, H * 0.3, W * 0.42, 0.7, 0.8, 'stalk', { pri: 3 }); k.arch(x0 - W * 0.42, -0.5 + r * 0.82 / YS, 0.2, 1.4, H * 0.3, 'dark'); }
      else { const sh = H * 0.72; k.cyl(x0, 0, 0, r + 1, 1.4, 'stalk', { round: 0.4 }).cyl(x0, 0, 0, r, sh, 'stalk'); cap(k, x0, 0, sh * 0.42, W * 0.98, Dp * 1.1, H * 0.2, 'capT', 4); cap(k, x0, 0, sh * 0.74, W * 0.76, Dp * 0.86, H * 0.19, 'capP', 4); cap(k, x0, 0, sh + H * 0.1, W * 0.56, Dp * 0.64, H * 0.2, 'capM', 3);
        for (const [x, y, z] of [[-W * 0.8, 2, 6], [W * 0.85, 1, 9], [-W * 0.5, 3, 12], [W * 0.4, 3.4, 4]]) k.ell(x0 + x, y, z, [0.6, 0.6, 0.6], 'spore', { pri: 8 });
        k.arch(x0, r * 0.82 / YS, 0.2, 1.5, sh * 0.3, 'dark'); k.rwin(x0, r * 0.84 / YS, sh * 0.6, 0.8).rwin(x0, r * 0.84 / YS, sh * 0.9, 0.7); k.cyl(x0 - W * 0.86, 2.2, 0, 0.9, 3.6, 'stalk'); cap(k, x0 - W * 0.86, 2.2, 4.6, 2.7, 2.7, 2, 'capP', 2); }
      return k; },
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; if (k.lvl) return A.myrrin.shellHi(k, k.lvl, W, Dp, H, x0); const r = Math.min(W, Dp * 1.25) * (s === 2 ? 0.46 : 0.52), sh = H * (s === 2 ? 0.6 : 0.5);
      k.cyl(x0, 0, 0, r + 0.7, 1.3, 'stalk', { round: 0.4 }).cyl(x0, 0, 0, r, sh + 1, 'stalk'); cap(k, x0, 0, sh + H * 0.14, W * (s ? 1.05 : 0.95), Dp * 1.15, H * (s === 2 ? 0.3 : 0.4), 'capM', s === 0 ? 3 : 5);
      k.arch(x0, r * 0.82 / YS, 0.2, 1.4, sh * 0.62, 'dark'); if (s) k.rwin(x0 - r * 0.6, r * 0.62 / YS, sh * 0.62, 0.8).rwin(x0 + r * 0.6, r * 0.62 / YS, sh * 0.62, 0.8);
      if (s === 2) { k.cyl(x0 + W * 0.2, -0.5, sh + H * 0.2, r * 0.5, H * 0.34, 'stalk', { pri: 5 }); cap(k, x0 + W * 0.2, -0.5, sh + H * 0.56, W * 0.56, Dp * 0.62, H * 0.2, 'capP', 3); k.rwin(x0 + W * 0.2, r * 0.3 / YS, sh + H * 0.42, 0.6);
        k.cyl(x0 - W * 0.82, 2, 0, 0.9, 3.4, 'stalk'); cap(k, x0 - W * 0.82, 2, 4.4, 2.6, 2.6, 2, 'capP', 2); }
      return k; },
    sig(k, x, y, s) { k.cyl(x, y, 0, 0.6, 2.4 + s * 0.6, 'stalk'); k.ell(x, y, 3 + s * 0.6, [1.9, 1.7, 1.3], 'capP', { pri: 4 }).cyl(x, y, 2.2 + s * 0.6, 1.5, 0.5, 'gill', { pri: 5 }); return k; } };
  A.okari = { H: [9, 13, 16.5], roof: 'reed', stone: 'pole', pal: 'pole', cover: ['reedD', 'sailW', 'sail'],
    // stage 4: a three-tier reed pagoda on stilts between two masts; stage 5: a lime-white harbour palace on tall stilts, curved roofs tiled in the kingdom colour, gold finials, a string of lamps
    shellHi(k, lv, W, Dp, H, x0) { H = Math.min(H * (1.1 + lv * 0.08), 17.5); const pz = 5.4 + lv * 0.8, wall = lv === 2 ? 'lime' : 'wallO', roof = lv === 2 ? 'bluetile' : 'reed';
      for (const [a, b] of [[-1, 1], [1, 1], [-1, -1], [1, -1], [0, 1]]) k.stake(x0 + a * (W - 0.9), b * (Dp - 0.6), pz + 1.5, 0.8); k.box(x0, 0, pz, W + 0.6, Dp + 0.6, 0.9, 'deck', { pri: 3 }).box(x0, Dp + 0.4, pz + 0.9, W + 0.4, 0.3, 1.4, 'pole', { pri: 4 });
      let z = pz + 0.9, w = W - 1, d = Dp - 0.9; for (let t = 0; t < 3; t++) { const wh = H * (0.24 - t * 0.04); k.box(x0, -0.3, z, w, d, wh, wall, { pri: 4 + t }).hip(x0, -0.3, z + wh, w, d, H * 0.2, roof, 1.9 - t * 0.3); if (t < 2) k.win(x0 - w * 0.5, d - 0.3, z + wh * 0.55, 0.7, 0.7).win(x0 + w * 0.5, d - 0.3, z + wh * 0.55, 0.7, 0.7); z += wh + H * 0.12; w *= 0.64; d *= 0.64; }
      k.ell(x0, -0.3, z + H * 0.12, [0.8, 0.8, 1.2], lv === 2 ? 'gold' : 'pole', { pri: 9 }); k.door(x0, Dp - 1.2, pz + 0.9, 1.5, H * 0.2, 'dark');
      for (const a of [-0.9, 0.9]) k.cap([x0 + a, Dp + 3, 0], [x0 + a, Dp + 0.7, pz + 0.6], 0.38, 0.38, 'pole', { pri: 6 });
      for (const a of lv === 2 ? [1] : [-1, 1]) { k.box(x0 + a * (W + 0.3), 1, 0, 0.55, 0.6, H + 8, 'pole', { pri: 7 }).box(x0 + a * (W + 0.3) - a * 2.1, 1.1, H, 2, 0.4, 6, a < 0 ? 'sailW' : 'sail', { pri: 8 }); }
      if (lv === 2) for (let q = 0; q < 5; q++) k.ell(x0 - W + 1 + q * (W * 2 - 2) / 4, Dp + 0.5, pz + 3.2 - Math.sin(q / 4 * Math.PI) * 1.2, [0.55, 0.5, 0.6], 'lamp', { pri: 9 });
      k.light = [x0, (Dp + 0.5) * YS, (pz + 3) * ZS]; return k; },
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; if (k.lvl) return A.okari.shellHi(k, k.lvl, W, Dp, H, x0); const pz = [2.6, 4.4, 5.2][s];
      for (const [a, b] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) k.stake(x0 + a * (W - 0.9), b * (Dp - 0.6), pz + 1.5, 0.75); k.box(x0, 0, pz, W + 0.5, Dp + 0.5, 0.9, 'deck', { pri: 3 });
      if (s === 0) { k.roofY(x0, 0, pz + 0.9, W * 0.82, Dp, H * 0.9, 'reed', 'dark', 1.0); k.cap([x0 + W * 0.2, Dp + 2.4, 0], [x0 + W * 0.2, Dp + 0.4, pz + 0.6], 0.42, 0.42, 'pole', { pri: 6 }); }
      else if (s === 1) { const wh = H * 0.5; k.box(x0, -0.3, pz + 0.9, W - 1.2, Dp - 1, wh, 'wallO').roofY(x0, -0.3, pz + 0.9 + wh, W - 1.2, Dp - 1, H * 0.55, 'reed', 'wallO', 1.6).door(x0, Dp - 1.3, pz + 0.9, 1.4, wh * 0.86, 'dark').win(x0 - W * 0.5, Dp - 1.3, pz + 0.9 + wh * 0.6, 0.8, 0.7).win(x0 + W * 0.5, Dp - 1.3, pz + 0.9 + wh * 0.6, 0.8, 0.7);
        for (const a of [-0.9, 0.9]) k.cap([x0 + a, Dp + 2.6, 0], [x0 + a, Dp + 0.4, pz + 0.6], 0.36, 0.36, 'pole', { pri: 6 }); k.box(x0, Dp + 1.5, pz * 0.45, 1.1, 0.3, 0.35, 'pole', { pri: 6 }); }
      else { const wh = H * 0.34; k.box(x0, -0.3, pz + 0.9, W - 1, Dp - 0.9, wh, 'wallO').hip(x0, -0.3, pz + 0.9 + wh, W - 1, Dp - 0.9, H * 0.3, 'reed', 1.8).box(x0, -0.3, pz + 0.9 + wh + H * 0.2, W * 0.5, Dp * 0.5, 1.6, 'wallO', { pri: 5 }).hip(x0, -0.3, pz + 2.5 + wh + H * 0.2, W * 0.5, Dp * 0.5, H * 0.3, 'reed', 1.4);
        k.door(x0, Dp - 1.2, pz + 0.9, 1.5, wh * 0.86, 'dark').win(x0 - W * 0.52, Dp - 1.2, pz + 0.9 + wh * 0.6, 0.8, 0.8).win(x0 + W * 0.52, Dp - 1.2, pz + 0.9 + wh * 0.6, 0.8, 0.8); k.box(x0, Dp + 0.3, pz + 0.9, W + 0.3, 0.3, 1.5, 'pole', { pri: 4 });
        for (const a of [-0.9, 0.9]) k.cap([x0 + a - W * 0.5, Dp + 2.8, 0], [x0 + a - W * 0.5, Dp + 0.6, pz + 0.6], 0.36, 0.36, 'pole', { pri: 6 });
        k.box(x0 + W + 0.2, 1, 0, 0.55, 0.6, H + 5, 'pole', { pri: 7 }).box(x0 + W - 1.9, 1.1, H - 2.5, 2, 0.4, 5.5, 'sail', { pri: 8 }).box(x0 + W - 1.5, 1.15, H + 3.2, 1.6, 0.4, 0.5, 'pole', { pri: 8 }); }
      return k; },
    sig(k, x, y, s) { k.box(x, y, 0, 0.5, 0.6, 7 + s * 1.5, 'pole', { pri: 7 }).box(x + 1.7, y + 0.1, 4.6 + s * 1.5, 1.4, 0.4, 2, s ? 'sail' : 'sailW', { pri: 8 }); return k; } };
  // ---------- chantier A.9: one shell per trade. Each people has six ways of building besides its house shell, each in five
  // stages (g = 0..4): long (stores, soldiers), tower (watch), sacred (temple), work (open workshop), lodge (inn, sick house),
  // study (books). f(k, g, W, Dp, H, x0): W, Dp half sizes of the plot, H the height wanted, x0 the offset on the plot.
  const ringOf = (n, R, Ry, a0, fn) => { for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.2832; fn(Math.cos(a) * R, Math.sin(a) * Ry, i); } };
  const hc = (H, g, max) => Math.min(g > 2 ? H * (1 + (g - 2) * 0.1) : H, max || 23);
  A.elf.trade = {
    // a hollow fallen giant under moss and leaves -> a long pale hall under a teal ridge, blossom at both ends
    long(k, g, W, Dp, H, x0) { const w = W - 0.8, d = Dp - 0.8; H = hc(H, g, 17);
      if (g < 3) { const r = Math.min(d * 0.85, 3.1 + g * 0.6); k.cap([x0 - w + r, 0, r], [x0 + w - r, 0, r], r, r * 0.88, 'bark');
        k.ell(x0 - w * 0.36, -0.5, r * 1.9, [w * 0.56, d * 0.75, 1.5 + g * 0.5], 'leaf', { pri: 4 }).ell(x0 + w * 0.5, 0.3, r * 1.85, [w * 0.36, d * 0.55, 1.1 + g * 0.4], 'leafL', { pri: 5 });
        k.arch(x0 - w * 0.34, r * 0.9 / YS, 0, 1.1, r * 1.05, 'dark'); if (g) k.rwin(x0 + w * 0.22, r * 0.96 / YS, r * 1.05, 0.8); if (g === 2) k.rwin(x0 + w * 0.6, r * 0.96 / YS, r * 1.05, 0.8);
        if (g) { k.cap([x0 + w - r * 0.9, -0.4, r * 1.4], [x0 + w - r * 0.3, -0.6, r * 2 + 2.2 + g], 0.8, 0.5, 'bark', { pri: 4 }).ell(x0 + w - r * 0.2, -0.6, r * 2 + 3.4 + g, [2.2 + g * 0.4, 2, 1.8 + g * 0.4], 'leaf', { pri: 5 }); }
        if (g === 2) k.ell(x0 - w * 0.34, r * 0.95 / YS + 0.6, r * 1.6, [0.6, 0.5, 0.7], 'lantern', { pri: 8 }).ell(x0 + w - r * 0.6, 0.6, r * 2 + 4.4, [0.7, 0.6, 0.7], 'bloom', { pri: 7 }); }
      else { const wall = g === 4 ? 'pearl' : 'whitew', wh = H * 0.4; k.box(x0, 0, 0, w + 0.4, d + 0.4, 1.4, 'bark').box(x0, 0, 0, w, d, wh, wall).box(x0, 0, wh, w + 0.5, d + 0.5, 0.8, 'bark', { pri: 3 }).hip(x0, 0, wh + 0.8, w, d, H * 0.34, 'spire', 0.9); for (const a of [-1, 1]) k.cyl(x0 + a * w * 0.6, d * 0.2, wh, 1.5, H * 0.2, wall, { pri: 5 }).cone(x0 + a * w * 0.6, d * 0.2, wh + H * 0.2, 2.1, H * 0.26, 'spire', { pri: 6 });
        k.arch(x0, d, 0.2, 1.5, wh * 0.84, 'door'); for (const a of [-0.62, -0.32, 0.32, 0.62]) k.win(x0 + a * w, d, wh * 0.6, 0.5, 1.1);
        for (const a of [-1, 1]) { k.ell(x0 + a * (w + 0.6), 0.8, 3.4, [2.6, d * 0.7, 3.4], 'leaf', { pri: 2 }).ell(x0 + a * (w + 0.4), 1.8, 5.2, [0.8, 0.7, 0.8], 'bloom', { pri: 6 }); if (g === 4) k.ell(x0 + a * w * 0.6, d * 0.2, wh + H * 0.46 + 0.6, [0.6, 0.6, 1.2], 'crystal', { pri: 8 }); } }
      return k; },
    // a lookout nest high on a bare trunk -> a pale needle with a ring balcony and a crystal
    tower(k, g, W, Dp, H, x0) { H = hc(H, g, 23);
      if (g < 3) { const r = 1.5 + g * 0.2, th = H * 0.72; k.cyl(x0, 0, 0, r + 0.7, 1.2, 'bark').cyl(x0, 0, 0, r, th, 'bark'); for (const a of [-1, 1]) k.cap([x0 + a * (r + 2), 1.6, 0], [x0 + a * (r - 0.4), 0.6, 2.8], 0.8, 0.5, 'bark', { pri: 3 });
        k.cyl(x0, 0, th * 0.7, r + 2.1, 0.8, 'bark', { pri: 5 }); ringOf(6, r + 1.9, (r + 1.9) / YS, 0.5, (x, y) => k.box(x0 + x, y, th * 0.7 + 0.8, 0.3, 0.3, 1.5, 'bark', { pri: 6 }));
        k.ell(x0, 0, th + H * 0.1, [r + 2.2 + g * 0.5, (r + 2.2) / YS, H * 0.2], 'leaf', { pri: 5 }).ell(x0 - 1.4, 0.6, th + H * 0.2, [1.8, 1.6, H * 0.1], 'leafL', { pri: 6 }); k.arch(x0, r * 0.84 / YS, 0.2, 1.0, 3, 'dark'); if (g) k.rwin(x0, r * 0.9 / YS, th * 0.5, 0.6); }
      else { const r = 1.7, th = H * 0.62, wall = g === 4 ? 'pearl' : 'whitew'; k.cyl(x0, 0, 0, r + 0.8, 1.4, 'bark').cyl(x0, 0, 0, r, th, wall).cyl(x0, 0, th * 0.66, r + 1.7, 0.7, 'whitew', { pri: 5 }).cyl(x0, 0, th - 0.9, r + 0.6, 0.9, 'bark', { pri: 4 }).cone(x0, 0, th, r + 1.1, H * 0.36, 'spire', { pri: 5 });
        k.ell(x0, 0, th + H * 0.36 + 0.5, [0.8, 0.8, 1.4], g === 4 ? 'crystal' : 'gold', { pri: 8 }); k.arch(x0, r * 0.84 / YS, 0.2, 1.0, 3.2, 'door').win(x0, r * 0.86 / YS, th * 0.5, 0.45, 1.1).win(x0, r * 0.86 / YS, th * 0.86, 0.45, 0.9);
        k.ell(x0 - 3.4, 0.8, 2.8, [2.4, 2, 2.8], 'leaf', { pri: 2 }); if (g === 4) k.ell(x0 + 3.4, 0.5, 3.2, [2.2, 2, 3.2], 'leaf', { pri: 2 }).ell(x0 + 3.2, 1.6, 5, [0.7, 0.6, 0.7], 'bloom', { pri: 6 }); }
      return k; },
    // an open ring of living pillars around a heart of light -> a pale colonnade under a floating teal crown
    sacred(k, g, W, Dp, H, x0) { H = hc(H, g, 22); const R = Math.min(W - 1.6, Dp * 1.15), Ry = R * 0.72 / YS, ph = H * (g < 3 ? 0.5 : 0.52), pm = g < 3 ? 'bark' : g === 4 ? 'pearl' : 'whitew';
      k.cyl(x0, 0, 0, R + 1.2, 0.7, g < 3 ? 'bark' : 'whitew', { pri: 1 }); ringOf(g === 0 ? 5 : 6, R, Ry, 0.52, (x, y, i) => { k.cap([x0 + x, y, 0], [x0 + x * 0.94, y * 0.94, ph], 0.75, 0.55, pm, { pri: 3 });
        if (g < 3) k.ell(x0 + x * 0.9, y * 0.9, ph + 1.2, [1.9 + g * 0.3, 1.7, 1.6 + g * 0.3], i & 1 ? 'leafL' : 'leaf', { pri: 4 }); });
      if (g < 3) { k.cyl(x0, 0, 0.7, 1.3, 1.2 + g * 0.4, 'whitew').ell(x0, 0, 3.2 + g * 0.6, [1.2 + g * 0.2, 1.1, 1.6 + g * 0.4], 'crystal', { pri: 8 }); if (g === 2) k.ell(x0, 0, ph + 3.4, [R * 0.7, Ry * 0.7, 2.4], 'leaf', { pri: 5 }).ell(x0 + 1.5, 0.8, ph + 4.6, [0.8, 0.7, 0.7], 'bloom', { pri: 7 }); }
      else { k.cyl(x0, 0, ph, R + 0.9, 0.9, 'whitew', { pri: 4 }).cone(x0, 0, ph + 0.9, R + 0.4, H * 0.36, 'spire', { pri: 5 }).ell(x0, 0, ph + H * 0.36 + 1.4, [0.9, 0.9, 1.6], 'crystal', { pri: 8 });
        k.cyl(x0, 0, 0.7, 1.5, 1.6, 'whitew').ell(x0, 0, 4.4, [1.5, 1.3, 2.2], 'crystal', { pri: 8 }); if (g === 4) ringOf(4, R + 1.6, Ry + 1.4, 0.2, (x, y) => k.ell(x0 + x, y, 1.6, [1.1, 1, 1.4], 'bloom', { pri: 3 })); }
      k.light = [x0, 0, 4 * ZS]; return k; },
    // a leaf awning on four forked posts over the work -> a pale pergola with a teal awning
    work(k, g, W, Dp, H, x0) { const w = W - 0.6, d = Dp - 0.6, ph = Math.min(H * 0.62, 8.5) + (g > 2 ? 1 : 0), pm = g < 3 ? 'bark' : 'whitew';
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { k.cap([x0 + a * (w - 0.6), b * (d - 0.5), 0], [x0 + a * (w - 0.9), b * (d - 0.6), ph], 0.7, 0.5, pm, { pri: 3 }); if (g < 3) k.cap([x0 + a * (w - 0.9), b * (d - 0.6), ph - 1], [x0 + a * (w + 0.5), b * (d - 0.6), ph + 0.8], 0.4, 0.3, 'bark', { pri: 3 }); }
      if (g < 3) k.ell(x0, 0, ph + 0.8, [w + 1, d + 0.9, 1.5 + g * 0.5], 'leaf', { pri: 4 }).ell(x0 - w * 0.4, 0.6, ph + 1.8 + g * 0.4, [w * 0.45, d * 0.6, 1], 'leafL', { pri: 5 });
      else { k.box(x0, 0, ph, w + 0.4, d + 0.4, 0.7, 'whitew', { pri: 4 }).hip(x0, 0, ph + 0.7, w + 0.2, d + 0.2, H * 0.3, 'spire', 0.8); k.ell(x0 + w * 0.8, d * 0.8, ph - 1.3, [0.7, 0.6, 0.8], 'lantern', { pri: 8 }); if (g === 4) k.ell(x0 - w * 0.8, d * 0.8, ph - 1.3, [0.7, 0.6, 0.8], 'lantern', { pri: 8 }).ell(x0, 0, ph + 0.9 + H * 0.3, [0.6, 0.6, 1.1], 'crystal', { pri: 8 }); }
      return k; },
    // a broad stump house under a flat leaf hat, a porch and a smoking knot -> a round pale pavilion under a low teal cone
    lodge(k, g, W, Dp, H, x0) { H = hc(H, g, 19); const r = Math.min(W * 0.78, Dp * 1.2), wh = H * (g < 3 ? 0.42 : 0.44);
      if (g === 0) { k.ell(x0 - W * 0.2, 0, 0, [W * 0.72, Dp * 0.95, H * 0.8], 'leaf').ell(x0 + W * 0.55, 0.6, 0, [W * 0.42, Dp * 0.62, H * 0.52], 'leafL', { pri: 3 }); k.arch(x0 - W * 0.2, Dp * 0.8, 0, 1.6, H * 0.45, 'dark'); k.cap([x0 - W * 0.2 - 2.2, Dp * 0.95, 0], [x0 - W * 0.2, Dp * 0.6, H * 0.6], 0.5, 0.3, 'bark', { pri: 5 }).cap([x0 - W * 0.2 + 2.2, Dp * 0.95, 0], [x0 - W * 0.2, Dp * 0.6, H * 0.6], 0.5, 0.3, 'bark', { pri: 5 }); return k; }
      const wall = g < 3 ? 'bark' : g === 4 ? 'pearl' : 'whitew'; k.cyl(x0, 0, 0, r + 0.7, 1.3, 'bark').cyl(x0, 0, 0, r, wh, wall);
      if (g < 3) { k.ell(x0, 0, wh + 0.6, [r + 1.8, (r + 1.8) / YS, 1.7], 'leaf', { pri: 4 }).ell(x0 - r * 0.2, -0.4, wh + 2.2, [r * 0.62, r * 0.6, 1.6 + g * 0.5], 'leafL', { pri: 5 }); k.cyl(x0 + r * 0.6, -1, wh, 0.8, 3.6, 'bark', { pri: 6 }); k.smoke = [x0 + r * 0.6, -1 * YS, (wh + 4.4) * ZS];
        k.box(x0, r * 0.9 / YS + 1, wh * 0.86, 2.4, 1.1, 0.5, 'leafL', { pri: 7 }); }
      else { k.cyl(x0, 0, wh - 0.9, r + 0.8, 0.9, 'bark', { pri: 3 }).cone(x0, 0, wh, r + 1.6, H * 0.4, 'spire', { pri: 5 }).ell(x0, 0, wh + H * 0.4 + 0.3, [0.8, 0.8, 1.1], g === 4 ? 'crystal' : 'gold', { pri: 8 }); for (const a of [-1, 1]) k.ell(x0 + a * (r + 0.9), r * 0.5, wh * 0.7, [0.7, 0.6, 0.8], 'lantern', { pri: 8 }); }
      k.arch(x0, r * 0.84 / YS, 0.2, 1.6, wh * 0.8, 'door').rwin(x0 - r * 0.62, r * 0.66 / YS, wh * 0.62, 0.85).rwin(x0 + r * 0.62, r * 0.66 / YS, wh * 0.62, 0.85); return k; },
    // a slim trunk under two leaf tiers -> a pale tower of two teal crowns
    study(k, g, W, Dp, H, x0) { H = hc(H, g, 23); const r = Math.min(W, Dp * 1.25) * 0.42;
      if (g === 0) { k.cone(x0, 0, 0, Math.min(W, Dp * 1.1) * 0.9, H * 1.05, 'leaf', { pri: 3 }).ell(x0 + 1.2, 1, H * 0.5, [1.6, 1.4, 1.2], 'leafL', { pri: 5 }); k.arch(x0, Dp * 0.5, 0, 1.3, H * 0.42, 'dark'); return k; }
      const wall = g < 3 ? 'bark' : g === 4 ? 'pearl' : 'whitew', t1 = H * 0.36, t2 = H * 0.66; k.cyl(x0, 0, 0, r + 0.7, 1.3, 'bark').cyl(x0, 0, 0, r, t1, wall).cyl(x0, 0, t1, r * 0.72, t2 - t1, wall);
      if (g < 3) k.ell(x0, 0, t1 + 0.4, [W * 0.92, Dp * 1.02, H * 0.1], 'leaf', { pri: 4 }).ell(x0, 0, t2 + H * 0.12, [W * 0.66, Dp * 0.74, H * 0.2], 'leaf', { pri: 5 }).ell(x0 - W * 0.24, 0.5, t2 + H * 0.24, [W * 0.3, Dp * 0.36, H * 0.1], 'leafL', { pri: 6 });
      else { k.cone(x0, 0, t1 - 0.4, r + 2.2, H * 0.13, 'spire', { pri: 4 }).cyl(x0, 0, t2 - 0.8, r * 0.72 + 0.6, 0.8, 'bark', { pri: 4 }).cone(x0, 0, t2, r * 0.72 + 1.2, H * 0.32, 'spire', { pri: 5 }).ell(x0, 0, t2 + H * 0.32 + 0.5, [0.7, 0.7, 1.3], g === 4 ? 'crystal' : 'gold', { pri: 8 }); }
      k.arch(x0, r * 0.84 / YS, 0.2, 1.3, t1 * 0.6, 'door').win(x0 - r * 0.6, r * 0.62 / YS, t1 * 0.66, 0.45, 0.9).win(x0 + r * 0.6, r * 0.62 / YS, t1 * 0.66, 0.45, 0.9).win(x0, r * 0.62 / YS, (t1 + t2) * 0.52, 0.45, 1); return k; } };
  A.dwarf.trade = {
    // a long barrow under slabs, a timber mouth -> a vaulted stone hall, copper barrel roof, buttresses -> brass vault and runes
    long(k, g, W, Dp, H, x0) { const w = W - 0.6, d = Dp - 0.7; H = hc(H, g, 16);
      if (g === 0) { k.box(x0, -0.5, 0, w, d, H * 0.5, 'slab', { round: 0.6 }).box(x0 - w * 0.2, -0.8, H * 0.5, w * 0.7, d * 0.7, 1.3, 'slab', { round: 0.5, pri: 2 }).box(x0 + w * 0.5, -0.5, H * 0.5, w * 0.3, d * 0.5, 0.9, 'slab', { round: 0.4, pri: 2 });
        for (const a of [-1, 1]) k.post(x0 - w * 0.4 + a * 1.9, d - 0.3, 0, H * 0.5, 'timber', 0.7); k.beamX(x0 - w * 0.4, d - 0.3, H * 0.5 - 0.5, 2.7, 'timber', 0.65).door(x0 - w * 0.4, d - 0.3, 0, 1.4, H * 0.44, 'dark'); return k; }
      const wall = g > 2 ? 'carvedL' : 'carved', roof = g === 4 ? 'brassL' : 'verd', wh = H * 0.46, rr = d * YS * 0.98;
      k.box(x0, 0, 0, w + 0.4, d + 0.4, 1.8, 'stoneD').box(x0, 0, 0, w, d, wh, wall); k.cap([x0 - w + 0.6, 0, wh], [x0 + w - 0.6, 0, wh], rr, rr, roof, { pri: 4 });
      for (const a of g > 1 ? [-1, 0, 1] : [-1, 1]) k.box(x0 + a * (w - 0.6), 0, wh - 0.4, 0.7, d + 0.5, rr / ZS + 1.1, a === 0 ? 'brass' : 'stoneD', { pri: 5 });
      for (const a of [-1, 1]) k.box(x0 + a * (w - 0.2), d - 0.1, 0, 1.2, 1.1, wh * 0.9, 'stoneD', { pri: 6 });
      k.arch(x0, d, 0.2, 1.9, wh * 0.8, 'door'); for (const a of [-0.56, 0.56]) k.win(x0 + a * w, d, wh * 0.56, 0.7, 0.9); if (g > 2) k.box(x0, d + 0.4, wh * 0.92, w * 0.5, 0.3, 0.5, g === 4 ? 'runeband' : 'brass', { pri: 8 }); return k; },
    // a cairn with a timber lookout -> a square keep, battlements, copper cap -> a beacon keep banded with runes
    tower(k, g, W, Dp, H, x0) { H = hc(H, g, 22); const w = Math.min(W, Dp * 1.2) * 0.62;
      if (g === 0) { const th = H * 0.5; k.box(x0, 0, 0, w + 0.9, w + 0.6, th * 0.5, 'slab', { round: 0.5 }).box(x0, -0.2, th * 0.5, w, w * 0.8, th * 0.5, 'slab', { round: 0.4, pri: 2 }); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.post(x0 + a * (w - 0.5), b * (w * 0.6), th, H * 0.3, 'timber', 0.5);
        k.box(x0, 0, th + H * 0.3, w + 0.5, w * 0.9, 0.7, 'timber', { pri: 5 }).door(x0, w + 0.6, 0, 1.2, th * 0.4, 'dark'); return k; }
      const wall = g > 2 ? 'carvedL' : 'carved', th = H * 0.7; k.box(x0, 0, 0, w + 0.9, w + 0.9, 2.4, 'stoneD').box(x0, 0, 0, w, w, th, wall).box(x0, 0, th, w + 0.8, w + 0.8, 1.1, 'stoneD', { pri: 4 });
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box(x0 + a * (w + 0.2), b * (w + 0.2), th + 1.1, 0.7, 0.7, 1.3, wall, { pri: 5 });
      if (g < 3) k.hip(x0, 0, th + 1.1, w * 0.72, w * 0.72, H * 0.2, 'verd', 0.3); else { k.box(x0, 0, th + 1.1, w * 0.5, w * 0.5, 1.6, 'brass', { pri: 5 }); k.fire(x0, 0, th + 2.7, 1.5); if (g === 4) k.box(x0, w + 0.3, th * 0.8, w * 0.9, 0.3, 0.5, 'runeband', { pri: 8 }); }
      k.arch(x0, w, 0.2, 1.3, 3.6, 'door').win(x0, w, th * 0.5, 0.5, 1).win(x0, w, th * 0.8, 0.5, 0.8); return k; },
    // three standing stones around a fire -> a stepped plinth, four pillars, a slab roof over a glowing rune stone -> a brass-roofed sanctum
    sacred(k, g, W, Dp, H, x0) { H = hc(H, g, 20); const w = W - 1, d = Dp - 0.6;
      if (g === 0) { for (const [x, y, h] of [[-w * 0.6, -1, H * 0.8], [w * 0.55, -0.6, H * 0.66], [0, -d * 0.8, H]]) k.box(x0 + x, y, 0, 1.5, 1.2, h, 'slab', { round: 0.4 }); k.box(x0 - w * 0.3, -d * 0.4, H * 0.8, w * 0.5, 1.2, 1, 'slab', { round: 0.3, pri: 4 }); k.cyl(x0, d * 0.4, 0, 1.6, 0.8, 'stoneD'); k.fire(x0, d * 0.4, 0.8, 1.3); return k; }
      const pm = g > 2 ? 'carvedL' : 'carved', ph = H * 0.5; k.box(x0, 0, 0, w + 0.6, d + 0.6, 1.2, 'stoneD').box(x0, 0, 1.2, w - 0.4, d - 0.2, 1.1, 'carved');
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box(x0 + a * (w - 1.6), b * (d - 1.2), 2.3, 1.1, 1, ph, pm, { pri: 3 });
      k.box(x0, 0, ph + 2.3, w - 0.2, d, 1.2, 'stoneD', { pri: 4 }); if (g === 1) k.box(x0, -0.2, ph + 3.5, w * 0.7, d * 0.7, 1.2, 'verd', { pri: 5 }); else if (g === 2) k.hip(x0, 0, ph + 3.5, w - 0.6, d - 0.4, H * 0.22, 'verd', 0.6); else { k.ell(x0, 0, ph + 3.5, [w * 0.8, d * 0.85, H * 0.26], g === 4 ? 'brassL' : 'verd', { pri: 5 }).ell(x0, 0, ph + 3.5 + H * 0.26, [0.8, 0.8, 1.2], 'runeband', { pri: 8 }); }
      k.box(x0, 0, 2.3, 1.3, 1, ph * 0.8, 'slab', { round: 0.3, pri: 3 }).box(x0, 1.1, 3.2, 0.5, 0.3, ph * 0.5, g > 2 ? 'runeband' : 'rune', { pri: 8 }); k.light = [x0, 1.1 * YS, 5 * ZS]; return k; },
    // a hearth under a slab on props -> a stone smithy bay, a great square chimney, a copper lean-to -> brass stack and rune lintel
    work(k, g, W, Dp, H, x0) { const w = W - 0.5, d = Dp - 0.6, ph = Math.min(H * 0.6, 7.5) + (g > 2 ? 1 : 0), pm = g === 0 ? 'timber' : g > 2 ? 'carvedL' : 'carved';
      for (const a of [-1, 1]) k.box(x0 + a * (w - 0.7), d - 0.6, 0, 0.8, 0.8, ph, pm, { pri: 3 }); k.box(x0, -d + 0.7, 0, w, 0.9, ph + 1.2, g === 0 ? 'slab' : pm, { round: g === 0 ? 0.4 : 0 });
      if (g === 0) k.box(x0, 0, ph, w + 0.5, d + 0.3, 1.1, 'slab', { round: 0.4, pri: 4 }); else { k.box(x0, 0, ph, w + 0.5, d + 0.4, 0.9, 'stoneD', { pri: 4 }).box(x0, -0.4, ph + 0.9, w * 0.74, d * 0.7, 1, g === 4 ? 'brassL' : 'verd', { pri: 5 }); if (g > 1) k.box(x0, -0.7, ph + 1.9, w * 0.42, d * 0.4, 0.9, g === 4 ? 'brassL' : 'verd', { pri: 5 }); }
      if (g) { const ch = ph + 4 + g; k.box(x0 - w + 1.3, -d + 1.2, 0, 1.4, 1.3, ch, 'stoneD', { pri: 6 }).box(x0 - w + 1.3, -d + 1.2, ch, 1.7, 1.6, 0.9, g > 2 ? 'brass' : 'stoneD', { pri: 7 }); k.smoke = [x0 - w + 1.3, (-d + 1.2) * YS, (ch + 1.5) * ZS]; }
      if (g > 2) k.box(x0, d - 0.3, ph - 0.7, w - 1.6, 0.3, 0.5, g === 4 ? 'runeband' : 'brass', { pri: 8 }); return k; },
    // a round hut of piled slabs -> a stone rotunda under a copper dome, a chimney -> a brass dome and a rune ring
    lodge(k, g, W, Dp, H, x0) { H = hc(H, g, 17); const r = Math.min(W * 0.8, Dp * 1.2), wh = H * 0.46, wall = g === 0 ? 'slab' : g > 2 ? 'carvedL' : 'carved';
      k.cyl(x0, 0, 0, r + 0.6, 1.6, 'stoneD').cyl(x0, 0, 0, r, wh, wall, g === 0 ? { round: 0.5 } : {});
      if (g === 0) k.cyl(x0, 0, wh, r * 0.8, 1.2, 'slab', { round: 0.5, pri: 3 }).cyl(x0, -0.3, wh + 1.2, r * 0.45, 1, 'slab', { round: 0.4, pri: 4 });
      else { k.cyl(x0, 0, wh, r + 0.6, 0.9, 'stoneD', { pri: 3 }).ell(x0, 0, wh + 0.9, [r * 0.94, r * 0.94 / YS, H * 0.3], g === 4 ? 'brassL' : 'verd', { pri: 4 }); if (g > 1) k.cyl(x0, 0, wh + 0.9 + H * 0.26, 1.1, 1.2, g > 2 ? 'brass' : 'stoneD', { pri: 6 }); if (g === 4) k.ell(x0, 0, wh + 2.6 + H * 0.26, [0.7, 0.7, 1], 'runeband', { pri: 8 });
        k.box(x0 + r * 0.7, -r * 0.5, wh * 0.6, 1.1, 1, wh * 0.9 + 3, 'stoneD', { pri: 5 }); k.smoke = [x0 + r * 0.7, -r * 0.5 * YS, (wh * 1.5 + 4) * ZS]; }
      k.arch(x0, r * 0.84 / YS, 0.2, 1.6, wh * 0.78, g ? 'door' : 'dark'); if (g) k.rwin(x0 - r * 0.62, r * 0.66 / YS, wh * 0.6, 0.8).rwin(x0 + r * 0.62, r * 0.66 / YS, wh * 0.6, 0.8); if (g > 2) k.cyl(x0, 0, wh * 0.9, r + 0.15, 0.5, 'runeband', { pri: 2 }); return k; },
    // a rune stone under a lean-to -> a tall narrow house of lore, steep copper gable, a great rune window -> twin brass finials
    study(k, g, W, Dp, H, x0) { H = hc(H, g, 22); const w = Math.min(W, Dp * 1.3) * 0.62, d = Dp * 0.7;
      if (g === 0) { k.box(x0, -0.6, 0, 1.6, 1.3, H, 'slab', { round: 0.3 }).box(x0, 0.8, H * 0.3, 0.5, 0.3, H * 0.4, 'rune', { pri: 8 }); for (const a of [-1, 1]) k.post(x0 + a * w, d * 0.6, 0, H * 0.55, 'timber', 0.6); k.box(x0, 0, H * 0.55, w + 0.6, d, 0.9, 'slab', { round: 0.3, pri: 4 }); return k; }
      const wall = g > 2 ? 'carvedL' : 'carved', wh = H * 0.54; k.box(x0, 0, 0, w + 0.5, d + 0.5, 2, 'stoneD').box(x0, 0, 0, w, d, wh, wall).roofY(x0, 0, wh, w, d, H * 0.44, g === 4 ? 'brassL' : 'verd', wall, 1);
      for (const a of [-1, 1]) { k.box(x0 + a * (w - 0.1), d - 0.1, 0, 0.9, 0.9, wh + 1, 'stoneD', { pri: 6 }); if (g > 2) k.box(x0 + a * (w - 0.1), d - 0.1, wh + 1, 1.1, 1.1, 0.8, 'brass', { pri: 7 }); }
      k.arch(x0, d, 0.2, 1.4, wh * 0.42, 'door').box(x0, d + 0.3, wh * 0.56, 0.7, 0.3, wh * 0.5 + (g > 1 ? 1.4 : 0), g > 2 ? 'runeband' : 'win', { pri: 7 }); if (g > 1) for (const a of [-0.6, 0.6]) k.win(x0 + a * w, d, wh * 0.62, 0.4, 1); return k; } };
  A.myrrin.trade = {
    // a fallen log with a row of shelf caps -> a long house under one arched cap on a colonnade of stalks
    long(k, g, W, Dp, H, x0) { const w = W - 0.8, d = Dp - 0.8; H = hc(H, g, 16);
      if (g < 3) { const r = Math.min(d * 0.8, 2.8 + g * 0.5); k.cap([x0 - w + r, 0, r], [x0 + w - r, 0, r], r, r * 0.9, 'log'); const n = 2 + g;
        for (let i = 0; i < n; i++) { const x = x0 - w * 0.62 + i * (w * 1.3 / Math.max(1, n - 1)), hh = 2.2 + ((i * 7) % 3) * 1.1 + g * 0.6; k.cyl(x, -0.3, r * 1.7, 0.7, hh, 'stalk', { pri: 3 }); cap(k, x, -0.3, r * 1.7 + hh + 0.8, 2.6 + (i & 1) * 0.7 + g * 0.2, 2.4, 1.6 + g * 0.2, ['capP', 'capM', 'capT'][i % 3], 2); }
        k.arch(x0 - w * 0.3, r * 0.92 / YS, 0, 1.1, r * 1.1, 'dark'); if (g) k.rwin(x0 + w * 0.3, r * 0.96 / YS, r * 1.05, 0.75); }
      else { const sh = H * 0.42; for (const a of [-0.9, -0.3, 0.3, 0.9]) k.cyl(x0 + a * w, d * 0.6, 0, 0.9, sh, 'stalk'); k.box(x0, -0.6, 0, w - 0.6, d * 0.6, sh, 'stalk', { round: 0.4 });
        k.cyl(x0, 0, sh - 0.3, w * 0.9, 0.9, 'gill', { pri: 4 }); k.ell(x0, 0, sh + 0.6, [w + 1, d + 1.4, H * 0.36], g === 4 ? 'capT' : 'capM', { pri: 5 }); for (const [x, y, z] of [[-0.5, 0.5, 0.3], [0.1, 0.9, 0.22], [0.55, 0.3, 0.3], [-0.1, -0.2, 0.36]]) k.ell(x0 + x * w, y * d, sh + 0.6 + H * z, [1.3, 1, 0.6], 'spot', { pri: 6 });
        k.arch(x0, d * 0.1, 0.2, 1.4, sh * 0.8, 'dark'); k.rwin(x0 - w * 0.5, d * 0.1, sh * 0.6, 0.7).rwin(x0 + w * 0.5, d * 0.1, sh * 0.6, 0.7); if (g === 4) for (const a of [-1, 1]) k.ell(x0 + a * (w + 0.4), d * 0.8, sh * 0.7, [0.6, 0.6, 0.6], 'spore', { pri: 8 }); }
      return k; },
    // a thin tall stalk, a pointed cap, a collar halfway -> two collars and drifting spores
    tower(k, g, W, Dp, H, x0) { H = hc(H, g, 23); const r = 1.3 + Math.min(g, 2) * 0.15, th = H * 0.74; k.cyl(x0, 0, 0, r + 0.7, 1.1, 'stalk', { round: 0.4 }).cyl(x0, 0, 0, r, th, 'stalk');
      if (g) cap(k, x0, 0, th * 0.5, r + 2.2, (r + 2) / YS * 0.8, 1.2, 'capP', 2); if (g > 2) cap(k, x0, 0, th * 0.76, r + 1.7, (r + 1.6) / YS * 0.8, 1.1, 'capT', 2);
      k.cyl(x0, 0, th - 0.4, r + 1.4, 0.6, 'gill', { pri: 5 }).cone(x0, 0, th, r + 2 + g * 0.2, H * 0.3, g === 4 ? 'capT' : 'capM', { pri: 5 }); k.ell(x0 - 1, r * 0.6, th + H * 0.08, [0.8, 0.6, 0.5], 'spot', { pri: 6 }).ell(x0 + 1.1, r * 0.5, th + H * 0.14, [0.7, 0.6, 0.45], 'spot', { pri: 6 });
      k.arch(x0, r * 0.84 / YS, 0.2, 0.9, 2.8, 'dark').rwin(x0, r * 0.9 / YS, th * 0.86, 0.6); if (g > 1) k.rwin(x0, r * 0.9 / YS, th * 0.3, 0.55); if (g === 4) k.ell(x0 - 3, 1, th * 0.9, [0.55, 0.55, 0.55], 'spore', { pri: 8 }).ell(x0 + 3.2, 0.5, th * 0.62, [0.55, 0.55, 0.55], 'spore', { pri: 8 }); return k; },
    // a ring of small caps around a pale glowing puffball -> a great moon-ball in a crown of teal caps
    sacred(k, g, W, Dp, H, x0) { H = hc(H, g, 20); const R = Math.min(W - 1.8, Dp * 1.1), Ry = R * 0.72 / YS, br = Math.min(R * 0.62, 2.6 + g * 0.55);
      k.cyl(x0, 0, 0, R + 1.2, 0.6, 'moss', { pri: 1 }); ringOf(5 + (g > 1 ? 1 : 0), R, Ry, 0.5, (x, y, i) => { const hh = 2.4 + g * 0.8 + (i % 2) * 1.2; k.cyl(x0 + x, y, 0, 0.7, hh, 'stalk'); cap(k, x0 + x, y, hh + 0.8, 2.1 + g * 0.2, 1.9, 1.4 + g * 0.15, g > 2 ? 'capT' : i & 1 ? 'capP' : 'capM', 2); });
      k.cyl(x0, 0, 0.6, br * 0.5, 1.2, 'stalk').cyl(x0, 0, 1.2, br * 0.8, 0.7, 'gill', { pri: 5 }).ell(x0, 0, 1.6 + br * 0.9, [br, br * 0.95, br * 0.9], g > 2 ? 'spore' : 'spot', { pri: 6 });
      if (g > 1) for (const [x, y, z] of [[-0.5, 0.6, 0.5], [0.4, 0.7, 1.1], [0.1, 0.8, 0.2]]) k.ell(x0 + x * br, y * br, 1.6 + br * 0.9 + z * br * 0.5, [0.7, 0.5, 0.5], g > 2 ? 'spot' : 'gill', { pri: 8 }); k.light = [x0, br * YS, (1.6 + br) * ZS]; return k; },
    // a hollow stump with bracket shelves -> a great stump, tiers of brackets, a glowing hollow
    work(k, g, W, Dp, H, x0) { const w = W - 0.6, d = Dp - 0.6, r = Math.min(w * 0.7, d * 1.1), sh = Math.min(H * 0.6, 7) + g * 0.5;
      k.cyl(x0, -0.3, 0, r + 0.6, 1.2, 'log', { round: 0.4 }).cyl(x0, -0.3, 0, r, sh, 'log'); k.cyl(x0, -0.3, sh, r * 0.8, 0.5, 'stalk', { pri: 3 }); k.arch(x0, (r * 0.84 - 0.3) / YS, 0, r * 0.52, sh * 0.72, 'dark');
      const br = (a, z, rx, m) => { k.cyl(x0 + a * (r + rx * 0.5), 0, z - 0.5, rx * 0.8, 0.4, 'gill', { pri: 5 }); k.ell(x0 + a * (r + rx * 0.5), 0, z, [rx, r * 0.8, 0.8], m, { pri: 6 }); };
      br(-1, sh * 0.72, 2.4 + g * 0.3, 'capP'); br(1, sh * 0.5, 2.1 + g * 0.3, 'capM'); if (g > 0) br(1, sh * 0.95, 1.9 + g * 0.2, 'capP'); if (g > 1) br(-1, sh * 0.36, 2, 'capT'); if (g > 2) { cap(k, x0 + r * 0.2, -0.3, sh + 2.6, r * 0.9, r * 0.8, 1.8, g === 4 ? 'capT' : 'capM', 3); k.cyl(x0 + r * 0.2, -0.3, sh, 0.8, 2, 'stalk', { pri: 4 }); }
      return k; },
    // a squat pale puffball with a little hat -> two fused puffballs, round windows, a teal hat
    lodge(k, g, W, Dp, H, x0) { H = hc(H, g, 17); const r = Math.min(W * 0.76, Dp * 1.15), bh = H * (0.34 + Math.min(g, 2) * 0.03);
      k.ell(x0, 0, bh * 0.92, [r, r / YS * 0.86, bh], 'stalk'); if (g > 2) k.ell(x0 + r * 0.8, 0.6, bh * 0.66, [r * 0.62, r * 0.6, bh * 0.7], 'stalk', { pri: 3 });
      k.cyl(x0, 0, bh * 1.7, r * 0.5, 0.5, 'gill', { pri: 5 }); cap(k, x0, 0, bh * 1.86 + 0.6, r * (0.62 + g * 0.06), r * 0.6, 1.6 + g * 0.3, g > 2 ? 'capT' : 'capP', 3); if (g > 1) { k.cyl(x0 - r * 0.9, 1.4, 0, 0.7, 3, 'stalk'); cap(k, x0 - r * 0.9, 1.4, 4, 2.2, 2, 1.5, 'capM', 2); }
      k.arch(x0, r * 0.82 / YS * 0.86, 0, 1.4, bh * 0.9, 'dark'); if (g) k.rwin(x0 - r * 0.56, r * 0.6 / YS, bh * 1.05, 0.8).rwin(x0 + r * 0.56, r * 0.6 / YS, bh * 1.05, 0.8); if (g > 2) k.rwin(x0 + r * 0.95, r * 0.5 / YS + 0.6, bh * 0.8, 0.6); return k; },
    // a morel: a stalk under a tall pitted cap -> a taller morel with lit pits and a smaller sister
    study(k, g, W, Dp, H, x0) { H = hc(H, g, 22); const r = Math.min(W, Dp * 1.25) * (0.3 + Math.min(g, 2) * 0.03), sh = H * 0.3;
      const morel = (x, y, s, m) => { k.cyl(x, y, 0, r * s + 0.5, 1, 'stalk', { round: 0.4 }).cyl(x, y, 0, r * s, sh * s + 1, 'stalk'); k.ell(x, y, sh * s + H * 0.34 * s, [r * s + 1.3, (r * s + 1.2) / YS * 0.86, H * 0.36 * s], m, { pri: 4 });
        for (const [dx, dz] of [[-0.45, 0.2], [0.4, 0.32], [-0.1, 0.46], [0.3, 0.1], [-0.3, -0.06]]) k.rwin(x + dx * (r * s + 1.3), y + (r * s + 0.9) / YS * 0.86, sh * s + H * (0.34 + dz * 0.6) * s, 0.5 * s, g > 0 ? 'gill' : 'dark'); };
      if (g > 2) morel(x0 + W * 0.36, 0.8, 0.62, 'capP'); morel(x0 - (g > 2 ? W * 0.14 : 0), 0, 1, g === 4 ? 'capT' : 'capM'); k.arch(x0 - (g > 2 ? W * 0.14 : 0), r * 0.84 / YS, 0.2, 1, sh * 0.7, 'dark'); return k; } };
  A.okari.trade = {
    // an upturned hull on stilts as a roof -> a long boathouse, plank walls -> lime walls, blue tiles, lamps
    long(k, g, W, Dp, H, x0) { const w = W - 0.6, d = Dp - 0.8, pz = 2.2 + Math.min(g, 2) * 0.9; H = hc(H, g, 15);
      for (const a of [-1, -0.33, 0.33, 1]) for (const b of [-1, 1]) k.stake(x0 + a * (w - 0.7), b * (d - 0.5), pz + 1.2, 0.7); k.box(x0, 0, pz, w + 0.4, d + 0.4, 0.8, 'deck', { pri: 3 });
      const wh = g === 0 ? 0 : H * 0.2 + g * 0.3, wall = g > 2 ? 'lime' : 'wallO'; if (g) k.box(x0, -0.2, pz + 0.8, w - 0.8, d - 0.6, wh, wall);
      if (g < 3) { const rr = (d - 0.2) * YS; k.cap([x0 - w + 1.4, -0.2, pz + 0.8 + wh], [x0 + w - 1.4, -0.2, pz + 0.8 + wh], rr, rr * 0.7, g === 0 ? 'reedD' : 'reed', { pri: 4 }); k.box(x0, -0.2, pz + 0.8 + wh + rr / ZS - 0.2, w - 0.6, 0.3, 0.6, 'pole', { pri: 6 }); }
      else for (const a of [-1, 0, 1]) { const bw = (w - 0.8) / 3; k.roofY(x0 + a * bw * 2, -0.2, pz + 0.8 + wh, bw, d - 0.6, H * 0.36, g === 4 ? 'bluetile' : 'reed', wall, 0.5); k.ell(x0 + a * bw * 2, d - 0.6, pz + 0.8 + wh + H * 0.36 * 0.8 + 0.4, [0.5, 0.5, 0.8], g === 4 ? 'gold' : 'pole', { pri: 8 }); }
      k.door(x0 - w * 0.3, d - 0.8, pz + 0.8, 1.4, Math.max(wh, 2.6) * 0.9, 'dark'); if (g) for (const a of [0.2, 0.6]) k.win(x0 + a * w, d - 0.8, pz + 0.8 + wh * 0.6, 0.6, 0.6);
      for (const a of [-0.8, 0.8]) k.cap([x0 - w * 0.3 + a, d + 2.4, 0], [x0 - w * 0.3 + a, d + 0.4, pz + 0.5], 0.34, 0.34, 'pole', { pri: 6 }); if (g > 2) for (let q = 0; q < 4; q++) k.ell(x0 - w + 1.4 + q * (w * 2 - 2.8) / 3, d + 0.4, pz + 2.6, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); return k; },
    // a tripod of poles with a crow's nest and a pennant -> a white round light tower with a lamp room under blue tiles
    tower(k, g, W, Dp, H, x0) { H = hc(H, g, 22);
      if (g < 3) { const th = H * 0.72, sp = 2.6 + g * 0.3; for (const [a, b] of [[-1, 0.8], [1, 0.8], [0, -1]]) k.cap([x0 + a * sp, b * sp * 0.8, 0], [x0 + a * 0.5, b * 0.4, th], 0.5, 0.36, 'pole', { pri: 3 }); k.box(x0, 0, th * 0.42, sp * 0.62, 0.3, 0.4, 'pole', { pri: 4 });
        k.cyl(x0, 0, th, 2.2 + g * 0.2, 0.7, 'deck', { pri: 5 }); ringOf(6, 2 + g * 0.2, 2 / YS, 0.5, (x, y) => k.box(x0 + x, y, th + 0.7, 0.25, 0.25, 1.3, 'pole', { pri: 6 })); if (g) k.cone(x0, 0, th + 2.6, 2.5, H * 0.14, 'reed', { pri: 7 }); if (g) k.box(x0, 0, th + 0.7, 0.3, 0.3, 2, 'pole', { pri: 6 });
        k.box(x0 + 2.4, 0.2, th + 0.9 + (g ? H * 0.14 + 1.4 : 1), 1.5, 0.3, 1, 'sail', { pri: 8 }).box(x0 + 0.8, 0.1, th + 0.7, 0.3, 0.3, (g ? H * 0.14 + 2.8 : 2.6), 'pole', { pri: 7 }); if (g === 2) k.ell(x0 - 1.2, 1.4, th + 1.6, [0.55, 0.5, 0.6], 'lamp', { pri: 9 }); }
      else { const th = H * 0.62, r = 2; k.cyl(x0, 0, 0, r + 1, 1.6, 'pole').cyl(x0, 0, 0, r, th * 0.5, 'lime').cyl(x0, 0, th * 0.5, r * 0.82, th * 0.5, 'lime').cyl(x0, 0, th * 0.48, r + 0.2, 0.6, g === 4 ? 'bluetile' : 'pole', { pri: 4 }).cyl(x0, 0, th, r + 0.9, 0.6, 'deck', { pri: 5 });
        k.cyl(x0, 0, th + 0.6, r * 0.62, H * 0.12, 'lamp', { pri: 6 }).cone(x0, 0, th + 0.6 + H * 0.12, r + 0.5, H * 0.16, g === 4 ? 'bluetile' : 'reed', { pri: 7 }).ell(x0, 0, th + 1 + H * 0.28, [0.6, 0.6, 0.9], g === 4 ? 'gold' : 'pole', { pri: 9 });
        k.arch(x0, r * 0.84 / YS, 0.2, 1, 3, 'dark').win(x0, r * 0.76 / YS, th * 0.72, 0.4, 0.8); k.light = [x0, 0, (th + 1.5) * ZS]; }
      return k; },
    // an open deck, four poles, a great pale shell under a reed cone -> a white plinth, a blue-tiled cone, gold and lamps
    sacred(k, g, W, Dp, H, x0) { H = hc(H, g, 20); const R = Math.min(W - 1.8, Dp * 1.1), Ry = R * 0.74 / YS, pz = 1.6 + Math.min(g, 2) * 0.7, ph = H * 0.42;
      ringOf(6, R, Ry, 0.3, (x, y) => k.stake(x0 + x, y, pz + 1, 0.7)); k.cyl(x0, 0, pz, R + 1, 0.8, 'deck', { pri: 2 }); if (g > 2) k.cyl(x0, 0, pz + 0.8, 2.6, 0.9, 'lime', { pri: 3 });
      ringOf(g ? 6 : 4, R - 0.4, Ry - 0.4, 0.52, (x, y) => k.box(x0 + x, y, pz + 0.8, 0.4, 0.4, ph, g > 2 ? 'lime' : 'pole', { pri: 3 }));
      if (g) k.cone(x0, 0, pz + 0.8 + ph, R + 0.8, H * 0.3, g === 4 ? 'bluetile' : 'reed', { pri: 5 }).ell(x0, 0, pz + 1.2 + ph + H * 0.3, [0.7, 0.7, 1.1], g > 2 ? 'gold' : 'pole', { pri: 8 }); else k.box(x0, 0, pz + 0.8 + ph, R * 0.9, Ry * 0.9, 0.5, 'reedD', { pri: 5 });
      k.ell(x0, 0, pz + 0.8 + 1.8 + Math.min(g, 2) * 0.2 + (g > 2 ? 0.9 : 0), [1.7 + Math.min(g, 2) * 0.2, 1.5, 1.6 + Math.min(g, 2) * 0.15], 'sailW', { pri: 4 }).ell(x0, 1.2, pz + 0.8 + 1.4, [0.9, 0.5, 0.8], 'lamp', { pri: 8 });
      if (g > 1) for (const a of [-1, 1]) k.ell(x0 + a * (R - 0.4), Ry * 0.6, pz + ph - 0.2, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); for (const a of [-0.8, 0.8]) k.cap([x0 + a, Ry + 3, 0], [x0 + a, Ry + 0.8, pz + 0.5], 0.34, 0.34, 'pole', { pri: 6 }); k.light = [x0, 1.2 * YS, (pz + 2.2) * ZS]; return k; },
    // a slipway shed: a deck, tall poles, a sail stretched as an awning -> a reed roof on white posts, lamps
    work(k, g, W, Dp, H, x0) { const w = W - 0.5, d = Dp - 0.6, pz = 1.4 + Math.min(g, 2) * 0.4, ph = Math.min(H * 0.55, 7) + (g > 2 ? 1 : 0), pm = g > 2 ? 'lime' : 'pole';
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { k.stake(x0 + a * (w - 0.6), b * (d - 0.5), pz + 1, 0.65); k.box(x0 + a * (w - 0.7), b * (d - 0.6), pz + 0.7, 0.4, 0.4, ph + (b < 0 ? 1.6 : 0), pm, { pri: 3 }); }
      k.box(x0, 0, pz, w + 0.3, d + 0.3, 0.7, 'deck', { pri: 3 });
      if (g < 2) { k.slab(x0, 0, pz + 0.7 + ph + 0.9, w + 0.3, d + 0.6, 0.3, g ? 'sail' : 'sailW', 0.35); k.box(x0, -d + 0.6, pz + 0.7 + ph + 1.5, w - 0.4, 0.3, 0.5, 'pole', { pri: 6 }); for (const q of [-0.45, 0.25]) k.slab(x0, q * d, pz + 0.7 + ph + 1.05 - q * d * 0.3, w + 0.35, 0.35, 0.35, 'pole', 0.4); }
      else { k.box(x0, 0, pz + 0.7 + ph, w + 0.2, d + 0.2, 0.6, 'pole', { pri: 4 }).hip(x0, 0, pz + 1.3 + ph, w, d, H * 0.34, g === 4 ? 'bluetile' : 'reed', 1.1); if (g > 2) k.ell(x0, 0, pz + 1.5 + ph + H * 0.34, [0.5, 0.5, 0.8], g === 4 ? 'gold' : 'pole', { pri: 8 }); } if (g > 1) k.ell(x0 + w - 0.8, d + 0.2, pz + ph - 0.6, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); if (g > 2) k.ell(x0 - w + 0.8, d + 0.2, pz + ph - 0.6, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); return k; },
    // a round hut on a round deck under a wide reed hat -> a white drum house, a veranda, a blue hat
    lodge(k, g, W, Dp, H, x0) { H = hc(H, g, 17); const r = Math.min(W * 0.72, Dp * 1.1), pz = 2 + Math.min(g, 2) * 0.9, wh = H * (g ? 0.3 : 0.12), wall = g > 2 ? 'lime' : 'wallO';
      ringOf(6, r + 0.6, (r + 0.4) / YS * 0.8, 0.3, (x, y) => k.stake(x0 + x, y, pz + 1, 0.7)); k.cyl(x0, 0, pz, r + 1.5, 0.8, 'deck', { pri: 3 }).cyl(x0, 0, pz + 0.8, r, wh, wall, { pri: 4 });
      k.cone(x0, 0, pz + 0.8 + wh, r + 1.9, H * (g ? 0.4 : 0.6), g === 4 ? 'bluetile' : g ? 'reed' : 'reedD', { pri: 5 }); k.ell(x0, 0, pz + 1 + wh + H * (g ? 0.4 : 0.6), [0.6, 0.6, 1], g > 2 ? 'gold' : 'pole', { pri: 8 });
      k.door(x0, r * 0.84 / YS, pz + 0.8, 1.3, Math.max(wh * 0.9, 2.4), 'dark'); if (g) k.rwin(x0 - r * 0.62, r * 0.66 / YS, pz + 0.8 + wh * 0.6, 0.7).rwin(x0 + r * 0.62, r * 0.66 / YS, pz + 0.8 + wh * 0.6, 0.7);
      if (g > 1) ringOf(5, r + 1.3, (r + 1.3) / YS * 0.8, 0.2, (x, y) => { if (y > 0) k.box(x0 + x, y, pz + 0.8, 0.25, 0.25, 1.4, 'pole', { pri: 6 }); }); for (const a of [-0.8, 0.8]) k.cap([x0 + a, r / YS + 3.4, 0], [x0 + a, r / YS + 1.2, pz + 0.5], 0.34, 0.34, 'pole', { pri: 6 }); if (g > 2) for (const a of [-1, 1]) k.ell(x0 + a * (r + 1), r * 0.5, pz + 0.8 + wh, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); return k; },
    // a narrow two-storey stilt house, a hip roof on each floor -> three white floors under blue tiles, a gold finial
    study(k, g, W, Dp, H, x0) { H = hc(H, g, 22); const w = Math.min(W, Dp * 1.3) * 0.6, d = Dp * 0.62, pz = 2 + Math.min(g, 2) * 0.8, wall = g > 2 ? 'lime' : 'wallO', roof = g === 4 ? 'bluetile' : 'reed', n = g === 0 ? 1 : g < 3 ? 2 : 3;
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.stake(x0 + a * (w - 0.5), b * (d - 0.4), pz + 1, 0.7); k.box(x0, 0, pz, w + 0.5, d + 0.5, 0.8, 'deck', { pri: 3 });
      let z = pz + 0.8, ww = w - 0.5, dd = d - 0.4; const fh = (H - pz) * (n === 1 ? 0.4 : n === 2 ? 0.24 : 0.18); for (let t = 0; t < n; t++) { k.box(x0, -0.2, z, ww, dd, fh, wall, { pri: 4 + t }).hip(x0, -0.2, z + fh, ww, dd, fh * (t === n - 1 ? 1.1 : 0.6), roof, 1.5 - t * 0.2); k.win(x0, dd - 0.2, z + fh * 0.6, 0.5, fh * 0.26); z += fh * 1.5; ww *= 0.78; dd *= 0.78; }
      k.ell(x0, -0.2, z + fh * 0.2, [0.6, 0.6, 1], g > 2 ? 'gold' : 'pole', { pri: 9 }); k.door(x0 - w * 0.4, d - 0.6, pz + 0.8, 1, fh * 0.8, 'dark'); for (const a of [-0.7, 0.7]) k.cap([x0 - w * 0.4 + a, d + 2.6, 0], [x0 - w * 0.4 + a, d + 0.6, pz + 0.5], 0.32, 0.32, 'pole', { pri: 6 }); return k; } };
  // ---------- the types, common to the four peoples
  function build(name) { const a = A[name], DS = {}, sh = a.shell, sig = a.sig, HH = a.H;
    const def = (type, make) => { DS[type] = { fp: D[type].fp, great: D[type].great, make(k) { const [W, Dp] = dims(D[type].fp); make(k, k.s, W, Dp); return k; } }; };
    const tf = n => (a.trade && a.trade[n]) ? (k, s, W, Dp, H, x0) => a.trade[n](k, k.s + k.lvl, W, Dp, H, x0 || 0) : sh, shLong = tf('long'), shTower = tf('tower'), shSacred = tf('sacred'), shWork = tf('work'), shLodge = tf('lodge'), shStudy = tf('study');
    def('house', (k, s, W, Dp) => { sh(k, s, W - 0.8, Dp - 0.3, HH[s]); if (s !== 1) sig(k, W + 0.2, Dp + 1.2, 0); else k.sack(W - 0.4, Dp + 1.6); });
    def('hall', (k, s, W, Dp) => { sh(k, s, W - 2.2, Dp - 0.6, HH[s] * 1.32); k.banner(-W - 0.3, 3, 0, 15 + s * 2, 'banner').banner(W - 3, 3, 0, 15 + s * 2, 'banner'); sig(k, -W + 2.6, Dp + 2.6, s); sig(k, W - 2.2, Dp + 2.6, s); if (s) k.fire(0, Dp + 4.2, 0, 1.4).ell(0, Dp + 4.2, 0.4, [2.6, 2, 0.8], 'stoneD'); });
    def('farm', (k, s, W, Dp) => { if (k.lvl) k.flag(W - 0.6, -Dp + 1, 0, 10 + k.lvl * 2); if (s === 0) { k.palisade(-W, -1, -Dp, 2.6); k.hay(-5.2, 1, 3.2, 4.4).hay(4.8, 2.4, 3.8, 5.6); sig(k, 0.2, 5.5, 0); } else { sh(k, s, W * 0.56, Dp - 0.4, HH[s] * 0.9, -W * 0.42); k.hay(W * 0.5, 0.5, 3.4, 5.2).hay(W * 0.72, 5.6, 2.4, 3.6).sack(W * 0.2, 6.4); k.palisade(W * 0.1, W, -Dp + 0.5, 2.6); } });
    def('warehouse', (k, s, W, Dp) => { shLong(k, s, W - 0.6, Dp - 1.6, HH[s] * 1.05); k.crate(-W + 1.2, Dp + 0.9, 0, 1.8).barrel(W - 1.5, Dp + 1.2).sack(W - 5, Dp + 1.8).sack(-W + 5, Dp + 2); if (s) k.crate(-W + 1.6, Dp + 0.7, 3.6, 1.3).barrel(W - 4.6, Dp + 0.4); });
    def('sawmill', (k, s, W, Dp) => { k.logs(-W * 0.52, 1.5, 3.4, 6); shWork(k, s, W * 0.5, Dp - 0.6, HH[s] * 0.9, W * 0.45); k.cyl(-W * 0.45, 7, 0, 1.6, 1.8, 'log').box(-W * 0.45 + 1, 6.9, 2, 0.4, 0.4, 3.2, 'timber', { rot: rotY(0.5) }).box(-W * 0.45 + 2.2, 6.9, 4.4, 1.1, 0.4, 0.8, 'iron', { pri: 4 }); });
    def('mine', (k, s, W, Dp) => { k.ell(0, -1, 0, [W, Dp + 1, [10, 11.5, 13][s]], 'rock').ell(-W * 0.55, 1, 0, [W * 0.5, Dp * 0.8, 6.5], 'rock', { pri: -1 }); k.arch(1, Dp * 0.86, 0, 2.6, 6.4, 'dark'); k.post(-1.8, Dp + 0.2, 0, 6.6, a.pal === 'slab' ? 'stoneD' : a.pal, 0.8).post(3.8, Dp + 0.2, 0, 6.6, a.pal === 'slab' ? 'stoneD' : a.pal, 0.8).beamX(1, Dp + 0.2, 6.2, 3.5, a.pal === 'slab' ? 'stoneD' : a.pal, 0.7);
      k.ell(-W + 2.4, Dp + 1.6, 0.9, [1.7, 1.3, 1.2], 'ore').ell(-W + 5, Dp + 2.4, 0.6, [1.1, 0.9, 0.9], 'ore').ell(W - 2.2, Dp + 1.8, 0.8, [1.6, 1.2, 1.1], 'rock'); if (s) sig(k, W - 1, Dp - 2, s); if (s === 2) k.crate(W - 4.6, Dp + 2.4, 0, 1.5); });
    def('market', (k, s, W, Dp) => { for (const x of [-W * 0.5, W * 0.5]) { k.post(x - 4.6, 5, 0, 7, a.pal === 'slab' ? 'timber' : a.pal).post(x + 4.6, 5, 0, 7, a.pal === 'slab' ? 'timber' : a.pal).post(x - 4.6, -3, 0, 10.5, a.pal === 'slab' ? 'timber' : a.pal).post(x + 4.6, -3, 0, 10.5, a.pal === 'slab' ? 'timber' : a.pal).slab(x, 1, 9.2, 5.6, 5.4, 0.42, x < 0 ? a.cover[s] : a.cover[(s + 1) % 3], 0.9); }
      k.crate(-W * 0.5 - 2, 2.5, 0, 1.7).sack(-W * 0.5 + 2.4, 3.4).barrel(W * 0.5 + 2.4, 2.4).crate(W * 0.5 - 2, 3, 0, 1.4); if (s > 0) sig(k, 0, Dp + 1, s); if (s === 2) k.banner(-W + 0.2, Dp + 1, 0, 13, 'banner'); });
    def('temple', (k, s, W, Dp) => { shSacred(k, s, W - (a.trade ? 2.2 : 3.4), Dp - 1.2, HH[s] * (s === 2 ? 1.22 : 1.45)); for (const a2 of [-1, 1]) { sig(k, a2 * (W - 1.6), Dp + 1.5, 2); if (s) sig(k, a2 * (W - 2.4), -Dp + 2, 1); } k.fire(0, Dp + 4, 0, 1.3 + s * 0.2).ell(0, Dp + 4, 0.4, [2.6, 2, 0.8], 'stoneD'); if (s === 2) k.box(0, Dp + 1.6, 0, 0.5, 0.4, 3, 'rune', { pri: 7 }); });
    def('barracks', (k, s, W, Dp) => { shLong(k, s, W - 3.4, Dp - 1, HH[s] * 1.05, -2.6); k.post(W - 5.6, 4.4, 0, 7).post(W - 1.2, 4.4, 0, 7).beamX(W - 3.4, 4.4, 6.4, 2.8, 'timber', 0.45); for (let i = -1; i <= 1; i++) k.box(W - 3.4 + i * 1.4, 4.7, 1, 0.35, 0.35, 5.4, i ? 'iron' : 'ironD', { pri: 7 }); k.banner(W - 1.4, -2, 0, 15, 'banner'); k.palisade(-W, -W + 5, Dp + 2.6, 4); if (s === 2) k.fire(W - 3.4, Dp + 3, 0, 1.2); });
    def('forge', (k, s, W, Dp) => { shWork(k, s, W * 0.6, Dp - 0.4, HH[s], -W * 0.36); k.box(W * 0.5, 2, 0, 2.6, 2.2, 3.6, 'stoneD').box(W * 0.5, 4.3, 0.6, 1.4, 0.4, 2.2, 'fire', { pri: 7 }); k.light = [W * 0.5, 4.3 * YS, 2 * ZS]; k.box(W * 0.5, -0.5, 3.6, 1.4, 1.5, 5 + s * 2, 'stoneD', { pri: 3 }); k.smoke = [W * 0.5, -0.5 * YS, (9.6 + s * 2) * ZS];
      k.box(W * 0.5 + 0.4, Dp + 1.4, 0, 1.1, 0.9, 1.6, 'log').box(W * 0.5 + 0.4, Dp + 1.4, 1.6, 2, 1, 1.3, 'ironD', { pri: 5 }); });
    def('watchtower', (k, s, W, Dp) => { shTower(k, s, W - 1.6, Dp - 1.4, HH[s] * (s === 2 ? 1.35 : 1.75)); if (s) k.flag(W - 1.2, 2, 0, 12 + s * 3); });
    def('port', (k, s, W, Dp) => { shWork(k, s, W * 0.5, Dp - 2.4, HH[s] * 0.92, -W * 0.45); k.box(W * 0.45, 4.5, 0, W * 0.5, 4, 1.3, 'plankH'); for (const x of [W * 0.02, W * 0.9]) for (const y of [1, 8]) k.stake(x, y, 4.4, 0.8); k.post(W * 0.45 - 3, 2.6, 1.3, 6.6).post(W * 0.45 + 3, 2.6, 1.3, 6.6).beamX(W * 0.45, 2.6, 7.4, 3.6, 'timber', 0.45); for (let i = -1; i <= 1; i++) k.ell(W * 0.45 + i * 1.8, 2.9, 5.6, [0.6, 0.5, 1.4], 'fish', { pri: 7 }); k.barrel(W * 0.2, 6.4, 1.3).crate(W * 0.72, 6.6, 1.3, 1.4); });
    def('tavern', (k, s, W, Dp) => { shLodge(k, s, W - 1.6, Dp - 0.4, HH[s] * 1.04, -1.4); k.barrel(W - 1.6, Dp + 0.6).barrel(W - 4.6, Dp + 1.6).barrel(W - 2.8, Dp + 1.2, 2.8); k.post(-W + 0.6, Dp + 2, 0, 9).sign(-W + 1.6, Dp + 0.6, 8.4); });
    def('library', (k, s, W, Dp) => { shStudy(k, s, W - 2.4, Dp - 1.4, HH[s] * 1.12, -2); for (const [x, y, h] of [[W - 1.6, 1, 7], [W - 3.4, Dp + 1.6, 5]]) k.box(x, y, 0, 1.3, 1.1, h + s, a.stone === 'pole' ? 'pole' : 'stoneL', { round: 0.3 }).box(x, y + 1.0, (h + s) * 0.5, 0.4, 0.3, 1.5, 'rune', { pri: 7 }); k.light = [W - 1.6, 2 * YS, 4.5 * ZS]; });
    def('pen', (k, s, W, Dp) => BL.pen(k, s + (k.lvl || 0), W, Dp, { post: a.pal === 'slab' ? 'timber' : a.pal, rail: a.pal === 'slab' ? 'brass' : a.pal, corner: a.stone, roof: [a.cover[0], a.roof, a.roof], trough: a.pal === 'slab' ? 'carved' : a.pal }));
    def('hospital', (k, s, W, Dp) => { if (a.trade) { shLodge(k, s, W * 0.66, Dp - 1.2, HH[s] * 1.04, -W * 0.3); shWork(k, s, W * 0.3, Dp * 0.62, HH[s] * 0.8, W * 0.66); } else sh(k, s, W - 1.4, Dp - 1.2, HH[s] * 1.04); k.post(W - 0.6, Dp + 1.4, 0, 9).ell(W - 0.6, Dp + 1.7, 7.6, [1.8, 0.4, 1.8], 'cloth', { pri: 7 }).box(W - 0.6, Dp + 2, 6.6, 0.45, 0.3, 2, 'tealc', { pri: 8 }).box(W - 0.6, Dp + 2, 7.25, 1.2, 0.3, 0.7, 'tealc', { pri: 8 }); k.sack(-W + 1.6, Dp + 1.6); });
    // ---------- chantier A.8: one building of their own per people (no shell: each is its own construction, in five stages)
    const own = (type, fp, make) => { DS[type] = { fp, make(k) { const [W, Dp] = dims(fp); make(k, k.s + k.lvl, W, Dp); return k; } }; };
    // elves — the heartgrove: one old tree in a ring of pale stones; it grows, blossoms, is hung with lanterns, then crowned with crystal
    if (name === 'elf') own('grove', [3, 3], (k, g, W, Dp) => { const th = 5.5 + g * 1.2, r = 1.5 + g * 0.28, nst = 6 + g;
      for (let i = 0; i < nst; i++) { const a2 = i / nst * 6.283 + 0.5, x = Math.cos(a2) * (W - 1.6), y = Math.sin(a2) * (Dp - 1.6) + 1.2; if (y < -1.5 && Math.abs(x) < 5) continue; k.box(x, y, 0, 0.75, 0.6, 1.9 + (i % 2) * 0.9 + g * 0.25, g >= 3 ? 'pearl' : 'whitew', { round: 0.3, pri: y > 2 ? 6 : 1 }); }
      k.cyl(0, 0, 0, r + 0.7, 1.4, 'bark').cyl(0, 0, 0, r, th, 'bark'); for (const s2 of [-1, 1]) k.cap([s2 * (r + 3.2), 2.6, 0], [s2 * (r - 0.4), 1, 3.4 + g * 0.3], 1.0, 0.7, 'bark', { pri: 3 }); k.cap([0.6, r + 3, 0], [0.2, r - 0.2, 2.6], 0.9, 0.6, 'bark', { pri: 3 });
      const cz = th + 2.6 + g * 0.5, cw = 5.6 + g * 0.8; k.ell(0, 0, cz, [cw, 5.2 + g * 0.6, 3.6 + g * 0.45], 'leaf', { pri: 4 }).ell(-cw * 0.62, 1.5, cz + 1.2, [cw * 0.52, 3.4, 2.5 + g * 0.2], 'leafL', { pri: 5 }).ell(cw * 0.66, 0.5, cz + 0.2, [cw * 0.46, 3.2, 2.3 + g * 0.2], 'leaf', { pri: 5 }).ell(cw * 0.2, -0.5, cz + 2.6 + g * 0.3, [cw * 0.5, 3, 2.2 + g * 0.2], 'leafL', { pri: 6 }).ell(-cw * 0.1, 4.2, cz - 1.6, [cw * 0.5, 2.2, 1.7], 'leaf', { pri: 6 });
      if (g >= 1) { for (const [x, y, z] of [[-cw * 0.7, 4.6, cz + 0.2], [cw * 0.3, 6, cz - 1.2], [cw * 0.85, 3.4, cz - 0.6], [-cw * 0.1, 3.4, cz + 2.6], [-cw * 0.3, 6.2, cz - 2]].slice(0, 1 + g)) k.ell(x, y, z, [0.9, 0.7, 0.8], 'bloom', { pri: 8 }); k.ell(0, Dp - 2.4, 0.3, [2.4, 1.5, 0.5], 'crystal', { pri: 2 }).ell(0, Dp - 2.4, 0.2, [3, 2, 0.4], 'whitew', { pri: 1 }); k.light = [0, (Dp - 2.4) * YS, 1.2 * ZS]; }
      else k.sack(3.2, Dp - 2);
      if (g >= 2) for (const s2 of [-1, 1]) { k.box(s2 * (3.6 + g * 0.3), 5, th * 0.55, 0.22, 0.22, th * 0.4 + 1, 'bark', { pri: 7 }); k.ell(s2 * (3.6 + g * 0.3), 5, th * 0.45, [0.95, 0.8, 1.05], 'lantern', { pri: 9 }); }
      if (g >= 3) { k.cyl(-W + 2.6, Dp - 1.6, 0, 0.9, 5, 'pearl', { pri: 6 }).ell(-W + 2.6, Dp - 1.6, 6, [0.8, 0.8, 1.5], 'crystal', { pri: 8 }); k.cyl(W - 2.6, Dp - 1.6, 0, 0.9, 5, 'pearl', { pri: 6 }).ell(W - 2.6, Dp - 1.6, 6, [0.8, 0.8, 1.5], 'crystal', { pri: 8 }); }
      if (g >= 4) { k.ell(0, 0.4, cz + 4.4 + g * 0.5, [1.1, 1, 2], 'crystal', { pri: 9 }); k.ell(-2.2, 1, cz + 3.6, [0.7, 0.6, 1.2], 'crystal', { pri: 9 }).ell(2.4, 0.6, cz + 3.4, [0.7, 0.6, 1.2], 'crystal', { pri: 9 }); } });
    // dwarves — the delve: a shaft under a headframe and its wheel, an ore cart on rails, a spoil heap; timber, then iron and copper, then brass and runes
    if (name === 'dwarf') own('delve', [3, 2], (k, g, W, Dp) => { const hh = 8.5 + g * 1.3, fm = g === 0 ? 'timber' : g < 3 ? 'ironD' : 'brass', wm = g < 3 ? 'ironD' : 'brassL';
      k.box(0, 0.4, 0, 4.9, 3.6, 2.2 + (g > 1 ? 0.6 : 0), g > 1 ? 'carved' : 'slab', { round: 0.2 }).box(0, 0.6, 2.2 + (g > 1 ? 0.6 : 0), 3.4, 2.3, 0.3, 'dark', { pri: 3 });
      k.post(-4.3, 0.8, 0, hh, fm, 0.85).post(4.3, 0.8, 0, hh, fm, 0.85).beamX(0, 0.8, hh - 0.5, 5, fm, 0.8); k.cap([-7.4, 3.6, 0], [-4.3, 0.8, hh * 0.72], 0.5, 0.5, fm, { pri: 4 }).cap([7.4, 3.6, 0], [4.3, 0.8, hh * 0.72], 0.5, 0.5, fm, { pri: 4 });
      const wz = hh + 2.2, wl = g === 0 ? 'log' : g < 3 ? 'iron' : 'brassL'; k.ell(0, 1.4, wz, [2.7, 0.5, 2.7], wl, { pri: 6 }).ell(0, 1.9, wz, [1.75, 0.4, 1.75], 'dark', { pri: 7 }).box(0, 2.1, wz - 0.25, 2.5, 0.2, 0.5, wl, { pri: 8 }).box(0, 2.1, wz - 2.5, 0.25, 0.2, 5, wl, { pri: 8 }).ell(0, 2.3, wz, [0.65, 0.3, 0.65], 'stoneD', { pri: 9 });
      k.box(0, 1.1, 2.6, 0.18, 0.18, hh - 2.2, 'timber', { pri: 5 });
      if (g >= 1) k.box(0, 0.2, hh + 5.2, 3.6, 2.2, 0.8, 'verd', { pri: 5 }); if (g >= 2) k.box(0, 0.1, hh + 6, 2.2, 1.4, 0.7, g >= 4 ? 'brassL' : 'verd', { pri: 5 });
      k.box(5.2, Dp - 0.6, 0, 4.2, 0.25, 0.3, 'ironD', { pri: 4 }).box(5.2, Dp + 0.8, 0, 4.2, 0.25, 0.3, 'ironD', { pri: 4 }); k.box(6.6, Dp + 0.1, 0.7, 1.9, 1.2, 1.5, g >= 3 ? 'brass' : 'timber', { pri: 6 }).ell(6.6, Dp + 0.1, 2.5, [1.6, 1.0, 0.9], 'ore', { pri: 7 }).ell(5.6, Dp + 1.2, 0.5, [0.55, 0.3, 0.55], 'dark', { pri: 8 }).ell(7.7, Dp + 1.2, 0.5, [0.55, 0.3, 0.55], 'dark', { pri: 8 });
      k.ell(-6.9, Dp - 1.6, 0.6, [2.4, 1.7, 1.5 + g * 0.2], 'slab').ell(-5.2, Dp + 0.2, 0.4, [1.3, 1, 0.9], 'ore', { pri: 5 }).ell(-8.2, Dp + 0.4, 0.3, [1, 0.8, 0.7], 'slab', { pri: 5 });
      if (g >= 1) { k.box(-4.3, 1.7, hh * 0.45, 0.45, 0.3, 0.95, 'rune', { pri: 9 }); k.light = [-4.3, 1.7 * YS, hh * 0.45 * ZS]; }
      if (g >= 3) k.box(0, 4.1, 1.1, 4.4, 0.2, 0.55, 'runeband', { pri: 9 }); if (g >= 4) { sig(k, W - 1.2, -Dp + 1.6, 2); sig(k, -W + 1.2, -Dp + 1.6, 2); } });
    // myrrin — the spore bed: a mound of moss between two logs where mushrooms are sown in rows under a mother mushroom
    if (name === 'myrrin') own('sporebed', [3, 2], (k, g, W, Dp) => { k.ell(0, 1, 0, [W - 0.8, Dp - 0.6, 1.3], 'moss'); k.cap([-W + 1, Dp + 0.6, 0.6], [W - 1, Dp + 0.6, 0.6], 0.75, 0.75, 'log', { pri: 6 }).cap([-W + 1.4, -Dp + 2, 0.6], [W - 1.4, -Dp + 2, 0.6], 0.7, 0.7, 'log', { pri: 1 });
      const nm = 4 + Math.min(3, g); for (let row = 0; row < 2; row++) for (let i = 0; i < nm; i++) { const x = -W + 2.6 + i * (W * 2 - 5.2) / (nm - 1) + (row ? 1.1 : 0), y = row ? 3.6 : 0.2, h = 1.3 + ((i * 7 + row * 3) % 3) * 0.7 + g * 0.35, m = (i + row) % 3 === 0 ? 'capT' : (i + row) % 2 ? 'capP' : 'capM';
          if (g >= 1 && row === 0 && i === 0) continue; k.cyl(x, y, 1, 0.42, h, 'stalk', { pri: 3 + row * 2 }); if (g >= 2) k.cyl(x, y, 1 + h - 0.1, 1.05, 0.35, 'gill', { pri: 4 + row * 2 }); k.ell(x, y, 1.4 + h, [1.45 + (i % 2) * 0.25, 1.25, 0.85], m, { pri: 5 + row * 2 }); }
      if (g >= 1) { const mh = 5 + g * 1.4; k.cyl(-W + 2.8, -0.6, 0, 1.0, mh, 'stalk'); cap(k, -W + 2.8, -0.6, mh + 1.2, 3.3 + g * 0.35, 3.1 + g * 0.3, 2 + g * 0.25, g >= 3 ? 'capT' : 'capM', 3); k.light = [-W + 2.8, 1.5 * YS, mh * ZS]; }
      else k.sack(W - 1.6, Dp + 1.6);
      if (g >= 2) { k.post(W - 3.8, -1.6, 0, 6.2, 'log', 0.45).post(W - 0.8, -1.6, 0, 6.2, 'log', 0.45).beamX(W - 2.3, -1.6, 5.8, 2, 'log', 0.4); for (let i = 0; i < 3; i++) k.ell(W - 3.3 + i, -1.3, 4.6, [0.45, 0.4, 0.6], i === 1 ? 'capT' : 'capP', { pri: 7 }); }
      if (g >= 3) for (const [x, y, z] of [[-2, 2, 6.5], [3, 1, 8], [-5, 4, 4.6], [5.5, 4, 5.4], [0.5, 3.4, 10]].slice(0, g === 3 ? 3 : 5)) k.ell(x, y, z, [0.5, 0.5, 0.5], 'spore', { pri: 9 });
      if (g >= 4) { k.cyl(W - 2.4, 1.6, 0, 0.8, 7.4, 'stalk', { pri: 6 }); cap(k, W - 2.4, 1.6, 8.4, 2.9, 2.7, 1.9, 'capP', 3); } });
    // okari — the tide house: a deck on stilts over the shore, racks of drying fish, nets, glass floats, a ladder down to the water
    if (name === 'okari') own('tidehouse', [3, 2], (k, g, W, Dp) => { const pz = 2.6 + Math.min(2, g) * 0.9;
      for (const [a2, b2] of [[-1, 1], [1, 1], [-1, -1], [1, -1], [0, 1]]) k.stake(a2 * (W - 0.9), b2 * (Dp - 0.6), pz + 1.3, 0.75); k.box(0, 0, pz, W + 0.4, Dp + 0.4, 0.85, 'deck', { pri: 3 });
      const hx = -W * 0.48, hw = W * 0.42, hd = Dp - 1.2;
      if (g === 0) k.roofY(hx, -0.2, pz + 0.85, hw, hd, 6.4, 'reed', 'dark', 0.9);
      else { const wh = 3.2 + Math.min(3, g) * 0.5; k.box(hx, -0.3, pz + 0.85, hw - 0.5, hd - 0.3, wh, g >= 4 ? 'lime' : 'wallO', { pri: 4 }); if (g >= 4) k.hip(hx, -0.3, pz + 0.85 + wh, hw - 0.5, hd - 0.3, 4.6, 'bluetile', 1.7).ell(hx, -0.3, pz + wh + 5.8, [0.6, 0.6, 0.9], 'gold', { pri: 9 }); else k.roofY(hx, -0.3, pz + 0.85 + wh, hw - 0.5, hd - 0.3, 5 + g * 0.5, 'reed', 'wallO', 1.5);
        k.door(hx, hd - 0.5, pz + 0.85, 1.2, wh * 0.86, 'dark'); if (g >= 2) k.win(hx - hw * 0.55, hd - 0.5, pz + 0.85 + wh * 0.6, 0.6, 0.6); }
      const rx = W * 0.5, rh = 4.6 + Math.min(2, g) * 0.6; k.post(rx - 3.4, 1.4, pz + 0.85, rh, 'pole', 0.4).post(rx + 3.4, 1.4, pz + 0.85, rh, 'pole', 0.4).beamX(rx, 1.4, pz + 0.85 + rh - 0.4, 3.8, 'pole', 0.4);
      const nf = 3 + Math.min(2, g); for (let i = 0; i < nf; i++) k.ell(rx - 2.6 + i * 5.2 / (nf - 1), 1.7, pz + 0.85 + rh - 1.7, [0.5, 0.4, 1.15], 'fish', { pri: 7 });
      if (g >= 2) { k.post(rx - 3.4, -2.6, pz + 0.85, rh + 1, 'pole', 0.4).post(rx + 3.4, -2.6, pz + 0.85, rh + 1, 'pole', 0.4).beamX(rx, -2.6, pz + 0.85 + rh + 0.6, 3.8, 'pole', 0.4); for (let i = 0; i < 4; i++) k.ell(rx - 2.4 + i * 1.6, -2.3, pz + 0.85 + rh - 0.7, [0.45, 0.4, 1.1], 'fish', { pri: 5 }); }
      k.box(W - 0.4, Dp + 0.5, pz * 0.35, 0.2, 0.3, pz * 0.9, 'rope', { pri: 6 }).box(W - 2.6, Dp + 0.55, pz * 0.3, 2.3, 0.15, pz * 0.72, 'sailW', { pri: 5 });
      for (const a2 of [-0.8, 0.8]) k.cap([a2 - 1.5, Dp + 2.8, 0], [a2 - 1.5, Dp + 0.5, pz + 0.6], 0.34, 0.34, 'pole', { pri: 6 }); for (let q = 1; q <= 2; q++) k.box(-1.5, Dp + 0.7 + (3 - q) * 0.7, pz * q / 3, 1.0, 0.25, 0.3, 'pole', { pri: 7 });
      if (g >= 1) { for (const [x, y] of [[3.4, Dp + 2.2], [5.2, Dp + 2.8], [7.4, Dp + 2]].slice(0, 1 + Math.min(2, g))) k.ell(x, y, 0.75, [0.8, 0.75, 0.8], 'lamp', { pri: 8 }); k.light = [4.4, (Dp + 2.4) * YS, 1.2 * ZS]; }
      if (g >= 3) { k.box(W + 0.1, -1, 0, 0.5, 0.55, 15 + g, 'pole', { pri: 7 }).box(W - 1.9, -0.9, 10 + g, 1.9, 0.35, 4.6, 'sail', { pri: 8 }); k.ell(1.2, 2.8, pz + 1.3, [1.3, 1, 0.7], 'lime', { pri: 6 }).ell(1.5, 2.9, pz + 1.9, [0.5, 0.5, 0.45], 'lamp', { pri: 8 }); }
      if (g >= 4) for (let q = 0; q < 4; q++) k.ell(-W + 2 + q * (W * 2 - 4) / 3, Dp + 0.5, pz + 3.4 - Math.sin(q / 3 * Math.PI) * 1.1, [0.5, 0.45, 0.55], 'lamp', { pri: 9 }); });
    // types that do not use the shell get one small high-stage shell beside them, so that stages 4 and 5 differ everywhere
    for (const t of ['mine', 'market']) { const base = DS[t].make; DS[t].make = k => { base(k); if (k.lvl) { const [W, Dp] = dims(D[t].fp); a.shellHi(k, k.lvl, W * 0.3, Dp * 0.42, 9.5, t === 'mine' ? W * 0.62 : 0); } return k; }; }
    const wm = { elf: ['bark', 'bark', 'whitew'], dwarf: ['slab', 'carved', 'carvedL'], myrrin: ['stalk', 'stalk', 'stalk'], okari: ['pole', 'pole', 'wallO'] }[name], tm = { elf: 'leaf', dwarf: 'verd', myrrin: 'capM', okari: 'reed' }[name];
    def('wall', (k, s) => { if (name === 'dwarf' || s === 2) { k.box(0, 0, 0, 3.1, 3, 8 + s, wm[s]).box(0, 0, 8 + s, 3.2, 3.2, 1, name === 'dwarf' ? 'stoneD' : tm, { pri: 3 }); } else { for (const x of [-2.2, -0.75, 0.75, 2.2]) k.stake(x, 0, 8.5 + s * 1.5 + (x * x > 2 ? 0 : 1), 0.9); k.box(0, 0.9, 5, 3, 0.4, 0.8, wm[s] === 'stalk' ? 'capP' : 'timber', { pri: 3 }); }
      if (name === 'myrrin') k.ell(0, 0, 10.5 + s * 1.5, [3.3, 3, 1.6], 'capM', { pri: 5 }); if (name === 'elf' && s < 2) k.ell(0, 0, 10 + s * 1.5, [3.2, 2.8, 1.5], 'leaf', { pri: 5 });  hiTop(k, 12 + s); });
    const hiTop = (k, z) => { if (!k.lvl) return; const g = { elf: 'crystal', dwarf: 'runeband', myrrin: 'spore', okari: 'lamp' }[name]; k.box(0, 0, z, 3.3, 3.3, 1 + k.lvl * 0.6, wm[2], { pri: 7 }).ell(0, 0.6, z + 2 + k.lvl * 0.8, [0.8 + k.lvl * 0.15, 0.8, 1 + k.lvl * 0.3], k.lvl === 2 ? g : 'gold', { pri: 9 }); };
    def('gate', (k, s) => { if (name === 'dwarf' || s === 2) { k.box(0, 0, 0, 3.1, 3, 10.5 + s, wm[s]).box(0, 0, 10.5 + s, 3.2, 3.2, 1, name === 'dwarf' ? 'stoneD' : tm, { pri: 3 }).arch(0, 3, 0, 1.9, 7.5, 'door'); } else { k.stake(-2.4, 0, 11 + s, 1).stake(2.4, 0, 11 + s, 1).box(0, 0, 8, 3, 0.8, 1.4, 'timber', { pri: 4 }).door(0, 0, 0, 1.7, 7.6, 'door'); }
      if (name === 'myrrin') k.ell(0, 0, 12.5 + s, [3.5, 3.1, 1.8], 'capP', { pri: 5 }); if (name === 'elf') k.ell(0, 0, 12 + s, [3.3, 2.9, 1.6], 'leafL', { pri: 5 }); if (name === 'okari') k.box(0, 0.5, 9.5 + s, 2.6, 0.4, 1.6, 'sail', { pri: 6 });  hiTop(k, 14.5 + s); });
    return DS; }
  for (const n of Object.keys(A)) DSETS[n] = build(n);
};
