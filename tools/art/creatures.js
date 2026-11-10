// Animal sources: species = proportions on the quadruped rig (or the small bird / fish rigs below), materials, cell size, animations.
'use strict';
const { Scene, rotX, rotY, rotZ, mul, app, add } = require('../lib/sdf'); const { mat, ix } = require('../lib/mats'); const Q = require('./rigs/quadruped');
const S = Math.sin, C = Math.cos, PI = Math.PI;
const QA = [['idle', 4], ['walk', 4], ['run', 4], ['eat', 4], ['attack', 4], ['hit', 4], ['death', 2], ['sleep', 2]];
// ---- bird rig: body, head, beak, two wings that flap, tail. Faces +y.
function bird(sp, anim, i) { const sc = new Scene(), k = sp.scale, fly = anim === 'fly' || anim === 'walk' || anim === 'run', n = 4, t = i / n * 2 * PI;
  const dead = anim === 'death' ? Math.min(1, (i + 1) / 3) : 0, flap = fly ? S(t) * 0.75 : anim === 'attack' ? [0.9, 1.1, -0.6, -0.9, 0, 0.4][i] : 0, z = (fly ? 2 + 0.5 * C(t) : 1.4) * k * (1 - dead * 0.6) + (anim === 'attack' ? [1, 2, -0.5, -1, 0, 0.5][i] * 0.5 : 0);
  const R = rotY(dead * 1.4), W = v => add(app(R, v), [0, anim === 'attack' ? [0, -0.5, 1.5, 2, 1, 0][i] : 0, z]);
  sc.ell(W([0, 0, 0]), [1.25 * k, 2.3 * k, 1.2 * k], 'body', { rot: R, g: 1 }); sc.ell(W([0, 2.1 * k, 0.7 * k]), [1.05 * k, 1.1 * k, 1.0 * k], sp.head ? 'head' : 'body', { g: 1, k: 0.4, pri: 1 });
  sc.cap(W([0, 2.9 * k, 0.55 * k]), W([0, 3.9 * k, 0.3 * k]), 0.42 * k, 0.15 * k, 'beak', { pri: 2 }); sc.box(W([0, -2.6 * k, 0.1 * k]), [0.9 * k, 1.2 * k, 0.3 * k], 'wing', { rot: R, pri: 1 });
  if (fly || anim === 'attack') for (const s of [-1, 1]) { const a = flap * s; sc.box(W([s * 2.6 * k * C(flap * 0.6), 0.1 * k, 0.4 * k + S(flap) * 1.5 * k]), [2.3 * k, 1.25 * k, 0.32 * k], 'wing', { rot: mul(R, rotY(-a)), round: 0.2, pri: 1 }); }
  else for (const s of [-1, 1]) sc.ell(W([s * 1.0 * k, -0.4 * k, 0.25 * k]), [0.7 * k, 1.9 * k, 0.9 * k], 'wing', { pri: 1 });
  return { scene: sc, decals: [{ p: W([-0.95 * k, 2.4 * k, 0.9 * k]), idx: 'eye', tag: 'eyeL' }, { p: W([0.95 * k, 2.4 * k, 0.9 * k]), idx: 'eye', tag: 'eyeR' }] }; }
// ---- fish rig: body, tail fin that wags, dorsal fin. Faces +y.
function fish(sp, anim, i) { const sc = new Scene(), k = sp.scale, t = i / 4 * 2 * PI, wag = S(t) * (anim === 'run' ? 0.8 : 0.5), dead = anim === 'death' ? 1 : 0, R = rotY(dead * 1.5), W = v => add(app(R, v), [0, 0, 1.6 * k]);
  sc.ell(W([S(t) * 0.2 * k, 0, 0]), [0.95 * k, 2.6 * k, 1.35 * k], 'body', { rot: R, g: 1 }); sc.ell(W([0, 0.3 * k, -0.5 * k]), [0.8 * k, 2.0 * k, 0.8 * k], 'belly', { rot: R, pri: -1 });
  sc.box(W([S(wag) * 1.2 * k, -3.2 * k, 0]), [0.3 * k, 1.0 * k, 1.3 * k], 'fin', { rot: mul(R, rotZ(wag)), round: 0.2, pri: 1 }); sc.box(W([0, -0.2 * k, 1.3 * k]), [0.25 * k, 1.1 * k, 0.6 * k], 'fin', { rot: R, round: 0.2, pri: 1 });
  return { scene: sc, decals: [{ p: W([-0.85 * k, 1.7 * k, 0.25 * k]), idx: 'eye', tag: 'eyeL' }, { p: W([0.85 * k, 1.7 * k, 0.25 * k]), idx: 'eye', tag: 'eyeR' }] }; }
