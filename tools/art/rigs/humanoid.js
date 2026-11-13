// Humanoid base rig (one skeleton for every people, job, age and humanoid monster).
// build(spec, pose) -> { scene, decals }.  Model faces +y (toward the camera at yaw 0). Units = pixels.
'use strict';
const { Scene, rotX, rotY, rotZ, mul, app, add, scl, lerp, CP } = require('../../lib/sdf');

const DEF = {
  scale: 1, legLen: 2.7, hipW: 1.3, legR: 0.85, footL: 0.95,
  torsoH: 2.7, torsoR: [2.15, 1.45, 1.75], shoulderW: 2.75, chestUp: 0,
  armLen: 3.1, armR: 0.78, handR: 0.8,
  headR: [3.0, 2.7, 2.65], headUp: 2.75, headFwd: 0.25, hunch: 0,
  hair: 'short', hairR: 1.0, hairBack: 1.25, hairUp: 1.15, beard: 0, ears: 0, tusks: 0, robe: 0, belly: 0,
  acc: [],
};
// animation poses ------------------------------------------------------------
const S = Math.sin, C = Math.cos, PI = Math.PI;
const ease = t => t * t * (3 - 2 * t);
const ANIMS = {
  idle: { n: 6, f: (i) => { const t = i / 6 * 2 * PI; return { sq: 1 + 0.035 * S(t), armL: { sw: 0.06 * S(t), ab: 0.12 + 0.05 * S(t) }, armR: { sw: -0.06 * S(t), ab: 0.12 + 0.05 * S(t) }, head: { nod: 0.05 * S(t + 1) } }; } },
  walk: { n: 8, f: (i) => { const t = i / 8 * 2 * PI, s = S(t); return { z: 0.7 * Math.abs(C(t)) - 0.15, lean: 0.10,
    legL: { sw: 0.75 * s, kn: 0.9 * Math.max(0, -C(t)) }, legR: { sw: -0.75 * s, kn: 0.9 * Math.max(0, C(t)) },
    armL: { sw: -0.7 * s, ab: 0.14, el: 0.25 }, armR: { sw: 0.7 * s, ab: 0.14, el: 0.25 }, head: { nod: -0.04 } }; } },
  // overhead two-handed swing (axe, pick): anticipation(0,1) strike(2) impact(3) recover(4,5)
  chop: { n: 6, f: (i) => { const k = [[2.4, -0.25, 0.25, 0.3], [2.9, -0.38, 0.4, 0.15], [1.7, 0.1, 0, 0.5], [0.75, 0.42, -0.35, 0.2], [0.9, 0.3, -0.2, 0.3], [1.6, 0, 0, 0.4]][i];
    return { lean: k[1], z: k[2] * 0.5, sq: 1 + k[2] * 0.06, armR: { sw: k[0], ab: 0.05, el: k[3] }, armL: { sw: k[0] - 0.25, ab: -0.1, el: k[3] + 0.4 }, legL: { sw: 0.25, kn: 0.2 + (i === 3 ? 0.3 : 0) }, legR: { sw: -0.3, kn: i === 3 ? 0.3 : 0.05 }, tool: [-0.5, -1.0, 0.5, 1.75, 1.6, 0.6][i], head: { nod: k[1] * 0.5 } }; } },
  // low swing to the ground (hoe, shovel, scythe)
  dig: { n: 6, f: (i) => { const k = [[1.3, -0.1, 0.2], [1.8, -0.2, 0.1], [0.9, 0.3, 0.3], [0.45, 0.55, 0.2], [0.55, 0.5, 0.5], [1.0, 0.15, 0.4]][i];
    return { lean: k[1], z: -Math.max(0, k[1]) * 0.7, armR: { sw: k[0], ab: 0, el: k[2] }, armL: { sw: k[0] + 0.3, ab: -0.15, el: k[2] + 0.2 }, legL: { sw: 0.3, kn: Math.max(0, k[1]) * 0.9 }, legR: { sw: -0.25, kn: Math.max(0, k[1]) * 0.5 }, tool: [0.3, -0.2, 1.2, 2.2, 2.1, 1.2][i], head: { nod: k[1] * 0.6 } }; } },
  // one-handed hammering in front (builder, smith)
  hammer: { n: 6, f: (i) => { const k = [[1.5, 0.9], [2.3, 0.5], [1.9, 0.9], [0.95, 0.5], [1.0, 0.7], [1.3, 0.9]][i];
    return { lean: 0.22 + (i === 3 ? 0.12 : 0), z: i === 3 ? -0.3 : 0, armR: { sw: k[0], ab: 0.1, el: k[1] }, armL: { sw: 0.9, ab: -0.2, el: 0.9 }, legL: { sw: 0.2, kn: 0.25 }, legR: { sw: -0.2, kn: 0.2 }, tool: [0.3, -0.5, 0.2, 1.5, 1.3, 0.7][i], head: { nod: 0.2 } }; } },
  // melee attack: wind-up (0,1), lunge+slash (2,3), recovery (4,5)
  attack: { n: 6, f: (i) => { const k = [[-0.6, -0.2, 0], [-1.1, -0.32, -0.3], [1.3, 0.3, 1.2], [2.0, 0.45, 1.6], [1.2, 0.25, 0.9], [0.3, 0.05, 0.3]][i];
    return { lean: k[1], y: k[2] * 0.9, z: i === 1 ? -0.3 : i === 2 ? 0.3 : 0, sq: i === 1 ? 0.94 : i === 2 ? 1.06 : 1, armR: { sw: k[0], ab: i < 2 ? 0.7 : 0.1, el: i < 2 ? 1.0 : 0.15 }, armL: { sw: -k[0] * 0.4 + 0.3, ab: 0.3, el: 0.6 },
      legL: { sw: i >= 2 && i < 5 ? 0.8 : 0.1, kn: i >= 2 && i < 5 ? 0.5 : 0.1 }, legR: { sw: i >= 2 && i < 5 ? -0.7 : -0.1, kn: 0.1 }, tool: [-0.6, -1.3, 0.6, 1.6, 1.7, 0.8][i], head: { nod: k[1] * 0.4 } }; } },
  // ranged attack: raise (0), draw (1,2), hold (3), release (4), recover (5)
  shoot: { n: 6, f: (i) => { const d = [0.2, 0.6, 1, 1, 0, 0.1][i];
    return { lean: -0.06 - 0.06 * d + (i === 4 ? 0.12 : 0), armL: { sw: 1.5, ab: 0.05, el: 0 }, armR: { sw: 1.45, ab: 0.25, el: 0.4 + 1.7 * d }, legL: { sw: 0.35, kn: 0.1 }, legR: { sw: -0.35, kn: 0.1 }, draw: d, head: { nod: -0.05 } }; } },
  hit: { n: 3, f: (i) => { const k = [0.9, 0.6, 0.2][i]; return { lean: -0.5 * k, y: -1.0 * k, z: 0.3 * k, sq: 1 - 0.06 * k, armL: { sw: -0.6 * k, ab: 0.8 * k, el: 0.5 }, armR: { sw: -0.4 * k, ab: 0.9 * k, el: 0.4 }, head: { nod: -0.4 * k }, legL: { sw: -0.3 * k, kn: 0.2 }, legR: { sw: 0.2 * k, kn: 0.3 * k } }; } },
  death: { n: 8, f: (i) => { const fall = [0, 0.08, 0.25, 0.55, 0.85, 1.04, 0.97, 1][i], k = Math.min(1, i / 3);
    return { fall, lean: -0.3 * (1 - fall) * k, z: i === 5 ? 0.25 : 0, y: -0.5 * k * (1 - fall), armL: { sw: -0.4 * k + fall * 0.5, ab: 0.5 - fall * 0.2, el: 0.4 }, armR: { sw: 0.3 * k + fall * 0.1, ab: 0.4 - fall * 0.1, el: 0.5 }, legL: { sw: 0.3 * k * (1 - fall) + 0.2 * fall, kn: 0.5 * k * (1 - fall) + 0.15 }, legR: { sw: -0.15 * fall, kn: 0.3 * (1 - fall) }, head: { nod: -0.5 * k + 0.3 * fall } }; } },
  pray: { n: 4, f: (i) => { const b = [0, 0.5, 1, 0.5][i]; return { kneel: 1, lean: 0.25 + 0.35 * b, armL: { sw: 1.9 - 0.9 * b, ab: -0.3, el: 0.9 }, armR: { sw: 1.9 - 0.9 * b, ab: -0.3, el: 0.9 }, head: { nod: 0.2 + 0.4 * b } }; } },
  sleep: { n: 2, f: (i) => ({ fall: 1, sq: 1 + 0.05 * i, armL: { sw: 0.1, ab: 0.25, el: 0.3 }, armR: { sw: 0.1, ab: 0.25, el: 0.3 }, legL: { sw: 0.1, kn: 0.15 }, legR: { sw: -0.05, kn: 0.3 } }) },
  joy: { n: 6, f: (i) => { const j = [-0.4, 0.6, 1.8, 2.1, 1.0, -0.3][i], up = [0.4, 1.6, 2.9, 3.0, 2.4, 0.9][i];
    return { z: Math.max(j, -0.4), sq: i === 0 || i === 5 ? 0.9 : i === 2 ? 1.08 : 1, armL: { sw: 0.2, ab: up, el: 0.2 }, armR: { sw: 0.2, ab: up, el: 0.2 }, legL: { sw: i > 1 && i < 5 ? -0.25 : 0, kn: i === 0 || i === 5 ? 0.5 : i > 1 && i < 5 ? 0.6 : 0 }, legR: { sw: i > 1 && i < 5 ? 0.3 : 0, kn: i === 0 || i === 5 ? 0.5 : 0.2 }, head: { nod: -0.25 } }; } },
};

