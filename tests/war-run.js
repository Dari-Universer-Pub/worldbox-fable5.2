// Headless kingdoms run: a human and an orc band settle 45 tiles apart. Expect: two kingdoms, a war, deaths in battle, an end of war.
//   node tests/war-run.js [ticks] [seed]
const AL = require('./sim-bundle.js'); const ticks = +process.argv[2] || 40000, seed = +process.argv[3] || 7;
const sim = new AL.Sim({ size: 'medium', seed, noFauna: true }), W = sim.world, n = W.n;
let best = null, bq = -1; for (let k = 0; k < 6000; k++) { const x = 40 + ((AL.hash2(k, 1, seed) * (n - 130)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0), x2 = x + 44; if (W.region[y * n + x] === 0 || W.region[y * n + x] !== W.region[y * n + x2]) continue; const q = Math.min(AL.Units.siteQuality(sim, x, y), AL.Units.siteQuality(sim, x2, y)); if (q > bq) { bq = q; best = [x, y, x2]; } }
sim.command({ t: 'spawn', kind: 'human', x: best[0] + 0.5, y: best[1] + 0.5, count: 16 }); sim.command({ t: 'spawn', kind: 'orc', x: best[2] + 0.5, y: best[1] + 0.5, count: 16 });
const seen = {}; let printed = 0; const T0 = Date.now();
for (let k = 1; k <= ticks; k++) { sim.step(); sim.events.length = 0;
  while (printed < sim.chron.length) { const c = sim.chron[printed++]; seen[c.k] = (seen[c.k] || 0) + 1; if (!process.argv.includes('--quiet') && c.k !== 'colony' && c.k !== 'town') console.log('y' + (1 + Math.floor(c.t / AL.YEAR)) + ' [' + c.k + '] ' + c.s); }
  if (k % 10000 === 0) console.log('t=' + k, sim.kingdoms.map(kd => kd.name + (kd.alive ? '' : '+') + ' towns ' + kd.towns.length + ' pop ' + kd.towns.reduce((s, t) => s + sim.towns[t].pop, 0) + ' str ' + AL.Realm.strength(sim, kd).toFixed(0)).join(' | '), 'killed', sim.stats.killed, 'starved', sim.stats.starved); }
console.log('events', JSON.stringify(seen), 'ms/tick', ((Date.now() - T0) / ticks).toFixed(3));
const fails = []; if (sim.kingdoms.length < 2) fails.push('kingdoms'); if (!seen.war) fails.push('no war'); if (!(seen.peace || seen.fall)) fails.push('war never ended'); if (sim.stats.killed < 3) fails.push('no battle'); if ((seen.war || 0) > 12) fails.push('looping wars'); if (!seen.crown && !seen.dynasty) fails.push('no succession');
console.log(fails.length ? 'WAR FAIL ' + fails : 'WAR OK'); process.exit(fails.length ? 1 : 0);
