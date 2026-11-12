// Architecture of the four provisional peoples (pipeline A, same kit as tools/art/buildings.js). Each people has its own SHELL in
// three stages (a way of building, not a recolour) and its own signature prop; a building type = the shell sized for its
// footprint + the props that tell its trade. Flagged provisional in src/data/peoples.json: looked at on sheets
// (shots/buildings-elf.png, -dwarf, -myrrin, -okari and their silhouettes), not patched by hand.
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
    m.whitew = mat('sand', [3, 4, 5], { ink: 'earth' }); m.spire = mat('teal', [1, 2, 3, 4], { extra: { th: [-0.1, 0.35, 0.82] } }); m.bloom = mat('pink', [3, 4, 5]); return m; };
  SETS.dwarf = () => { const m = SETS.human(); m.slab = P(mat('stone', [1, 2, 3, 4]), PAT.rock); m.carved = P(mat('stone', [2, 3, 4]), PAT.stone); m.carvedL = P(mat('stone', [3, 4, 5]), PAT.stone); m.verd = mat('teal', [2, 3, 4, 5], { extra: { th: [-0.1, 0.35, 0.82] } }); m.brass = mat('fire', [1, 2, 3]); return m; };
  SETS.myrrin = () => { const m = SETS.human(); m.stalk = mat('sand', [3, 4, 5], { ink: 'magic' }); m.capM = P(mat('magic', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), spots); m.capP = P(mat('pink', [2, 3, 4, 5], { extra: { th: [-0.15, 0.3, 0.86] } }), spots);
    m.gill = Object.assign(glow([2, 3, 4]), { th: [-2, 0.4] }); m.spot = mat('ice', [4, 5], { ink: 'magic' }); m.moss = mat('swamp', [2, 3, 4]); return m; };
  SETS.okari = () => { const m = SETS.human(); m.reed = P(mat('sand', [1, 2, 3, 4], { extra: { th: [-0.15, 0.3, 0.86] } }), PAT.thatch); m.reedD = P(mat('earth', [2, 3, 4]), PAT.thatch); m.pole = mat('earth', [1, 2, 3]); m.deck = P(mat('sand', [1, 2, 3], { ink: 'earth' }), PAT.planksH);
    m.wallO = P(mat('sand', [2, 3, 4], { ink: 'earth' }), PAT.planksV); m.sail = team([2, 3, 4]); m.sailW = mat('ice', [3, 4, 5], { ink: 'stone' }); m.rope = mat('fire', [1, 2, 3]); return m; };
  // ---------- per people: shell(k, s, W, Dp, H, x0), sig(k, x, y, s) signature prop, H heights per stage, cover = market cloth
  const A = {};
  A.elf = { H: [9, 14, 19], roof: 'leaf', stone: 'bark', pal: 'bark', cover: ['leaf', 'leafL', 'banner'],
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0;
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
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0;
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
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; const r = Math.min(W, Dp * 1.25) * (s === 2 ? 0.46 : 0.52), sh = H * (s === 2 ? 0.6 : 0.5);
      k.cyl(x0, 0, 0, r + 0.7, 1.3, 'stalk', { round: 0.4 }).cyl(x0, 0, 0, r, sh + 1, 'stalk'); cap(k, x0, 0, sh + H * 0.14, W * (s ? 1.05 : 0.95), Dp * 1.15, H * (s === 2 ? 0.3 : 0.4), 'capM', s === 0 ? 3 : 5);
      k.arch(x0, r * 0.82 / YS, 0.2, 1.4, sh * 0.62, 'dark'); if (s) k.rwin(x0 - r * 0.6, r * 0.62 / YS, sh * 0.62, 0.8).rwin(x0 + r * 0.6, r * 0.62 / YS, sh * 0.62, 0.8);
      if (s === 2) { k.cyl(x0 + W * 0.2, -0.5, sh + H * 0.2, r * 0.5, H * 0.34, 'stalk', { pri: 5 }); cap(k, x0 + W * 0.2, -0.5, sh + H * 0.56, W * 0.56, Dp * 0.62, H * 0.2, 'capP', 3); k.rwin(x0 + W * 0.2, r * 0.3 / YS, sh + H * 0.42, 0.6);
        k.cyl(x0 - W * 0.82, 2, 0, 0.9, 3.4, 'stalk'); cap(k, x0 - W * 0.82, 2, 4.4, 2.6, 2.6, 2, 'capP', 2); }
      return k; },
    sig(k, x, y, s) { k.cyl(x, y, 0, 0.6, 2.4 + s * 0.6, 'stalk'); k.ell(x, y, 3 + s * 0.6, [1.9, 1.7, 1.3], 'capP', { pri: 4 }).cyl(x, y, 2.2 + s * 0.6, 1.5, 0.5, 'gill', { pri: 5 }); return k; } };
  A.okari = { H: [9, 13, 16.5], roof: 'reed', stone: 'pole', pal: 'pole', cover: ['reedD', 'sailW', 'sail'],
    shell(k, s, W, Dp, H, x0) { x0 = x0 || 0; const pz = [2.6, 4.4, 5.2][s];
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
  // ---------- the types, common to the four peoples
  function build(name) { const a = A[name], DS = {}, sh = a.shell, sig = a.sig, HH = a.H;
    const def = (type, make) => { DS[type] = { fp: D[type].fp, great: D[type].great, provisional: true, make(k) { const [W, Dp] = dims(D[type].fp); make(k, k.s, W, Dp); return k; } }; };
    def('house', (k, s, W, Dp) => { sh(k, s, W - 0.8, Dp - 0.3, HH[s]); if (s !== 1) sig(k, W + 0.2, Dp + 1.2, 0); else k.sack(W - 0.4, Dp + 1.6); });
    def('hall', (k, s, W, Dp) => { sh(k, s, W - 2.2, Dp - 0.6, HH[s] * 1.32); k.banner(-W - 0.3, 3, 0, 15 + s * 2, 'banner').banner(W - 3, 3, 0, 15 + s * 2, 'banner'); sig(k, -W + 2.6, Dp + 2.6, s); sig(k, W - 2.2, Dp + 2.6, s); if (s) k.fire(0, Dp + 4.2, 0, 1.4).ell(0, Dp + 4.2, 0.4, [2.6, 2, 0.8], 'stoneD'); });
    def('farm', (k, s, W, Dp) => { if (s === 0) { k.palisade(-W, -1, -Dp, 2.6); k.hay(-5.2, 1, 3.2, 4.4).hay(4.8, 2.4, 3.8, 5.6); sig(k, 0.2, 5.5, 0); } else { sh(k, s, W * 0.56, Dp - 0.4, HH[s] * 0.9, -W * 0.42); k.hay(W * 0.5, 0.5, 3.4, 5.2).hay(W * 0.72, 5.6, 2.4, 3.6).sack(W * 0.2, 6.4); k.palisade(W * 0.1, W, -Dp + 0.5, 2.6); } });
    def('warehouse', (k, s, W, Dp) => { sh(k, s, W - 0.6, Dp - 1.6, HH[s] * 1.05); k.crate(-W + 1.2, Dp + 0.9, 0, 1.8).barrel(W - 1.5, Dp + 1.2).sack(W - 5, Dp + 1.8).sack(-W + 5, Dp + 2); if (s) k.crate(-W + 1.6, Dp + 0.7, 3.6, 1.3).barrel(W - 4.6, Dp + 0.4); });
    def('sawmill', (k, s, W, Dp) => { k.logs(-W * 0.52, 1.5, 3.4, 6); sh(k, s, W * 0.5, Dp - 0.6, HH[s] * 0.9, W * 0.45); k.cyl(-W * 0.45, 7, 0, 1.6, 1.8, 'log').box(-W * 0.45 + 1, 6.9, 2, 0.4, 0.4, 3.2, 'timber', { rot: rotY(0.5) }).box(-W * 0.45 + 2.2, 6.9, 4.4, 1.1, 0.4, 0.8, 'iron', { pri: 4 }); });
    def('mine', (k, s, W, Dp) => { k.ell(0, -1, 0, [W, Dp + 1, [10, 11.5, 13][s]], 'rock').ell(-W * 0.55, 1, 0, [W * 0.5, Dp * 0.8, 6.5], 'rock', { pri: -1 }); k.arch(1, Dp * 0.86, 0, 2.6, 6.4, 'dark'); k.post(-1.8, Dp + 0.2, 0, 6.6, a.pal === 'slab' ? 'stoneD' : a.pal, 0.8).post(3.8, Dp + 0.2, 0, 6.6, a.pal === 'slab' ? 'stoneD' : a.pal, 0.8).beamX(1, Dp + 0.2, 6.2, 3.5, a.pal === 'slab' ? 'stoneD' : a.pal, 0.7);
      k.ell(-W + 2.4, Dp + 1.6, 0.9, [1.7, 1.3, 1.2], 'ore').ell(-W + 5, Dp + 2.4, 0.6, [1.1, 0.9, 0.9], 'ore').ell(W - 2.2, Dp + 1.8, 0.8, [1.6, 1.2, 1.1], 'rock'); if (s) sig(k, W - 1, Dp - 2, s); if (s === 2) k.crate(W - 4.6, Dp + 2.4, 0, 1.5); });
    def('market', (k, s, W, Dp) => { for (const x of [-W * 0.5, W * 0.5]) { k.post(x - 4.6, 5, 0, 7, a.pal === 'slab' ? 'timber' : a.pal).post(x + 4.6, 5, 0, 7, a.pal === 'slab' ? 'timber' : a.pal).post(x - 4.6, -3, 0, 10.5, a.pal === 'slab' ? 'timber' : a.pal).post(x + 4.6, -3, 0, 10.5, a.pal === 'slab' ? 'timber' : a.pal).slab(x, 1, 9.2, 5.6, 5.4, 0.42, x < 0 ? a.cover[s] : a.cover[(s + 1) % 3], 0.9); }
      k.crate(-W * 0.5 - 2, 2.5, 0, 1.7).sack(-W * 0.5 + 2.4, 3.4).barrel(W * 0.5 + 2.4, 2.4).crate(W * 0.5 - 2, 3, 0, 1.4); if (s > 0) sig(k, 0, Dp + 1, s); if (s === 2) k.banner(-W + 0.2, Dp + 1, 0, 13, 'banner'); });
    def('temple', (k, s, W, Dp) => { sh(k, s, W - 3.4, Dp - 1.2, HH[s] * (s === 2 ? 1.22 : 1.45)); for (const a2 of [-1, 1]) { sig(k, a2 * (W - 1.6), Dp + 1.5, 2); if (s) sig(k, a2 * (W - 2.4), -Dp + 2, 1); } k.fire(0, Dp + 4, 0, 1.3 + s * 0.2).ell(0, Dp + 4, 0.4, [2.6, 2, 0.8], 'stoneD'); if (s === 2) k.box(0, Dp + 1.6, 0, 0.5, 0.4, 3, 'rune', { pri: 7 }); });
    def('barracks', (k, s, W, Dp) => { sh(k, s, W - 3.4, Dp - 1, HH[s] * 1.05, -2.6); k.post(W - 5.6, 4.4, 0, 7).post(W - 1.2, 4.4, 0, 7).beamX(W - 3.4, 4.4, 6.4, 2.8, 'timber', 0.45); for (let i = -1; i <= 1; i++) k.box(W - 3.4 + i * 1.4, 4.7, 1, 0.35, 0.35, 5.4, i ? 'iron' : 'ironD', { pri: 7 }); k.banner(W - 1.4, -2, 0, 15, 'banner'); k.palisade(-W, -W + 5, Dp + 2.6, 4); if (s === 2) k.fire(W - 3.4, Dp + 3, 0, 1.2); });
    def('forge', (k, s, W, Dp) => { sh(k, s, W * 0.6, Dp - 0.4, HH[s], -W * 0.36); k.box(W * 0.5, 2, 0, 2.6, 2.2, 3.6, 'stoneD').box(W * 0.5, 4.3, 0.6, 1.4, 0.4, 2.2, 'fire', { pri: 7 }); k.light = [W * 0.5, 4.3 * YS, 2 * ZS]; k.box(W * 0.5, -0.5, 3.6, 1.4, 1.5, 5 + s * 2, 'stoneD', { pri: 3 }); k.smoke = [W * 0.5, -0.5 * YS, (9.6 + s * 2) * ZS];
      k.box(W * 0.5 + 0.4, Dp + 1.4, 0, 1.1, 0.9, 1.6, 'log').box(W * 0.5 + 0.4, Dp + 1.4, 1.6, 2, 1, 1.3, 'ironD', { pri: 5 }); });
    def('watchtower', (k, s, W, Dp) => { sh(k, s, W - 1.6, Dp - 1.4, HH[s] * (s === 2 ? 1.35 : 1.75)); if (s) k.flag(W - 1.2, 2, 0, 12 + s * 3); });
    def('port', (k, s, W, Dp) => { sh(k, s, W * 0.5, Dp - 2.4, HH[s] * 0.92, -W * 0.45); k.box(W * 0.45, 4.5, 0, W * 0.5, 4, 1.3, 'plankH'); for (const x of [W * 0.02, W * 0.9]) for (const y of [1, 8]) k.stake(x, y, 4.4, 0.8); k.post(W * 0.45 - 3, 2.6, 1.3, 6.6).post(W * 0.45 + 3, 2.6, 1.3, 6.6).beamX(W * 0.45, 2.6, 7.4, 3.6, 'timber', 0.45); for (let i = -1; i <= 1; i++) k.ell(W * 0.45 + i * 1.8, 2.9, 5.6, [0.6, 0.5, 1.4], 'fish', { pri: 7 }); k.barrel(W * 0.2, 6.4, 1.3).crate(W * 0.72, 6.6, 1.3, 1.4); });
    def('tavern', (k, s, W, Dp) => { sh(k, s, W - 1.6, Dp - 0.4, HH[s] * 1.04, -1.4); k.barrel(W - 1.6, Dp + 0.6).barrel(W - 4.6, Dp + 1.6).barrel(W - 2.8, Dp + 1.2, 2.8); k.post(-W + 0.6, Dp + 2, 0, 9).sign(-W + 1.6, Dp + 0.6, 8.4); });
    def('library', (k, s, W, Dp) => { sh(k, s, W - 2.4, Dp - 1.4, HH[s] * 1.12, -2); for (const [x, y, h] of [[W - 1.6, 1, 7], [W - 3.4, Dp + 1.6, 5]]) k.box(x, y, 0, 1.3, 1.1, h + s, a.stone === 'pole' ? 'pole' : 'stoneL', { round: 0.3 }).box(x, y + 1.0, (h + s) * 0.5, 0.4, 0.3, 1.5, 'rune', { pri: 7 }); k.light = [W - 1.6, 2 * YS, 4.5 * ZS]; });
    def('hospital', (k, s, W, Dp) => { sh(k, s, W - 1.4, Dp - 1.2, HH[s] * 1.04); k.post(W - 0.6, Dp + 1.4, 0, 9).ell(W - 0.6, Dp + 1.7, 7.6, [1.8, 0.4, 1.8], 'cloth', { pri: 7 }).box(W - 0.6, Dp + 2, 6.6, 0.45, 0.3, 2, 'tealc', { pri: 8 }).box(W - 0.6, Dp + 2, 7.25, 1.2, 0.3, 0.7, 'tealc', { pri: 8 }); k.sack(-W + 1.6, Dp + 1.6); });
    const wm = { elf: ['bark', 'bark', 'whitew'], dwarf: ['slab', 'carved', 'carvedL'], myrrin: ['stalk', 'stalk', 'stalk'], okari: ['pole', 'pole', 'wallO'] }[name], tm = { elf: 'leaf', dwarf: 'verd', myrrin: 'capM', okari: 'reed' }[name];
    def('wall', (k, s) => { if (name === 'dwarf' || s === 2) { k.box(0, 0, 0, 3.1, 3, 8 + s, wm[s]).box(0, 0, 8 + s, 3.2, 3.2, 1, name === 'dwarf' ? 'stoneD' : tm, { pri: 3 }); } else { for (const x of [-2.2, -0.75, 0.75, 2.2]) k.stake(x, 0, 8.5 + s * 1.5 + (x * x > 2 ? 0 : 1), 0.9); k.box(0, 0.9, 5, 3, 0.4, 0.8, wm[s] === 'stalk' ? 'capP' : 'timber', { pri: 3 }); }
      if (name === 'myrrin') k.ell(0, 0, 10.5 + s * 1.5, [3.3, 3, 1.6], 'capM', { pri: 5 }); if (name === 'elf' && s < 2) k.ell(0, 0, 10 + s * 1.5, [3.2, 2.8, 1.5], 'leaf', { pri: 5 }); });
    def('gate', (k, s) => { if (name === 'dwarf' || s === 2) { k.box(0, 0, 0, 3.1, 3, 10.5 + s, wm[s]).box(0, 0, 10.5 + s, 3.2, 3.2, 1, name === 'dwarf' ? 'stoneD' : tm, { pri: 3 }).arch(0, 3, 0, 1.9, 7.5, 'door'); } else { k.stake(-2.4, 0, 11 + s, 1).stake(2.4, 0, 11 + s, 1).box(0, 0, 8, 3, 0.8, 1.4, 'timber', { pri: 4 }).door(0, 0, 0, 1.7, 7.6, 'door'); }
      if (name === 'myrrin') k.ell(0, 0, 12.5 + s, [3.5, 3.1, 1.8], 'capP', { pri: 5 }); if (name === 'elf') k.ell(0, 0, 12 + s, [3.3, 2.9, 1.6], 'leafL', { pri: 5 }); if (name === 'okari') k.box(0, 0.5, 9.5 + s, 2.6, 0.4, 1.6, 'sail', { pri: 6 }); });
    return DS; }
  for (const n of Object.keys(A)) DSETS[n] = build(n);
};