function build(specIn, pose = {}) {
  const sp = Object.assign({}, DEF, specIn), sc = new Scene(), decals = [];
  const k = sp.scale, P = Object.assign({}, pose);
  if (P.z) P.z = Math.round(P.z * k * CP) / CP / k * k; // whole-pixel vertical bob (anti-shimmer)
  const legLen = sp.legLen * k, half = legLen / 2;
  const kneel = P.kneel || 0, fall = P.fall || 0;
  // root transform: fall rotates the whole body backward around the feet
  const rootR = mul(rotZ(P.turn || 0), rotX(fall * PI / 2 * 0.98));
  const rootT = [P.x || 0, (P.y || 0) + fall * 2.5 * k, (P.z || 0) + fall * 1.6 * k];
  const W = v => add(app(rootR, v), rootT);
  const sq = P.sq || 1;
  const pelvisZ = (legLen - kneel * half * 0.95) * (0.5 + 0.5 * sq);
  const pelvis = [0, kneel * 0.4 * k, pelvisZ];
  // upper body rotation (lean forward = +y, roll)
  const lean = (P.lean || 0) + sp.hunch, upR = mul(rotX(-lean), rotY(P.roll || 0));
  const U = v => W(add(pelvis, app(upR, v)));
  // ---- legs
  for (const side of [-1, 1]) {
    const L = (side < 0 ? P.legL : P.legR) || {}, a = (L.sw || 0), kn = (L.kn || 0) + kneel * 1.9;
    const hip = [side * sp.hipW * k, pelvis[1], pelvisZ];
    const aa = a + kneel * 0.9;
    const knee = add(hip, [0, S(aa) * half, -C(aa) * half]);
    const foot = add(knee, [0, S(aa - kn) * half, -C(aa - kn) * half]);
    if (foot[2] < 0.5 * k && !kneel) { /* keep feet on the ground when planted */ }
    const lm = sp.robe ? 'cloth' : 'pants';
    sc.cap(W(hip), W(knee), sp.legR * k, sp.legR * k * 0.92, lm, { g: 1 });
    sc.cap(W(knee), W(foot), sp.legR * k * 0.9, sp.legR * k * 0.85, lm, { g: 1 });
    sc.ell(W(add(foot, [0, sp.footL * 0.45 * k, 0.1 * k])), [sp.legR * k * 0.95, sp.footL * k, sp.legR * k * 0.8], 'boot', { g: 1, rot: rootR });
  }
  // ---- torso
  const tH = sp.torsoH * k * sq, tr = sp.torsoR;
  const chest = [0, 0, tH];
  sc.ell(U([0, 0, tH * 0.5]), [tr[0] * k, tr[1] * k, tr[2] * k * sq], 'cloth', { rot: mul(rootR, upR), g: 2 });
  if (sp.belly) sc.ell(U([0, sp.belly * 0.5 * k, tH * 0.32]), [tr[0] * k * 0.95, tr[1] * k + sp.belly * 0.5 * k, tr[2] * k * 0.8], 'cloth', { rot: mul(rootR, upR), g: 2, k: 0.6 });
  if (sp.robe) { // long robe: cone from the waist to near the ground
    sc.cap(U([0, 0, tH * 0.3]), W([pelvis[0], pelvis[1], 0.9 * k]), tr[0] * k * 0.95, (tr[0] + 0.55) * k, 'cloth', { g: 2, k: 0.5 });
  }
  // ---- head
  const H = P.head || {}, headR = mul(mul(rootR, upR), rotX(-(H.nod || 0)));
  const hc = U(add(chest, app(rotX(-(H.nod || 0) * 0.5), [0, sp.headFwd * k, sp.headUp * k])));
  const hr = sp.headR.map(v => v * k * (sp.headScale || 1));
  const HL = v => add(hc, app(headR, v));
  sc.ell(hc, hr, 'skin', { rot: headR, pri: 1 });
  if (sp.neck) sc.cap(U([0, 0, tH * 0.85]), hc, sp.neck * k, sp.neck * k * 0.9, 'skin', { pri: 0 });
  if (sp.ears) for (const s of [-1, 1]) sc.cap(HL([s * hr[0] * 0.85, -0.2, 0.2 * k]), HL([s * (hr[0] + sp.ears * k), -0.6 * k, (sp.earUp || 1.1) * k]), 0.7 * k, 0.25 * k, 'skin', { k: 0.3, pri: sp.earUp ? 3 : 0 });
  if (sp.hair === 'short' || sp.hair === 'long' || sp.hair === 'top') {
    // cap over the top of the skull + volume at the back; the face (front-lower part) stays free
    sc.ell(HL([0, -hr[1] * 0.36, hr[2] * 0.64]), [hr[0] * 1.05, hr[1] * 0.74, hr[2] * 0.5], 'hair', { rot: headR, pri: 2 });
    sc.ell(HL([0, -hr[1] * 0.66, hr[2] * 0.04]), [hr[0] * 1.0, hr[1] * 0.5, hr[2] * 0.9], 'hair', { rot: headR, pri: 2 });
    if (sp.hair === 'long') sc.cap(HL([0, -hr[1] * 0.75, 0]), HL([0, -hr[1] * 0.9, -2.4 * k]), hr[0] * 0.85, hr[0] * 0.6, 'hair', { pri: 2 });
  } else if (sp.hair === 'crest') sc.ell(HL([0, -0.3 * k, hr[2] * 0.95]), [0.6 * k, hr[1] * 0.9, 1.0 * k], 'hair', { rot: headR, pri: 2 });
  else if (sp.hair === 'knot') { sc.ell(HL([0, -0.55 * k, 0.75 * k]), [hr[0] * 1.0, hr[1] * 0.96, hr[2] * 0.8], 'hair', { rot: headR, pri: 2 }); sc.ell(HL([0, -0.6 * k, hr[2] + 0.5 * k]), [0.9 * k, 0.9 * k, 0.8 * k], 'hair', { pri: 2 }); }
  if (sp.beard) sc.ell(HL([0, hr[1] * 0.62, -hr[2] * (0.55 + 0.3 * sp.beard)]), [hr[0] * 0.72, hr[1] * 0.5, hr[2] * (0.45 + 0.35 * sp.beard)], 'hair', { rot: headR, pri: 3 });
  if (sp.jaw) sc.ell(HL([0, hr[1] * 0.35, -hr[2] * 0.55]), [hr[0] * 0.95, hr[1] * 0.8, hr[2] * 0.6], 'skin', { rot: headR, k: 0.5, pri: 1 });
  if (!sp.noNose) sc.ell(HL([0, hr[1] * 0.98, -hr[2] * 0.16]), [0.5 * k, 0.5 * k, 0.45 * k], 'skin', { rot: headR, pri: 1 });
  // face decals
  const eyeY = hr[1] * 0.92, eyeZ = (sp.eyeZ == null ? -0.15 : sp.eyeZ) * k, eyeX = (sp.eyeX || 1.0) * k;
  decals.push({ p: HL([-eyeX, eyeY, eyeZ]), idx: 'eye', on: ['skin'], tag: 'eyeL' }, { p: HL([eyeX, eyeY, eyeZ]), idx: 'eye', on: ['skin'], tag: 'eyeR' });
  decals.push({ p: HL([hr[0] * 0.9, hr[1] * 0.5, eyeZ + 0.1 * k]), idx: 'eye', on: ['skin'], tag: 'sideeye' });
  if (sp.tusks) for (const s of [-1, 1]) decals.push({ p: HL([s * hr[0] * 0.5, hr[1] * 0.95, -hr[2] * 0.62]), idx: 'tusk', on: ['skin'], tag: s < 0 ? 'tuskL' : 'tuskR' });
  // ---- arms
  const hands = {};
  for (const side of [-1, 1]) {
    const A = (side < 0 ? P.armL : P.armR) || {}, sw = A.sw || 0, ab = (A.ab == null ? 0.12 : A.ab), el = A.el || 0;
    const sh = [side * sp.shoulderW * k, 0, tH * 0.86 + sp.chestUp * k];
    const d1 = [side * S(ab), S(sw) * C(ab), -C(sw) * C(ab)], d2 = [side * S(ab) * 0.8, S(sw + el) * C(ab), -C(sw + el) * C(ab)];
    const hl = sp.armLen * k / 2, elb = add(sh, scl(d1, hl)), hand = add(elb, scl(d2, hl));
    sc.cap(U(sh), U(elb), sp.armR * k * 1.05, sp.armR * k * 0.95, 'cloth', { g: 3 });
    sc.cap(U(elb), U(hand), sp.armR * k * 0.92, sp.armR * k * 0.85, sp.sleeves === 'long' ? 'cloth' : 'skin', { g: 3 });
    sc.ell(U(hand), [sp.handR * k, sp.handR * k, sp.handR * k], 'skin', { g: 3, pri: 1 });
    hands[side < 0 ? 'L' : 'R'] = { pos: hand, dir: d2, side, sw: sw + el };
  }
  // ---- accessories
  const bones = { U, W, HL, hc, hr, headR, hands, chest, tH, k, pose: P, upR: mul(rootR, upR), rootR, sp };
  for (const a of sp.acc) ACC[a.kind](sc, bones, a, decals);
  return { scene: sc, decals };
}

