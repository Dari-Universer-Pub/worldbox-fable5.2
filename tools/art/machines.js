// Siege machines (chantier B.4, pipeline A): a covered battering ram and a catapult, modelled with the implicit-surface kit,
// rendered in four directions. Animations: move (4 frames, the wheels turn and the machine rocks), attack (6 frames: the log
// swings back and strikes / the arm is wound down and let go), wreck (1 frame: broken and charred). Both carry the kingdom colour.
// The model points to +x (front) and stands on z = 0. Cell 48x48. Baked by tools/bake-machines.js.
'use strict';
const { Scene, rotY, rotX, mul, app, add } = require('../lib/sdf'); const { mat, team } = require('../lib/mats');
const MATS = { wood: mat('earth', [2, 3, 4]), woodD: mat('earth', [0, 1, 2]), plank: mat('sand', [1, 2, 3], { ink: 'earth' }), hide: mat('sand', [2, 3, 4], { ink: 'earth' }), hideD: mat('earth', [1, 2, 3]), iron: mat('stone', [2, 3, 4]), ironD: mat('stone', [0, 1, 2]),
  rope: mat('sand', [3, 4, 5], { ink: 'earth' }), cloth: team([2, 3, 4]), clothD: team([1, 2, 3]), stone: mat('stone', [3, 4, 5]), char: mat('stone', [0, 1, 2]), ember: mat('fire', [3, 4, 5]) };
const MACHINES = { ram: { cell: 48, oy: 38 }, catapult: { cell: 48, oy: 38 } }, ANIMS = [['move', 4], ['attack', 6], ['wreck', 1]];
const S = Math.sin, C = Math.cos, PI = Math.PI;
// a spoked wheel standing in the x-z plane at (x, y), radius r, turned by angle a
function wheel(sc, W, x, y, r, a, broken) { const c = [x, y, r]; sc.ell(W(c), [r, 0.55, r], 'woodD', { pri: 4 }); sc.ell(W(add(c, [0, y > 0 ? 0.3 : -0.3, 0])), [r * 0.72, 0.5, r * 0.72], 'plank', { pri: 5 }); sc.ell(W(add(c, [0, y > 0 ? 0.5 : -0.5, 0])), [0.75, 0.5, 0.75], 'iron', { pri: 7 });
  if (!broken) for (let q = 0; q < 2; q++) { const b = a + q * PI / 2, d = [C(b) * r * 0.66, y > 0 ? 0.45 : -0.45, S(b) * r * 0.66]; sc.cap(W(add(c, [-d[0], d[1], -d[2]])), W(add(c, d)), 0.3, 0.3, 'woodD', { pri: 6 }); } }
