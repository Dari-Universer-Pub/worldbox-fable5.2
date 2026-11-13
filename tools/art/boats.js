// Boats (chantier B.2, pipeline A): a fishing boat (32x32 cell) and a transport ship (48x48 cell), modelled with the same
// implicit-surface kit as the creatures, rendered in four directions, four frames of swell each (the hull pitches and heaves,
// the sail fills and slackens). The sail carries a band in the kingdom colour (team ramp). Baked by tools/bake-boats.js.
// The model points to +x (bow) and floats at z = 0: what is under the water line is cut by the baker.
'use strict';
const { Scene, rotY, rotZ, mul, app, add } = require('../lib/sdf'); const { mat, team, glow } = require('../lib/mats');
const MATS = { hull: mat('earth', [1, 2, 3]), hullD: mat('earth', [0, 1, 2]), deck: mat('sand', [1, 2, 3], { ink: 'earth' }), rail: mat('earth', [2, 3, 4]), pole: mat('earth', [0, 1, 2]),
  sailW: mat('ice', [3, 4, 5], { ink: 'stone' }), sail: team([2, 3, 4]), sailD: team([1, 2, 3]), cabin: mat('sand', [2, 3, 4], { ink: 'earth' }), roof: mat('fire', [0, 1, 2]), net: mat('teal', [1, 2, 3]),
  lamp: Object.assign(glow([3, 4, 5]), { th: [-2, 0.2] }), crate: mat('sand', [1, 2, 3], { ink: 'earth' }), fish: mat('water', [3, 4, 5], { ink: 'stone' }), iron: mat('stone', [2, 3, 4]) };
