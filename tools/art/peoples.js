// People sources: proportions (on the single humanoid rig), materials, equipment per job look, ages.
'use strict';
const { mat, team, ix } = require('../lib/mats');
const BASE_MATS = () => ({ pants: mat('earth', [2, 3, 4]), boot: mat('earth', [0, 1]), wood: mat('sand', [1, 2, 3], { ink: 'earth' }), steel: mat('stone', [3, 4, 5]), blade: mat('ice', [3, 4, 5], { ink: 'stone' }), gold: mat('fire', [2, 3, 4]), straw: mat('sand', [3, 4, 5]),
  leather: mat('earth', [2, 3, 4]), wood2: mat('earth', [1, 2, 3]), cloth: team([2, 3, 4], { extra: { th: [-0.1, 0.5] } }), cloth2: mat('stone', [1, 2, 3]), bone: mat('sand', [3, 4, 5]), white: mat('ice', [3, 4, 5]),
  // materials of the four own trades (chantier A.8)
  leaf: mat('forest', [2, 3, 4]), leafL: mat('grass', [3, 4, 5], { ink: 'forest' }), bloom: mat('pink', [3, 4, 5]), lampl: mat('fire', [4, 5], { ink: 'fire' }), orem: mat('fire', [1, 2, 3]), capT: mat('teal', [2, 3, 4]), gill: mat('pink', [3, 4, 5], { ink: 'magic' }), net: mat('sand', [1, 2, 3], { ink: 'earth' }), float: mat('teal', [3, 4, 5]) });