const BA = [['idle', 2], ['fly', 4], ['attack', 4], ['death', 2]], FA = [['swim', 4], ['run', 4], ['death', 2]];
const E0 = ix('stone', 0);
const SPECIES = {
  rabbit: { cell: 16, oy: 13, rig: 'quad', eye: E0, spec: { scale: 1.12, bodyLen: 3.4, bodyR: [1.5, 1.6], rump: 1.15, legLen: 1.3, legR: 0.5, legSpread: 0.9, neckLen: 0.8, neckAng: 1.1, neckR: 0.9, headR: [1.15, 1.35, 1.15], earLen: 2.3, earOut: 0.12, ears: 1.1, tail: { len: 0.5, up: 1, r: 0.75 }, mats: { tail: 'white' } },
    mats: { fur: mat('earth', [3, 4, 5]), white: mat('ice', [3, 4, 5], { ink: 'earth' }) } },
  deer: { cell: 24, oy: 21, rig: 'quad', eye: E0, spec: { scale: 1.25, bodyLen: 6.2, bodyR: [1.7, 1.9], legLen: 4.2, legR: 0.55, neckLen: 3.2, neckAng: 1.05, headR: [1.15, 1.9, 1.2], snout: 1.0, antlers: 1, earLen: 1.3, tail: { len: 1.0, up: 0.6, r: 0.6 }, mats: { hoof: 'hoof', tail: 'white' } },
    mats: { fur: mat('earth', [3, 4, 5]), bone: mat('sand', [3, 4, 5]), hoof: mat('earth', [0, 1]), white: mat('ice', [3, 4, 5], { ink: 'earth' }) } },
  sheep: { cell: 24, oy: 20, rig: 'quad', eye: ix('ice', 5), spec: { scale: 1.15, bodyLen: 5, bodyR: [2.0, 2.0], wool: 1.45, legLen: 2.5, legR: 0.5, neckLen: 1.4, neckAng: 0.75, headR: [1.0, 1.5, 1.05], snout: 0.6, earLen: 0.8, earOut: 1.2, tail: { len: 0.6, up: -0.4, r: 0.6 }, mats: { head: 'dark', leg: 'dark', ear: 'dark', neck: 'fur' } },
    mats: { fur: mat('ice', [3, 4, 5], { ink: 'stone' }), dark: mat('stone', [1, 2, 3]) } },
  boar: { cell: 24, oy: 20, rig: 'quad', eye: E0, tusk: ix('ice', 5), spec: { scale: 1.15, bodyLen: 5.4, bodyR: [2.0, 2.1], chest: 1.15, rump: 0.9, legLen: 2.1, legR: 0.6, neckLen: 1.2, neckAng: 0.25, neckR: 1.4, headR: [1.3, 1.9, 1.35], headAng: 0.05, snout: 1.4, tusks: 1, mane: 0.85, earLen: 0.8, tail: { len: 0.9, up: 0.9, r: 0.35 }, mats: { mane: 'mane', snout: 'snout' } },
    mats: { fur: mat('earth', [1, 2, 3]), mane: mat('earth', [0, 1, 2]), snout: mat('skin', [1, 2, 3]) } },
  wolf: { cell: 24, oy: 20, rig: 'quad', eye: ix('fire', 4), spec: { scale: 1.15, bodyLen: 6, bodyR: [1.5, 1.7], chest: 1.12, rump: 0.85, legLen: 3.3, legR: 0.5, neckLen: 1.8, neckAng: 0.55, neckR: 1.15, headR: [1.25, 1.7, 1.2], snout: 1.5, earLen: 1.15, earOut: 0.3, tail: { len: 3.0, up: -0.35, r: 0.8, tip: 0.4 }, mats: { snout: 'belly' } },
    mats: { fur: mat('stone', [2, 3, 4]), belly: mat('stone', [3, 4, 5]) } },
  bear: { cell: 32, oy: 27, rig: 'quad', eye: E0, spec: { scale: 1.6, bodyLen: 6.6, bodyR: [2.5, 2.5], chest: 1.1, hump: 0.9, legLen: 2.7, legR: 0.95, legSpread: 1.5, neckLen: 1.4, neckAng: 0.45, neckR: 1.5, headR: [1.6, 1.9, 1.5], snout: 1.1, earLen: 0.6, ears: 1.2, earOut: 0.8, tail: { len: 0.4, up: 0, r: 0.6 }, mats: { snout: 'snout' } },
    mats: { fur: mat('earth', [1, 2, 3]), snout: mat('sand', [2, 3, 4], { ink: 'earth' }) } },
  eagle: { cell: 16, oy: 13, rig: 'bird', eye: E0, spec: { scale: 1.3, head: 1 }, mats: { body: mat('earth', [1, 2, 3]), head: mat('ice', [3, 4, 5], { ink: 'earth' }), wing: mat('earth', [0, 1, 2]), beak: mat('fire', [3, 4]) } },
  salmon: { cell: 16, oy: 13, rig: 'fish', eye: E0, spec: { scale: 1.25 }, mats: { body: mat('pink', [3, 4, 5]), belly: mat('ice', [3, 4, 5], { ink: 'red' }), fin: mat('red', [1, 2, 3]) } },
};
function frame(name, anim, i) { const sp = SPECIES[name]; if (sp.rig === 'quad') return Q.build(sp.spec, Q.ANIMS[anim].f(i)); return sp.rig === 'bird' ? bird(sp.spec, anim, i) : fish(sp.spec, anim, i); }
function anims(name) { const sp = SPECIES[name]; return sp.rig === 'quad' ? QA.map(([a, nd]) => [a, Q.ANIMS[a].n, nd]) : (sp.rig === 'bird' ? BA : FA).map(([a, nd]) => [a, a === 'idle' || a === 'death' ? 2 : a === 'attack' ? 6 : 4, nd]); }
module.exports = { SPECIES, frame, anims };
