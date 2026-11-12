// Quadruped base rig (deer, sheep, boar, wolf, bear, rabbit, horse, cattle...). Model faces +y. Units = pixels.
'use strict';
const { Scene, rotX, rotY, rotZ, mul, app, add, scl } = require('../../lib/sdf');
const S = Math.sin, C = Math.cos, PI = Math.PI;
const DEF = { scale: 1, bodyLen: 5, bodyR: [1.9, 1.9], chest: 1.0, rump: 1.0, legLen: 3.6, legR: 0.6, legSpread: 1.2,
  neckLen: 2.4, neckAng: 0.9, neckR: 1.0, headR: [1.2, 1.9, 1.2], snout: 0, ears: 1, earLen: 1.2, tail: { len: 1.2, up: 0.3, r: 0.5 },
  antlers: 0, horns: 0, tusks: 0, wool: 0, hump: 0, mane: 0, mats: {} };
const ANIMS = {
  idle: { n: 4, f: i => { const t = i / 4 * 2 * PI; return { sq: 1 + 0.03 * S(t), neck: 0.06 * S(t), tail: 0.5 * S(t * 2), ear: 0.3 * Math.max(0, S(t)) }; } },
  walk: { n: 8, f: i => { const t = i / 8 * 2 * PI; const L = ph => ({ sw: 0.6 * S(t + ph), kn: 0.9 * Math.max(0, C(t + ph)) }); return { z: 0.3 * Math.abs(S(t)), legs: [L(0), L(PI), L(PI * 0.9), L(PI * 1.9)], neck: 0.08 * S(t * 2), tail: 0.4 * S(t), head: 0.05 * S(t * 2) }; } },
  // bounding run / hop (rabbit, deer flight): gather (0,1) launch (2,3) flight (4,5) land (6,7)
  run: { n: 8, f: i => { const k = [[0.5, -0.5, -0.3, 0.9], [0.2, -0.2, -0.1, 0.92], [-0.6, 0.7, 0.7, 1.08], [-0.9, 0.9, 1.4, 1.1], [-0.6, 0.6, 1.5, 1.05], [0.1, 0.3, 1.0, 1], [0.7, -0.3, 0.3, 0.95], [0.6, -0.6, -0.2, 0.9]][i];
    return { z: k[2], sq: k[3], pitch: (i > 1 && i < 5 ? -0.18 : i >= 5 ? 0.15 : 0), legs: [{ sw: k[0], kn: k[0] > 0 ? 0.6 : 0.1 }, { sw: k[0] * 0.9, kn: k[0] > 0 ? 0.6 : 0.1 }, { sw: k[1], kn: k[1] < 0 ? 0.8 : 0.1 }, { sw: k[1] * 0.9, kn: k[1] < 0 ? 0.8 : 0.1 }], neck: -0.15 * k[2] * 0.4, tail: 0.3 }; } },
  eat: { n: 4, f: i => { const d = [0.7, 1, 0.85, 1][i]; return { neck: -1.5 * d, head: 0.5 * d, legs: [{ sw: 0.15 }, { sw: -0.1 }, {}, {}], tail: 0.3 * (i & 1) }; } },
  // attack: warning (0,1: rear back / lower head), lunge (2,3), recover (4,5)
  attack: { n: 6, f: i => { const k = [[-0.3, 0.25, -0.5], [-0.45, 0.4, -0.9], [0.3, -0.5, 1.2], [0.4, -0.7, 1.8], [0.2, -0.3, 0.8], [0, 0, 0.2]][i];
    return { pitch: -k[0] * 0.5, y: k[2], z: i === 2 ? 0.5 : 0, neck: k[1] * -1.2, head: k[1] * 0.8, sq: i === 1 ? 0.93 : i === 2 ? 1.07 : 1, legs: [{ sw: k[0] * 1.2, kn: i < 2 ? 0.3 : 0 }, { sw: k[0], kn: i < 2 ? 0.4 : 0 }, { sw: -k[0] * 0.8, kn: 0.2 }, { sw: -k[0] * 0.6, kn: 0.2 }], tail: -0.6, jaw: i >= 2 && i < 4 ? 1 : 0 }; } },
  hit: { n: 2, f: i => ({ y: -0.8 + 0.4 * i, pitch: 0.25 - 0.12 * i, sq: 0.94, neck: 0.4, legs: [{ sw: 0.5 }, { sw: 0.4 }, { sw: 0.3 }, { sw: 0.2 }] }) },
  death: { n: 6, f: i => { const f = [0.1, 0.35, 0.75, 1.05, 0.97, 1][i]; return { fall: f, neck: -0.4 * f, legs: [{ sw: 0.5 * f, kn: 0.5 * f }, { sw: 0.2 * f, kn: 0.3 }, { sw: -0.4 * f, kn: 0.5 * f }, { sw: -0.1, kn: 0.2 }], z: i === 3 ? 0.2 : 0, tail: -1 }; } },
  sleep: { n: 2, f: i => ({ lie: 1, sq: 1 + 0.05 * i, neck: -1.1, head: 0.4 }) },
};
function build(specIn, pose = {}) {
  const sp = Object.assign({}, DEF, specIn), sc = new Scene(), decals = [], k = sp.scale, P = pose;
  const fall = P.fall || 0, lie = P.lie || 0;
  const legLen = sp.legLen * k * (1 - lie * 0.75);
  const rootR = mul(rotY(fall * PI / 2 * 0.95), rotX((P.pitch || 0)));
  const bz = legLen + sp.bodyR[1] * k * 0.75;
  const rootT = [(P.x || 0) + fall * 1.2 * k, P.y || 0, (P.z || 0) + bz * (1 - fall * 0.55)];
  const W = v => add(app(rootR, v), rootT);
  const sq = P.sq || 1, bl = sp.bodyLen * k / 2, br = sp.bodyR, M = sp.mats;
  const body = M.body || 'fur', belly = M.belly || body;
  // trunk: chest (front) and rump (back) blended
  sc.ell(W([0, bl * 0.45, 0.1 * k]), [br[0] * k * sp.chest, bl * 0.75, br[1] * k * sp.chest * sq], body, { rot: rootR, g: 1 });
  sc.ell(W([0, -bl * 0.45, 0]), [br[0] * k * sp.rump, bl * 0.8, br[1] * k * sp.rump * sq], body, { rot: rootR, g: 1, k: 1.0 });
  if (sp.hump) sc.ell(W([0, bl * 0.35, br[1] * k * 0.7]), [br[0] * k * 0.8, bl * 0.5, sp.hump * k], M.hump || body, { rot: rootR, g: 1, k: 0.8 });
  if (sp.wool) { const n = 5; for (let i = 0; i < n; i++) { const a = i / n * 2 * PI; sc.ell(W([S(a) * br[0] * k * 0.55, C(a) * bl * 0.6, br[1] * k * (0.35 + 0.25 * ((i * 7) % 3) / 2)]), [sp.wool * k, sp.wool * k * 1.1, sp.wool * k * 0.9], body, { g: 1, k: 0.5 }); } }
  // legs: 0 front-left, 1 front-right, 2 back-left, 3 back-right
  const legs = P.legs || [];
  for (let i = 0; i < 4; i++) {
    const front = i < 2, side = (i & 1) ? 1 : -1, L = legs[i] || {}, sw = (L.sw || 0) * (1 - lie), kn = (L.kn || 0) + lie * 1.4;
    const hip = [side * sp.legSpread * k, (front ? 1 : -1) * bl * 0.72, -br[1] * k * 0.35], h2 = legLen / 2 + br[1] * k * 0.2;
    const knee = add(hip, [0, S(sw) * h2, -C(sw) * h2]), bend = front ? -kn : kn, foot = add(knee, [0, S(sw + bend) * h2, -C(sw + bend) * h2]);
    const lm = M.leg || body;
    sc.cap(W(hip), W(knee), sp.legR * k * 1.25, sp.legR * k, lm, { g: 2 + i });
    sc.cap(W(knee), W(foot), sp.legR * k, sp.legR * k * 0.85, M.hoof && false ? M.hoof : lm, { g: 2 + i });
    if (M.hoof) sc.ell(W(add(foot, [0, 0.15 * k, 0])), [sp.legR * k, sp.legR * k * 1.1, sp.legR * k * 0.8], M.hoof, { pri: 1 });
  }
  // neck + head
  const na = sp.neckAng + (P.neck || 0), nb = [0, bl * 0.85, br[1] * k * 0.35];
  const nt = add(nb, [0, C(na) * sp.neckLen * k, S(na) * sp.neckLen * k]);
  sc.cap(W(nb), W(nt), sp.neckR * k * 1.15, sp.neckR * k * 0.9, M.neck || body, { g: 1, k: 0.6 });
  if (sp.mane) sc.cap(W(add(nb, [0, -0.6 * k, 0.6 * k])), W(add(nt, [0, -0.7 * k, 0.5 * k])), sp.mane * k, sp.mane * k * 0.8, M.mane || body, { pri: 1 });
  const ha = (P.head || 0) + (sp.headAng || 0.25), headR = mul(rootR, rotX(ha)), hr = sp.headR.map(v => v * k);
  const hc = add(nt, [0, hr[1] * 0.45 * C(ha), hr[2] * 0.25 - hr[1] * 0.45 * S(ha)]);
  const HL = v => W(add(hc, app(rotX(ha), v)));
  sc.ell(W(hc), hr, M.head || body, { rot: headR, pri: 1 });
  if (sp.snout) sc.cap(HL([0, hr[1] * 0.5, -hr[2] * 0.15]), HL([0, hr[1] * 0.5 + sp.snout * k, -hr[2] * 0.3]), hr[0] * 0.75, hr[0] * 0.55, M.snout || M.head || body, { pri: 1, k: 0.3 });
  if (sp.ears) for (const s of [-1, 1]) sc.cap(HL([s * hr[0] * 0.7, -hr[1] * 0.45, hr[2] * 0.5]), HL([s * (hr[0] * 0.7 + sp.earLen * k * (sp.earOut == null ? 0.5 : sp.earOut)), -hr[1] * 0.6, hr[2] * 0.5 + sp.earLen * k * (0.9 + (P.ear || 0) * 0.2)]), 0.5 * k * sp.ears, 0.28 * k * sp.ears, M.ear || body, { pri: 2 });
  if (sp.antlers) for (const s of [-1, 1]) { const a0 = HL([s * hr[0] * 0.45, -hr[1] * 0.2, hr[2] * 0.8]), a1 = HL([s * (hr[0] * 0.5 + 1.2 * k * sp.antlers), -hr[1] * 0.6, hr[2] + 2.0 * k * sp.antlers]), a2 = HL([s * (hr[0] * 0.5 + 0.6 * k * sp.antlers), hr[1] * 0.3, hr[2] + 3.2 * k * sp.antlers]), a3 = HL([s * (hr[0] * 0.5 + 2.2 * k * sp.antlers), -hr[1] * 0.2, hr[2] + 2.9 * k * sp.antlers]);
    sc.cap(a0, a1, 0.42 * k, 0.4 * k, 'bone', { pri: 3 }); sc.cap(a1, a2, 0.4 * k, 0.3 * k, 'bone', { pri: 3 }); sc.cap(a1, a3, 0.4 * k, 0.3 * k, 'bone', { pri: 3 }); }
  if (sp.horns) for (const s of [-1, 1]) sc.cap(HL([s * hr[0] * 0.6, -hr[1] * 0.2, hr[2] * 0.7]), HL([s * (hr[0] * 0.6 + 1.0 * k * sp.horns), hr[1] * 0.2, hr[2] * 0.7 + 1.3 * k * sp.horns]), 0.5 * k, 0.22 * k, 'bone', { pri: 3 });
  const eyeY = hr[1] * 0.35, eyeZ = hr[2] * 0.3;
  decals.push({ p: HL([-hr[0] * 0.95, eyeY, eyeZ]), idx: 'eye', tag: 'eyeL', on: sp.eyeOn || null }, { p: HL([hr[0] * 0.95, eyeY, eyeZ]), idx: 'eye', tag: 'eyeR', on: sp.eyeOn || null });
  if (sp.nose) decals.push({ p: HL([0, hr[1] + sp.snout * k, -hr[2] * 0.25]), idx: 'nose', tag: 'nose' });
  if (sp.tusks) for (const s of [-1, 1]) decals.push({ p: HL([s * hr[0] * 0.8, hr[1] * 0.6 + sp.snout * k * 0.7, -hr[2] * 0.5]), idx: 'tusk', tag: s < 0 ? 'tuskL' : 'tuskR' });
  // tail
  const tl = sp.tail; if (tl && tl.len) { const tb = [0, -bl * 1.15, br[1] * k * 0.3], ta = tl.up + (P.tail || 0) * 0.3; sc.cap(W(tb), W(add(tb, [S((P.tail || 0) * 0.5) * tl.len * k * 0.5, -C(ta) * tl.len * k, S(ta) * tl.len * k])), tl.r * k, tl.r * k * (tl.tip || 0.6), M.tail || body, { pri: 1 }); }
  // species-specific parts (trunk, horns, wings, shell...): spec.extra(bones)
  if (sp.extra) sp.extra({ sc, W, HL, hr, k, bl, br, M, P, rootR, headR, decals, nb, nt, legLen, body, sp });
  return { scene: sc, decals };
}
module.exports = { build, ANIMS, DEF };
