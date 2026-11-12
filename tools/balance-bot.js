#!/usr/bin/env node
// Balance bot: plays many whole games headlessly (no browser: the simulation is deterministic and runs under Node), samples
// everything that makes a game coherent and pleasant (pace of progress, growth, famine, idleness, towns, wars, religions,
// wildlife, fire, events per year, consistency of the data, speed) and judges it against written targets.
//
//   node tools/balance-bot.js battery [--quick] [--only a,b] [--seeds 1,2,3] [--out file.json]   scenarios on several seeds, in parallel
//   node tools/balance-bot.js run <scenario> <seed> <years>             one run, JSON on stdout
//
// Scenarios: solo-human, solo-orc (one people alone), duel44, duel80 (humans and orcs 44 / 80 tiles apart), wild (animals
// only, 200 years), chaos (two peoples 60 tiles apart and a random god power every 1.25 years).
'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');

// ------------------------------------------------------------------------------------------------ one run
function runOne(scn, seed, years) {
  const AL = require(path.join(ROOT, 'tests/sim-bundle.js')); const t0 = Date.now();
  const sim = new AL.Sim({ size: 'medium', seed, noFauna: false }), W = sim.world, n = W.n, E = sim.E, YEAR = AL.YEAR;
  // ---- hooks: chronicle and causes of death
  const log = [], deaths = { people: {}, animals: {} }, R = AL.Realm, origLog = R.log; R.log = function (s, type, text, x, y, a, b) { log.push({ t: s.tick, type, text, a, b }); return origLog.apply(this, arguments); };
  const P = AL.Ents.prototype, origKill = P.kill; P.kill = function (s, i, cause) { if (this.alive[i] && !(this.flags[i] & 1)) { const k = this.kind[i] < AL.NPEOPLE ? deaths.people : deaths.animals; k[cause] = (k[cause] || 0) + 1; } return origKill.apply(this, arguments); };
  // biggest army on the march (soldiers flagged as mobilised for one kingdom), seen each time a kingdom at war sends its soldiers
  let peakArmy = 0; { const oM = AL.War.mobilize; AL.War.mobilize = function (s, kd) { const r = oM.apply(this, arguments); let m = 0; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.kingdom[i] === kd.id && (E.flags[i] & 4096)) m++; if (m > peakArmy) peakArmy = m; return r; }; }
  // ---- placement
  // a start on a small island (under 4000 tiles) caps a people at ~140 whatever the rules are, and there is no sea colonisation yet: not a fair test
  const regSize = new Map(); for (let i = 0; i < n * n; i++) { const r = W.region[i]; if (r) regSize.set(r, (regSize.get(r) || 0) + 1); }
  const site = (dist, minQ) => { let best = null, bq = -1; for (let k = 0; k < 9000; k++) { const x = 30 + ((AL.hash2(k, 1, seed) * (n - 70 - dist)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0), x2 = x + dist; if (W.region[y * n + x] === 0 || W.region[y * n + x] !== W.region[y * n + x2] || (regSize.get(W.region[y * n + x]) || 0) < 4000) continue; const q = Math.min(AL.Units.siteQuality(sim, x, y), dist ? AL.Units.siteQuality(sim, x2, y) : 9); if (q > bq) { bq = q; best = [x, y, x2]; } if (q >= minQ && k > 400) break; } return { best, bq }; };
  const dist = { 'solo-human': 0, 'solo-orc': 0, duel44: 44, duel80: 80, chaos: 60, small: 6, wild: 0 }[scn];
  if (scn !== 'wild') { const { best, bq } = site(dist, 0.62); if (!best) return { scn, seed, error: 'no site' };
    if (scn === 'solo-orc') sim.command({ t: 'spawn', kind: 'orc', x: best[0] + .5, y: best[1] + .5, count: 16 });
    else { const cnt = scn === 'small' ? 3 : 16; sim.command({ t: 'spawn', kind: 'human', x: best[0] + .5, y: best[1] + .5, count: cnt }); if (dist) sim.command({ t: 'spawn', kind: 'orc', x: best[2] + .5, y: best[1] + .5, count: cnt }); } }
  const rng = new AL.Rng(seed * 7919 + 13), POW = ['rain', 'storm', 'lightning', 'fire', 'tornado', 'earthquake', 'meteor', 'bomb', 'heal', 'curse', 'plague', 'madness', 'rage', 'poison', 'inspire', 'resurrect', 'prophet', 'war', 'peace', 'flood', 'eruption', 'drought', 'coldsnap', 'heatwave', 'teleport', 'fertility', 'strength', 'bigbomb'];
  let land = 0, trees0 = 0; for (let i = 0; i < n * n; i++) { if (AL.GROUND[W.ground[i]].cost > 0) land++; if (AL.fKind[W.feature[i]] === 1) trees0++; }
  const trees = () => { let t = 0; for (let i = 0; i < n * n; i++) if (AL.fKind[W.feature[i]] === 1) t++; return t; };
  const out = { scn, seed, years, series: [], milestone: {}, invariants: {}, stall: 0, maxTick: 0, nanCount: 0 }, J = AL.JOBS, ms = out.milestone, inv = out.invariants; const bump = (k, v = 1) => { inv[k] = (inv[k] || 0) + v; };
  let popHist = [], wars = {}, warList = [], peaceN = 0, tick = 0, slow = 0;
  const first = (k, y) => { if (ms[k] == null) ms[k] = y; };
  const sample = (yr, full) => {
    let kids = 0, adults = 0, idle = 0, hung = 0, nPeople = 0, byKind = {}; const animals = {}; let nAn = 0;
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || (E.flags[i] & 1)) continue; const k = E.kind[i];
      if (!Number.isFinite(E.x[i]) || !Number.isFinite(E.y[i]) || !Number.isFinite(E.hp[i])) { out.nanCount++; continue; }
      if (k < AL.NPEOPLE) { nPeople++; byKind[AL.KINDS[k].name] = (byKind[AL.KINDS[k].name] || 0) + 1; hung += E.hunger[i]; if (E.flags[i] & 2) kids++; else if (!(E.flags[i] & 4)) { adults++; if (E.job[i] === 0 && !(E.flags[i] & 128) && E.town[i] >= 0) idle++; } }
      else if (AL.KINDS[k].cls === 1) { animals[AL.KINDS[k].name] = (animals[AL.KINDS[k].name] || 0) + 1; nAn++; } }
    const alive = sim.towns.filter(t => t.alive).sort((a, b) => b.pop - a.pop), main = alive[0]; let maxStage = 0, tiny = 0, tinyOld = 0;
    // consistency of the books: town.pop must equal the people who live there
    const real = new Int32Array(sim.towns.length); for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & 1) && E.kind[i] < AL.NPEOPLE && E.town[i] >= 0 && E.town[i] < real.length) real[E.town[i]]++;
    for (const t of alive) { maxStage = Math.max(maxStage, t.stage); if (t.pop <= 5) { tiny++; if (tick - t.founded > 12000) tinyOld++; } if (Math.abs(real[t.id] - t.pop) > 2) bump('town.pop != residents'); for (let r = 0; r < AL.NRES; r++) if (t.stock[r] < -0.5 || !Number.isFinite(t.stock[r])) bump('bad stock'); }
    for (const kd of sim.kingdoms) if (kd.alive && kd.ruler >= 0 && !E.alive[kd.ruler]) bump('dead ruler in office');
    const fp = main ? main.stock[AL.RES.food] / Math.max(1, main.pop) : 0;
    const row = { y: yr, people: nPeople, byKind, kids, adults, idle, hunger: nPeople ? hung / nPeople : 0, towns: alive.length, tiny, tinyOld, maxStage, mainPop: main ? main.pop : 0, mainCap: main ? main.popCap : 0, mainStage: main ? main.stage : 0, mainFood: fp, kingdoms: sim.kingdoms.filter(k => k.alive).length, religions: sim.religions.filter(r => r.alive).length, cultures: sim.cultures.filter(c => c.alive).length, animals, nAn, fires: sim.nFire, ents: E.count };
    if (full) { row.trees = trees(); row.burnt = sim.stats.burnt; } out.series.push(row); return row; };
  const yearly = yr => {
    const alive = sim.towns.filter(t => t.alive); let ms2 = 0; for (const t of alive) ms2 = Math.max(ms2, t.stage); for (let s = 2; s <= 5; s++) if (ms2 >= s) first('stage' + s, yr);
    if (sim.religions.length) first('religion', yr); if (sim.kingdoms.length) first('kingdom', yr); if (log.some(l => l.type === 'war')) first('war', yr); if (log.some(l => l.type === 'schism')) first('schism', yr);
    const main = alive.sort((a, b) => b.pop - a.pop)[0]; popHist.push(main ? { pop: main.pop, cap: main.popCap, f: main.stock[AL.RES.food] / Math.max(1, main.pop), war: !!main.atWar } : { pop: 0, cap: 0, f: 0, war: false });
    const h = popHist, L = h.length - 1; if (L >= 8 && h[L].pop < 150 && h[L].pop - h[L - 4].pop < 2 && h[L].pop < 0.85 * h[L].cap && h[L].f > 6 && !h[L].war && h[L - 4].pop > 0) out.stall++; };
  const total = years * YEAR; let kingdomPeak = 0;
  for (let k = 1; k <= total; k++) { tick = k; const tt = process.hrtime.bigint();
    if (scn === 'chaos' && k % 1500 === 0) { const id = rng.pick(POW), towns = sim.towns.filter(t => t.alive), tw = towns.length && rng.chance(0.6) ? rng.pick(towns) : null, x = tw ? tw.cx + rng.range(-8, 8) : rng.range(20, n - 20), y = tw ? tw.cy + rng.range(-8, 8) : rng.range(20, n - 20); sim.command({ t: 'power', id, x, y, x0: tw ? tw.cx : x, y0: tw ? tw.cy : y, r: 0 }); }
    try { sim.step(); } catch (e) { out.error = 'tick ' + k + ': ' + e.message; break; } sim.events.length = 0;
    const d = Number(process.hrtime.bigint() - tt) / 1e6; if (d > out.maxTick) out.maxTick = d; if (d > 50) slow++;
    if (k % YEAR === 0) { const yr = k / YEAR; yearly(yr); if (yr % 5 === 0) sample(yr, yr % 20 === 0 || yr === years); kingdomPeak = Math.max(kingdomPeak, sim.kingdoms.filter(q => q.alive).length); } }
  // ---- wars from the chronicle
  const open = {}; for (const l of log) { if (l.type === 'war' && l.a != null) { open[l.a + '-' + l.b] = l.t; } else if (l.type === 'peace' && l.a != null) { const key = open[l.a + '-' + l.b] != null ? l.a + '-' + l.b : open[l.b + '-' + l.a] != null ? l.b + '-' + l.a : null; if (key) { warList.push({ start: open[key] / YEAR, len: (l.t - open[key]) / YEAR }); delete open[key]; } } }
  const types = {}; for (const l of log) types[l.type] = (types[l.type] || 0) + 1;
  out.wars = warList; out.openWars = Object.keys(open).length; out.eventTypes = types; out.deaths = deaths; out.kingdomPeak = kingdomPeak; out.slowTicks = slow;
  out.rulersKilled = log.filter(l => l.type === 'death' && /violence/.test(l.text)).length; out.heroes = types.hero || 0;
  out.chronPerYear = (log.filter(l => !/^(era|death|colony|town)$/.test(l.type)).length) / Math.max(1, years);
  out.final = sample(years, true); out.land = land; out.trees0 = trees0; out.forestRatio = trees0 ? out.final.trees / trees0 : 1; out.burntShare = out.final.burnt / Math.max(1, land);
  out.msPerTick = (Date.now() - t0) / total; out.stats = sim.stats; out.wallS = (Date.now() - t0) / 1000; out.firstWarAfterContactOk = true;
  out.peakArmy = peakArmy; out.humans = out.final.byKind.human || 0; out.orcs = out.final.byKind.orc || 0; return out; }

