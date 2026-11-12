// Headless run of the provisional content (step 12): every provisional kind is spawned and must live through 600 ticks without a
// NaN; every provisional power is used and must be routed to a handler (zone opened, units touched or creatures summoned);
// provisional animals never appear by themselves in a wild world; the run is deterministic.   node tests/prov-run.js [seed]
const AL = require('./sim-bundle.js'); const seed = +process.argv[2] || 7, fails = [];
const run = (sim, k) => { for (let i = 0; i < k; i++) { sim.step(); sim.events.length = 0; } };
const count = (sim, kd) => { const E = sim.E; let c = 0; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 1) && E.kind[i] === kd) c++; return c; };
function site(sim, water, deep) { const W = sim.world, n = W.n; let best = null, bq = -1; for (let k = 0; k < 4000; k++) { const x = 20 + ((AL.hash2(k, 1, seed) * (n - 40)) | 0), y = 20 + ((AL.hash2(k, 2, seed) * (n - 40)) | 0), g = W.ground[y * n + x];
    if (water) { if (AL.gWater[g] && (!deep || AL.GROUND[g].name === 'deep')) return [x, y]; continue; } if (!W.region[y * n + x]) continue; const q = AL.Units.siteQuality(sim, x, y); if (q > bq) { bq = q; best = [x, y]; } } return best; }
function once() { const sig = [];
  // 1. kinds
  const sim = new AL.Sim({ size: 'small', seed, noFauna: true }), land = site(sim, false), sea = site(sim, true), kinds = AL.KINDS.filter(K => K.provisional); let spawned = 0;
  for (const K of kinds) { const p = K.swim ? sea : land, before = count(sim, K.kid); sim.command({ t: 'spawn', kind: K.name, x: p[0] + 0.5, y: p[1] + 0.5, count: 2 }); if (count(sim, K.kid) <= before) fails.push('spawn ' + K.name); else spawned++; }
  run(sim, 600); const E = sim.E; let nan = 0, live = 0; for (let i = 0; i < E.hi; i++) if (E.alive[i]) { live++; if (!Number.isFinite(E.x[i]) || !Number.isFinite(E.y[i]) || !Number.isFinite(E.hp[i])) nan++; }
  if (nan) fails.push('NaN in ' + nan + ' beings'); if (kinds.length !== 53) fails.push('provisional kinds ' + kinds.length + ' (expected 4 peoples + 32 animals + 17 monsters)'); sig.push(spawned, live);
  // 2. powers
  const P = AL.DATA.powers, prov = Object.keys(P).filter(k => P[k].provisional); if (prov.length !== 56) fails.push('provisional powers ' + prov.length);
  let used = 0; for (const id of prov) { const s2 = new AL.Sim({ size: 'small', seed, noFauna: true }), q = site(s2, false); s2.command({ t: 'spawn', kind: 'human', x: q[0] + 0.5, y: q[1] + 0.5, count: 12 }); run(s2, 30);
    const D = P[id]; if (D.spawn && D.spawn.some(e => AL.KINDS[AL.K[e[0]]].swim)) { const w = site(s2, true); q[0] = w[0]; q[1] = w[1]; } const z0 = s2.zones.length, n0 = s2.E.count, ph0 = s2.phen.length, pw0 = s2.stats.powers; s2.command({ t: 'power', id, x: q[0] + 0.5, y: q[1] + 0.5 }); const r = s2.lastPower;
    if (s2.stats.powers !== pw0 + 1 || !r || r.id !== id) { fails.push('power not used: ' + id); continue; }
    if (D.kind === 'zone') { if (s2.zones.length !== z0 + 1) fails.push('no zone: ' + id); }
    else if (D.like === 'summon') { const want = D.spawn.reduce((a, b) => a + b[1], 0); if (s2.E.count < n0 + Math.ceil(want / 2)) fails.push('summon ' + id + ' gave ' + (s2.E.count - n0) + '/' + want); }
    else if (!AL.Powers.handlers[D.like]) fails.push('no handler: ' + id + ' -> ' + D.like);
    else if (D.scatter && ['tornado', 'meteor', 'earthquake', 'flood'].includes(D.like) && s2.phen.length < ph0 + Math.min(2, D.scatter)) fails.push('scatter ' + id + ' gave ' + (s2.phen.length - ph0));
    run(s2, 120); used++; sig.push(s2.E.count); }
  sig.push(used);
  // 3. a wild world never grows provisional animals by itself (20 years)
  const w = new AL.Sim({ size: 'small', seed }); run(w, 24000); let wild = 0; for (const K of AL.KINDS) if (K.provisional) wild += count(w, K.kid); if (wild) fails.push(wild + ' provisional animals appeared by themselves'); sig.push(w.E.count);
  return sig.join(','); }
const a = once(), b = once(); if (a !== b) fails.push('not deterministic');
console.log(fails.length ? 'PROV FAIL ' + fails.join(' | ') : 'PROV OK 53 provisional kinds spawned and alive, 56 provisional powers routed, none appears by itself, deterministic');
process.exit(fails.length ? 1 : 0);
