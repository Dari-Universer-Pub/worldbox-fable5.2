// Cavalry (chantier B.4): one rider per people on a war horse. The horse is the quadruped rig (the horse of tools/art/creatures.js
// with a caparison in the kingdom colour), the rider is the humanoid rig of the people, seated, with a lance and a kite shield.
// Both scenes are merged into one before rendering. Cell 32x32, keys '<people>/rider/<anim>/<dir>/<i>'.
'use strict';
const Q = require('./rigs/quadruped'), H = require('./rigs/humanoid'); require('./rigs/humanoid-war');
const { PEOPLES } = require('./peoples'); const CR = require('./creatures'); const { mat, team } = require('../lib/mats');
const { add, scl, mul, rotZ } = require('../lib/sdf');
const S = Math.sin, C = Math.cos, PI = Math.PI;
const CELL = 32, OY = 29;
// the mount of each people: coat and size
const MOUNT = {
  human: { fur: mat('earth', [2, 3, 4]), mane: mat('earth', [0, 1, 2]), scale: 1.55 },
  orc: { fur: mat('stone', [1, 2, 3]), mane: mat('stone', [0, 1, 2]), scale: 1.6, chest: 1.12 },
  elf: { fur: mat('ice', [3, 4, 5], { ink: 'stone' }), mane: mat('sand', [3, 4, 5]), scale: 1.5, legLen: 4.8, bodyR: [1.55, 1.7] },
  dwarf: { fur: mat('sand', [1, 2, 3], { ink: 'earth' }), mane: mat('earth', [0, 1, 2]), scale: 1.45, legLen: 3.4, bodyR: [1.95, 2.0] },
  myrrin: { fur: mat('sand', [3, 4, 5], { ink: 'earth' }), mane: mat('magic', [1, 2, 3]), scale: 1.4, legLen: 3.9 },
  okari: { fur: mat('stone', [0, 1, 2]), mane: mat('ice', [3, 4, 5], { ink: 'stone' }), scale: 1.5, legLen: 4.7, bodyR: [1.6, 1.75] },
};
// lance: a long shaft couched under the right arm, a pennon in the kingdom colour behind the point
H.ACC.lance = (sc, b, a) => { const h = b.hands.R, k = b.k, t = b.pose.tool == null ? 1.25 : b.pose.tool, d = [0.12, S(t), C(t)], tip = add(h.pos, scl(d, 7.0 * k));
  sc.cap(b.U(add(h.pos, scl(d, -3.0 * k))), b.U(tip), 0.36 * k, 0.32 * k, 'wood', { pri: 5 }); sc.cap(b.U(tip), b.U(add(tip, scl(d, 1.6 * k))), 0.6 * k, 0.12 * k, 'blade', { pri: 7 });
  sc.box(b.U(add(add(tip, scl(d, -1.2 * k)), [0, -d[2] * 0.9 * k, d[1] * 0.9 * k])), [0.3 * k, 0.75 * k, 0.75 * k], 'cloth', { rot: b.upR, round: 0.15, pri: 6 }); };
