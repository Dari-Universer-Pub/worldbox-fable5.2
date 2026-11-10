// Headless ecosystem run: species counts over time, zombie outbreak, flora regrowth.  node tests/eco-run.js [ticks] [seed]
const AL = require('./sim-bundle.js'); const ticks = +process.argv[2] || 20000, seed = +process.argv[3] || 7;
const sim = new AL.Sim({ size: 'medium', seed }), E = sim.E, W = sim.world, n = W.n;
function census() { const c = {}; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 1)) { const k = AL.KINDS[E.kind[i]].name; c[k] = (c[k] || 0) + 1; } return c; }
function trees() { let t = 0, s = 0; for (let i = 0; i < n * n; i++) { const k = AL.fKind[W.feature[i]]; if (k === 1) t++; else if (W.feature[i] === AL.F.stump) s++; } return [t, s]; }
const c0 = census(), t0 = trees(); console.log('t=0', JSON.stringify(c0), 'trees/stumps', t0.join('/')); const T0 = Date.now(); let ok = true;
for (let k = 1; k <= ticks; k++) { sim.step(); sim.events.length = 0; if (k % 5000 === 0) console.log('t=' + k, JSON.stringify(census()), 'trees/stumps', trees().join('/'), 'killed', sim.stats.killed); }
const c1 = census(); console.log('ms/tick', ((Date.now() - T0) / ticks).toFixed(3));
for (const s of ['rabbit', 'deer', 'sheep', 'boar', 'wolf', 'bear', 'eagle', 'salmon']) if (!c1[s]) { console.log('EXTINCT ' + s); ok = false; } else if (c1[s] > (c0[s] || 1) * 12) { console.log('EXPLODED ' + s); ok = false; }
// zombie outbreak next to a village: contagion must spread, defenders must fight
let sx = -1, sy = -1, best = -1; for (let k = 0; k < 4000; k++) { const x = 20 + ((AL.hash2(k, 1, seed) * (n - 40)) | 0), y = 20 + ((AL.hash2(k, 2, seed) * (n - 40)) | 0); if (W.ground[y * n + x] !== AL.G.grass) continue; const q = AL.Units.siteQuality(sim, x, y); if (q > best) { best = q; sx = x; sy = y; } }
sim.command({ t: 'spawn', kind: 'human', x: sx + 0.5, y: sy + 0.5, count: 30 }); for (let k = 0; k < 3000; k++) { sim.step(); sim.events.length = 0; }
const before = census(); sim.command({ t: 'spawn', kind: 'zombie', x: sx + 6.5, y: sy + 0.5, count: 5 }); let maxZ = 0, hits = 0; for (let k = 0; k < 4000; k++) { sim.step(); for (const e of sim.events) if (e[0] === 'hit') hits++; sim.events.length = 0; if (k % 100 === 0) maxZ = Math.max(maxZ, census().zombie || 0); }
const after = census(); console.log('outbreak: humans', before.human, '->', after.human || 0, ' zombies max', maxZ, 'now', after.zombie || 0, ' hits', hits, 'killed', sim.stats.killed);
if (!(hits > 10)) { console.log('NO FIGHT'); ok = false; } if (!(maxZ > 5 || (after.zombie || 0) < 5)) { console.log('NOTHING HAPPENED'); ok = false; }
console.log(ok ? 'ECO OK' : 'ECO FAIL'); process.exit(ok ? 0 : 1);
