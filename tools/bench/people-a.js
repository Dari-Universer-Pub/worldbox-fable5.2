'use strict';
const { render } = require('../lib/sdf'); const { Img } = require('../lib/img'); const { mat, team, ix } = require('../lib/mats');
const H = require('../art/rigs/humanoid');
const MATS = { skin: mat('skin', [2, 3, 4]), hair: mat('earth', [1, 2, 3]), cloth: team([2, 3, 4], {extra:{th:[-0.1,0.5]}}), pants: mat('earth', [2, 3, 4]), boot: mat('earth', [0, 1]), wood: mat('earth', [2, 3, 4]), steel: mat('stone', [2, 3, 4, 5]), gold: mat('fire', [2, 3, 4]), straw: mat('sand', [2, 3, 4]), leather: mat('earth', [2, 3]), wood2: mat('earth', [1, 2, 3]), cloth2: mat('stone', [1, 2, 3]), bone: mat('sand', [3, 4, 5]) };
const YAW = { down: 0, left: -Math.PI / 2, up: Math.PI, right: Math.PI / 2 };
function frame(spec, anim, i, dir, mats = MATS, raw = false) {
  const { scene, decals } = H.build(spec, H.ANIMS[anim].f(i));
  const dd = decals.filter(d => dir === 'down' || (dir === 'left' && /R$/.test(d.tag) === false) || (dir === 'right' && /L$/.test(d.tag) === false)).filter(() => dir !== 'up')
    .map(d => Object.assign({}, d, { idx: d.idx === 'eye' ? ix('stone', 0) : ix('ice', 5) }));
  return render(scene, { w: 24, h: 24, ox: 12, oy: 21.2, yaw: YAW[dir], mats, decals: dd, ss: 4, raw: !!raw });
}
module.exports = { frame, MATS, YAW };
if (require.main === module) {
  const spec = { scale: 1.5, acc: [{ kind: 'axe' }] };
  const anims = process.argv[2] ? process.argv[2].split(',') : ['idle', 'walk', 'chop', 'attack', 'death'];
  const dirs = ['down', 'left', 'up', 'right'];
  let W = 0; for (const a of anims) W = Math.max(W, H.ANIMS[a].n);
  const sheet = new Img(W * 24, anims.length * dirs.length * 24);
  anims.forEach((a, ai) => dirs.forEach((d, di) => { for (let i = 0; i < H.ANIMS[a].n; i++) sheet.blit(frame(spec, a, i, d), i * 24, (ai * 4 + di) * 24); }));
  sheet.savePNG('shots/bench-people-a.png', { scale: +process.argv[3] || 6, bg: [104, 148, 67] });
}
