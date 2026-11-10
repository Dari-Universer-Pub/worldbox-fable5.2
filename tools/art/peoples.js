// People sources: proportions (on the single humanoid rig), materials, equipment per job look, ages.
'use strict';
const { mat, team, ix } = require('../lib/mats');
const BASE_MATS = () => ({ pants: mat('earth', [2, 3, 4]), boot: mat('earth', [0, 1]), wood: mat('sand', [1, 2, 3], { ink: 'earth' }), steel: mat('stone', [3, 4, 5]), gold: mat('fire', [2, 3, 4]), straw: mat('sand', [3, 4, 5]),
  leather: mat('earth', [2, 3, 4]), wood2: mat('earth', [1, 2, 3]), cloth: team([2, 3, 4], { extra: { th: [-0.1, 0.5] } }), cloth2: mat('stone', [1, 2, 3]), bone: mat('sand', [3, 4, 5]), white: mat('ice', [3, 4, 5]) });
const PEOPLES = {
  human: { spec: { scale: 1.5 }, mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [2, 3, 4]), hair: mat('earth', [1, 2, 3]) }), eye: ix('stone', 0), tusk: ix('ice', 5) },
  orc: { spec: { scale: 1.5, legLen: 2.3, hipW: 1.5, legR: 1.0, torsoH: 2.9, torsoR: [2.7, 1.7, 1.9], shoulderW: 3.5, armLen: 3.9, armR: 1.05, handR: 1.05, headR: [2.6, 2.5, 2.3], headUp: 2.0, headFwd: 1.0, hunch: 0.3, hair: 'crest', jaw: 1, tusks: 1, ears: 0.9, eyeZ: 0.25, chestUp: 0.2 },
    mats: () => Object.assign(BASE_MATS(), { skin: mat('jungle', [2, 3, 4]), hair: mat('stone', [0, 1, 2]), pants: mat('earth', [1, 2, 3]), steel: mat('stone', [2, 3, 4]), straw: mat('earth', [3, 4, 5]) }), eye: ix('red', 0), tusk: ix('sand', 5),
    swap: { sword: 'cleaver', hat: null, crown: 'helmet:horns', staff: 'staff:bone', hood: null } },
  elf: { provisional: true, spec: { scale: 1.5, legLen: 3.3, torsoH: 2.8, torsoR: [1.75, 1.25, 1.7], shoulderW: 2.3, armLen: 3.3, armR: 0.7, headR: [2.6, 2.5, 2.5], hair: 'long', ears: 1.4 }, mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [3, 4, 5]), hair: mat('sand', [3, 4, 5]), pants: mat('forest', [2, 3, 4]) }), eye: ix('forest', 0), tusk: 0 },
  dwarf: { provisional: true, spec: { scale: 1.5, legLen: 1.7, hipW: 1.5, legR: 1.0, torsoH: 2.6, torsoR: [2.7, 1.8, 1.8], shoulderW: 3.1, armLen: 2.9, armR: 1.0, headR: [2.9, 2.6, 2.5], headUp: 2.4, beard: 1, hair: 'short' }, mats: () => Object.assign(BASE_MATS(), { skin: mat('skin', [2, 3, 4]), hair: mat('fire', [0, 1, 2]) }), eye: ix('stone', 0), tusk: 0 },
  myrrin: { provisional: true, spec: { scale: 1.5, legLen: 1.5, hipW: 1.0, legR: 0.8, torsoH: 2.6, torsoR: [1.9, 1.6, 1.9], shoulderW: 2.1, armLen: 2.4, armR: 0.65, headR: [2.3, 2.2, 2.0], headUp: 2.0, hair: 'none', acc0: [{ kind: 'hat', mat: 'cap' }] }, mats: () => Object.assign(BASE_MATS(), { skin: mat('sand', [3, 4, 5]), hair: mat('earth', [1, 2, 3]), cap: mat('magic', [2, 3, 4]), pants: mat('sand', [2, 3, 4]) }), eye: ix('magic', 0), tusk: 0 },
  okari: { provisional: true, spec: { scale: 1.5, legLen: 4.2, hipW: 0.9, legR: 0.55, torsoH: 2.6, torsoR: [1.7, 1.5, 1.7], shoulderW: 2.0, armLen: 3.0, armR: 0.65, headR: [1.9, 2.3, 1.9], headUp: 3.2, headFwd: 0.6, hair: 'crest', robe: 0, acc0: [{ kind: 'beak' }] }, mats: () => Object.assign(BASE_MATS(), { skin: mat('ice', [3, 4, 5]), hair: mat('red', [2, 3, 4]), pants: mat('fire', [1, 2, 3]), boot: mat('fire', [0, 1]) }), eye: ix('stone', 0), tusk: 0 },
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
  knight: { acc: [{ kind: 'sword', len: 5.2 }, { kind: 'shield', mat: 'steel' }, { kind: 'helmet', crest: 'cloth' }, { kind: 'pauldrons' }], work: 'attack' },
  priest: { acc: [{ kind: 'staff' }], spec: { robe: 1, sleeves: 'long' }, mats: { cloth: 'white' }, work: 'pray' },
  scholar: { acc: [{ kind: 'book' }], spec: { robe: 1, sleeves: 'long' }, work: 'hammer' },
  ruler: { acc: [{ kind: 'crown' }, { kind: 'cape' }, { kind: 'staff', mat: 'gold' }], spec: { sleeves: 'long' }, work: 'joy' },
  child: { acc: [], spec: { scaleMul: 0.72, headScale: 1.22 }, work: 'joy' },
  elder: { acc: [{ kind: 'staff', mat: 'wood' }], spec: { hunch: 0.28, scaleMul: 0.95 }, hair: 'grey', work: 'hammer' },
};
const ANIMS = [['idle', 'idle', 4], ['walk', 'walk', 4], ['work', null, 4], ['attack', 'attack', 4], ['hit', 'hit', 4], ['pray', 'pray', 4], ['joy', 'joy', 4], ['death', 'death', 2], ['sleep', 'sleep', 2]];
module.exports = { PEOPLES, LOOKS, ANIMS };
