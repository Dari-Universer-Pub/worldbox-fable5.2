// Headless town survival run: node tests/town-run.js [ticks] [seed] [count] [--quiet]
const AL = require('./sim-bundle.js');
const ticks = +process.argv[2] || 30000, seed = +process.argv[3] || 7, count = +process.argv[4] || 12, quiet = process.argv.includes('--quiet');
const sim = new AL.Sim({ size: 'medium', seed });
const W = sim.world, n = W.n;
// find a good grass spot near the centre
let sx = -1, sy = -1, best = -1;
for (let k = 0; k < 4000; k++) { const x = 20 + ((AL.hash2(k, 1, seed) * (n - 40)) | 0), y = 20 + ((AL.hash2(k, 2, seed) * (n - 40)) | 0); if (W.ground[y * n + x] !== AL.G.grass) continue; const q = AL.Units.siteQuality(sim, x, y); if (q > best) { best = q; sx = x; sy = y; } }
sim.command({ t: 'spawn', kind: 'human', x: sx + 0.5, y: sy + 0.5, count });
const J = AL.JOBS, R = AL.RESN; let minPop = 1e9, maxPop = 0; const t0 = Date.now();
function line() { const E = sim.E; let pop = 0, kids = 0, hung = 0; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 1) && E.kind[i] < AL.NPEOPLE) { pop++; if (E.flags[i] & 2) kids++; hung += E.hunger[i]; }
  const tw = sim.towns.filter(t => t.alive); let s = `t=${sim.tick} pop=${pop} kids=${kids} hunger=${(hung / Math.max(1, pop)).toFixed(0)} towns=${tw.length} starved=${sim.stats.starved} births=${sim.stats.births} deaths=${sim.stats.deaths}`;
  for (const t of tw.slice(0, 3)) { const st = [...t.stock].map((v, k) => v ? R[k] + ':' + v.toFixed(0) : '').filter(Boolean).join(' '); const jb = []; for (let j = 0; j < J.length; j++) if (t.want[j] || t.have[j]) jb.push(J[j].name + ' ' + t.have[j] + '/' + t.want[j]); const bl = {}; for (const b of t.blds) { const k = AL.BTYPES[sim.B.type[b]].name + (sim.B.state[b] === 0 ? '*' : ''); bl[k] = (bl[k] || 0) + 1; }
    s += `\n   town${t.id} stage=${t.stage} pop=${t.pop}/${t.popCap} idle=${t.idle} | ${st} | ${jb.join(', ')} | ${JSON.stringify(bl)}`; } return { s, pop }; }
for (let k = 0; k < ticks; k++) { sim.step(); sim.events.length = 0; if (sim.tick % 1000 === 0 || k === ticks - 1) { const l = line(); if (!quiet || k === ticks - 1) console.log(l.s); minPop = Math.min(minPop, l.pop); maxPop = Math.max(maxPop, l.pop); } }
const ms = (Date.now() - t0) / ticks; console.log(`ms/tick=${ms.toFixed(3)} minPop=${minPop} maxPop=${maxPop}`);
const fin = line().pop; if (fin < count || minPop < count * 0.75) { console.log('TOWN FAIL'); process.exit(1); } console.log('TOWN OK');