function frame(name, anim, i) { const sc = new Scene(), wreck = anim === 'wreck', t = anim === 'move' ? i / 4 * 2 * PI : 0, rock = anim === 'move' ? S(t) * 0.035 : 0, R = wreck ? mul(rotY(0.16), rotX(0.22)) : rotY(rock), W = v => add(app(R, v), [0, 0, anim === 'move' ? Math.abs(C(t)) * 0.3 : 0]);
  const box = (c, h, m, o) => sc.box(W(c), h, m, Object.assign({ rot: R }, o)), turn = anim === 'move' ? i * PI / 4 : 0, WD = wreck ? 'char' : 'wood', WK = wreck ? 'char' : 'woodD';
  if (name === 'ram') { // a wheeled frame under a steep roof of hides; the log hangs from ropes and swings
    const k = anim === 'attack' ? [0, -2.2, -3.6, 3.4, 4.2, 1.2][i] : 0, lz = 5.6 + Math.abs(k) * 0.12;
    for (const sx of [-6.5, 6.5]) for (const sy of [-4.6, 4.6]) { if (wreck && sx > 0 && sy > 0) continue; wheel(sc, W, sx, sy, 2.7, turn, wreck); }
    box([0, 0, 3.4], [9.5, 3.9, 0.55], WD, { pri: 3 }); box([0, 4.0, 3.6], [9.8, 0.45, 0.6], WK, { pri: 4 }); box([0, -4.0, 3.6], [9.8, 0.45, 0.6], WK, { pri: 4 });
    for (const sx of [-7.5, 7.5]) for (const sy of [-3.6, 3.6]) sc.cap(W([sx, sy, 3.6]), W([sx * 0.92, sy * 0.25, 13.2]), 0.55, 0.45, WK, { pri: 4 });
    if (!wreck) { sc.prism(W([0, 0, 9.3]), 0, 8.6, 5.0, 4.6, 'hide', { pri: 5 }); box([0, 0, 13.7], [8.9, 0.5, 0.45], 'woodD', { pri: 7 }); // ridge pole
      for (const sx of [-5.6, -1.9, 1.9, 5.6]) { box([sx, 2.5, 11.3], [0.25, 2.9, 0.3], 'hideD', { rot: mul(R, rotX(0.74)), pri: 6 }); box([sx, -2.5, 11.3], [0.25, 2.9, 0.3], 'hideD', { rot: mul(R, rotX(-0.74)), pri: 6 }); }
      box([0, 3.0, 10.9], [2.2, 0.35, 1.5], 'cloth', { rot: mul(R, rotX(0.74)), pri: 8, round: 0.2 }); box([0, -3.0, 10.9], [2.2, 0.35, 1.5], 'cloth', { rot: mul(R, rotX(-0.74)), pri: 8, round: 0.2 });
    } else { sc.prism(W([-3, 0, 8.6]), 0, 4.6, 4.6, 3.6, 'char', { pri: 5 }); sc.ell(W([-1, 1.5, 9.5]), [1.1, 0.9, 0.7], 'ember', { pri: 8 }); sc.ell(W([-5, -1, 8.6]), [0.8, 0.7, 0.6], 'ember', { pri: 8 }); }
    // the log: a trunk with iron bands and an iron head, hung on two ropes
    sc.cap(W([-8.5 + k, 0, lz - (wreck ? 2.6 : 0)]), W([10.5 + k, 0, lz - (wreck ? 1.4 : 0)]), 1.45, 1.45, wreck ? 'char' : 'plank', { pri: 4 }); sc.cap(W([10.2 + k, 0, lz - (wreck ? 1.4 : 0)]), W([13.2 + k, 0, lz - (wreck ? 1.3 : 0)]), 1.9, 1.25, wreck ? 'ironD' : 'iron', { pri: 6 });
    if (!wreck) { for (const bx of [-5, 3]) sc.cap(W([bx + k, 0, lz]), W([bx + 0.5 + k, 0, lz]), 1.6, 1.6, 'ironD', { pri: 5 }); for (const rx of [-5, 5]) sc.cap(W([rx, 0, 13.2]), W([rx + k, 0, lz + 1.3]), 0.22, 0.22, 'rope', { pri: 5 }); }
  } else { // catapult: a heavy wheeled frame, two uprights with a padded cross-beam, a long arm with a bucket, a winch and a rope
    const a = anim === 'attack' ? [0.3, 0.12, 0.0, 1.25, 1.5, 0.9][i] : wreck ? 0.05 : 0.3, loaded = anim !== 'attack' ? !wreck : i < 3; // arm angle from horizontal (back end low) to past upright
    for (const sx of [-7, 6.5]) for (const sy of [-5, 5]) { if (wreck && sx < 0 && sy < 0) continue; wheel(sc, W, sx, sy, 2.5, turn, wreck); }
    box([0, 3.6, 3.3], [10, 0.7, 0.7], WD, { pri: 3 }); box([0, -3.6, 3.3], [10, 0.7, 0.7], WD, { pri: 3 }); for (const sx of [-8.5, 0, 8.5]) box([sx, 0, 3.3], [0.6, 3.6, 0.55], WK, { pri: 3 });
    for (const sy of [-3.6, 3.6]) { sc.cap(W([2.5, sy, 3.6]), W([2.5, sy, wreck ? 8 : 13.5]), 0.75, 0.65, WD, { pri: 4 }); sc.cap(W([7.5, sy, 3.6]), W([3, sy, 10.5]), 0.5, 0.45, WK, { pri: 4 }); sc.cap(W([-3.5, sy, 3.6]), W([2, sy, 9.5]), 0.5, 0.45, WK, { pri: 4 }); }
    if (!wreck) { box([2.5, 0, 13.4], [0.8, 4.2, 0.8], 'woodD', { pri: 5 }); box([3.3, 0, 13.2], [0.5, 3.0, 1.0], 'hide', { pri: 6, round: 0.4 }); box([2.5, 4.4, 15.2], [0.25, 0.25, 1.4], 'woodD', { pri: 5 }); box([1.2, 4.4, 15.6], [1.2, 0.2, 0.8], 'cloth', { pri: 8, round: 0.15 }); }
    const piv = [1.5, 0, 5.4], L = 12.5, tip = add(piv, [-C(a) * L, 0, S(a) * L + (a < 0.4 ? 0.6 : 0)]); sc.cap(W(piv), W(tip), 0.8, 0.55, wreck ? 'char' : 'plank', { pri: 6 }); sc.cap(W(add(piv, [0, -1.6, 0])), W(add(piv, [0, 1.6, 0])), 1.1, 1.1, 'iron', { pri: 7 });
    sc.ell(W(add(tip, [0, 0, 0.4])), [1.9, 1.7, 0.9], wreck ? 'char' : 'woodD', { pri: 7 }); if (loaded) sc.ell(W(add(tip, [0, 0, 1.5])), [1.35, 1.3, 1.2], 'stone', { pri: 8 });
    if (!wreck) { sc.cap(W([-7.5, -3, 4.6]), W([-7.5, 3, 4.6]), 0.9, 0.9, 'woodD', { pri: 5 }); sc.cap(W([-7.5, 0, 4.8]), W(add(piv, [-C(a) * L * 0.62, 0, S(a) * L * 0.62])), 0.2, 0.2, 'rope', { pri: 5 }); for (const sy of [-4.2, 4.2]) sc.cap(W([-7.5, sy, 4.6]), W([-7.5 + C(turn + i) * 1.6, sy, 4.6 + S(turn + i) * 1.6]), 0.25, 0.25, 'iron', { pri: 6 }); }
    else { sc.ell(W([2, 1, 8.2]), [1.0, 0.8, 0.7], 'ember', { pri: 8 }); sc.ell(W([-4, -2, 4.4]), [0.8, 0.7, 0.5], 'ember', { pri: 8 }); }
  }
  return sc; }
module.exports = { MACHINES, MATS, ANIMS, frame };
