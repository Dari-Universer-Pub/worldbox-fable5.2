#!/usr/bin/env node
// Light proof for the god powers: one small game, then every power named on the command line (default: all the powers
// that have their own rule in src/sim/powers2.js) is cast once near a living town; prints what each one returned and
// which counters of the simulation moved. Not a test battery: one seed, a few game years.
//   node tools/power-proof.js [seed] [id,id,...]
'use strict';
const path = require('path'), AL = require(path.join(__dirname, '..', 'tests/sim-bundle.js'));
const seed = +process.argv[2] || 7, only = process.argv[3] ? process.argv[3].split(',') : null;
const sim0 = new AL.Sim({ size: 'medium', seed, noFauna: false }), sim = sim0, W = sim.world, n = W.n, E = sim.E;
let best = null, bq = -1; for (let k = 0; k < 6000; k++) { const x = 40 + ((AL.hash2(k, 1, seed) * (n - 140)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0); if (!W.region[y * n + x] || W.region[y * n + x] !== W.region[y * n + x + 50]) continue; const q = Math.min(AL.Units.siteQuality(sim, x, y), AL.Units.siteQuality(sim, x + 50, y)); if (q > bq) { bq = q; best = [x, y]; } }
sim.command({ t: 'spawn', kind: 'human', x: best[0] + .5, y: best[1] + .5, count: 16 }); sim.command({ t: 'spawn', kind: 'orc', x: best[0] + 50.5, y: best[1] + .5, count: 16 });
for (let k = 0; k < AL.YEAR * 45; k++) sim0.step();
const OLD = ['heal', 'strength', 'fertility', 'curse', 'poison', 'plague', 'rage', 'madness', 'inspire', 'death', 'resurrect', 'lightning', 'fire', 'acid', 'bomb', 'bigbomb', 'nuke', 'tornado', 'earthquake', 'meteor', 'eruption', 'flood', 'teleport', 'prophet', 'relic', 'war', 'peace', 'summon'];
const ids = only || Object.keys(AL.DATA.powers).filter(k => AL.Powers.handlers[k] && !OLD.includes(k));
// what must have moved for the power to count as seen: a counter of sim.stats, or a custom check
const WANT = { drizzle: 'ripened', monsoon: 'flooded', hailstorm: 'hailed', tempest: 'uprooted', blizzard: 'snowed', frostbite: 'frozen', scorch: 'dried', greatdrought: 'dried', acidfog: 'deaths', thunderclap: 'chained', firestorm: 'whirlFires', wildfire: 'burnt', twister: 'thrown', tremor: 'fissures', cataclysm: 'ridges', meteorshower: 'showerRocks', comet: 'cometOre', tsunami: 'swept', spring: 'springs', caldera: 'calderas',
  firecracker: 'scared', minefield: 'minesBlown', carpetbomb: 'carpet', megabomb: 'uprooted', tsar: 'blasted', acidflood: 'corroded', smite: 'smitten', annihilate: 'erased', mend: 'mended', sanctuary: 'spared', might: 'champions', bloom: 'bloomed', hex: 'hexed', venom: 'wells', pestilence: 'infected', frenzy: 'frenzied', delirium: 'revolts', genius: 'geniuses', revival: 'rebuilt', armory: 'armed', crusade: 'crusades', truce: 'truces',
  wolfpack: 'K:wolf', herd: 'K:deer', flock: 'gifts', swarm: 'K:rat', pride: 'K:lion', undeadhorde: 'dug', boneguard: 'K:skeleton', hellgate: 'gateSpawn', dragoncall: 'lairsMade', colossuscall: 'K:colossus', leviathancall: 'K:leviathan', giantcall: 'K:giant', feywild: 'groves', voidrift: 'rifted' };
const UNIT = { smite: 1, might: 1, genius: 1, thunderclap: 1, firecracker: 1, twister: 1, megabomb: 1, minefield: 1, frostbite: 1, mend: 1, sanctuary: 1, annihilate: 1, voidrift: 1, tempest: 1, hailstorm: 1, drizzle: 1 };
const buf = AL.Save.write(sim0);
console.log('year', (sim0.tick / AL.YEAR) | 0, 'towns', sim0.towns.filter(t => t.alive).length, 'kingdoms', sim0.kingdoms.filter(k => k.alive).length);
let bad = 0;
for (const id of ids) { const sim = AL.Save.read(buf), E = sim.E, W = sim.world, n = W.n, D = AL.DATA.powers[id], run = t => { for (let k = 0; k < t; k++) sim.step(); };
  const kc = name => { let c = 0; const kd = AL.K[name]; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 1) && E.kind[i] === kd) c++; return c; };
  const towns = sim.towns.filter(t => t.alive).sort((a, b) => b.pop - a.pop), t = id === 'delirium' ? (towns.find(o => o.kingdom >= 0 && sim.kingdoms[o.kingdom].capital !== o.id && sim.kingdoms[o.kingdom].towns.length > 1) || towns[0]) : towns[0];
  let x = t.cx + 2.5, y = t.cy + 2.5; if (UNIT[id]) { for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 3) && E.town[i] === t.id && Math.hypot(E.x[i] - t.cx, E.y[i] - t.cy) < 8) { x = E.x[i]; y = E.y[i]; break; } }
  // staging for the powers that need something to act on: a fight, a ruin, graves, a war, beasts
  if (id === 'frenzy') for (let k = 0; k < 6; k++) AL.Creatures.spawn(sim, AL.K.boar, x + 6 + k % 3, y + 6);
  const wolves = () => { for (let k = 0; k < 5; k++) { const wi = AL.Creatures.spawn(sim, AL.K.wolf, x + 1 + k % 2, y + 1); if (wi >= 0) AL.Powers.give(sim, wi, 'raging', 2000); } for (let i = 0; i < E.hi; i++) if (E.alive[i] && Math.hypot(E.x[i] - x, E.y[i] - y) < 6) E.hp[i] *= 0.5; };
  if (id === 'mend') wolves();
  if (id === 'revival' || id === 'undeadhorde') { let d = 0; for (const b of t.blds.slice()) if (sim.B.type[b] !== AL.BT.hall && d < 2) { AL.Towns.destroy(sim, b, true); d++; } let c = 0; for (let i = 0; i < E.hi && c < 5; i++) if (E.alive[i] && !(E.flags[i] & 1) && E.town[i] === t.id) { E.kill(sim, i, 'god'); c++; } run(5); }
  if (id === 'truce') { const ks = sim.kingdoms.filter(k => k.alive); if (ks.length > 1) AL.Realm.declare(sim, sim.kingdoms[t.kingdom], ks.find(k => k.id !== t.kingdom), 'old hatred'); }
  if (id === 'spring') { let bh = -1; for (let k = 0; k < 400; k++) { const X = t.cx + ((AL.hash2(k, 5, seed) * 50) | 0) - 25, Y = t.cy + ((AL.hash2(k, 6, seed) * 50) | 0) - 25; if (W.inb(X, Y) && !(W.flags[Y * n + X] & 2) && AL.gCost[W.ground[Y * n + X]] > 0 && W.height[Y * n + X] > bh) { bh = W.height[Y * n + X]; x = X + .5; y = Y + .5; } } }
  const s0 = JSON.parse(JSON.stringify(sim.stats)), w = WANT[id] || '', k0 = w.startsWith('K:') ? kc(w.slice(2)) : 0, c0 = sim.chron.length, hud0 = sim.hud();
  const r = AL.Powers.use(sim, { id, x, y }); if (id === 'sanctuary') wolves(); const hud1 = sim.hud(), k1 = w.startsWith('K:') ? kc(w.slice(2)) - k0 : 0; run(D.cat === 'nature' || id === 'hellgate' || id === 'pestilence' ? 320 : 200);
  const d = []; for (const k in sim.stats) if (typeof sim.stats[k] === 'number' && sim.stats[k] !== s0[k] && !['powers', 'births', 'deaths', 'killed', 'starved', 'trades'].includes(k)) d.push(k + '+' + (sim.stats[k] - s0[k]));
  const seen = w.startsWith('K:') ? k1 : sim.stats[w] - s0[w], ok = r > 0 && seen > 0; if (!ok) bad++;
  const lg = sim.chron.slice(c0).map(e => e.k || e.type).join(',');
  console.log((ok ? 'ok   ' : 'NONE ') + id.padEnd(14) + ' ret ' + String(r).padEnd(4) + ' ' + (w + '=' + seen).padEnd(16) + ' zones ' + (hud1.zones.length - hud0.zones.length) + ' phen ' + (hud1.phen.length - hud0.phen.length) + (hud1.mines ? ' mines ' + hud1.mines.length / 2 : '') + '  ' + d.join(' ') + (lg ? '  log: ' + lg : '')); }
console.log(bad ? 'POWERS NOT SEEN FIRING: ' + bad : 'ALL ' + ids.length + ' POWERS FIRED');