// ------------------------------------------------------------------------------------------------ judging
const med = a => { const s = a.filter(v => v != null && Number.isFinite(v)).sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const fmt = v => v == null ? '-' : Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
function judge(results) {
  const by = {}; for (const r of results) (by[r.scn] = by[r.scn] || []).push(r); const rows = [];
  // check(group, name, target text, value fn per run -> number, ok fn on {median, all}, why it matters)
  const chk = (grp, name, target, vf, ok, why) => { const rs = (by[grp] || []).filter(r => !r.error); if (!rs.length) return; const vals = rs.map(vf), m = med(vals), mn = Math.min(...vals.filter(Number.isFinite)), mx = Math.max(...vals.filter(Number.isFinite)); const v = ok({ m, vals, mn, mx, n: rs.length }); rows.push({ grp, name, target, obs: `${fmt(m)} [${fmt(mn)}..${fmt(mx)}]`, verdict: v ? 'ok' : 'FAIL', why }); };
  const share = (vals, f) => vals.filter(f).length / Math.max(1, vals.length);
  for (const g of ['solo-human', 'solo-orc']) {
    chk(g, 'first town of stage 2 (year)', '<= 8', r => r.milestone.stage2 ?? 999, ({ m }) => m <= 8, 'a settlement must visibly become a village quickly');
    chk(g, 'first town of stage 3 (year)', '8 - 22', r => r.milestone.stage3 ?? 999, ({ m }) => m >= 8 && m <= 22, 'the first real change of look, within the first generation');
    chk(g, 'first town of stage 4 (year)', '15 - 45', r => r.milestone.stage4 ?? 999, ({ m }) => m >= 15 && m <= 45, 'stone age of the town in the middle of a life');
    chk(g, 'first town of stage 5 (year)', '22 - 70', r => r.milestone.stage5 ?? 999, ({ m }) => m >= 22 && m <= 70, 'the late game must be reachable in one long session');
    chk(g, 'biggest town at year 15', '>= 55', r => (r.series.find(s => s.y === 15) || {}).mainPop || 0, ({ m }) => m >= 55, 'early growth');
    chk(g, 'biggest town at year 60', '200 - 800', r => (r.series.find(s => s.y === 60) || {}).mainPop || 0, ({ m }) => m >= 200 && m <= 800, 'a city, not a hamlet and not a megalopolis');
    chk(g, 'years of growth stall (room+food, pop flat 4 y)', '<= 6', r => r.stall, ({ m, mx }) => m <= 6 && mx <= 14, 'no long flat spells when nothing blocks growth');
    chk(g, 'starved share of people deaths %', '<= 15', r => 100 * ((r.deaths.people.hunger || 0) / Math.max(1, Object.values(r.deaths.people).reduce((a, b) => a + b, 0))), ({ m }) => m <= 15, 'famine exists but is not the main killer');
    chk(g, 'idle adults share % (average of samples)', '<= 20', r => 100 * med(r.series.filter(s => s.y >= 10).map(s => s.idle / Math.max(1, s.adults))), ({ m }) => m <= 20, 'people should look busy');
    chk(g, 'average hunger of people (0 fed .. 100 starving)', '<= 45', r => med(r.series.filter(s => s.y >= 10).map(s => s.hunger)), ({ m }) => m <= 45, 'a fed population');
    chk(g, 'tiny towns (<=5) older than 10 y at year 100', '0 - 1', r => r.final.tinyOld, ({ m, mx }) => m <= 1 && mx <= 3, 'no dead-end colonies');
    chk(g, 'people at year 100', '700 - 2600', r => r.final.people, ({ m }) => m >= 700 && m <= 2600, 'a populated world, not overcrowded');
    chk(g, 'a people dies out alone (runs with 0 people at year 100)', '0', r => r.final.people === 0 ? 1 : 0, ({ vals }) => vals.every(v => v === 0), 'a starting village must not vanish by itself');
    chk(g, 'biggest collapse in 5 years (share of the population lost)', '<= 45 %', r => 100 * Math.max(0, ...r.series.slice(1).map((x, i) => r.series[i].people > 40 ? 1 - x.people / r.series[i].people : 0)), ({ m }) => m <= 45, 'no mass death spiral');
    chk(g, 'towns at year 100', '4 - 16', r => r.final.towns, ({ m }) => m >= 4 && m <= 16, 'several towns');
    chk(g, 'first religion (year)', '<= 35', r => r.milestone.religion ?? 999, ({ vals }) => share(vals, v => v <= 35) >= 0.85, 'faith appears within a generation');
    chk(g, 'religions alive at year 100', '1 - 8', r => r.final.religions, ({ m }) => m >= 1 && m <= 8, 'a few faiths, schisms included');
    chk(g, 'chronicle entries per year (no era/death/colony/town)', g.startsWith('solo') ? '0.4 - 8' : '0.6 - 8', r => r.chronPerYear, ({ m }) => m >= (g.startsWith('solo') ? 0.4 : 0.6) && m <= 8, 'enough story, not spam (a world with one people has no wars or treaties, so fewer entries)');
    chk(g, 'cultures alive at year 100', '2 - 8', r => r.final.cultures, ({ m }) => m >= 2 && m <= 8, 'cultures split and change');
    chk(g, 'data consistency violations', '0', r => Object.values(r.invariants).reduce((a, b) => a + b, 0) + r.nanCount, ({ mx }) => mx === 0, 'books must match the world');
  }
  for (const g of ['duel44', 'duel80']) {
    chk(g, 'both peoples alive at year 100 (share of runs)', '>= 80 %', r => r.humans > 0 && r.orcs > 0 ? 1 : 0, ({ vals }) => share(vals, v => v === 1) >= 0.8, 'a war should not erase a people in most games');
    chk(g, 'humans / orcs people at year 100', '0.25 - 4', r => (r.humans + 1) / (r.orcs + 1), ({ m }) => m >= 0.25 && m <= 4, 'the two peoples are contrasting but each can win');
    chk(g, 'biggest army on the march in a war', '>= 20', r => r.peakArmy, ({ m }) => m >= 20, 'battles should look like battles');
    chk(g, 'wars started in 100 years', '1 - 8', r => r.wars.length + r.openWars, ({ m }) => m >= 1 && m <= 8, 'wars happen without looping');
    chk(g, 'average war length (years)', '1 - 8', r => r.wars.length ? r.wars.reduce((a, w) => a + w.len, 0) / r.wars.length : null, ({ m }) => m != null && m >= 1 && m <= 8, 'a war is an episode, not a blink and not for ever');
    chk(g, 'rulers killed by violence', '<= 3', r => r.rulersKilled, ({ m }) => m <= 3, 'rulers are not slaughtered in chains');
    chk(g, 'kingdoms alive at year 100 (share of runs with 2+)', '>= 60 %', r => r.final.kingdoms >= 2 ? 1 : 0, ({ vals }) => share(vals, v => v === 1) >= 0.6, 'the map keeps several powers');
    chk(g, 'people killed (all causes, whole run)', 'info', r => (r.deaths.people.violence || 0) + (r.deaths.people.war || 0), () => true, 'how bloody the wars are');
    chk(g, 'data consistency violations', '0', r => Object.values(r.invariants).reduce((a, b) => a + b, 0) + r.nanCount, ({ mx }) => mx === 0, 'books must match the world');
  }
  chk('wild', 'species extinct at year 200', '0 (>= 90 % of runs)', r => AL_NAMES.filter(k => !(r.final.animals[k] > 0)).length, ({ vals }) => share(vals, v => v === 0) >= 0.9, 'a stable ecosystem');
  chk('wild', 'largest species share of animals %', '<= 45', r => 100 * Math.max(...Object.values(r.final.animals)) / Math.max(1, r.final.nAn), ({ m }) => m <= 45, 'no species floods the world');
  chk('wild', 'predators alive (wolf+bear+eagle)', '>= 8', r => (r.final.animals.wolf || 0) + (r.final.animals.bear || 0) + (r.final.animals.eagle || 0), ({ m }) => m >= 8, 'hunters are present');
  chk('wild', 'animals at year 200', '200 - 1000', r => r.final.nAn, ({ m }) => m >= 200 && m <= 1000, 'a living countryside');
  chk('wild', 'forest at year 200 (share of start)', '0.7 - 1.6', r => r.forestRatio, ({ m }) => m >= 0.7 && m <= 1.6, 'forests neither vanish nor take over');
  // a player drops three of each people side by side and watches: the little bands must be able to make a village
  chk('small', 'people (both peoples) at year 20', '>= 20', r => (r.series.find(x => x.y === 20) || {}).people || 0, ({ m }) => m >= 20, 'three placed people must grow, not stay three for ever');
  chk('small', 'both peoples alive at year 40 (share of runs)', '>= 65 %', r => r.humans > 0 && r.orcs > 0 ? 1 : 0, ({ vals }) => share(vals, v => v === 1) >= 0.65, 'a small start is fragile, not hopeless');
  chk('small', 'people at year 40', '>= 60', r => r.final.people, ({ m }) => m >= 60, 'the village grows');
  chk('chaos', 'people alive at year 100', '>= 30', r => r.final.people, ({ m }) => m >= 30, 'peoples survive an active god');
  chk('chaos', 'burnt land % over 100 years', '<= 25', r => 100 * r.burntShare, ({ m }) => m <= 25, 'fire is a disaster, not the climate');
  chk('chaos', 'forest at year 100 (share of start)', '0.5 - 1.6', r => r.forestRatio, ({ m }) => m >= 0.5 && m <= 1.6, 'forests recover');
  chk('chaos', 'data consistency violations', '0', r => Object.values(r.invariants).reduce((a, b) => a + b, 0) + r.nanCount, ({ mx }) => mx === 0, 'books must match the world after disasters');
  for (const g of Object.keys(by)) { chk(g, 'simulation cost ms per tick (average)', '<= 1.6', r => r.msPerTick, ({ m }) => m <= 1.6, 'speed'); chk(g, 'slowest tick ms', '<= 50', r => r.maxTick, ({ m }) => m <= 50, 'no stutter'); chk(g, 'crashes', '0', r => r.error ? 1 : 0, ({ mx }) => mx === 0, 'stability'); }
  return rows; }
const AL_NAMES = ['rabbit', 'deer', 'sheep', 'boar', 'wolf', 'bear', 'eagle', 'salmon'];

// ------------------------------------------------------------------------------------------------ battery
async function battery() {
  const quick = process.argv.includes('--quick'), oi = process.argv.indexOf('--out'), outFile = oi > 0 ? process.argv[oi + 1] : path.join(os.tmpdir(), 'aeonloom-balance.json');
  const oo = process.argv.indexOf('--only'), only = oo > 0 ? process.argv[oo + 1].split(',') : null, so = process.argv.indexOf('--seeds'), seedArg = so > 0 ? process.argv[so + 1].split(',').map(Number) : null;
  const seeds = seedArg || (quick ? [7, 3, 5] : [1, 2, 3, 4, 5, 6, 7, 8]), jobs = [];
  for (const s of seeds) { jobs.push(['solo-human', s, quick ? 80 : 100]); jobs.push(['solo-orc', s, quick ? 80 : 100]); jobs.push(['duel44', s, quick ? 80 : 100]); jobs.push(['duel80', s, quick ? 80 : 100]); jobs.push(['chaos', s, quick ? 60 : 100]); jobs.push(['small', s, 40]); }
  for (const s of (quick ? [7, 3] : [1, 2, 3, 4, 5, 6])) jobs.push(['wild', s, quick ? 120 : 200]);
  if (only) for (let k = jobs.length - 1; k >= 0; k--) if (!only.includes(jobs[k][0])) jobs.splice(k, 1);
  const results = [], par = Math.max(1, os.cpus().length), queue = jobs.slice(); let done = 0;
  const worker = () => new Promise(resolve => { const next = () => { const j = queue.shift(); if (!j) return resolve(); const c = spawn(process.execPath, [__filename, 'run', j[0], String(j[1]), String(j[2])], { stdio: ['ignore', 'pipe', 'inherit'] }); let buf = ''; c.stdout.on('data', d => buf += d); c.on('close', () => { try { results.push(JSON.parse(buf)); } catch (e) { results.push({ scn: j[0], seed: j[1], error: 'no output' }); } done++; process.stderr.write(`\r${done}/${jobs.length} runs`); next(); }); }; next(); });
  await Promise.all(Array.from({ length: par }, worker)); process.stderr.write('\n'); fs.writeFileSync(outFile, JSON.stringify(results));
  const rows = judge(results); let last = ''; for (const r of rows) { if (r.grp !== last) { console.log('\n== ' + r.grp); last = r.grp; } console.log((r.verdict === 'ok' ? 'ok   ' : 'FAIL ') + r.name.padEnd(56) + ' target ' + r.target.padEnd(14) + ' observed ' + r.obs + '   (' + r.why + ')'); }
  const bad = rows.filter(r => r.verdict !== 'ok'); console.log(`\nBALANCE: ${rows.length - bad.length}/${rows.length} targets met on ${results.length} games (raw results: ${outFile})`); process.exit(0); }

if (process.argv[2] === 'run') { const r = runOne(process.argv[3], +process.argv[4], +process.argv[5]); process.stdout.write(JSON.stringify(r)); }
else if (process.argv[2] === 'battery') battery();
else if (process.argv[2] === 'judge') { const rows = judge(JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))); let last = ''; for (const r of rows) { if (r.grp !== last) { console.log('\n== ' + r.grp); last = r.grp; } console.log((r.verdict === 'ok' ? 'ok   ' : 'FAIL ') + r.name.padEnd(56) + ' target ' + r.target.padEnd(14) + ' observed ' + r.obs); } }
else console.log('usage: node tools/balance-bot.js battery [--quick] [--out f] | run <scenario> <seed> <years> | judge <file.json>');
