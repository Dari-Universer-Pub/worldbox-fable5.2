// AL.Units — people: movement, needs, utility AI, jobs, life cycle. (Animals and monsters live in creatures.js and reuse the movement.)
(function (AL) {
  'use strict';
  const U = AL.Units = {}, ACT = U.ACT = { NONE: 0, WANDER: 1, EAT: 2, SLEEP: 3, WORK: 4, HAUL: 5, BUILD: 6, SOCIAL: 7, PRAY: 8, FLEE: 9, FIGHT: 10, FOUND: 11, SETTLE: 12, FORAGE: 13, GUARD: 14, MARCH: 15, GOTO: 16, CONTROL: 17, BOARD: 18, CORPSE: 255 };
  const F = AL.Ents.F, T = AL.Towns;
  U.ACTN = Object.keys(ACT);
  U.dayPhase = sim => (sim.tick % AL.DAY) / AL.DAY;       // 0..1; night when > 0.7
  U.isNight = sim => { const p = (sim.tick % AL.DAY) / AL.DAY; return p > 0.72 || p < 0.04; };
  // ------------------------------------------------------------ movement
  // start a trip. returns 1 arrived already, 2 started, 0 failed/unreachable, -1 deferred (budget)
  U.goTo = function (sim, i, tx, ty) { const E = sim.E, W = sim.world, n = W.n, sx = E.x[i] | 0, sy = E.y[i] | 0; E.tx[i] = tx; E.ty[i] = ty; E.flow[i] = -1; E.pathLen[i] = 0; E.pathPos[i] = 0;
    if (sx === tx && sy === ty) return 1; if (!W.inb(tx, ty)) return 0; const t = ty * n + tx, s = sy * n + sx;
    if (W.region[s] && W.region[t] && W.region[s] !== W.region[t]) return 0; if (!W.region[t] && !(W.flags[t] & 2)) return 0;
    const dist = Math.abs(tx - sx) + Math.abs(ty - sy);
    if (dist > 90) { E.flow[i] = t; return 2; }
    if (sim.pathBudget <= 0) return -1; sim.pathBudget--;
    const len = sim.path.find(sx, sy, tx, ty, E.path, i * E.PATH, E.PATH, 3600); if (len > 0) { E.pathLen[i] = len; return 2; } if (len === -1) { E.flow[i] = t; return 2; } return 0; };
  // advance along the path / flow field. returns true when the destination tile is reached
  U.move = function (sim, i) { const E = sim.E, W = sim.world, n = W.n; let nt = -1;
    if (E.pathPos[i] < E.pathLen[i]) nt = E.path[i * E.PATH + E.pathPos[i]];
    else if (E.flow[i] >= 0) { const x = E.x[i] | 0, y = E.y[i] | 0, t = E.flow[i]; if (x === t % n && y === ((t / n) | 0)) { E.flow[i] = -1; return true; } // (a field is followed to its end: retrying A* near the goal failed every tick on long detours)
      if (sim.fieldBudget <= 0 && !(sim.path.fields.get(t) && W.regionVersion - sim.path.fields.get(t).ver <= 10)) return false; const had = sim.path.stats.fields, f = sim.path.field(t); if (sim.path.stats.fields !== had) sim.fieldBudget--; nt = sim.path.follow(f, x, y); if (nt < 0) { E.flow[i] = -1; return f.d[y * n + x] === 0; } }
    else return (E.x[i] | 0) === E.tx[i] && (E.y[i] | 0) === E.ty[i];
    const tx = nt % n + 0.5, ty = ((nt / n) | 0) + 0.5, dx = tx - E.x[i], dy = ty - E.y[i], d = Math.sqrt(dx * dx + dy * dy);
    if ((W.flags[nt] & 2) && nt !== E.ty[i] * n + E.tx[i]) { E.pathLen[i] = 0; E.pathPos[i] = 0; return false; }
    const here = (E.y[i] | 0) * n + (E.x[i] | 0), c = AL.gCost[W.ground[here]] || 1.5; let step = E.spd[i] / (W.road[here] > 120 ? c * 0.6 : c); if (E.flags[i] & F.CHILD) step *= 0.85; if (E.carryN[i]) step *= 0.88;
    if (d <= step) { E.x[i] = tx; E.y[i] = ty; if (E.pathPos[i] < E.pathLen[i]) E.pathPos[i]++; if (W.road[nt] < 250 && !(W.flags[nt] & 8)) W.road[nt] += 2; if (E.pathPos[i] >= E.pathLen[i] && E.flow[i] < 0) { E.pathLen[i] = 0; E.pathPos[i] = 0; return (nt % n) === E.tx[i] && ((nt / n) | 0) === E.ty[i]; } }
    else { E.x[i] += dx / d * step; E.y[i] += dy / d * step; }
    E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); E.anim[i] = AL.ANIM.walk; return false; };
  U.moving = (E, i) => E.pathPos[i] < E.pathLen[i] || E.flow[i] >= 0;
  U.stop = function (E, i) { E.pathLen[i] = 0; E.pathPos[i] = 0; E.flow[i] = -1; };
  U.face = function (E, i, x, y) { const dx = x - E.x[i], dy = y - E.y[i]; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); };
  function begin(sim, i, act, tx, ty) { const E = sim.E, r = U.goTo(sim, i, tx, ty); if (r === 0) { E.act[i] = ACT.NONE; E.cool[i] = 24; E.stuck[i]++; return false; } if (r === -1) { E.act[i] = ACT.NONE; return false; } E.act[i] = act; E.phase[i] = r === 1 ? 1 : 0; E.timer[i] = 0; E.stuck[i] = 0; return true; }
  U.begin = begin;
  // random walkable tile near (x,y)
  U.randomNear = function (sim, x, y, r) { const W = sim.world, n = W.n, rng = sim.rng, reg = W.region[(y | 0) * n + (x | 0)]; for (let k = 0; k < 8; k++) { const X = (x + rng.range(-r, r)) | 0, Y = (y + rng.range(-r, r)) | 0; if (!W.inb(X, Y)) continue; const t = Y * n + X; if (W.region[t] === reg && reg && !(W.flags[t] & 2)) return t; } return -1; };
  // ------------------------------------------------------------ thinking (utility scores)
  const sc = U.scores = new Float32Array(8); // eat, sleep, work, social, pray, wander, haul (kept for the debug line of the sheet)
  U.think = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, town = sim.towns[E.town[i]], night = U.isNight(sim), fl = E.flags[i];
    if (E.cool[i] > 0) { E.cool[i] = E.cool[i] > 8 ? E.cool[i] - 8 : 0; if (E.act[i] === ACT.NONE) { E.anim[i] = AL.ANIM.idle; } return; }
    if (AL.Creatures && AL.Creatures.threat(sim, i)) return;
    if (!town || !town.alive) return U.thinkNomad(sim, i);
    const h = E.hunger[i], en = E.energy[i], child = fl & F.CHILD;
    const dp = U.dayPhase(sim), evening = dp > 0.56 && dp <= 0.72;
    // hunger grows into the strongest drive: a villager eats before sleeping and never works on an empty stomach
    sc[0] = h > 45 ? 0.3 + (h - 45) / 55 * 1.3 : 0; sc[1] = (night ? 0.55 : 0) + (en < 35 ? (1 - en / 100) * 1.1 : 0); sc[6] = E.carryN[i] ? 0.95 : 0;
    sc[2] = (!child && !night) ? (E.job[i] ? (evening ? 0.45 : 0.6) : 0.3) : 0; sc[3] = (1 - E.social[i] / 100) * (night ? 0.2 : 0.75) + (evening ? 0.22 : 0); sc[4] = town.temple ? (1 - E.faith[i] / 100) * 0.35 : 0; sc[5] = child ? 0.3 : 0.12;
    let b = 0; for (let k = 1; k < 7; k++) if (sc[k] > sc[b]) b = k; E.lastScore = b;
    if (b === 0) return U.startEat(sim, i, town); if (b === 6) return U.startHaul(sim, i, town); if (b === 1) return U.startSleep(sim, i, town);
    if (b === 2) { if (U.startWork(sim, i, town)) return; b = 5; }
    if (b === 3) { const t = U.randomNear(sim, town.cx, town.cy, 5); if (t >= 0 && begin(sim, i, ACT.SOCIAL, t % n, (t / n) | 0)) return; }
    if (b === 4) { const tb = T.findType(sim, town, AL.BT.temple, E.x[i], E.y[i]); if (tb >= 0 && begin(sim, i, ACT.PRAY, T.doorX(sim.B, tb), T.doorY(sim.B, tb))) { E.tB[i] = tb; return; } }
    const t = U.randomNear(sim, child ? E.x[i] : (E.x[i] + town.cx) / 2, child ? E.y[i] : (E.y[i] + town.cy) / 2, 6); if (t >= 0) begin(sim, i, ACT.WANDER, t % n, (t / n) | 0); };
  U.startEat = function (sim, i, town) { const E = sim.E, B = sim.B; if (town.stock[AL.RES.food] >= 1) { const b = T.nearestStore(sim, town, E.x[i], E.y[i]); if (b >= 0 && begin(sim, i, ACT.EAT, T.doorX(B, b), T.doorY(B, b))) { E.tB[i] = b; return; } } U.startForage(sim, i, town); };
  U.startForage = function (sim, i, town) { const E = sim.E, W = sim.world, n = W.n, x = E.x[i] | 0, y = E.y[i] | 0; let best = -1, bd = 1e9;
    if (town && town.berries) for (const t of town.berries) { if (W.fgrow[t] < 200) continue; const d = Math.abs(t % n - x) + Math.abs(((t / n) | 0) - y); if (d < bd) { bd = d; best = t; } }
    if (best < 0) for (let k = 0; k < 24; k++) { const X = x + sim.rng.int(17) - 8, Y = y + sim.rng.int(17) - 8; if (!W.inb(X, Y)) continue; const t = Y * n + X, f = W.feature[t]; if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) { best = t; break; } }
    if (best >= 0 && begin(sim, i, ACT.FORAGE, best % n, (best / n) | 0)) return true;
    const t = U.randomNear(sim, E.x[i], E.y[i], 9); if (t >= 0) begin(sim, i, AL.gFert[W.ground[t]] > 0.2 ? ACT.FORAGE : ACT.WANDER, t % n, (t / n) | 0); return false; };
  U.startHaul = function (sim, i, town) { const E = sim.E, B = sim.B, b = T.nearestStore(sim, town, E.x[i], E.y[i]); if (b < 0) { E.carryN[i] = 0; return; } if (begin(sim, i, ACT.HAUL, T.doorX(B, b), T.doorY(B, b))) E.tB[i] = b; };
  U.startSleep = function (sim, i, town) { const E = sim.E, B = sim.B; let b = E.home[i]; if (b < 0 || !B.alive[b] || B.state[b] !== 1) { b = -1; E.home[i] = -1;
      for (const hb of town.blds) { if (B.state[hb] !== 1) continue; const cap = AL.BTYPES[B.type[hb]].cap; if (cap && B.occ[hb] < cap) { b = hb; B.occ[hb]++; E.home[i] = hb; break; } } }
    if (b >= 0) { if (begin(sim, i, ACT.SLEEP, T.doorX(B, b), T.doorY(B, b))) E.tB[i] = b; }
    else { const t = U.randomNear(sim, town.cx, town.cy, 4); if (t >= 0 && begin(sim, i, ACT.SLEEP, t % sim.world.n, (t / sim.world.n) | 0)) E.tB[i] = -1; } };
  // pick the nearest of a few random candidates from a target list
  function pickTarget(sim, list, x, y, valid) { const n = sim.world.n; let best = -1, bd = 1e9; const m = Math.min(list.length, 10); for (let k = 0; k < m; k++) { const t = list[sim.rng.int(list.length)]; if (!valid(t)) continue; const d = Math.abs(t % n - x) + Math.abs(((t / n) | 0) - y); if (d < bd) { bd = d; best = t; } } return best; }
  // a walkable tile next to t (to work on a blocked or occupied target)
  function standBy(sim, t, fx, fy) { const W = sim.world, n = W.n, x = t % n, y = (t / n) | 0; let best = -1, bd = 1e9; for (let d = 0; d < 4; d++) { const X = x + (d === 0 ? 1 : d === 1 ? -1 : 0), Y = y + (d === 2 ? 1 : d === 3 ? -1 : 0); if (!W.inb(X, Y)) continue; const j = Y * n + X; if (AL.gCost[W.ground[j]] <= 0 || (W.flags[j] & 2)) continue; const dd = Math.abs(X - fx) + Math.abs(Y - fy); if (dd < bd) { bd = dd; best = j; } } return best; }
  U.standBy = standBy;
  // the bog folk cannot stand fire: a flame within 5 tiles and they drop everything and run from it
  U.fearFire = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, x = E.x[i] | 0, y = E.y[i] | 0, fire = W.fire; let fx = 0, fy = 0, c = 0;
    for (let dy = -5; dy <= 5; dy++) { const Y = y + dy; if (Y < 0 || Y >= n) continue; for (let dx = -5; dx <= 5; dx++) { const X = x + dx; if (X < 0 || X >= n) continue; if (fire[Y * n + X] > 1) { fx += X; fy += Y; c++; } } }
    if (!c) return false; fx = fx / c + 0.5; fy = fy / c + 0.5; let dx = E.x[i] - fx, dy = E.y[i] - fy; const l = Math.sqrt(dx * dx + dy * dy) || 1; dx /= l; dy /= l;
    const t = U.randomNear(sim, AL.clamp(E.x[i] + dx * 9, 2, n - 3), AL.clamp(E.y[i] + dy * 9, 2, n - 3), 3); if (t < 0) return false; U.stop(E, i); E.carryN[i] = 0;
    if (!begin(sim, i, ACT.FLEE, t % n, (t / n) | 0)) return false; E.mood[i] = Math.max(0, E.mood[i] - 4); sim.stats.fireFled = (sim.stats.fireFled || 0) + 1; return true; };
  U.startWork = function (sim, i, town) { const E = sim.E, W = sim.world, n = W.n, B = sim.B, job = AL.JOBS[E.job[i]], task = job.task, x = E.x[i] | 0, y = E.y[i] | 0; let t = -1;
    E.tB[i] = -1;
    if (task === 'chop') { t = pickTarget(sim, town.trees, x, y, t => AL.fKind[W.feature[t]] === 1 && W.fgrow[t] > 110); if (t < 0) { town.scanAt = Math.min(town.scanAt, sim.tick - 200); return false; } const s = standBy(sim, t, x, y); if (s < 0) return false; if (begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = t; return true; } return false; }
    if (task === 'mine') { t = pickTarget(sim, town.rocks, x, y, t => AL.fKind[W.feature[t]] === 4); if (t >= 0) { const s = standBy(sim, t, x, y); if (s >= 0 && begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = t; return true; } }
      const mb = T.findType(sim, town, AL.BT.mine, x, y); if (mb >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, mb), T.doorY(B, mb))) { E.tE[i] = -1; E.tB[i] = mb; return true; } return false; }
    if (task === 'farm') { let fb = E.work[i]; if (fb < 0 || !B.alive[fb] || B.type[fb] !== AL.BT.farm || B.state[fb] !== 1) { fb = -1; let bw = 99; for (const b of town.blds) if (B.type[b] === AL.BT.farm && B.state[b] === 1 && B.workers[b] < bw) { bw = B.workers[b]; fb = b; } if (fb < 0) return false; E.work[i] = fb; B.workers[fb]++; }
      const f = B.aux[fb]; if (!f || !f.length) return false; let best = -1, bg = -1; const o = sim.rng.int(f.length); for (let k = 0; k < f.length; k++) { const tt = f[(k + o) % f.length]; const g = W.feature[tt] === AL.F.wheat ? (W.fgrow[tt] >= 250 ? 600 : 255 - W.fgrow[tt]) : 400; if (g > bg) { bg = g; best = tt; } }
      if (best >= 0 && begin(sim, i, ACT.WORK, best % n, (best / n) | 0)) { E.tE[i] = best; return true; } return false; }
    if (task === 'build') { let sb = -1, bd = 1e9; for (const b of town.blds) if (B.state[b] === 0) { const d = Math.abs(B.x[b] - x) + Math.abs(B.y[b] - y); if (d < bd) { bd = d; sb = b; } } if (sb < 0) return false; if (begin(sim, i, ACT.BUILD, T.doorX(B, sb), T.doorY(B, sb))) { E.tB[i] = sb; return true; } return false; }
    if (task === 'gather' || task === 'hunt' || task === 'herd' || task === 'idle') { if (task !== 'gather' && task !== 'idle' && AL.Creatures && AL.Creatures.startHunt(sim, i, town, task)) return true;
      t = town.berries && town.berries.length ? pickTarget(sim, town.berries, x, y, t => W.fgrow[t] > 200) : -1; if (t >= 0 && begin(sim, i, ACT.WORK, t % n, (t / n) | 0)) { E.tE[i] = t; return true; }
      const r = U.randomNear(sim, town.cx, town.cy, town.radius + 4); if (r >= 0 && AL.gFert[W.ground[r]] > 0.3 && begin(sim, i, ACT.WORK, r % n, (r / n) | 0)) { E.tE[i] = -2; return true; } return false; }
    if (task === 'fish') { if (!town.shore || !town.shore.length) return false; t = pickTarget(sim, town.shore, x, y, t => !(W.flags[t] & 2)); if (t >= 0 && begin(sim, i, ACT.WORK, t % n, (t / n) | 0)) { E.tE[i] = -3; return true; } return false; }
    // ---- the four peoples' own trades (chantier A.8)
    if (task === 'tend') { const gb = T.findType(sim, town, AL.BT.grove, x, y); if (gb < 0) return false; const full = town.trees.length > 70 + town.pop && sim.rng.int(5) > 0; // a warden plants a sapling on free ground near the grove, or tends a young tree when the wood is already thick
      for (let k = 0; k < 14; k++) { const r = U.randomNear(sim, B.x[gb] + 1, B.y[gb] + 1, 10); if (r < 0) continue; const g = W.ground[r], f = W.feature[r], young = AL.fKind[f] === 1 && W.fgrow[r] < 250; if (W.flags[r] & 10) continue;
        if (!(young || (!full && (!f || f === AL.F.stump) && W.road[r] < 20 && AL.gFert[g] > 0.3 && AL.floraByBiome[g].trees.length))) continue; const s = young ? standBy(sim, r, x, y) : r; if (s >= 0 && begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = r; return true; } } return false; }
    // ---- the engineer (chantier B.3): lays the planks of the town's bridge one by one, else mends the most damaged building
    if (task === 'engineer') { const pj = town.bridge; if (pj && pj.at < pj.tiles.length) { const p = pj.tiles[pj.at], s = pj.at > 0 ? pj.tiles[pj.at - 1] : pj.near; if (begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = p; return true; } return false; }
      let bb = -1, bv = 0.92; for (const b of town.blds) { if (!B.alive[b] || B.state[b] !== 1) continue; const v = B.hp[b] / B.hpMax[b]; if (v < bv) { bv = v; bb = b; } }
      if (bb >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, bb), T.doorY(B, bb))) { E.tE[i] = -5; E.tB[i] = bb; return true; } return false; }
    // ---- the healer (chantier B.3): walks to the worst wounded or sick person of the kingdom around the town; nobody to treat: keeps the hospital
    if (task === 'heal') { const hb = T.findType(sim, town, AL.BT.hospital, x, y); if (hb < 0) return false; const c = E.query(town.cx, town.cy, Math.min(34, town.radius + 10)); let bj = -1, bv = 0.25;
      for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || E.kind[j] >= AL.NPEOPLE || (E.flags[j] & F.DEAD) || E.kingdom[j] !== E.kingdom[i] || E.anim[j] === AL.ANIM.inside || E.act[j] === ACT.FIGHT) continue; const v = ((E.flags[j] & (F.SICK | F.INFECTED)) ? 1 : 0) + 1 - E.hp[j] / E.hpMax[j]; if (v > bv) { bv = v; bj = j; } }
      if (bj >= 0 && begin(sim, i, ACT.WORK, E.x[bj] | 0, E.y[bj] | 0)) { E.tE[i] = -6; E.tB[i] = bj; if (E.act[bj] === ACT.NONE || E.act[bj] === ACT.WANDER || E.act[bj] === ACT.SOCIAL) { U.stop(E, bj); E.act[bj] = ACT.NONE; E.cool[bj] = 80; } return true; }
      if (begin(sim, i, ACT.WORK, T.doorX(B, hb), T.doorY(B, hb))) { E.tE[i] = -4; E.tB[i] = hb; return true; } return false; }
    if (task === 'sail') { const pb = T.findType(sim, town, AL.BT.port, x, y); if (pb >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, pb), T.doorY(B, pb))) { E.tE[i] = -4; E.tB[i] = pb; return true; } return false; } // the sailor is out with the boats (AL.Sea)
    if (task === 'delve') { const db = T.findType(sim, town, AL.BT.delve, x, y); if (db >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, db), T.doorY(B, db))) { E.tE[i] = -4; E.tB[i] = db; return true; } return false; }
    if (task === 'spore') { const sb = T.findType(sim, town, AL.BT.sporebed, x, y); if (sb < 0) return false; let best = -1, bv = -1; // a ripe mushroom first, then a growing one, then a free tile to seed
      for (let k = 0; k < 14; k++) { const r = U.randomNear(sim, B.x[sb] + 1, B.y[sb] + 1, 6); if (r < 0 || (W.flags[r] & 10) || W.road[r] > 20) continue; const f = W.feature[r]; let v = -1; if (f === AL.F.mushroom) v = W.fgrow[r] > 200 ? 3 : 2; else if (!f && AL.gFert[W.ground[r]] > 0.2) v = 1; if (v > bv) { bv = v; best = r; } }
      if (best >= 0 && begin(sim, i, ACT.WORK, best % n, (best / n) | 0)) { E.tE[i] = best; return true; } return false; }
    if (task === 'dive') { if (!town.shore || !town.shore.length) return false; t = pickTarget(sim, town.shore, x, y, t => !(W.flags[t] & 2)); if (t >= 0 && begin(sim, i, ACT.WORK, t % n, (t / n) | 0)) { E.tE[i] = -3; return true; } return false; }
    // jobs done at a building: smith, study, preach, trade, entertain, heal
    const need = job.needs ? AL.BT[job.needs] : -1; if (task === 'guard' || task === 'siege') { if (AL.War && AL.War.unitDuty(sim, i, town)) return true; const r = U.randomNear(sim, town.cx, town.cy, town.radius * 0.8); if (r >= 0 && begin(sim, i, ACT.GUARD, r % n, (r / n) | 0)) return true; return false; }
    if (task === 'trade' && AL.Trade && AL.Trade.startTrip(sim, i, town)) return true;
    if (task === 'rule') { const r = U.randomNear(sim, town.cx, town.cy, 4); if (r >= 0 && begin(sim, i, ACT.WANDER, r % n, (r / n) | 0)) return true; return false; }
    if (need >= 0) { const b = T.findType(sim, town, need, x, y); if (b >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, b), T.doorY(B, b))) { E.tE[i] = -4; E.tB[i] = b; return true; } }
    return false; };
  // ------------------------------------------------------------ acting (called every tick when not travelling)
  const WORKT = { chop: 50, mine: 60, farm: 34, gather: 40, hunt: 40, herd: 40, fish: 70, smith: 90, study: 80, preach: 80, trade: 60, entertain: 80, heal: 40, tend: 60, delve: 90, sail: 220, engineer: 50, spore: 40, dive: 80 };
  U.act = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, B = sim.B, a = E.act[i], town = sim.towns[E.town[i]], A = AL.ANIM, R = AL.RES;
    if (a === ACT.NONE) { E.anim[i] = A.idle; return; }
    if (E.phase[i] === 0) { E.phase[i] = 1; E.timer[i] = 0; }
    const tm = ++E.timer[i];
    switch (a) {
      case ACT.WANDER: E.anim[i] = A.idle; if (tm > 20 + (E.seed[i] & 31)) E.act[i] = ACT.NONE; break;
      case ACT.GOTO: E.act[i] = ACT.NONE; break;
      case ACT.EAT: E.anim[i] = A.idle; if (tm > 14) { if (town && town.stock[R.food] >= 1) { town.stock[R.food] -= 1; E.hunger[i] = Math.max(0, E.hunger[i] - 60); if (E.hunger[i] > 35 && town.stock[R.food] >= 1) { town.stock[R.food] -= 1; E.hunger[i] = Math.max(0, E.hunger[i] - 60); } E.mood[i] = Math.min(100, E.mood[i] + 4); } else E.cool[i] = 8; E.act[i] = ACT.NONE; } break;
      case ACT.FORAGE: E.anim[i] = A.work; if (tm > 30) { const t = (E.y[i] | 0) * n + (E.x[i] | 0), f = W.feature[t]; if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) { W.fgrow[t] = 20; W.mark(t % n, (t / n) | 0); E.hunger[i] = Math.max(0, E.hunger[i] - 45); } else if (AL.gFert[W.ground[t]] > 0.2 && sim.rng.chance(0.7)) E.hunger[i] = Math.max(0, E.hunger[i] - 32); /* roots, eggs, small game */ E.act[i] = ACT.NONE; } break;
      case ACT.SLEEP: { E.anim[i] = E.tB[i] >= 0 ? A.inside : A.sleep; E.flags[i] |= F.ASLEEP; E.energy[i] = Math.min(100, E.energy[i] + (E.tB[i] >= 0 ? 0.55 : 0.35)); if (E.hp[i] < E.hpMax[i]) E.hp[i] += 0.05;
        if ((E.energy[i] >= 99 && !U.isNight(sim)) || E.hunger[i] > 78 || tm > 260) { E.flags[i] &= ~F.ASLEEP; E.act[i] = ACT.NONE; if (E.tB[i] < 0) E.mood[i] = Math.max(0, E.mood[i] - 6); } break; }
      case ACT.SOCIAL: E.anim[i] = (tm % 50) > 38 ? A.joy : A.idle; E.social[i] = Math.min(100, E.social[i] + 0.7); if (tm === 30) U.socialize(sim, i); if (tm > 70) E.act[i] = ACT.NONE; break;
      case ACT.PRAY: E.anim[i] = A.pray; E.faith[i] = Math.min(100, E.faith[i] + 0.8); if (tm > 80) { E.act[i] = ACT.NONE; if (AL.Faith) AL.Faith.onPray(sim, i, town); } break;
      case ACT.GUARD: E.anim[i] = A.idle; if (tm > 40) E.act[i] = ACT.NONE; break;
      case ACT.HAUL: { const b = E.tB[i]; if (town && b >= 0) { town.stock[E.carry[i]] += E.carryN[i]; } E.carryN[i] = 0; E.act[i] = ACT.NONE; break; }
      case ACT.BUILD: { const b = E.tB[i]; if (b < 0 || !B.alive[b] || B.state[b] !== 0) { E.act[i] = ACT.NONE; break; } E.anim[i] = A.work; U.face(E, i, B.x[b] + B.w[b] / 2, B.y[b]);
        if (tm % 10 === 0) { B.prog[b] += 2.6 * E.workMul[i] * E.mod(i, 'build') * (200 / (AL.BTYPES[B.type[b]].hp + 80)); B.dirty = true; sim.emit('hammer', E.x[i], E.y[i]); if (B.prog[b] >= 100) { T.complete(sim, b); if (town) town.sites = Math.max(0, town.sites - 1); E.act[i] = ACT.NONE; } }
        if (tm > 300) E.act[i] = ACT.NONE; break; }
      case ACT.WORK: { const job = AL.JOBS[E.job[i]], task = job.task, tgt = E.tE[i]; E.anim[i] = tgt === -4 ? A.inside : A.work; if (tgt >= 0) U.face(E, i, tgt % n + 0.5, ((tgt / n) | 0) + 0.5);
        const need = (WORKT[task] || 60) / (E.workMul[i] * (town && town.stock[R.tools] > 0 ? 1.25 : 1));
        if (task === 'chop' && tm % 17 === 5) sim.emit('chop', E.x[i], E.y[i]); else if (task === 'mine' && tm % 20 === 5) sim.emit('mine', E.x[i], E.y[i]);
        if (tm < need) break; E.act[i] = ACT.NONE; if (!town) break;
        if (task === 'chop') { if (tgt >= 0 && AL.fKind[W.feature[tgt]] === 1) { const f = AL.FLORA[W.feature[tgt]]; if (AL.KINDS[town.people].replant) { W.fgrow[tgt] = 10; sim.stats.replanted = (sim.stats.replanted || 0) + 1; } else { W.feature[tgt] = AL.F.stump; W.fgrow[tgt] = 0; } W.mark(tgt % n, (tgt / n) | 0); E.carry[i] = R.wood; E.carryN[i] = Math.round(f.wood * E.mod(i, 'chop')); sim.emit('treefall', tgt % n, (tgt / n) | 0); } }
        else if (task === 'mine') { let ore = -1; if (tgt >= 0 && AL.fKind[W.feature[tgt]] === 4) { const f = AL.FLORA[W.feature[tgt]]; if (f.ore) ore = R[f.ore]; if (W.feature[tgt] !== AL.F.peak && W.feature[tgt] !== AL.F.snowpeak) { if (W.fgrow[tgt] <= 70) { W.feature[tgt] = 0; W.mark(tgt % n, (tgt / n) | 0); } else W.fgrow[tgt] -= 64; } }
          else if (sim.rng.chance(0.3)) ore = sim.rng.chance(0.55) ? R.iron : sim.rng.chance(0.75) ? R.copper : sim.rng.chance(0.85) ? R.gold : R.aetherite;
          if (ore >= 0 && sim.rng.chance(0.6)) { E.carry[i] = ore; E.carryN[i] = 1; town.stock[R.stone] += 1; } else { E.carry[i] = R.stone; E.carryN[i] = Math.round(3 * E.mod(i, 'mine')); } }
        else if (task === 'farm') { if (tgt >= 0 && (W.flags[tgt] & 8)) { if (W.feature[tgt] !== AL.F.wheat) { W.feature[tgt] = AL.F.wheat; W.fgrow[tgt] = 0; } else if (W.fgrow[tgt] >= 250) { W.fgrow[tgt] = 0; E.carry[i] = R.food; E.carryN[i] = Math.round(6 * E.mod(i, 'farm') * (sim.cropMul || 1)); } else W.fgrow[tgt] = Math.min(250, W.fgrow[tgt] + 40); W.mark(tgt % n, (tgt / n) | 0); } }
        else if (task === 'gather' || task === 'hunt' || task === 'herd' || task === 'idle') { if (tgt >= 0 && W.fgrow[tgt] > 200) { W.fgrow[tgt] = 20; W.mark(tgt % n, (tgt / n) | 0); E.carry[i] = R.food; E.carryN[i] = 3; } else if (tgt === -2 && sim.rng.chance(0.7)) { E.carry[i] = R.food; E.carryN[i] = 2; } }
        else if (task === 'fish') { E.carry[i] = R.food; E.carryN[i] = Math.round(3 * E.mod(i, 'fish') * (AL.KINDS[E.kind[i]].fishMul || 1)); sim.emit('splash', E.x[i], E.y[i]); }
        else if (task === 'smith') { const st = town.stock; const ore = st[R.iron] >= 1 ? R.iron : st[R.copper] >= 1 ? R.copper : -1; if (ore >= 0 && st[R.wood] >= 1) { st[ore] -= 1; st[R.wood] -= 1; const k = st[R.tools] < town.pop * 0.3 ? R.tools : st[R.weapons] <= st[R.armor] ? R.weapons : R.armor; st[k] += (ore === R.iron ? 2 : 1) * (AL.KINDS[town.people].craft || 1); sim.emit('anvil', E.x[i], E.y[i]); } }
        else if (task === 'study') { town.knowledge += 1 * E.mod(i, 'learn') * (AL.Faith ? AL.Faith.m(sim, E.religion[i], 'learn') : 1); }
        else if (task === 'preach') { if (AL.Faith) AL.Faith.preach(sim, i, town); }
        else if (task === 'entertain') { town.cheer = (town.cheer || 0) + 1; }
        else if (task === 'tend') { const S = sim.stats; if (tgt >= 0 && !(W.flags[tgt] & 10)) { const f = W.feature[tgt], g = W.ground[tgt]; if (AL.fKind[f] === 1) { W.fgrow[tgt] = Math.min(255, W.fgrow[tgt] + 90); S.tended = (S.tended || 0) + 1; } else if (!f || f === AL.F.stump) { const tr = AL.floraByBiome[g].trees; if (tr.length) { W.feature[tgt] = tr[sim.rng.int(tr.length)]; W.fgrow[tgt] = 12; S.planted = (S.planted || 0) + 1; } }
            W.mark(tgt % n, (tgt / n) | 0); sim.emit('tend', tgt % n + 0.5, ((tgt / n) | 0) + 0.5); } E.carry[i] = R.food; E.carryN[i] = 4; } // fruit and nuts of the wood
        else if (task === 'engineer') { const S = sim.stats; if (tgt >= 0) { if (town.bridge && town.bridge.tiles[town.bridge.at] === tgt && T.bridgeLay(sim, town)) S.engineered = (S.engineered || 0) + 1; } else if (tgt === -5) { const b = E.tB[i]; if (b >= 0 && B.alive[b] && B.state[b] === 1 && B.hp[b] < B.hpMax[b] && town.stock[R.wood] >= 1) { town.stock[R.wood] -= 1; B.hp[b] = Math.min(B.hpMax[b], B.hp[b] + 30); B.dirty = true; S.repaired = (S.repaired || 0) + 1; sim.emit('hammer', E.x[i], E.y[i]); } } }
        else if (task === 'heal') { if (tgt === -6) { const j = E.tB[i], S = sim.stats; E.tB[i] = -1; if (j >= 0 && E.alive[j] && !(E.flags[j] & F.DEAD) && Math.abs(E.x[j] - E.x[i]) + Math.abs(E.y[j] - E.y[i]) < 6) { E.hp[j] = Math.min(E.hpMax[j], E.hp[j] + E.hpMax[j] * 0.45 * E.mod(i, 'heal'));
              if (E.flags[j] & F.SICK) { if (AL.Powers) AL.Powers.clearTemp(sim, j, ['plagued', 'poisoned']); E.flags[j] &= ~F.SICK; S.cured = (S.cured || 0) + 1; } S.healed = (S.healed || 0) + 1; E.mood[j] = Math.min(100, E.mood[j] + 8); sim.emit('care', E.x[j], E.y[j]); } } else { town.care = (town.care || 0) + 1; } }
        else if (task === 'sail') { sim.stats.sailed = (sim.stats.sailed || 0) + 1; }
        else if (task === 'delve') { const S = sim.stats, rng = sim.rng; S.delved = (S.delved || 0) + 1; if (rng.chance(0.45)) { E.carry[i] = rng.chance(0.5) ? R.iron : rng.chance(0.6) ? R.copper : rng.chance(0.75) ? R.gold : R.aetherite; E.carryN[i] = 1; town.stock[R.stone] += 2; S.delvedOre = (S.delvedOre || 0) + 1; } else { E.carry[i] = R.stone; E.carryN[i] = Math.round(4 * E.mod(i, 'mine')); } sim.emit('delve', E.x[i], E.y[i]); }
        else if (task === 'spore') { const S = sim.stats; if (tgt >= 0 && !(W.flags[tgt] & 10)) { const f = W.feature[tgt]; if (f === AL.F.mushroom) { if (W.fgrow[tgt] > 200) { W.fgrow[tgt] = 30; E.carry[i] = R.food; E.carryN[i] = Math.round(5 * E.mod(i, 'farm')); S.sporeFood = (S.sporeFood || 0) + E.carryN[i]; } else W.fgrow[tgt] = Math.min(255, W.fgrow[tgt] + 115); }
            else if (!f) { W.feature[tgt] = AL.F.mushroom; W.fgrow[tgt] = 40; S.spored = (S.spored || 0) + 1; } W.mark(tgt % n, (tgt / n) | 0); sim.emit('spore', tgt % n + 0.5, ((tgt / n) | 0) + 0.5); } }
        else if (task === 'dive') { const S = sim.stats; E.carry[i] = R.food; E.carryN[i] = Math.round(5 * E.mod(i, 'fish')); S.dived = (S.dived || 0) + 1; if (sim.rng.chance(0.12)) { town.stock[R.gold] += 1; S.pearls = (S.pearls || 0) + 1; } sim.emit('dive', E.x[i], E.y[i]); }
        break; }
      case ACT.BOARD: E.anim[i] = A.inside; break; // aboard a ship: carried by AL.Sea until the landing
      default: if (AL.UnitsExtra && AL.UnitsExtra(sim, i, a, tm)) break; E.act[i] = ACT.NONE;
    }
  };
  // meeting another villager: friendships, couples
  U.socialize = function (sim, i) { const E = sim.E, c = E.query(E.x[i], E.y[i], 3); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || E.town[j] !== E.town[i] || (E.flags[j] & (F.DEAD | F.CHILD)) || (E.flags[i] & F.CHILD)) continue;
      if (E.spouse[i] < 0 && E.spouse[j] < 0 && E.sex[i] !== E.sex[j] && E.kind[i] === E.kind[j] && E.mother[i] !== j && E.mother[j] !== i && !(E.mother[i] >= 0 && E.mother[i] === E.mother[j]) && sim.rng.chance(0.35)) { E.spouse[i] = j; E.spouse[j] = i; sim.emit('love', E.x[i], E.y[i]); E.mood[i] = Math.min(100, E.mood[i] + 15); E.mood[j] = Math.min(100, E.mood[j] + 15); }
      E.social[j] = Math.min(100, E.social[j] + 10); break; } };
  // ------------------------------------------------------------ nomads: bands without a town; they look for a place to settle
  U.thinkNomad = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, x = E.x[i] | 0, y = E.y[i] | 0, t = y * n + x;
    if (E.hunger[i] > 60) { if (U.startForage(sim, i, null)) return; if (E.hunger[i] > 60 && sim.rng.chance(0.35)) E.hunger[i] -= 25; }
    // join a nearby town of the same people
    const c = E.query(x, y, 10); let band = 0; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] !== E.kind[i] || (E.flags[j] & F.DEAD)) continue; if (E.town[j] >= 0 && sim.towns[E.town[j]].alive && !(E.flags[i] & F.SETTLER)) { U.joinTown(sim, i, sim.towns[E.town[j]]); return; } if (E.town[j] < 0) band++; }
    const age = sim.tick - (E.nomadSince ? 0 : 0);
    if (band >= 2 && !(W.owner[t]) && U.siteQuality(sim, x, y) > 0.55 && sim.rng.chance(E.flags[i] & F.SETTLER ? 0.5 : 0.12)) { let far = true; for (const tw of sim.towns) if (tw.alive && Math.abs(tw.cx - x) + Math.abs(tw.cy - y) < (tw.people === E.kind[i] ? 30 : 12)) far = false;
      if (far) { const town = T.found(sim, E.kind[i], x, y, (E.flags[i] & F.SETTLER) ? E.kingdom[i] : null, i); if (town) { const c2 = E.query(x, y, 14); for (let k = 0; k < c2; k++) { const j = E.near[k]; if (E.kind[j] === E.kind[i] && E.town[j] < 0 && !(E.flags[j] & F.DEAD)) { U.joinTown(sim, j, town); town.stock[AL.RES.food] += 5; town.stock[AL.RES.wood] += 1; } } return; } } }
    // a nomad on its own looks for another of its kind (placed bands must not drift apart for ever: a town needs two nearby)
    if (band < 2 && !(E.flags[i] & F.SETTLER) && sim.rng.chance(0.25)) { let bj = -1, bd2 = 60; for (let j = 0; j < E.hi; j++) { if (j === i || !E.alive[j] || E.kind[j] !== E.kind[i] || E.town[j] >= 0 || (E.flags[j] & F.DEAD)) continue; const d = Math.abs(E.x[j] - E.x[i]) + Math.abs(E.y[j] - E.y[i]); if (d > 6 && d < bd2) { bd2 = d; bj = j; } } if (bj >= 0 && begin(sim, i, ACT.WANDER, E.x[bj] | 0, E.y[bj] | 0)) return; }
    // wander, biased toward land the people likes; settlers keep their heading
    let r = -1; if ((E.flags[i] & F.SETTLER) && E.tx[i] >= 0 && Math.abs(E.tx[i] - x) + Math.abs(E.ty[i] - y) > 6 && E.stuck[i] < 3) { if (begin(sim, i, ACT.WANDER, E.tx[i], E.ty[i])) return; }
    r = U.randomNear(sim, E.x[i], E.y[i], 12); if (r >= 0) begin(sim, i, ACT.WANDER, r % n, (r / n) | 0); };
  U.siteQuality = function (sim, x, y) { const W = sim.world, n = W.n; let good = 0, tot = 0; for (let dy = -6; dy <= 6; dy += 2) for (let dx = -6; dx <= 6; dx += 2) { const X = x + dx, Y = y + dy; tot++; if (!W.inb(X, Y)) continue; const t = Y * n + X, g = W.ground[t]; if (AL.gCost[g] > 0 && !W.owner[t] && !(W.flags[t] & 2)) good += 0.6 + AL.gFert[g] * 0.4; } return good / tot; };
  U.joinTown = function (sim, i, town) { const E = sim.E; E.town[i] = town.id; E.kingdom[i] = town.kingdom; E.flags[i] &= ~F.SETTLER; E.job[i] = 0; E.home[i] = -1; E.work[i] = -1; if (E.culture[i] < 0) E.culture[i] = town.culture; if (E.religion[i] < 0) E.religion[i] = town.religion; T.setLook(E, i); town.pop++; };
  // ------------------------------------------------------------ life cycle
  U.lifeTick = function (sim, i) { const E = sim.E, K = AL.KINDS[E.kind[i]], age = sim.tick - E.born[i], fl = E.flags[i];
    if (age >= E.life[i]) { E.kill(sim, i, 'age'); return; }
    const mat = (K.maturity || 16) * AL.YEAR; if (age < mat) { if (!(fl & F.CHILD)) { E.flags[i] |= F.CHILD; T.setLook(E, i); } } else if (fl & F.CHILD) { E.flags[i] &= ~F.CHILD; T.setLook(E, i); sim.emit('grownup', E.x[i], E.y[i]); }
    if (age > E.life[i] * 0.78 && !(fl & F.ELDER)) { E.flags[i] |= F.ELDER; if (!AL.JOBS[E.job[i]].military) T.setLook(E, i); }
    // births
    if (E.preg[i] >= 0 && sim.tick >= E.preg[i]) { E.preg[i] = -1; E.flags[i] &= ~F.PREGNANT; const town = sim.towns[E.town[i]]; if (town && town.alive) U.birth(sim, i, E.spouse[i], town); }
    else if (E.sex[i] === 1 && E.spouse[i] >= 0 && E.preg[i] < 0 && !(fl & (F.CHILD | F.ELDER)) && E.town[i] >= 0) { const town = sim.towns[E.town[i]], sp = E.spouse[i];
      if (!E.alive[sp] || (E.flags[sp] & F.DEAD)) { E.spouse[i] = -1; } else if (town.alive && town.pop < town.popCap && town.pop - town.adults < town.adults * (1.5 + 1.5 * Math.max(0, Math.min(1, (town.stock[AL.RES.food] / town.pop - 5) / 8))) + 4 && town.stock[AL.RES.food] > town.pop * 3.5 && E.count < E.cap - 200) { const p = 0.11 * Math.min(1, town.stock[AL.RES.food] / (town.pop * 9)) * (K.fertility || 1) * E.mod(i, 'fertility') * (sim.fertMul || 1) * (AL.Faith ? AL.Faith.m(sim, E.religion[i], 'fertility') : 1) * (town.pop < 16 ? 2.2 : 1); if (sim.rng.chance(p)) { E.preg[i] = sim.tick + 300; E.flags[i] |= F.PREGNANT; } } } };
  // a being placed by the god takes the sex that is rarer among its own kind nearby (three placed orcs must not all be male and never have a child)
  U.balanceSex = function (sim, i) { const E = sim.E; let m = 0, f = 0; for (let j = 0; j < E.hi; j++) { if (j === i || !E.alive[j] || Math.abs(E.x[j] - E.x[i]) > 8 || Math.abs(E.y[j] - E.y[i]) > 8 || (E.flags[j] & 1) || E.kind[j] !== E.kind[i] || (E.flags[j] & 3)) continue; if (E.sex[j] === 0) m++; else f++; } if (m > f) E.sex[i] = 1; else if (f > m) E.sex[i] = 0; };
  U.birth = function (sim, mother, father, town) { const E = sim.E, rng = sim.rng; const c = E.spawn(sim, E.kind[mother], E.x[mother], E.y[mother], { age: 0, town: town.id, kingdom: town.kingdom, mother, father, culture: E.culture[mother], religion: E.religion[mother], traits: [0, 0], clan: father >= 0 && E.alive[father] && E.clan[father] >= 0 ? E.clan[father] : E.clan[mother] }); if (c < 0) return -1;
    // inheritance: each parental inborn trait passes with 45%; 3% mutation adds a random inborn trait
    for (let t = 0; t < 48; t++) { const m = E.hasTrait(mother, t), f = father >= 0 && E.alive[father] ? E.hasTrait(father, t) : 0; if ((m && rng.chance(0.45)) || (f && rng.chance(0.45))) E.addTrait(c, t, true); } if (rng.chance(0.03 * (sim.mutMul || 1))) E.addTrait(c, rng.int(48), true); if (rng.chance(0.004 * (sim.mutMul || 1))) E.addTrait(c, AL.TRAIT.mutant, true);
    E.recalc(c); E.hp[c] = E.hpMax[c]; E.flags[c] |= F.CHILD; E.look[c] = AL.LOOK.child; E.home[c] = E.home[mother]; town.pop++; sim.stats.births++; sim.emit('birth', E.x[c], E.y[c]); return c; };
  // ------------------------------------------------------------ module
  AL.Sim.modules.push({
    name: 'units',
    init(sim) { sim.E = new AL.Ents(); sim.path = new AL.Path(sim.world); sim.stats = { births: 0, deaths: 0, starved: 0, killed: 0 }; },
    tick(sim) { const E = sim.E, tk = sim.tick; sim.pathBudget = 50; sim.fieldBudget = 1; if (sim.path.w.regionsDirty && false) { } E.rebuildHash(sim.world.n);
      const np = AL.NPEOPLE, HT = AL.Faith ? AL.Faith.tab.hunger : null;
      for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; if (E.kind[i] >= np) continue; // creatures are ticked by their module
        if (E.flags[i] & F.DEAD) { if (--E.timer[i] <= 0) E.remove(i); continue; }
        // needs
        const asleep = E.flags[i] & F.ASLEEP; E.hunger[i] += (asleep ? 0.1 : 0.2) * (HT ? HT[E.religion[i] + 1] : 1); if (!asleep) E.energy[i] -= 0.13; E.social[i] -= 0.04; E.faith[i] -= 0.015;
        // travellers (merchants, armies, settlers far from any store) eat the rations they carry from their town's stock
        if (E.hunger[i] > 70 && ((i + tk) & 15) === 0 && E.town[i] >= 0) { const a = E.act[i], tw = sim.towns[E.town[i]]; if (tw && tw.alive && tw.stock[AL.RES.food] >= 1 && (a === ACT.TRADE || a === ACT.MARCH || a === ACT.SIEGE || a === ACT.FIGHT || (E.flags[i] & F.MOBILIZED) || Math.abs(E.x[i] - tw.cx) + Math.abs(E.y[i] - tw.cy) > 28)) { tw.stock[AL.RES.food] -= 1; E.hunger[i] -= 60; } }
        if (E.hunger[i] >= 100) { E.hunger[i] = 100; E.hp[i] -= 0.07; if (E.hp[i] <= 0) { sim.stats.starved++; E.kill(sim, i, 'hunger'); continue; } } else if (E.hp[i] < E.hpMax[i] && E.hunger[i] < 60) E.hp[i] += 0.02;
        if (E.energy[i] < 0) E.energy[i] = 0; if (E.social[i] < 0) E.social[i] = 0; if (E.faith[i] < 0) E.faith[i] = 0;
        if (((i + tk) & 63) === 0) { U.lifeTick(sim, i); if (E.flags[i] & F.DEAD) continue; }
        if (E.flags[i] & F.CONTROLLED) { if (U.moving(E, i)) U.move(sim, i); else if (E.act[i] === ACT.NONE) E.anim[i] = AL.ANIM.idle; else U.act(sim, i); continue; }
        if (AL.War && AL.War.unitTick(sim, i)) continue;
        if (E.act[i] === ACT.FIGHT) U.act(sim, i);
        else if (U.moving(E, i)) { if (U.move(sim, i)) { /* arrived: act next tick */ } else if (!U.moving(E, i) && E.act[i] !== ACT.NONE && E.phase[i] === 0) { // path lost before arriving
            if ((E.x[i] | 0) !== E.tx[i] || (E.y[i] | 0) !== E.ty[i]) { const r = U.goTo(sim, i, E.tx[i], E.ty[i]); if (r === 0) { E.act[i] = ACT.NONE; E.cool[i] = 16; } } } }
        else if (E.act[i] !== ACT.NONE) U.act(sim, i);
        if (((i + tk) & 15) === 0 && AL.KINDS[E.kind[i]].fearFire && E.act[i] !== ACT.FLEE && E.act[i] !== 255 && !(E.flags[i] & F.DEAD)) U.fearFire(sim, i);
        if (((i + tk) & 7) === 0 && E.act[i] === ACT.NONE && !(E.flags[i] & F.DEAD)) U.think(sim, i);
        else if (((i + tk) & 31) === 0 && AL.Creatures && E.act[i] !== ACT.FIGHT && E.act[i] !== ACT.FLEE && E.act[i] !== ACT.BOARD && E.act[i] !== 255 && !(E.flags[i] & F.ASLEEP && false) && AL.Creatures.near(sim, i)) { U.stop(E, i); E.flags[i] &= ~F.ASLEEP; E.act[i] = ACT.NONE; E.cool[i] = 0; U.think(sim, i); }
        else if (((i + tk) & 31) === 0 && E.hunger[i] > 80 && (E.act[i] === ACT.WANDER || E.act[i] === ACT.SOCIAL || E.act[i] === ACT.GUARD || E.act[i] === ACT.WORK && E.phase[i] === 0)) { U.stop(E, i); E.act[i] = ACT.NONE; }
      } },
    onDeath(sim, i, cause) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE) return; sim.stats.deaths++; const town = sim.towns[E.town[i]]; if (town) town.pop = Math.max(0, town.pop - 1); const h = E.home[i]; if (h >= 0 && sim.B.occ[h] > 0) sim.B.occ[h]--; const w = E.work[i]; if (w >= 0 && sim.B.workers[w] > 0) sim.B.workers[w]--; const sp = E.spouse[i]; if (sp >= 0 && E.spouse[sp] === i) E.spouse[sp] = -1; sim.emit('death', E.x[i], E.y[i], E.kind[i], cause === 'age' ? 0 : cause === 'hunger' ? 1 : 2); },
    command(sim, m) { if (m.t === 'spawn') { const W = sim.world, n = W.n, k = AL.K[m.kind]; if (k == null) return true; for (let c = 0; c < (m.count || 1); c++) { const x = m.x + (c ? sim.rng.range(-1.5, 1.5) : 0), y = m.y + (c ? sim.rng.range(-1.5, 1.5) : 0); if (!W.inb(x | 0, y | 0)) continue; const t = (y | 0) * n + (x | 0); const K = AL.KINDS[k]; if (K.cls === 0 && (AL.gCost[W.ground[t]] <= 0 || (W.flags[t] & 2))) continue; if (AL.Creatures && K.cls !== 0) { const ai = AL.Creatures.spawn(sim, k, x, y); if (ai >= 0) U.balanceSex(sim, ai); continue; } const i = sim.E.spawn(sim, k, x, y, {}); if (i >= 0) { U.balanceSex(sim, i); const tid = W.owner[t] - 1, town = sim.towns[tid]; if (town && town.alive && town.people === k) U.joinTown(sim, i, town); sim.emit('spawn', x, y, k); } } return true; } },
    snapshot(sim) { const E = sim.E, n = E.hi; if (!n) return { t: 'ents', n: 0 }; const fr = new Uint8Array(n);
      const m = { t: 'ents', n, tick: sim.tick, x: E.x.slice(0, n), y: E.y.slice(0, n), alive: E.alive.slice(0, n), kind: E.kind.slice(0, n), look: E.look.slice(0, n), anim: E.anim.slice(0, n), dir: E.dir.slice(0, n), flags: E.flags.slice(0, n), gen: E.gen.slice(0, n), kd: E.kingdom.slice(0, n), tw: E.town.slice(0, n), hp: fr, carry: E.carryN.slice(0, n), cr: E.carry.slice(0, n), bf: new Uint16Array(n) };
      for (let i = 0; i < n; i++) m.bf[i] = E.traits1[i] >>> 16;
      for (let i = 0; i < n; i++) fr[i] = E.hpMax[i] > 0 ? Math.max(0, Math.min(255, 255 * E.hp[i] / E.hpMax[i])) : 0; m._tr = [m.x.buffer, m.y.buffer, m.alive.buffer, m.kind.buffer, m.look.buffer, m.anim.buffer, m.dir.buffer, m.flags.buffer, m.gen.buffer, m.kd.buffer, m.tw.buffer, m.hp.buffer, m.carry.buffer, m.cr.buffer, m.bf.buffer]; return m; },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