H.ACC.kite = (sc, b, a) => { const h = b.hands.L, k = b.k, R = mul(b.upR, rotZ(-0.5)), c = add(h.pos, [-0.7 * k, 0.6 * k, 0.2 * k]); sc.ell(b.U(c), [1.6 * k, 0.6 * k, 2.3 * k], 'steel', { rot: R, pri: 5 }); sc.ell(b.U(add(c, [-0.1 * k, 0.35 * k, 0.1 * k])), [1.0 * k, 0.45 * k, 1.6 * k], 'cloth', { rot: R, pri: 6 }); };
const ANIMS = [['idle', 4, 4], ['walk', 8, 4], ['attack', 6, 4], ['hit', 3, 4], ['death', 8, 2]];
// horse pose and rider pose for one frame
function poses(anim, i) {
  const seat = { legL: { sw: 0.55, kn: 0.95 }, legR: { sw: 0.55, kn: 0.95 }, armL: { sw: 0.7, ab: 0.2, el: 0.9 }, armR: { sw: 0.5, ab: 0.25, el: 1.1 }, tool: 0.35 };
  if (anim === 'idle') { const t = i / 4 * 2 * PI; return { h: Q.ANIMS.idle.f(i), r: Object.assign({}, seat, { sq: 1 + 0.03 * S(t), head: { nod: 0.04 * S(t) } }), bob: 0 }; }
  if (anim === 'walk') { const hp = Q.ANIMS.run.f(i); hp.z *= 0.45; hp.pitch = (hp.pitch || 0) * 0.6; return { h: hp, r: Object.assign({}, seat, { lean: 0.18 + 0.06 * S(i / 8 * 2 * PI), armR: { sw: 0.6, ab: 0.25, el: 1.0 }, tool: 0.7 }), bob: hp.z }; }
  if (anim === 'attack') { const hp = Q.ANIMS.attack.f(i), k = [0, -0.3, 0.6, 1, 0.7, 0.2][i]; hp.neck = (hp.neck || 0) * 0.5; return { h: hp, r: Object.assign({}, seat, { lean: 0.15 + 0.3 * Math.max(0, k), armR: { sw: 0.8 + 0.7 * k, ab: 0.2, el: 0.9 - 0.7 * Math.max(0, k) }, tool: 1.45 }), bob: hp.z || 0, fwd: hp.y || 0 }; }
  if (anim === 'hit') { const hp = Q.ANIMS.hit.f(Math.min(1, i)), k = [0.9, 0.6, 0.2][i]; return { h: hp, r: Object.assign({}, seat, { lean: -0.45 * k, armL: { sw: -0.3 * k + 0.5, ab: 0.7 * k, el: 0.6 }, armR: { sw: 0.2, ab: 0.8 * k, el: 0.8 }, head: { nod: -0.4 * k }, tool: 0.1 }), bob: 0, fwd: hp.y || 0 }; }
  // death: the horse goes down, the rider is thrown off its back
  const hp = Q.ANIMS.death.f(Math.min(5, i)), f = [0, 0.1, 0.3, 0.6, 0.9, 1.04, 0.97, 1][i]; return { h: hp, r: { fall: f, armL: { sw: -0.4 + f * 0.5, ab: 0.6, el: 0.4 }, armR: { sw: 0.3, ab: 0.5, el: 0.5 }, legL: { sw: 0.3, kn: 0.4 }, legR: { sw: -0.1, kn: 0.5 }, tool: 1.2 + f * 0.4 }, thrown: f };
}
function specOf(pid) { const P = PEOPLES[pid], M = MOUNT[pid], hs = Object.assign({}, CR.SPECIES.horse.spec, { scale: M.scale }); for (const k of ['legLen', 'bodyR', 'chest']) if (M[k]) hs[k] = M[k];
  const base = hs.extra; hs.extra = c => { if (base) base(c); const { sc, W, k, bl, br, rootR } = c; // caparison over the rump and a saddle cloth, in the kingdom colour; a leather saddle
    sc.ell(W([0, -bl * 0.5, br[1] * k * 0.25]), [br[0] * k * 1.1, bl * 0.5, br[1] * k * 0.85], 'cloth', { rot: rootR, pri: 2 }); sc.box(W([0, bl * 0.02, br[1] * k * 0.95]), [br[0] * k * 0.8, bl * 0.34, 0.45 * k], 'leather', { rot: rootR, round: 0.3, pri: 3 });
    sc.cap(W([0, bl * 0.8, br[1] * k * 0.2]), W([0, bl * 0.95, -br[1] * k * 0.5]), br[0] * k * 0.9, br[0] * k * 0.7, 'cloth', { pri: 2 }); };
  const rs = Object.assign({}, P.spec, { scale: (P.spec.scale || 1.5) * 0.86, hipW: Math.max(P.spec.hipW || 1.3, (hs.bodyR[0] * M.scale) / ((P.spec.scale || 1.5) * 0.86) * 0.9) });
  let acc = (P.spec.acc0 || []).concat([{ kind: 'lance' }, { kind: 'kite' }, { kind: 'helmet', crest: 'cloth' }, { kind: 'pauldrons' }]);
  if (P.swap) acc = acc.map(a => { if (!(a.kind in P.swap)) return a; const s = P.swap[a.kind]; if (!s) return null; const [kk, opt] = s.split(':'); const o = Object.assign({}, a, { kind: kk }); if (opt === 'horns') o.horns = 1; else if (opt === 'circlet') o.circlet = 1; else if (opt) o.mat = opt; return o; }).filter(Boolean);
  rs.acc = acc.filter(a => H.ACC[a.kind]);
  const mats = Object.assign(P.mats(), { fur: M.fur, mane: M.mane }); return { hs, rs, mats, P, M }; }
const cache = {};
function frame(pid, anim, i) { const S0 = cache[pid] || (cache[pid] = specOf(pid)), { hs, rs } = S0, p = poses(anim, i), k = hs.scale;
  const horse = Q.build(hs, p.h), legLen = hs.legLen * k, saddle = legLen + hs.bodyR[1] * k * 1.45, rk = rs.scale || 1.5, pelvis = (rs.legLen || 2.7) * rk;
  const rp = Object.assign({}, p.r); let z = saddle - pelvis + (p.bob || 0), y = -2.2 + (p.fwd || 0), x = 0;
  if (p.thrown != null) { z = (saddle - pelvis) * (1 - Math.min(1, p.thrown * 1.3)); y = -1 - p.thrown * 3; x = -p.thrown * 5.5; }
  rp.z = z; rp.y = (rp.y || 0) + y; rp.x = x; const rider = H.build(rs, rp);
  for (const q of rider.scene.p) { if (q.g) q.g += 20; horse.scene.p.push(q); }
  return { scene: horse.scene, decals: rider.decals.map(d => Object.assign({ rider: 1 }, d)).concat(horse.decals) }; }
module.exports = { CELL, OY, ANIMS, MOUNT, frame, specOf };
