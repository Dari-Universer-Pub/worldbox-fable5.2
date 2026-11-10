// Headless culture run: humans and orcs settle apart. Expect: cultures with their own values and names in their own
// language, a religion founded by a prophet (power) with 3 dogmas whose effects are measurable, a schism, conversion,
// sound shifts in a language, notable characters, a dated history, and determinism.
//   node tests/culture-run.js [ticks] [seed]
const AL = require('./sim-bundle.js'); const ticks = +process.argv[2] || 36000, seed = +process.argv[3] || 7, quiet = process.argv.includes('--quiet');
function run(log) { const sim = new AL.Sim({ size: 'medium', seed, noFauna: true }), W = sim.world, n = W.n, out = { seen: {} };
  let best = null, bq = -1; for (let k = 0; k < 6000; k++) { const x = 40 + ((AL.hash2(k, 1, seed) * (n - 130)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0), x2 = x + 44; if (W.region[y * n + x] === 0 || W.region[y * n + x] !== W.region[y * n + x2]) continue; const q = Math.min(AL.Units.siteQuality(sim, x, y), AL.Units.siteQuality(sim, x2, y)); if (q > bq) { bq = q; best = [x, y, x2]; } }
  sim.command({ t: 'spawn', kind: 'human', x: best[0] + 0.5, y: best[1] + 0.5, count: 16 }); sim.command({ t: 'spawn', kind: 'orc', x: best[2] + 0.5, y: best[1] + 0.5, count: 16 });
  let printed = 0;
  for (let k = 1; k <= ticks; k++) { sim.step(); sim.events.length = 0;
    while (printed < sim.chron.length) { const c = sim.chron[printed++]; out.seen[c.k] = (out.seen[c.k] || 0) + 1; if (log && /culture|religion|schism|convert|mission|language|hero|prophet|faithlost/.test(c.k)) console.log('y' + (1 + Math.floor(c.t / AL.YEAR)) + ' [' + c.k + '] ' + c.s); }
    if (k === 6000) { const t = sim.towns.find(t => t.alive && t.people === 0); if (t) { sim.command({ t: 'power', id: 'prophet', x: t.cx + 1, y: t.cy + 2 }); out.r0 = sim.religions.length; } }
    if (k === 6100 && sim.religions.length) { const E = sim.E, r = sim.religions[0]; out.followers0 = 0; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.religion[i] === r.id) out.followers0++; out.dogmas0 = r.dogmas.length; out.mods0 = ['mood', 'loyal', 'war', 'convert', 'fertility', 'hunger', 'crop', 'heal', 'learn'].map(key => AL.Faith.m(sim, r.id, key)); }
    if (k === 20000) { const t = sim.towns.find(t => t.alive && t.religion >= 0); if (t) { const before = sim.religions.length; sim.command({ t: 'power', id: 'prophet', x: t.cx + 1, y: t.cy + 2 }); out.schism = sim.religions.length > before && sim.religions[sim.religions.length - 1].parent >= 0; } } }
  out.sim = sim; return out; }
const T0 = Date.now(), A = run(!quiet), sim = A.sim, ms = (Date.now() - T0) / ticks;
const q = (name, args) => { for (const m of AL.Sim.modules) if (m.query) { const r = m.query(sim, Object.assign({ q: name }, args || {})); if (r !== undefined) return r; } };
const cu = q('cultures'), re = q('religions'), la = q('languages'), no = q('notables'), hi = q('history');
console.log('cultures', cu.map(c => c.name + '(' + AL.KINDS[c.people].name + ' war ' + c.values.war.toFixed(2) + ' trade ' + c.values.trade.toFixed(2) + ' members ' + c.members + ' shifts ' + c.shifts.join(' ') + ')').join(' | '));
console.log('languages', la.map(l => l.name + ': ' + l.sample.join(' ')).join(' | '));
console.log('religions', re.map(r => r.name + (r.alive ? '' : '+') + ' by ' + r.founder + ' [' + r.dogmas + '] followers ' + r.followers + ' towns ' + r.towns + (r.parent >= 0 ? ' <- ' + re[r.parent].name : '')).join(' | '));
console.log('towns', sim.towns.filter(t => t.alive).map(t => t.name + '/' + (t.culture >= 0 ? cu[t.culture].name : '-') + '/' + (t.religion >= 0 ? re[t.religion].name : '-')).join(' | '));
console.log('notables living', no.living.slice(0, 8).map(x => x.name + ' ' + x.title).join(', '), '| dead', no.dead.slice(-6).map(x => x.name + ' ' + x.title + ' y' + x.born + '-' + x.died).join(', '));
console.log('history year', hi.year, 'age', hi.era, 'entries', hi.entries.length, 'events', JSON.stringify(A.seen), 'ms/tick', ms.toFixed(3), 'mods', (A.mods0 || []).map(v => +v.toFixed(2)).join(','));
const fails = [], hc = cu.filter(c => c.people === 0), oc = cu.filter(c => c.people === 1);
if (!hc.length || !oc.length) fails.push('cultures'); else { if (Math.abs(hc[0].values.war - oc[0].values.war) < 0.2) fails.push('values do not differ'); if (!/^[A-Z][a-z]+$/.test(hc[0].name) || hc[0].name === oc[0].name) fails.push('names'); }
const hn = [], on = []; for (let k = 1; k <= 40; k++) { hn.push(AL.Lang.person(k * 2654435761 >>> 0, 0, -1, 0, k & 1)); on.push(AL.Lang.person(k * 2654435761 >>> 0, 1, -1, 0, k & 1)); }
if (new Set(hn).size < 30 || new Set(on).size < 30) fails.push('name variety'); const oz = on.join('').toLowerCase(), hz = hn.join('').toLowerCase(), cnt = (s, re) => (s.match(re) || []).length / s.length; if (!(cnt(oz, /[gkzu]/g) > cnt(hz, /[gkzu]/g) * 1.8)) fails.push('languages sound alike');
if (!(A.r0 >= 1)) fails.push('no religion from prophet'); if (A.dogmas0 !== 3) fails.push('dogmas'); if (!(A.followers0 >= 4)) fails.push('followers'); if (!(A.mods0 || []).some(v => Math.abs(v - 1) > 0.05)) fails.push('dogmas without effect'); if (!A.schism) fails.push('no schism');
if (!re.some(r => r.alive && r.followers > 0)) fails.push('no living religion'); if (!la.some(l => l.shifts.length > 0)) fails.push('no language drift');
if (!no.living.length || !no.living.some(x => x.title === 'king' || x.title === 'queen')) fails.push('notables'); if (!no.dead.length) fails.push('legends'); if (!(hi.year > 20) || !hi.era) fails.push('calendar');
// a sound shift really changes words: same seed before / after the shift
const sc = cu.find(c => c.shifts.length); if (sc) { let diff = 0; const C = sim.cultures[sc.id]; for (let k = 1; k < 200; k++) if (AL.Lang.word(k * 7919, C.people, C.id, 0, 2) !== AL.Lang.word(k * 7919, C.people, C.id, null, 2)) diff++; console.log('words changed by drift', diff, '/ 199'); if (!diff) fails.push('drift changes nothing'); }
// determinism
const B = run(false), sig = s => s.cultures.map(c => c.name).join() + '|' + s.religions.map(r => r.name + r.followers).join() + '|' + s.E.count + '|' + s.chron.length; if (sig(sim) !== sig(B.sim)) fails.push('not deterministic');
console.log(fails.length ? 'CULTURE FAIL ' + fails : 'CULTURE OK'); process.exit(fails.length ? 1 : 0);
