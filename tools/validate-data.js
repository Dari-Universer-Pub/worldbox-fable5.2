#!/usr/bin/env node
// Data validator: one schema per file of src/data, cross-references between the files and against the baked assets
// (atlas frames, icons, effects, sounds, tracks, i18n keys in English AND French), and the table of counts against the
// quantified final vision (BIBLE.md §6).   node tools/validate-data.js [--quiet]
'use strict';
const fs = require('fs'), path = require('path'); const { check } = require('./lib/schema');
const ROOT = path.join(__dirname, '..'), quiet = process.argv.includes('--quiet');
const D = {}; for (const f of fs.readdirSync(path.join(ROOT, 'src/data')).filter(f => f.endsWith('.json')).sort()) { try { D[f.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) { console.log('VALIDATE FAIL ' + f + ': ' + e.message); process.exit(1); } }
const man = JSON.parse(fs.readFileSync(path.join(__dirname, 'build-manifest.json'), 'utf8')), pal = JSON.parse(fs.readFileSync(path.join(__dirname, 'art/palette.json'), 'utf8'));
const atlas = {}; for (const a of man.atlases) atlas[a] = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', a + '.json'), 'utf8'));
const frames = new Set(); for (const a in atlas) for (const k in atlas[a].frames) frames.add(k);
const errs = [], warn = [], E = m => errs.push(m);
// ---------------------------------------------------------------- schemas
const N = 'number', I = 'int', S = 'string', B = 'bool', O = (object, optional, open) => ({ object, optional: optional || [], open: !!open });
const ground = { ref: 'grounds' }, DIETS = { enum: ['herb', 'pred', 'omni', 'meat', 'plants', 'fish'] }, CATS = ['world', 'peoples', 'creatures', 'nature', 'destruction', 'divine', 'tools'];
const culture = O({ war: { num: [0, 1] }, trade: { num: [0, 1] }, land: { num: [0, 1] }, lore: { num: [0, 1] }, faith: { num: [0, 1] }, sea: { num: [0, 1] } });
const SCH = {
  peoples: { map: O({ id: I, team: S, atlas: S, provisional: B, devSpeed: { num: [0.2, 3] }, strength: { num: [0.2, 3] }, fertility: { num: [0.1, 3] }, lifespan: { num: [20, 400] }, maturity: { num: [4, 60] }, speed: { num: [0.3, 2.5] }, courage: { num: [0, 1] }, hp: { num: [20, 400] }, likes: { array: ground }, hates: { array: ground }, diet: DIETS, buildSet: S, lang: { ref: 'languages' }, culture }, ['provisional']), min: 6 },
  animals: { map: O({ atlas: S, provisional: B, size: { enum: [16, 24, 32] }, hp: { num: [1, 2000] }, speed: { num: [0.1, 3] }, attack: { num: [0, 200] }, diet: { enum: ['herb', 'pred'] }, herd: { num: [1, 20] }, lifespan: { num: [1, 200] }, meat: { num: [0, 60] }, fertility: { num: [0.1, 3] }, biomes: { array: ground, min: 1 }, density: { num: [0, 5] }, courage: { num: [0, 1] }, livestock: B, fly: B, swim: B }, ['provisional', 'livestock', 'fly', 'swim']), min: 40 },
  monsters: { map: O({ atlas: S, provisional: B, humanoid: B, size: { enum: [16, 24, 32, 48, 64] }, hp: { num: [1, 9000] }, speed: { num: [0.1, 3] }, attack: { num: [0, 500] }, lifespan: { num: [1, 9000] }, hostile: B, courage: { num: [0, 1] }, contagion: B, night: B, fire: B, fly: B, swim: B, ability: S, armor: { num: [0, 0.9] } }, ['provisional', 'humanoid', 'contagion', 'night', 'fire', 'fly', 'swim', 'ability', 'armor']), min: 20 },
  powers: { map: O({ cat: { enum: CATS }, kind: { enum: ['brush', 'spawn', 'zone', 'point', 'area', 'move', 'control'] }, fx: S, snd: { ref: 'sounds' }, zone: { enum: ['rain', 'acid', 'storm', 'drought', 'cold', 'heat'] }, r: { num: [0.5, 40] }, dur: { num: [50, 6000] }, drag: B, provisional: B, icon: S, like: S, scatter: { num: [1, 20] }, spread: { num: [1, 40] }, spawn: { array: { array: { any: true }, len: 2 }, min: 1 } }, ['fx', 'zone', 'r', 'dur', 'drag', 'provisional', 'icon', 'like', 'scatter', 'spread', 'spawn']), min: 100 },
  buildings: { map: O({ id: I, fp: { array: I, len: 2 }, cost: { map: N }, hp: { num: [1, 5000] }, stage: { num: [0, 5] }, max: { array: N, len: 2 }, great: B, light: B, store: B, cap: N, job: { ref: 'jobs' }, workers: N, fields: B, defense: B, shore: B, provisional: B, wall: B, gate: B }, ['great', 'light', 'store', 'cap', 'job', 'workers', 'fields', 'defense', 'shore', 'provisional', 'wall', 'gate']), min: 15 },
  jobs: { map: O({ id: I, look: S, task: S, res: S, needs: S, military: B, ranged: B, minStage: N }, ['look', 'task', 'res', 'needs', 'military', 'ranged', 'minStage']), min: 20 },
  stages: { array: O({ name: S, pop: N, need: { array: { ref: 'buildings' } }, look: { num: [0, 4] }, sprite: { num: [0, 2] }, provisional: B }, ['need', 'provisional']), min: 6 },
  grounds: { map: O({ id: I, rank: N, cost: N, water: N, flat: { array: { any: true }, len: 2 }, fert: N, flam: N, biome: S, emissive: B }, ['biome', 'emissive']), min: 14 },
  flora: { map: O({ id: I, kind: S, sprite: S, biomes: { array: ground }, wood: N, grow: N, lod: { array: { any: true } }, food: N, graze: N, light: N, stone: N, ore: S }, ['sprite', 'biomes', 'wood', 'grow', 'lod', 'food', 'graze', 'light', 'stone', 'ore']), min: 25 },
  resources: { map: O({ id: I, icon: S, ore: B, rare: B }, ['ore', 'rare']), min: 10 },
  eras: { map: O({ id: I, en: S, fr: S, grow: N, crop: N, fert: N, mut: N, temp: N, storm: N, undead: N, strife: N, tint: { array: N, len: 4 }, music: S, rain: N }, ['rain', 'music', 'tint']), min: 10 },
  dogmas: { map: O({ id: I, en: S, fr: S, mods: { map: N }, opposite: { ref: 'dogmas' } }, ['opposite']), min: 12 },
  traits: { map: O({ id: I, en: S, fr: S, mods: { map: N }, opposite: { ref: 'traits' }, acquired: B }, ['opposite', 'acquired', 'mods']), min: 60 },
  languages: { map: O({ provisional: B, on: { array: S, min: 3 }, vo: { array: S, min: 3 }, co: { array: { any: true }, min: 2 }, m: { array: S, min: 2 }, f: { array: S, min: 2 }, place: { array: S, min: 2 }, faith: { array: S, min: 1 }, folk: S, shifts: { array: { array: S, len: 2 } } }, ['provisional']), min: 6 },
  keys: { map: O({ codes: { array: S, min: 1 }, group: S }), min: 20 },
  i18n: O({ en: { map: S }, fr: { map: S } }),
  music: O({ instruments: { map: { any: true }, min: 6 }, tracks: { map: O({ provisional: B, title: S, bpm: { num: [30, 220] }, vol: { num: [0.1, 1.5] }, form: { array: S, min: 1 }, loopFrom: I, tracks: { array: O({ inst: S, layer: { enum: ['base', 'melody', 'pad', 'bells', 'rhythm', 'tension'] }, vel: N, gate: N, pan: N, every: { array: N }, parts: { map: S } }, ['gate', 'pan', 'every'], true), min: 2 } }, ['provisional', 'title']), min: 8 } }),
  sounds: { map: { oneOf: [O({ cat: { enum: ['ui', 'work', 'combat', 'disaster', 'magic', 'animal', 'crowd'] }, expect: O({ dur: { array: N, len: 2 }, centroid: { array: N, len: 2 } }), layers: { array: { any: true }, min: 1 }, variants: { array: { array: { any: true }, min: 1 }, min: 2 }, bus: S, pitchVar: N, vol: N, rev: N, provisional: B }, ['layers', 'variants', 'bus', 'pitchVar', 'vol', 'rev', 'provisional'])] }, min: 120 },
};
for (const f in D) { if (!SCH[f]) { E(f + '.json: no schema'); continue; } check(D[f], SCH[f], f, errs, D); }
for (const f in SCH) if (!D[f]) E('missing data file ' + f + '.json');
// ---------------------------------------------------------------- cross-references
const en = D.i18n.en, fr = D.i18n.fr, need = k => { if (!(k in en)) E('i18n: missing English "' + k + '"'); if (!(k in fr)) E('i18n: missing French "' + k + '"'); };
for (const k in en) if (!(k in fr)) E('i18n: "' + k + '" has no French'); for (const k in fr) if (!(k in en)) E('i18n: "' + k + '" has no English');
for (const k in en) { const a = (en[k].match(/\{\w+\}/g) || []).sort().join(), b = ((fr[k] || '').match(/\{\w+\}/g) || []).sort().join(); if (k in fr && a !== b) E('i18n: "' + k + '" placeholders differ between English and French'); }
const uniqueIds = (f, list) => { const seen = {}; list.forEach(([k, id]) => { if (seen[id] != null) E(f + ': id ' + id + ' used by ' + seen[id] + ' and ' + k); seen[id] = k; }); const ids = list.map(x => x[1]).sort((a, b) => a - b); if (ids.some((id, i) => id !== ids[0] + i)) E(f + ': ids are not contiguous'); };
for (const f of ['peoples', 'buildings', 'jobs', 'grounds', 'flora', 'resources', 'eras', 'dogmas', 'traits']) uniqueIds(f, Object.entries(D[f]).map(([k, v]) => [k, v.id]));
const kinds = Object.assign({}, D.peoples, D.animals, D.monsters); { const n = Object.keys(D.peoples).length + Object.keys(D.animals).length + Object.keys(D.monsters).length; if (Object.keys(kinds).length !== n) E('a name is used by two kinds (people / animal / monster)'); }
const LOOKS = Object.keys(require('./art/peoples').LOOKS);
for (const [k, p] of Object.entries(D.peoples)) { need('kind.' + k); if (!atlas[p.atlas]) E('peoples.' + k + ': atlas ' + p.atlas + ' is not in the build'); if (!(p.team in pal.ramps)) E('peoples.' + k + ': team ramp ' + p.team);
  for (const l of LOOKS) for (const a of ['idle', 'walk', 'work', 'attack', 'hit', 'pray', 'joy', 'death', 'sleep']) if (!frames.has(`${k}/${l}/${a}/${a === 'death' || a === 'sleep' ? 'left' : 'down'}/0`)) E('peoples.' + k + ': no frame for look ' + l + ', animation ' + a);
  for (const b in D.buildings) for (let s = 0; s < 3; s++) for (let v = 0; v < 4; v++) if (!frames.has(`bld/${p.buildSet}/${b}/${s}/${v}`)) E('peoples.' + k + ': no building sprite ' + p.buildSet + '/' + b + '/' + s + '/' + v); }
for (const [k, a] of Object.entries(D.animals).concat(Object.entries(D.monsters))) { need('kind.' + k); if (!atlas[a.atlas]) { E('kind ' + k + ': atlas ' + a.atlas + ' is not in the build'); continue; }
  if (a.humanoid) { for (const an of ['idle', 'walk', 'attack']) if (!frames.has(`${k}/villager/${an}/down/0`)) E('monster ' + k + ': no frame ' + an); continue; }
  const mv = a.fly ? 'fly' : a.swim ? 'swim' : 'walk', first = a.fly ? 'idle' : a.swim ? 'swim' : 'idle'; for (const d of ['down', 'left', 'up', 'right']) { if (!frames.has(`${k}/${mv}/${d}/0`)) E('kind ' + k + ': no frame ' + mv + '/' + d); if (!a.fly && !frames.has(`${k}/${first}/${d}/0`)) E('kind ' + k + ': no frame ' + first + '/' + d); }
  if (!frames.has(`${k}/death/left/0`)) E('kind ' + k + ': no death frame'); const f = atlas[a.atlas].frames[`${k}/${first}/left/0`]; if (f && f[2] !== a.size) E('kind ' + k + ': size ' + a.size + ' but its cell is ' + f[2]);
 }
const HANDLED = ['heal', 'strength', 'fertility', 'curse', 'poison', 'plague', 'rage', 'madness', 'inspire', 'death', 'resurrect', 'lightning', 'fire', 'acid', 'bomb', 'bigbomb', 'nuke', 'tornado', 'earthquake', 'meteor', 'eruption', 'flood', 'teleport', 'prophet', 'relic', 'war', 'peace', 'summon'];
for (const [k, p] of Object.entries(D.powers)) { if (k !== 'spawn') { need('pw.' + k); need('pwd.' + k); if (!frames.has('ic/' + (p.icon || k))) E('powers.' + k + ': no icon ic/' + (p.icon || k)); }
  if (p.fx && !['dust', 'splash'].includes(p.fx) && ![...frames].some(f => f.startsWith('fx/' + p.fx + '/'))) E('powers.' + k + ': no effect fx/' + p.fx);
  if (p.kind === 'zone' && !p.zone) E('powers.' + k + ': zone power without a zone'); if (p.like && !HANDLED.includes(p.like)) E('powers.' + k + ': like "' + p.like + '" has no handler'); if (p.provisional && p.kind !== 'zone' && !p.like) E('powers.' + k + ': provisional power without "like"');
  if (p.like === 'summon') { if (!p.spawn) E('powers.' + k + ': summon without spawn'); else for (const [kn, c] of p.spawn) { if (!(kn in D.animals) && !(kn in D.monsters)) E('powers.' + k + ': unknown creature ' + kn); if (!(c >= 1)) E('powers.' + k + ': bad count'); } } }
for (const c of CATS) need('cat.' + c);
for (const k in D.buildings) need('bld.' + k); for (const k in D.jobs) need('job.' + k); for (const k in D.resources) { need('res.' + k); if (!frames.has('ic/' + D.resources[k].icon)) E('resources.' + k + ': no icon ic/' + D.resources[k].icon); }
for (const k in D.grounds) if (!['soil', 'road'].includes(k)) need('ground.' + k); D.stages.forEach((s, i) => need('stage.' + i)); for (const k in D.keys) need('key.' + k);
for (const [k, j] of Object.entries(D.jobs)) if (j.look && !LOOKS.includes(j.look)) E('jobs.' + k + ': unknown look ' + j.look);
for (const [k, f] of Object.entries(D.flora)) if (f.sprite && ![...frames].some(x => x.startsWith(f.sprite))) E('flora.' + k + ': no sprite ' + f.sprite);
for (const [k, b] of Object.entries(D.buildings)) for (const r in b.cost) if (!(r in D.resources)) E('buildings.' + k + ': unknown resource ' + r);
for (const [id, t] of Object.entries(D.music.tracks)) for (const tr of t.tracks) { if (!(tr.inst in D.music.instruments)) E('music.' + id + ': unknown instrument ' + tr.inst); for (const s of t.form) if (!(s in tr.parts)) E('music.' + id + ': ' + tr.inst + ' has no part ' + s);
  for (const pn in tr.parts) tr.parts[pn].split('|').forEach((bar, bi) => { for (const n of bar.trim().split(/\s+/)) if (!/^(-|([a-g][#b]?\d!?)(\+[a-g][#b]?\d!?)*)\/\d+(\.\d+)?$/.test(n)) E('music.' + id + ': bad note "' + n + '" (' + tr.inst + ' ' + pn + ' bar ' + (bi + 1) + ')'); }); }
// ---------------------------------------------------------------- counts against the final vision
const nb = Object.keys(D.buildings).filter(k => !D.buildings[k].wall && !D.buildings[k].gate).length, biomes = new Set(Object.values(D.grounds).map(g => g.biome).filter(Boolean)).size || Object.keys(D.grounds).length;
const cnt = (o, f) => Object.values(o).filter(f).length, snds = Object.entries(D.sounds).filter(([k]) => k[0] !== '_').map(x => x[1]);
const rows = [['peoples', 6, Object.keys(D.peoples).length, cnt(D.peoples, p => p.provisional)], ['biomes (ground types)', 14, Object.keys(D.grounds).length, 0], ['animal species', 40, Object.keys(D.animals).length, cnt(D.animals, p => p.provisional)], ['monsters', 20, Object.keys(D.monsters).length, cnt(D.monsters, p => p.provisional)],
  ['powers', 100, Object.keys(D.powers).length, cnt(D.powers, p => p.provisional)], ['ages', 10, Object.keys(D.eras).length, 0], ['traits', 60, Object.keys(D.traits).length, 0], ['dogmas', 12, Object.keys(D.dogmas).length, 0], ['building types', 15, nb, cnt(D.buildings, p => p.provisional)],
  ['building stages (looks)', 5, new Set(D.stages.map(s => s.look)).size, new Set(D.stages.filter(s => s.provisional).map(s => s.look)).size], ['jobs', 20, Object.keys(D.jobs).length - 1, 0], ['flora types', 25, Object.keys(D.flora).length, 0], ['sounds', 120, snds.length, snds.filter(s => s.provisional).length], ['music tracks', 8, Object.keys(D.music.tracks).length, cnt(D.music.tracks, t => t.provisional)]];
for (const [name, want, have] of rows) if (have < want) E('count: ' + name + ' ' + have + ' < ' + want + ' (final vision)');
if (!quiet) { console.log('content                    vision   data   provisional'); for (const [name, want, have, prov] of rows) console.log(name.padEnd(26) + String(want).padStart(6) + String(have).padStart(7) + String(prov).padStart(14)); console.log('i18n keys: ' + Object.keys(en).length + ' English, ' + Object.keys(fr).length + ' French; atlas frames in the build: ' + frames.size); }
if (warn.length && !quiet) for (const w of warn) console.log('  note: ' + w);
if (errs.length) { for (const e of errs.slice(0, 60)) console.log('  ' + e); if (errs.length > 60) console.log('  … ' + (errs.length - 60) + ' more'); console.log('VALIDATE FAIL ' + errs.length + ' error(s)'); process.exit(1); }
console.log('VALIDATE OK ' + Object.keys(D).length + ' data files, ' + rows.length + ' counts at or above the final vision');