const PEOPLES = {
  human: { spec: { scale: 1.5 }, mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [2, 3, 4]), hair: mat('earth', [1, 2, 3]) }), eye: ix('stone', 0), tusk: ix('ice', 5) },
  orc: { spec: { scale: 1.5, legLen: 2.3, hipW: 1.5, legR: 1.0, torsoH: 2.9, torsoR: [2.7, 1.7, 1.9], shoulderW: 3.5, armLen: 3.9, armR: 1.05, handR: 1.05, headR: [2.6, 2.5, 2.3], headUp: 2.0, headFwd: 1.0, hunch: 0.3, hair: 'crest', jaw: 1, tusks: 1, ears: 0.9, eyeZ: 0.25, chestUp: 0.2 },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('jungle', [2, 3, 4]), hair: mat('stone', [0, 1, 2]), pants: mat('earth', [1, 2, 3]), steel: mat('stone', [2, 3, 4]), straw: mat('earth', [3, 4, 5]) }), eye: ix('red', 0), tusk: ix('sand', 5),
    swap: { sword: 'cleaver', hat: null, crown: 'helmet:horns', staff: 'staff:bone', hood: null } },
  // elves: tall and slim, long pointed ears through long pale hair, forest green under the kingdom cloth
  elf: { spec: { scale: 1.5, legLen: 3.5, hipW: 1.05, legR: 0.7, torsoH: 2.9, torsoR: [1.7, 1.2, 1.7], shoulderW: 2.2, armLen: 3.4, armR: 0.66, handR: 0.7, headR: [2.45, 2.4, 2.45], headUp: 2.7, hair: 'long', ears: 2.0, earUp: 1.5 },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [3, 4, 5]), hair: mat('ice', [3, 4, 5], { ink: 'water' }), pants: mat('forest', [2, 3, 4]), boot: mat('forest', [0, 1]), straw: mat('grass', [3, 4, 5]), cloth2: mat('forest', [1, 2, 3]), steel: mat('teal', [3, 4, 5]) }), eye: ix('forest', 0), tusk: 0,
    swap: { helmet: 'helmet:circlet', hat: null } },
  // dwarves: short and very wide, iron cap, a beard down to the belt
  dwarf: { spec: { scale: 1.5, legLen: 1.6, hipW: 1.55, legR: 1.05, torsoH: 2.5, torsoR: [2.85, 1.9, 1.8], shoulderW: 3.3, armLen: 2.8, armR: 1.05, handR: 0.95, headR: [2.8, 2.5, 2.4], headUp: 2.3, headFwd: 0.5, beard: 1.9, belly: 0.8, hair: 'none', acc0: [{ kind: 'helmet' }] },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [2, 3, 4]), hair: mat('fire', [1, 2, 3]), pants: mat('stone', [1, 2, 3]), boot: mat('stone', [0, 1]) }), eye: ix('stone', 0), tusk: 0,
    swap: { hat: null, hood: null } },
  // myrrin: bog folk under a spotted mushroom cap, tiny legs, pale stalk body
  myrrin: { spec: { scale: 1.5, legLen: 1.3, hipW: 0.95, legR: 0.8, torsoH: 2.7, torsoR: [1.95, 1.6, 1.9], shoulderW: 2.1, armLen: 2.4, armR: 0.65, handR: 0.7, headR: [2.3, 2.2, 2.0], headUp: 2.1, hair: 'none', noNose: 1, acc0: [{ kind: 'mushcap', r: 1.75 }] },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('sand', [3, 4, 5]), hair: mat('earth', [1, 2, 3]), cap: mat('magic', [2, 3, 4]), gill: mat('pink', [3, 4, 5], { ink: 'magic' }), spot: mat('ice', [4, 5], { ink: 'magic' }), pants: mat('sand', [2, 3, 4]), boot: mat('earth', [1, 2]) }), eye: ix('magic', 0), tusk: 0,
    swap: { hat: null, hood: null, helmet: null } },
  // okari: crane folk, stilt legs, long neck, long bill, red crown feathers, a cloak in the kingdom colour
  okari: { spec: { scale: 1.5, legLen: 4.0, hipW: 0.85, legR: 0.5, footL: 1.2, torsoH: 2.3, torsoR: [1.75, 1.6, 1.6], shoulderW: 1.9, armLen: 2.8, armR: 0.6, handR: 0.6, headR: [1.7, 2.0, 1.7], headUp: 3.9, headFwd: 0.9, neck: 0.62, hair: 'crest', noNose: 1, eyeZ: 0.2, acc0: [{ kind: 'beak' }, { kind: 'cape', mat: 'cloak', r: 0.62, end: 4.6 }] },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('ice', [3, 4, 5]), hair: mat('red', [2, 3, 4]), pants: mat('fire', [1, 2, 3]), boot: mat('fire', [0, 1]), beak: mat('fire', [2, 3, 4]), cloak: team([1, 2, 3]) }), eye: ix('stone', 0), tusk: 0,
    swap: { hat: null, hood: null, helmet: null } },
  // humanoid monsters (same rig, one look)
  zombie: { monster: true, spec: { scale: 1.5, hunch: 0.38, armR: 0.7, hair: 'top', headFwd: 0.7 }, mats: () => Object.assign(BASE_MATS(), { skin: mat('swamp', [2, 3, 4]), hair: mat('stone', [0, 1, 2]), cloth: mat('stone', [1, 2, 3]), pants: mat('earth', [0, 1, 2]), boot: mat('swamp', [1, 2]) }), eye: ix('fire', 4), tusk: 0 },
  skeleton: { monster: true, spec: { scale: 1.5, legR: 0.5, armR: 0.45, handR: 0.6, torsoR: [1.55, 1.0, 1.6], hair: 'none', noNose: 1, acc0: [{ kind: 'sword' }] }, mats: () => Object.assign(BASE_MATS(), { skin: mat('sand', [3, 4, 5], { ink: 'stone' }), cloth: mat('sand', [2, 3, 4], { ink: 'stone' }), pants: mat('sand', [2, 3, 4], { ink: 'stone' }), boot: mat('sand', [1, 2], { ink: 'stone' }), blade: mat('stone', [2, 3, 4]) }), eye: ix('stone', 0), tusk: 0 },
  demon: { monster: true, spec: { scale: 1.62, torsoR: [2.5, 1.7, 1.9], shoulderW: 3.2, armR: 0.95, handR: 1.0, legR: 0.95, hair: 'none', ears: 1.1, jaw: 1, tusks: 1, acc0: [{ kind: 'helmet', mat: 'skin', horns: 1 }, { kind: 'cape', mat: 'wing' }] }, mats: () => Object.assign(BASE_MATS(), { skin: mat('red', [1, 2, 3]), cloth: mat('red', [0, 1, 2]), pants: mat('stone', [0, 1, 2]), boot: mat('stone', [0, 1]), wing: mat('magic', [0, 1, 2]), bone: mat('stone', [0, 1, 2]) }), eye: ix('fire', 5), tusk: ix('sand', 5) },
};
// job looks: equipment + which animation plays for "work" and "attack"
const LOOKS = {
  villager: { acc: [] , work: 'hammer' },
  lumberjack: { acc: [{ kind: 'axe' }], work: 'chop' },
  miner: { acc: [{ kind: 'pick' }], work: 'chop' },
  farmer: { acc: [{ kind: 'hoe' }, { kind: 'hat' }], work: 'dig' },
  builder: { acc: [{ kind: 'hammer' }, { kind: 'apron' }], work: 'hammer' },
  hunter: { acc: [{ kind: 'bow' }, { kind: 'quiver' }], work: 'shoot', attack: 'shoot' },
  fisher: { acc: [{ kind: 'rod' }, { kind: 'hat' }], work: 'dig' },
  herder: { acc: [{ kind: 'crook' }], work: 'dig' },
  blacksmith: { acc: [{ kind: 'hammer', mat: 'steel' }, { kind: 'apron' }], work: 'hammer' },
  merchant: { acc: [{ kind: 'pack' }, { kind: 'hat', mat: 'cloth2' }], work: 'hammer' },
  soldier: { acc: [{ kind: 'sword' }, { kind: 'shield' }, { kind: 'helmet' }], work: 'attack' },
  archer: { acc: [{ kind: 'bow' }, { kind: 'quiver' }, { kind: 'hood' }], work: 'shoot', attack: 'shoot' },
  knight: { acc: [{ kind: 'sword', len: 6 }, { kind: 'shield', mat: 'steel', boss: 'cloth' }, { kind: 'helmet', crest: 'cloth' }, { kind: 'pauldrons' }], work: 'attack' },
  priest: { acc: [{ kind: 'staff' }], spec: { robe: 1, sleeves: 'long' }, mats: { cloth: 'white' }, work: 'pray' },
  scholar: { acc: [{ kind: 'book' }], spec: { robe: 1, sleeves: 'long' }, work: 'hammer' },
  ruler: { acc: [{ kind: 'crown' }, { kind: 'cape' }, { kind: 'staff', mat: 'gold' }], spec: { sleeves: 'long' }, work: 'joy' },
  child: { acc: [], spec: { scaleMul: 0.72, headScale: 1.22 }, work: 'joy' },
  elder: { acc: [{ kind: 'staff', mat: 'wood' }], spec: { hunch: 0.28, scaleMul: 0.95 }, hair: 'grey', work: 'hammer' },
  // one trade of their own per people (chantier A.8): baked only for the people named in "only"
  warden: { only: 'elf', acc: [{ kind: 'leafstaff' }, { kind: 'mantle' }], spec: { sleeves: 'long' }, work: 'dig' },
  delver: { only: 'dwarf', acc: [{ kind: 'pick' }, { kind: 'lamp' }, { kind: 'orepack' }], work: 'chop' },
  sporer: { only: 'myrrin', acc: [{ kind: 'sickle' }, { kind: 'basket' }], work: 'dig' },
  diver: { only: 'okari', acc: [{ kind: 'trident' }, { kind: 'netbag' }], work: 'dig' },
};
const ANIMS = [['idle', 'idle', 4], ['walk', 'walk', 4], ['work', null, 4], ['attack', 'attack', 4], ['hit', 'hit', 4], ['pray', 'pray', 4], ['joy', 'joy', 4], ['death', 'death', 2], ['sleep', 'sleep', 2]];
module.exports = { PEOPLES, LOOKS, ANIMS };