// tool held in a hand: shaft from the hand along a direction rotated from the forearm
function toolAxis(b, hand, ang) {
  // absolute tool direction: angle from vertical-up toward forward (+y); slight outward tilt
  const h = b.hands[hand], a = (b.pose.tool == null ? 0.15 : b.pose.tool) + (ang || 0);
  return [h.side * 0.45 * C(a), S(a), C(a)];
}
const ACC = {
  axe(sc, b, a) { const h = b.hands[a.hand || 'R'], d = toolAxis(b, a.hand || 'R'), k = b.k, tip = add(h.pos, scl(d, 4.3 * k)), base = add(h.pos, scl(d, -1.0 * k));
    sc.cap(b.U(base), b.U(tip), 0.55 * k, 0.55 * k, 'wood', { pri: 2 });
    const hd = add(tip, scl(d, -0.7 * k)), n = [0, -d[2], d[1]]; // perpendicular in y-z
    sc.box(b.U(add(hd, scl(n, 0.9 * k))), [0.5 * k, 1.1 * k, 1.0 * k], 'steel', { rot: b.upR, round: 0.2, pri: 3 }); },
  pick(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k, tip = add(h.pos, scl(d, 4.2 * k)), base = add(h.pos, scl(d, -1.0 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(base), b.U(tip), 0.55 * k, 0.55 * k, 'wood', { pri: 2 });
    sc.cap(b.U(add(tip, scl(n, 2.0 * k))), b.U(add(tip, scl(d, 0.5 * k))), 0.3 * k, 0.55 * k, 'steel', { pri: 3 }); sc.cap(b.U(add(tip, scl(n, -2.0 * k))), b.U(add(tip, scl(d, 0.5 * k))), 0.3 * k, 0.55 * k, 'steel', { pri: 3 }); },
  hoe(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k, tip = add(h.pos, scl(d, 4.6 * k)), base = add(h.pos, scl(d, -1.4 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(base), b.U(tip), 0.4 * k, 0.4 * k, 'wood', { pri: 2 }); sc.cap(b.U(tip), b.U(add(tip, scl(n, 1.5 * k))), 0.55 * k, 0.45 * k, 'steel', { pri: 3 }); },
  hammer(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k, tip = add(h.pos, scl(d, 2.8 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(add(h.pos, scl(d, -0.6 * k))), b.U(tip), 0.4 * k, 0.4 * k, 'wood', { pri: 2 }); sc.cap(b.U(add(tip, scl(n, -1.0 * k))), b.U(add(tip, scl(n, 1.0 * k))), 0.75 * k, 0.75 * k, a.mat || 'steel', { pri: 3 }); },
  sword(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k;
    sc.cap(b.U(add(h.pos, scl(d, 0.6 * k))), b.U(add(h.pos, scl(d, (a.len || 5.4) * k))), 0.62 * k, 0.42 * k, a.mat || 'blade', { pri: 6 });
    sc.cap(b.U(add(h.pos, [-0.9 * k, 0, 0].map((v, i) => v + d[i] * 0.6 * k))), b.U(add(h.pos, [0.9 * k, 0, 0].map((v, i) => v + d[i] * 0.6 * k))), 0.35 * k, 0.35 * k, 'gold', { pri: 3 }); },
  club(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k; sc.cap(b.U(add(h.pos, scl(d, -0.5 * k))), b.U(add(h.pos, scl(d, 4.4 * k))), 0.45 * k, 1.15 * k, a.mat || 'wood', { pri: 3 }); },
  cleaver(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k, n = [0, -d[2], d[1]];
    sc.cap(b.U(h.pos), b.U(add(h.pos, scl(d, 1.4 * k))), 0.4 * k, 0.4 * k, 'wood', { pri: 2 });
    sc.box(b.U(add(add(h.pos, scl(d, 3.2 * k)), scl(n, 0.5 * k))), [0.4 * k, 1.1 * k, 2.0 * k], a.mat || 'steel', { rot: mul(b.upR, rotX(-(Math.atan2(d[1], -d[2]) + PI))), round: 0.25, pri: 3 }); },
  spear(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R', -0.25), k = b.k, tip = add(h.pos, scl(d, 5.6 * k));
    sc.cap(b.U(add(h.pos, scl(d, -2.6 * k))), b.U(tip), 0.36 * k, 0.36 * k, 'wood', { pri: 2 }); sc.cap(b.U(tip), b.U(add(tip, scl(d, 1.5 * k))), 0.7 * k, 0.15 * k, a.mat || 'steel', { pri: 3 }); },
  staff(sc, b, a) { const h = b.hands.R, k = b.k, d = toolAxis(b, 'R', -0.3), top = add(h.pos, scl(d, 5.0 * k));
    sc.cap(b.U(add(h.pos, scl(d, -3.6 * k))), b.U(top), 0.4 * k, 0.4 * k, 'wood', { pri: 2 }); sc.ell(b.U(add(top, scl(d, 0.7 * k))), [0.95 * k, 0.95 * k, 0.95 * k], a.mat || 'gold', { pri: 3 }); },
  crook(sc, b, a) { const h = b.hands.R, k = b.k, d = toolAxis(b, 'R', -0.3), top = add(h.pos, scl(d, 5.0 * k));
    sc.cap(b.U(add(h.pos, scl(d, -3.6 * k))), b.U(top), 0.38 * k, 0.38 * k, 'wood', { pri: 2 }); sc.cap(b.U(top), b.U(add(top, [0.0, 1.2 * k, 0.5 * k])), 0.38 * k, 0.38 * k, 'wood', { pri: 2 }); sc.cap(b.U(add(top, [0, 1.2 * k, 0.5 * k])), b.U(add(top, [0, 1.5 * k, -0.6 * k])), 0.38 * k, 0.3 * k, 'wood', { pri: 2 }); },
  rod(sc, b, a) { const h = b.hands.R, k = b.k, d = toolAxis(b, 'R', -0.6), top = add(h.pos, scl(d, 6.5 * k));
    sc.cap(b.U(add(h.pos, scl(d, -0.8 * k))), b.U(top), 0.36 * k, 0.3 * k, 'wood', { pri: 2 }); },
  bow(sc, b, a) { const h = b.hands.L, k = b.k, c = h.pos, dr = b.pose.draw || 0;
    const up = [0, 0.25, 0.97], f = [0, 0.97, -0.25];
    const m = add(c, scl(f, 0.5 * k)), t1 = add(add(c, scl(up, 3.0 * k)), scl(f, -0.9 * k)), t2 = add(add(c, scl(up, -3.0 * k)), scl(f, -0.9 * k));
    sc.cap(b.U(m), b.U(t1), 0.45 * k, 0.32 * k, 'wood', { pri: 3 }); sc.cap(b.U(m), b.U(t2), 0.45 * k, 0.32 * k, 'wood', { pri: 3 });
    if (dr > 0.3) { sc.cap(b.U(add(c, scl(f, -2.8 * k * dr))), b.U(add(c, scl(f, 1.6 * k))), 0.3 * k, 0.3 * k, 'steel', { pri: 3 }); } },
  shield(sc, b, a) { const h = b.hands.L, k = b.k, R = mul(b.upR, rotZ(-0.45)); sc.ell(b.U(add(h.pos, [-0.5 * k, 0.9 * k, 0.9 * k])), [2.1 * k, 0.75 * k, 2.4 * k], a.mat || 'wood', { rot: R, pri: 5 });
    sc.ell(b.U(add(h.pos, [-0.62 * k, 1.5 * k, 0.9 * k])), [0.85 * k, 0.5 * k, 0.95 * k], a.boss || 'steel', { rot: R, pri: 6 }); },
  helmet(sc, b, a) { const hr = b.hr; if (a.circlet) { sc.cap(b.HL([0, 0, hr[2] * 0.42]), b.HL([0, 0, hr[2] * 0.62]), hr[0] * 1.04, hr[0] * 1.0, a.mat || 'steel', { pri: 4 }); sc.ell(b.HL([0, hr[1] * 0.9, hr[2] * 0.62]), [0.6 * b.k, 0.5 * b.k, 0.8 * b.k], a.mat || 'steel', { pri: 5 }); return; } sc.ell(b.HL([0, -hr[1] * 0.32, hr[2] * 0.66]), [hr[0] * 1.1, hr[1] * 0.84, hr[2] * 0.54], a.mat || 'steel', { rot: b.headR, pri: 4 }); sc.ell(b.HL([0, -hr[1] * 0.7, hr[2] * 0.1]), [hr[0] * 1.06, hr[1] * 0.46, hr[2] * 0.8], a.mat || 'steel', { rot: b.headR, pri: 4 });
    if (a.crest) sc.ell(b.HL([0, -0.2 * b.k, hr[2] * 1.15]), [0.55 * b.k, hr[1] * 0.9, 0.9 * b.k], a.crest, { rot: b.headR, pri: 5 });
    if (a.horns) for (const s of [-1, 1]) sc.cap(b.HL([s * hr[0] * 0.9, 0, hr[2] * 0.6]), b.HL([s * (hr[0] + 1.3 * b.k), 0, hr[2] * 1.5]), 0.55 * b.k, 0.2 * b.k, 'bone', { pri: 5 }); },
  hat(sc, b, a) { const hr = b.hr, k = b.k; sc.ell(b.HL([0, 0, hr[2] * 0.62]), [hr[0] * 1.55, hr[1] * 1.55, 0.6 * k], a.mat || 'straw', { rot: b.headR, pri: 4 }); sc.ell(b.HL([0, 0, hr[2] * 0.95]), [hr[0] * 0.8, hr[1] * 0.8, 1.0 * k], a.mat || 'straw', { rot: b.headR, pri: 4 }); },
  hood(sc, b, a) { const hr = b.hr, k = b.k; sc.ell(b.HL([0, -0.5 * k, 0.35 * k]), [hr[0] * 1.12, hr[1] * 1.05, hr[2] * 1.1], a.mat || 'cloth2', { rot: b.headR, pri: 4 }); sc.cap(b.HL([0, -0.8 * k, hr[2] * 0.9]), b.HL([0, -1.6 * k, hr[2] * 1.5]), 1.0 * k, 0.3 * k, a.mat || 'cloth2', { pri: 4 }); },
  crown(sc, b, a) { const hr = b.hr, k = b.k; sc.cap(b.HL([0, 0, hr[2] * 0.75]), b.HL([0, 0, hr[2] * 1.2]), hr[0] * 0.78, hr[0] * 0.9, 'gold', { pri: 5 });
    },
  cape(sc, b, a) { const k = b.k, r = a.r || 1; sc.cap(b.U([0, -1.5 * k * r, b.tH * 0.85]), b.W([0, -2.0 * k * r - (b.pose.lean || 0) * 2, (a.end || 1.6) * k]), 1.9 * k * r, 2.4 * k * r, a.mat || 'cloth2', { pri: 2 }); },
  pack(sc, b, a) { const k = b.k; sc.box(b.U([0, -1.9 * k, b.tH * 0.55]), [1.6 * k, 1.0 * k, 1.5 * k], a.mat || 'leather', { rot: b.upR, round: 0.5, pri: 2 }); },
  quiver(sc, b, a) { const k = b.k; sc.cap(b.U([0.8 * k, -1.6 * k, b.tH * 0.2]), b.U([-1.0 * k, -1.6 * k, b.tH * 1.25]), 0.7 * k, 0.7 * k, 'leather', { pri: 2 }); },
  apron(sc, b, a) { const k = b.k; sc.box(b.U([0, 1.2 * k, b.tH * 0.3]), [1.5 * k, 0.5 * k, 1.5 * k], a.mat || 'leather', { rot: b.upR, round: 0.3, pri: 3 }); },
  pauldrons(sc, b, a) { const k = b.k, sp = b.sp; for (const s of [-1, 1]) sc.ell(b.U([s * sp.shoulderW * k * 1.05, 0, b.tH * 0.98]), [1.3 * k, 1.2 * k, 1.0 * k], a.mat || 'steel', { pri: 4 }); },
  book(sc, b, a) { const h = b.hands.L, k = b.k; sc.box(b.U(add(h.pos, [0.3 * k, 0.6 * k, 0.4 * k])), [1.1 * k, 0.5 * k, 1.3 * k], a.mat || 'cloth2', { rot: b.upR, round: 0.15, pri: 4 }); },
  // long bill of the crane folk
  beak(sc, b, a) { const hr = b.hr, k = b.k; sc.cap(b.HL([0, hr[1] * 0.75, -hr[2] * 0.1]), b.HL([0, hr[1] * 0.75 + (a.len || 2.8) * k, -hr[2] * 0.5]), 0.8 * k, 0.22 * k, a.mat || 'beak', { pri: 3 }); },
  // mushroom cap of the bog folk: wide dome, pale gills under the rim, three pale spots
  mushcap(sc, b, a) { const hr = b.hr, k = b.k, R = a.r || 1.6; sc.ell(b.HL([0, -0.1 * k, hr[2] * 0.25]), [hr[0] * R * 0.86, hr[1] * R * 0.86, 0.55 * k], a.gill || 'gill', { rot: b.headR, pri: 3 });
    sc.ell(b.HL([0, -0.1 * k, hr[2] * 0.42]), [hr[0] * R, hr[1] * R, hr[2] * 0.95], a.mat || 'cap', { rot: b.headR, pri: 4 });
    for (const [x, y, z, r] of [[-0.55, 0.35, 1.02, 0.62], [0.6, -0.1, 1.12, 0.7], [0.05, 0.75, 0.72, 0.5], [-0.2, -0.75, 0.95, 0.6]]) sc.ell(b.HL([x * hr[0] * R * 0.8, y * hr[1] * R * 0.8, hr[2] * 0.42 + z * hr[2] * 0.82]), [r * k, r * k, 0.5 * k], a.spot || 'spot', { rot: b.headR, pri: 5 }); },
  // ---- chantier A.8: the four peoples' own trades
  // warden of the grove (elves): a living staff, leaves and one blossom at its head; a mantle of leaves on the shoulders
  leafstaff(sc, b, a) { const h = b.hands.R, k = b.k, d = toolAxis(b, 'R', -0.3), top = add(h.pos, scl(d, 5.2 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(add(h.pos, scl(d, -3.6 * k))), b.U(top), 0.4 * k, 0.34 * k, 'wood2', { pri: 2 }); sc.cap(b.U(top), b.U(add(top, scl(n, -1.3 * k))), 0.34 * k, 0.3 * k, 'wood2', { pri: 2 });
    sc.ell(b.U(add(top, scl(d, 0.9 * k))), [1.25 * k, 1.1 * k, 1.0 * k], 'leaf', { pri: 4 }); sc.ell(b.U(add(add(top, scl(d, 0.2 * k)), scl(n, -1.7 * k))), [0.85 * k, 0.8 * k, 0.75 * k], 'leafL', { pri: 4 }); sc.ell(b.U(add(add(top, scl(d, 1.5 * k)), scl(n, 0.7 * k))), [0.5 * k, 0.5 * k, 0.5 * k], 'bloom', { pri: 6 }); },
  mantle(sc, b, a) { const k = b.k, sp = b.sp; sc.ell(b.U([0, -0.5 * k, b.tH * 0.9]), [sp.shoulderW * k * 1.25, sp.torsoR[1] * k * 1.35, 1.25 * k], 'leaf', { rot: b.upR, pri: 4 }); sc.cap(b.U([0, -1.3 * k, b.tH * 0.8]), b.U([0, -1.8 * k, b.tH * 0.15]), 1.5 * k, 1.9 * k, 'leaf', { pri: 2 });
    for (const s of [-1, 1]) sc.ell(b.U([s * sp.shoulderW * k * 1.05, 0.3 * k, b.tH * 1.0]), [0.9 * k, 0.9 * k, 0.6 * k], 'leafL', { pri: 5 }); },
  // delver (dwarves): a lamp on the iron cap, a hod of ore on the back
  lamp(sc, b, a) { const hr = b.hr, k = b.k; sc.box(b.HL([0, hr[1] * 0.78, hr[2] * 0.72]), [0.65 * k, 0.5 * k, 0.65 * k], 'gold', { rot: b.headR, round: 0.2, pri: 6 }); sc.ell(b.HL([0, hr[1] * 1.02, hr[2] * 0.72]), [0.5 * k, 0.4 * k, 0.5 * k], 'lampl', { pri: 7 }); },
  orepack(sc, b, a) { const k = b.k; sc.box(b.U([0, -2.0 * k, b.tH * 0.5]), [1.7 * k, 1.1 * k, 1.6 * k], 'leather', { rot: b.upR, round: 0.3, pri: 2 }); sc.ell(b.U([-0.7 * k, -2.0 * k, b.tH * 0.5 + 1.8 * k]), [0.95 * k, 0.85 * k, 0.8 * k], 'orem', { pri: 3 }); sc.ell(b.U([0.7 * k, -2.1 * k, b.tH * 0.5 + 1.6 * k]), [0.85 * k, 0.8 * k, 0.7 * k], 'steel', { pri: 3 }); },
  // sporer (myrrin): a short sickle, a wicker basket where small caps poke out
  sickle(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R'), k = b.k, tip = add(h.pos, scl(d, 2.6 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(add(h.pos, scl(d, -0.6 * k))), b.U(tip), 0.42 * k, 0.42 * k, 'wood', { pri: 2 }); sc.cap(b.U(tip), b.U(add(add(tip, scl(d, 2.0 * k)), scl(n, 1.2 * k))), 0.55 * k, 0.45 * k, 'blade', { pri: 7 }); sc.cap(b.U(add(add(tip, scl(d, 2.0 * k)), scl(n, 1.2 * k))), b.U(add(add(tip, scl(d, 1.4 * k)), scl(n, 3.2 * k))), 0.45 * k, 0.22 * k, 'blade', { pri: 7 }); },
  basket(sc, b, a) { const k = b.k, h = b.hands.L, c = add(h.pos, [-0.5 * k, 0.5 * k, -0.9 * k]); sc.cap(b.U(add(c, [0, 0, -0.7 * k])), b.U(add(c, [0, 0, 0.5 * k])), 0.85 * k, 1.15 * k, 'wood2', { pri: 6 });
    sc.ell(b.U(add(c, [-0.35 * k, 0.1 * k, 1.0 * k])), [0.8 * k, 0.75 * k, 0.6 * k], 'capT', { pri: 7 }); sc.ell(b.U(add(c, [0.55 * k, -0.1 * k, 0.8 * k])), [0.6 * k, 0.6 * k, 0.5 * k], 'gill', { pri: 7 }); },
  // diver (okari): a three-pronged fish spear, a net bag at the hip with a glass float
  trident(sc, b, a) { const h = b.hands.R, d = toolAxis(b, 'R', -0.25), k = b.k, tip = add(h.pos, scl(d, 5.0 * k)), n = [0, -d[2], d[1]];
    sc.cap(b.U(add(h.pos, scl(d, -2.8 * k))), b.U(tip), 0.34 * k, 0.34 * k, 'wood', { pri: 2 }); sc.cap(b.U(add(tip, scl(n, -1.3 * k))), b.U(add(tip, scl(n, 1.3 * k))), 0.32 * k, 0.32 * k, 'blade', { pri: 5 });
    for (const s of [-1.3, 0, 1.3]) sc.cap(b.U(add(tip, scl(n, s * k))), b.U(add(add(tip, scl(n, s * k)), scl(d, (s ? 1.5 : 2.0) * k))), 0.34 * k, 0.14 * k, 'blade', { pri: 6 }); },
  netbag(sc, b, a) { const k = b.k; sc.ell(b.U([-1.7 * k, 0.4 * k, b.tH * 0.12]), [1.15 * k, 1.0 * k, 1.3 * k], 'net', { pri: 5 }); sc.ell(b.U([-1.9 * k, 0.9 * k, b.tH * 0.12 + 1.1 * k]), [0.6 * k, 0.6 * k, 0.6 * k], 'float', { pri: 6 }); sc.cap(b.U([-1.2 * k, 0, b.tH * 0.75]), b.U([-1.7 * k, 0.3 * k, b.tH * 0.3]), 0.22 * k, 0.22 * k, 'leather', { pri: 4 }); },
  sack(sc, b, a) { const k = b.k; sc.ell(b.U([0.6 * k, -1.7 * k, b.tH * 0.9]), [1.7 * k, 1.5 * k, 1.8 * k], a.mat || 'straw', { pri: 3 }); },
};
module.exports = { build, ANIMS, DEF, ACC };
