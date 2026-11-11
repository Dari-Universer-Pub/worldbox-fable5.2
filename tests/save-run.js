// Headless save test: a world with two peoples, fauna, a fire and a weather zone is saved; the reloaded world must be
// identical to the saved state, and both must play on identically (same signature after 3000 more ticks).
//   node tests/save-run.js [ticks] [seed]
const AL = require('./sim-bundle.js'); const ticks = +process.argv[2] || 7000, seed = +process.argv[3] || 7;
const sim = new AL.Sim({ size: 'medium', seed }), W = sim.world, n = W.n;
let best = null, bq = -1; for (let k = 0; k < 6000; k++) { const x = 40 + ((AL.hash2(k, 1, seed) * (n - 130)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0), x2 = x + 44; if (W.region[y * n + x] === 0 || W.region[y * n + x] !== W.region[y * n + x2]) continue; const q = Math.min(AL.Units.siteQuality(sim, x, y), AL.Units.siteQuality(sim, x2, y)); if (q > bq) { bq = q; best = [x, y, x2]; } }
sim.command({ t: 'spawn', kind: 'human', x: best[0] + 0.5, y: best[1] + 0.5, count: 16 }); sim.command({ t: 'spawn', kind: 'orc', x: best[2] + 0.5, y: best[1] + 0.5, count: 16 });
const run = (s, k) => { for (let i = 0; i < k; i++) { s.step(); s.events.length = 0; } };
run(sim, ticks); const t = sim.towns.find(t => t.alive); sim.command({ t: 'power', id: 'prophet', x: t.cx + 1, y: t.cy + 2 }); sim.command({ t: 'power', id: 'fire', x: t.cx + 12, y: t.cy + 3, r: 2 }); sim.command({ t: 'power', id: 'rain', x: t.cx - 10, y: t.cy, r: 8 }); sim.command({ t: 'power', id: 'tornado', x: t.cx + 20, y: t.cy + 10 }); run(sim, 40);
const t0 = Date.now(), buf = AL.Save.write(sim), tw = Date.now() - t0, sigSaved = AL.Save.signature(sim), dups = AL.Save.dups.slice();
const t1 = Date.now(), sim2 = AL.Save.read(buf), tr = Date.now() - t1, sigLoaded = AL.Save.signature(sim2);
const buf2 = AL.Save.write(sim2), same = buf.byteLength === buf2.byteLength && Buffer.compare(Buffer.from(buf), Buffer.from(buf2)) === 0;
run(sim, 3000); run(sim2, 3000); const sA = AL.Save.signature(sim), sB = AL.Save.signature(sim2);
console.log('save', (buf.byteLength / 1024).toFixed(0) + ' KB', 'write', tw + ' ms', 'read', tr + ' ms', 'units', sim.E.count, 'towns', sim.towns.filter(t => t.alive).length, 'religions', sim.religions.length);
console.log('saved   ', sigSaved); console.log('loaded  ', sigLoaded); console.log('+3000 A ', sA); console.log('+3000 B ', sB); if (dups.length) console.log('shared references:', [...new Set(dups)].slice(0, 12).join(' '));
const fails = []; if (sigSaved !== sigLoaded) fails.push('reloaded state differs'); if (!same) fails.push('re-saved bytes differ'); if (sA !== sB) fails.push('play diverges after reload');
console.log(fails.length ? 'SAVE FAIL ' + fails : 'SAVE OK'); process.exit(fails.length ? 1 : 0);