const BOATS = { fishboat: { cell: 32, oy: 23, frames: 4 }, ship: { cell: 48, oy: 36, frames: 4 } };
// the swell: heave (up and down), pitch (bow up, bow down) and how full the sail is, for frame i of 4
function swell(i, amp) { const t = i / 4 * 2 * Math.PI, R = rotY(-Math.sin(t) * 0.07 * amp), dz = Math.cos(t) * 0.35 * amp; return { W: v => add(app(R, v), [0, 0, dz]), R, fill: 1 + Math.sin(t + 0.8) * 0.12 }; }
function frame(name, i) { const sc = new Scene(), { W, R, fill } = swell(i, name === 'ship' ? 0.8 : 1.2), S = rotZ(0.55); // the yard is braced a little off the keel so that the sail reads from every side
  const box = (c, h, m, o) => sc.box(W(c), h, m, Object.assign({ rot: R }, o)), boxS = (c, h, m, o) => sc.box(W(c), h, m, Object.assign({ rot: mul(R, S) }, o));
  if (name === 'fishboat') {
    sc.cap(W([-4.6, 0, 0.9]), W([4.2, 0, 0.9]), 2.5, 2.2, 'hull'); sc.cap(W([4, 0, 1.3]), W([7.2, 0, 3.3]), 1.7, 0.6, 'hull'); sc.cap(W([-4.6, 0, 1.3]), W([-6.6, 0, 2.9]), 1.7, 0.9, 'hull');
    box([-0.3, 0, 2.5], [4.6, 1.7, 0.3], 'deck', { pri: 3 }); box([-0.3, 2.0, 2.7], [4.8, 0.3, 0.45], 'rail', { pri: 4 }); box([-0.3, -2.0, 2.7], [4.8, 0.3, 0.45], 'rail', { pri: 4 });
    sc.cap(W([0.8, 0, 2.6]), W([0.8, 0, 11.5]), 0.42, 0.3, 'pole', { pri: 5 }); boxS([0.8, 0, 10.4], [0.3, 3.9, 0.3], 'pole', { pri: 6 });
    boxS([0.8 + 0.5 * fill, 0, 7.2], [0.28 + 0.25 * fill, 3.5, 3.0], 'sailW', { pri: 6, round: 0.3 }); boxS([0.8 + 0.6 * fill, 0, 6.8], [0.6 + 0.25 * fill, 3.65, 0.9], 'sail', { pri: 9 });
    sc.ell(W([-3, 1.2, 3.1]), [1.5, 1.1, 0.8], 'net', { pri: 5 }); sc.ell(W([3, -0.6, 3]), [0.9, 0.7, 0.5], 'fish', { pri: 5 }); sc.ell(W([3.5, 0.5, 3]), [0.8, 0.6, 0.45], 'fish', { pri: 5 });
    sc.cap(W([-6.2, 0, 2.8]), W([-6.2, 0, 5]), 0.25, 0.25, 'pole', { pri: 6 }); sc.ell(W([-6.2, 0, 5.4]), [0.6, 0.6, 0.7], 'lamp', { pri: 8 });
  } else {
    sc.cap(W([-8.5, 0, 1.6]), W([8, 0, 1.6]), 4.2, 3.6, 'hull'); sc.cap(W([7.5, 0, 2.2]), W([13, 0, 5.6]), 2.9, 0.8, 'hull'); sc.cap(W([-8.5, 0, 2.4]), W([-11.5, 0, 5]), 3.2, 1.8, 'hull');
    box([-0.5, 0, 3.6], [0.4, 4.3, 0.5], 'hullD', { pri: 2 }); box([4.5, 0, 3.6], [0.4, 4.0, 0.5], 'hullD', { pri: 2 }); box([-5, 0, 3.6], [0.4, 4.2, 0.5], 'hullD', { pri: 2 });
    box([-0.5, 0, 4.4], [8.6, 3.2, 0.35], 'deck', { pri: 3 }); box([-0.5, 3.5, 4.8], [8.8, 0.35, 0.6], 'rail', { pri: 4 }); box([-0.5, -3.5, 4.8], [8.8, 0.35, 0.6], 'rail', { pri: 4 });
    box([-8.2, 0, 6.2], [2.6, 2.9, 1.7], 'cabin', { pri: 5 }); sc.prism(W([-8.2, 0, 7.9]), 0, 3.1, 3.4, 2.1, 'roof', { pri: 6 }); box([-5.5, 0.9, 6.1], [0.2, 0.6, 0.7], 'lamp', { pri: 8 });
    sc.cap(W([1, 0, 4.6]), W([1, 0, 19]), 0.55, 0.36, 'pole', { pri: 5 }); boxS([1, 0, 17.4], [0.34, 6.2, 0.36], 'pole', { pri: 6 });
    boxS([1 + 0.7 * fill, 0, 12.6], [0.3 + 0.36 * fill, 5.7, 4.6], 'sailW', { pri: 6, round: 0.4 }); boxS([1 + 0.8 * fill, 0, 12.8], [0.7 + 0.36 * fill, 5.9, 1.4], 'sail', { pri: 9 }); boxS([1 + 0.8 * fill, 0, 9.3], [0.7 + 0.36 * fill, 5.9, 0.55], 'sailD', { pri: 9 });
    sc.cap(W([7.2, 0, 4.6]), W([7.2, 0, 13.5]), 0.45, 0.3, 'pole', { pri: 5 }); boxS([7.2, 0, 12.4], [0.3, 3.8, 0.3], 'pole', { pri: 6 }); boxS([7.2 + 0.5 * fill, 0, 9.6], [0.28 + 0.25 * fill, 3.4, 2.6], 'sailW', { pri: 6, round: 0.3 });
    box([2.2, 0.2, 19.4], [1.5, 0.22, 0.75], 'sail', { pri: 8 }); // the pennant at the masthead
    box([3.6, 1.6, 5.4], [1.0, 0.9, 0.9], 'crate', { pri: 5, round: 0.15 }); box([4.2, -1.5, 5.3], [0.9, 0.9, 0.8], 'crate', { pri: 5, round: 0.15 }); sc.cyl(W([-3.2, -1.8, 5.5]), 0.9, 0.9, 'crate', { pri: 5, round: 0.3 });
    sc.cap(W([12.6, 0, 5.5]), W([14.2, 0, 6.6]), 0.5, 0.3, 'iron', { pri: 6 });
  }
  return sc; }
module.exports = { BOATS, MATS, frame };
