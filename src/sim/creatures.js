// AL.Creatures — animals and monsters (same entity store as people), the ecosystem (grazing, hunting, breeding, flora growth)
// and AL.Fight, the shared melee/ranged resolution used by people, animals and monsters.
(function (AL) {
  'use strict';
  const C = AL.Creatures = {}, U = AL.Units, F = AL.Ents.F, ACT = U.ACT, Fi = AL.Fight = {};
  const CA = C.ACT = { IDLE: 0, WANDER: 1, GRAZE: 30, FLEE: 31, CHASE: 32, ATTACK: 33, SLEEP: 34 };
  ACT.HUNT = 19;
  // ------------------------------------------------------------ fight
  // a hits t. cause: 'fight' | 'zombie' | 'hunt' | 'beast'
  Fi.hit = function (sim, a, t, dmg, cause) { const E = sim.E; if (!E.alive[t] || (E.flags[t] & F.DEAD)) return false; const np = AL.NPEOPLE;
    if (E.kind[t] < np) { const town = sim.towns[E.town[t]]; if (town && town.stock[AL.RES.armor] > 0 && AL.JOBS[E.job[t]].military) dmg *= 0.7; }
    // home advantage: a person hurt by another person on the land of their own kingdom takes a quarter less damage (conquest is slower than defence, the weaker side can hold)
    if (E.kind[t] < np && a >= 0 && E.kind[a] < np) { const W = sim.world, o = W.owner[(E.y[t] | 0) * W.n + (E.x[t] | 0)]; if (o && sim.towns[o - 1] && sim.towns[o - 1].kingdom === E.kingdom[t] && E.kingdom[t] >= 0) dmg *= 0.75; }
    E.hp[t] -= dmg; sim.emit('hit', E.x[t], E.y[t], t, dmg | 0); if (E.act[t] !== 255 && E.kind[t] >= np && E.act[t] !== CA.ATTACK) { E.tE[t] = a; if (AL.KINDS[E.kind[t]].courage > 0.4) { E.act[t] = CA.CHASE; U.stop(E, t); } else E.act[t] = CA.IDLE; }
    if (E.hp[t] > 0) return false;
    E.kill(sim, t, cause); sim.stats.killed++; if (a >= 0 && E.alive[a]) { E.kills[a]++; const Ka = AL.KINDS[E.kind[a]], Kt = AL.KINDS[E.kind[t]];
      if (E.kind[a] < np && Kt.cls === 1) { E.carry[a] = AL.RES.food; E.carryN[a] = Kt.meat || 2; }           // a hunter brings the meat home
      else if (Ka.cls === 1 && Ka.diet === 'pred') { E.hunger[a] = 0; E.act[a] = CA.GRAZE; E.timer[a] = 0; } }  // a predator eats on the spot
    if (cause === 'zombie' && E.kind[t] < np) C.rise.push(E.x[t], E.y[t]);
    return true; };
  C.rise = [];
  // pursuit without path search: walk straight at the target while the next tile is free. Returns false when blocked.
  U.steer = function (sim, i, tx, ty) { const E = sim.E, W = sim.world, n = W.n, dx = tx - E.x[i], dy = ty - E.y[i], d = Math.sqrt(dx * dx + dy * dy); if (d < 0.01) return true; const here = (E.y[i] | 0) * n + (E.x[i] | 0), sp = Math.min(d, E.spd[i] / (AL.gCost[W.ground[here]] || 1.5));
    let nx = E.x[i] + dx / d * sp, ny = E.y[i] + dy / d * sp, t = (ny | 0) * n + (nx | 0);
    if (t !== here && (AL.gCost[W.ground[t]] <= 0 || (W.flags[t] & 2))) { // slide along one axis
      const tx1 = (E.y[i] | 0) * n + (nx | 0), ty1 = (ny | 0) * n + (E.x[i] | 0); if (Math.abs(dx) > 0.2 && AL.gCost[W.ground[tx1]] > 0 && !(W.flags[tx1] & 2)) ny = E.y[i]; else if (Math.abs(dy) > 0.2 && AL.gCost[W.ground[ty1]] > 0 && !(W.flags[ty1] & 2)) nx = E.x[i]; else return false; }
    E.x[i] = nx; E.y[i] = ny; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); return true; };
  const dist2 = (E, a, b) => { const dx = E.x[a] - E.x[b], dy = E.y[a] - E.y[b]; return dx * dx + dy * dy; };
  C.hostileTo = function (sim, a, t) { const E = sim.E, Ka = AL.KINDS[E.kind[a]]; return Ka.cls === 2 || ((E.act[a] === CA.CHASE || E.act[a] === CA.ATTACK) && E.tE[a] === t); };
  // people: react to a nearby danger. Returns true when the unit now flees or fights.
  C.threat = function (sim, i) { const E = sim.E, n = sim.world.n, c = E.query(E.x[i], E.y[i], 6), np = AL.NPEOPLE; let h = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.flags[j] & F.DEAD) continue; if (E.kind[j] < np) { if (!(AL.War && AL.War.hostile(sim, i, j))) continue; const d = dist2(E, i, j); if (d < bd) { bd = d; h = j; } continue; } const K = AL.KINDS[E.kind[j]];
      if (!(K.cls === 2 || ((E.act[j] === CA.CHASE || E.act[j] === CA.ATTACK) && E.tE[j] >= 0 && E.kind[E.tE[j]] < np))) continue; const d = dist2(E, i, j); if (d < bd) { bd = d; h = j; } }
    if (h < 0) return false; const mil = AL.JOBS[E.job[i]].military || AL.JOBS[E.job[i]].name === 'hunter';
    if (!(E.flags[i] & (F.CHILD | F.ELDER | F.RULER)) && (mil || E.courage[i] > 0.72 || (bd < 2.5 && E.courage[i] > 0.45))) { U.stop(E, i); E.act[i] = ACT.FIGHT; E.tE[i] = h; E.phase[i] = 1; E.timer[i] = 0; return true; }
    const town = sim.towns[E.town[i]]; let tx, ty; const dx = E.x[i] - E.x[h], dy = E.y[i] - E.y[h], l = Math.sqrt(dx * dx + dy * dy) || 1;
    if (town && town.alive && Math.abs(town.cx - E.x[h]) + Math.abs(town.cy - E.y[h]) > 6) { tx = town.cx; ty = town.cy; } else { const t = U.randomNear(sim, E.x[i] + dx / l * 8, E.y[i] + dy / l * 8, 3); if (t < 0) return false; tx = t % n; ty = (t / n) | 0; }
    if (U.begin(sim, i, ACT.FLEE, tx, ty)) { E.flags[i] |= F.FLEEING; E.mood[i] = Math.max(0, E.mood[i] - 3); return true; } return false; };
  // cheap check: is something hostile within 4 tiles of this person?
  C.near = function (sim, i) { const E = sim.E, c = E.query(E.x[i], E.y[i], 4), np = AL.NPEOPLE; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.flags[j] & F.DEAD) continue; if (E.kind[j] < np) { if (AL.War && AL.War.hostile(sim, i, j)) return true; continue; } if (AL.KINDS[E.kind[j]].cls === 2 || ((E.act[j] === CA.CHASE || E.act[j] === CA.ATTACK) && E.tE[j] >= 0 && E.kind[E.tE[j]] < np)) return true; } return false; };
  // hunters and herders: find game around the town
  C.startHunt = function (sim, i, town, task) { const E = sim.E, c = E.query(E.x[i], E.y[i], 16), np = AL.NPEOPLE; let best = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] < np || (E.flags[j] & F.DEAD)) continue; const K = AL.KINDS[E.kind[j]]; if (K.cls !== 1 || K.fly || K.swim || K.diet === 'pred') continue; const d = dist2(E, i, j); if (d < bd) { bd = d; best = j; } }
    if (best < 0) return false; E.act[i] = ACT.FIGHT; E.tE[i] = best; E.phase[i] = 1; E.timer[i] = 0; return true; };
  // executors for the people actions owned by this module (called from Units.act)
  AL.UnitsExtra = function (sim, i, a, tm) { const E = sim.E, n = sim.world.n;
    if (a === ACT.FLEE) { E.flags[i] &= ~F.FLEEING; E.act[i] = ACT.NONE; E.cool[i] = 8; return true; }
    if (a === ACT.FIGHT) { const t = E.tE[i]; if (t < 0 || !E.alive[t] || (E.flags[t] & F.DEAD)) { E.act[i] = ACT.NONE; E.tE[i] = -1; return true; } const job = AL.JOBS[E.job[i]], ranged = job.ranged || job.name === 'hunter', r = ranged ? 5.5 : 1.5, d2 = dist2(E, i, t);
      if (d2 > 24 * 24 || E.hunger[i] > 92) { E.act[i] = ACT.NONE; E.tE[i] = -1; return true; }
      if (d2 > r * r) { E.anim[i] = AL.ANIM.walk; if (!U.steer(sim, i, E.x[t], E.y[t])) { if (++E.stuck[i] > 20) { E.stuck[i] = 0; E.act[i] = ACT.NONE; E.tE[i] = -1; E.cool[i] = 24; } } E.timer[i] = 0; return true; }
      U.stop(E, i); U.face(E, i, E.x[t], E.y[t]); E.anim[i] = AL.ANIM.attack; const cyc = tm % 14;
      if (cyc === 6) { const town = sim.towns[E.town[i]]; let dmg = E.atk[i] * (job.military ? 1.8 : 1) * (town && town.stock[AL.RES.weapons] > 0 ? 1.3 : 1) * (0.8 + sim.rng.f() * 0.4); if (ranged) sim.emit('arrow', E.x[i], E.y[i], E.x[t], E.y[t]); Fi.hit(sim, i, t, dmg, AL.KINDS[E.kind[t]].cls === 1 ? 'hunt' : 'fight'); }
      return true; }
    return false; };
  // ------------------------------------------------------------ spawning
  C.spawn = function (sim, kind, x, y, opt) { const W = sim.world, n = W.n, K = AL.KINDS[kind], t = (y | 0) * n + (x | 0), g = W.ground[t]; if (K.swim ? !AL.gWater[g] : (!K.fly && AL.gCost[g] <= 0)) return -1;
    const i = sim.E.spawn(sim, kind, x, y, opt || {}); if (i < 0) return -1; const E = sim.E; E.hunger[i] = 10 + sim.rng.f() * 30; E.act[i] = 0; E.anim[i] = K.fly ? AL.ANIM.fly : K.swim ? AL.ANIM.swim : 0; if (K.fly) E.flags[i] |= F.FLYING; if (K.swim) E.flags[i] |= F.SWIMMING; return i; };
  C.populate = function (sim, share) { const W = sim.world, n = W.n, rng = sim.rng, tries = Math.round(n * n / 150 * share); for (let k = 0; k < tries; k++) { const x = 3 + rng.int(n - 6), y = 3 + rng.int(n - 6), t = y * n + x, list = C.byGround[W.ground[t]]; if (!list || !list.length || W.owner[t]) continue; const kind = list[rng.int(list.length)], K = AL.KINDS[kind]; if (rng.f() > K.density) continue;
      const m = 1 + rng.int(K.herd); for (let j = 0; j < m; j++) C.spawn(sim, kind, x + rng.range(-2, 2), y + rng.range(-2, 2), null); } };
  // straight-line movement for flyers and swimmers; returns true on arrival
  function glide(sim, i, K) { const E = sim.E, W = sim.world, n = W.n, dx = E.tx[i] + 0.5 - E.x[i], dy = E.ty[i] + 0.5 - E.y[i], d = Math.sqrt(dx * dx + dy * dy), sp = E.spd[i]; if (d <= sp) { E.x[i] = E.tx[i] + 0.5; E.y[i] = E.ty[i] + 0.5; return true; }
    const nx = E.x[i] + dx / d * sp, ny = E.y[i] + dy / d * sp; if (K.swim && !AL.gWater[W.ground[(ny | 0) * n + (nx | 0)]]) return true; E.x[i] = nx; E.y[i] = ny; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); return false; }
  function go(sim, i, K, tx, ty, act) { const E = sim.E, W = sim.world; if (!W.inb(tx, ty)) return false; if (K.fly || K.swim) { if (K.swim && !AL.gWater[W.ground[ty * W.n + tx]]) return false; E.tx[i] = tx; E.ty[i] = ty; E.act[i] = act; E.phase[i] = 0; E.timer[i] = 0; return true; }
    const r = U.goTo(sim, i, tx, ty); if (r <= 0) { E.cool[i] = 16; return false; } E.act[i] = act; E.phase[i] = r === 1 ? 1 : 0; E.timer[i] = 0; return true; }
  function wander(sim, i, K, r) { const E = sim.E, W = sim.world, n = W.n, rng = sim.rng; if (K.fly || K.swim) { for (let k = 0; k < 6; k++) { const X = (E.x[i] + rng.range(-r, r)) | 0, Y = (E.y[i] + rng.range(-r, r)) | 0; if (W.inb(X, Y) && go(sim, i, K, X, Y, CA.WANDER)) return true; } return false; }
    // herd animals drift toward one of their kind
    let cx = E.x[i], cy = E.y[i]; if (K.herd > 1 && rng.chance(0.5)) { const c = E.query(cx, cy, 9); for (let k = 0; k < c; k++) { const j = E.near[(k + (rng.int(c))) % c]; if (j !== i && E.kind[j] === E.kind[i]) { cx = (cx + E.x[j]) / 2; cy = (cy + E.y[j]) / 2; break; } } }
    const t = U.randomNear(sim, cx, cy, r); return t >= 0 && go(sim, i, K, t % n, (t / n) | 0, CA.WANDER); }
  // ------------------------------------------------------------ thinking
  C.think = function (sim, i, K) { const E = sim.E, W = sim.world, n = W.n, rng = sim.rng, np = AL.NPEOPLE, x = E.x[i], y = E.y[i]; if (E.cool[i] > 0) { E.cool[i] = E.cool[i] > 16 ? E.cool[i] - 16 : 0; return; }
    const hostile = K.cls === 2, pred = K.diet === 'pred';
    if (hostile || (pred && E.hunger[i] > 45)) { // look for a victim
      const c = E.query(x, y, hostile ? 13 : 11); let best = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || (E.flags[j] & F.DEAD)) continue; const Kj = AL.KINDS[E.kind[j]]; let ok;
        if (hostile) ok = Kj.cls === 0 || (Kj.cls === 1 && K.fire); else ok = (Kj.cls === 1 && Kj.diet !== 'pred' && (K.fly ? Kj.size <= 16 : !Kj.fly && !Kj.swim || (K.fly && Kj.swim))) || (Kj.cls === 0 && E.hunger[i] > 92 && !K.fly);
        if (!ok) continue; const d = dist2(E, i, j) * (Kj.cls === 0 && !hostile ? 3 : 1); if (d < bd) { bd = d; best = j; } }
      if (best >= 0) { E.tE[i] = best; E.act[i] = CA.CHASE; E.timer[i] = 0; U.stop(E, i); return; } }
    if (K.cls === 1 && !pred) { // prey: run from hunters and predators
      const c = E.query(x, y, 5); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || (E.flags[j] & F.DEAD)) continue; const Kj = AL.KINDS[E.kind[j]]; if (!(Kj.cls === 2 || Kj.diet === 'pred' && !Kj.fly || (Kj.cls === 0 && (E.act[j] === ACT.FIGHT) && E.tE[j] >= 0 && E.kind[E.tE[j]] >= np))) continue;
        if (K.courage > 0.5 && Kj.cls !== 2 && rng.chance(0.5)) { E.tE[i] = j; E.act[i] = CA.CHASE; E.timer[i] = 0; return; }
        const dx = x - E.x[j], dy = y - E.y[j], l = Math.sqrt(dx * dx + dy * dy) || 1; let t = -1; if (K.swim) { if (go(sim, i, K, (x + dx / l * 6) | 0, (y + dy / l * 6) | 0, CA.FLEE)) return; } else t = U.randomNear(sim, x + dx / l * 9, y + dy / l * 9, 3); if (t >= 0 && go(sim, i, K, t % n, (t / n) | 0, CA.FLEE)) { E.spd[i] = 0.22 * K.speed * 1.5; return; } break; }
      if (E.hunger[i] > 35) { const t = (y | 0) * n + (x | 0), g = W.ground[t]; if (K.swim || AL.gFert[g] > 0.25 || W.feature[t]) { E.act[i] = CA.GRAZE; E.timer[i] = 0; return; } } }
    if (U.isNight(sim) && !K.swim && !hostile && rng.chance(0.6)) { E.act[i] = CA.SLEEP; E.timer[i] = 0; return; }
    if (rng.chance(0.55)) wander(sim, i, K, hostile ? 14 : K.fly ? 16 : 7); else { E.act[i] = CA.IDLE; E.cool[i] = 16 + rng.int(40); } };
  // ------------------------------------------------------------ acting
  C.act = function (sim, i, K) { const E = sim.E, W = sim.world, n = W.n, A = AL.ANIM, a = E.act[i], tm = ++E.timer[i], rest = K.fly ? A.fly : K.swim ? A.swim : A.idle;
    if (a === CA.IDLE) { E.anim[i] = rest; return; }
    if (a === CA.WANDER || a === CA.FLEE) { E.act[i] = CA.IDLE; E.spd[i] = 0.22 * K.speed; E.anim[i] = rest; return; }
    if (a === CA.GRAZE) { E.anim[i] = K.swim ? A.swim : K.fly ? A.idle : A.eat; if (tm > 36) { E.hunger[i] = Math.max(0, E.hunger[i] - 45); E.act[i] = CA.IDLE; const t = (E.y[i] | 0) * n + (E.x[i] | 0); if (W.feature[t] === AL.F.grasstuft && sim.rng.chance(0.3)) { W.feature[t] = 0; W.mark(t % n, (t / n) | 0); } } return; }
    if (a === CA.SLEEP) { E.anim[i] = K.fly ? A.idle : A.sleep; if (tm > 200 || !U.isNight(sim)) E.act[i] = CA.IDLE; return; }
    if (a === CA.CHASE || a === CA.ATTACK) { const t = E.tE[i]; if (t < 0 || !E.alive[t] || (E.flags[t] & F.DEAD)) { E.act[i] = CA.IDLE; E.tE[i] = -1; E.spd[i] = 0.22 * K.speed; return; } const d2 = dist2(E, i, t);
      if (a === CA.CHASE) { if (d2 > 20 * 20 || tm > 400) { E.act[i] = CA.IDLE; E.tE[i] = -1; E.cool[i] = 32; E.spd[i] = 0.22 * K.speed; return; }
        if (d2 <= 1.7 * 1.7) { U.stop(E, i); E.act[i] = CA.ATTACK; E.timer[i] = 0; return; } E.spd[i] = 0.22 * K.speed * (K.cls === 1 ? 1.6 : 1); E.anim[i] = K.fly ? A.fly : K.cls === 1 ? A.run : A.walk;
        if (K.fly) { E.tx[i] = E.x[t] | 0; E.ty[i] = E.y[t] | 0; glide(sim, i, K); } else if (!U.steer(sim, i, E.x[t], E.y[t])) { if (++E.stuck[i] > 25) { E.stuck[i] = 0; E.act[i] = CA.IDLE; E.tE[i] = -1; E.cool[i] = 64; } } return; }
      // attack: frames 0-1 are the warning gesture, the blow lands at tick 7
      U.face(E, i, E.x[t], E.y[t]); E.anim[i] = A.attack; if (tm === 7 && d2 <= 2.4 * 2.4) Fi.hit(sim, i, t, E.atk[i] * (0.8 + sim.rng.f() * 0.4), K.contagion ? 'zombie' : K.cls === 2 ? 'fight' : 'beast'); if (tm >= 14) { if (E.act[i] === CA.ATTACK) { E.act[i] = CA.CHASE; E.timer[i] = 0; } } return; }
    E.act[i] = CA.IDLE; };
  C.life = function (sim, i, K) { const E = sim.E, age = sim.tick - E.born[i], rng = sim.rng; if (age >= E.life[i]) { E.kill(sim, i, 'age'); return; } if (K.cls !== 1) return;
    // rare species find each other (wider mate search) and recover faster: without this, wolves, eagles and rabbits sat at the migration floor for centuries
    const kn = sim.kindLast[E.kind[i]], kcap = sim.kindCap[E.kind[i]], rare = kn < Math.max(14, kcap * 0.15), boost = rare ? 2 : 1;
    if (E.sex[i] === 1 && E.hunger[i] < (K.diet === 'pred' ? 85 : 55) && age > E.life[i] * 0.15 && sim.nAnimals < sim.animalCap && rng.chance(0.05 * K.fertility * boost) && kn < kcap) { const c = E.query(E.x[i], E.y[i], rare ? 45 : K.herd <= 1 ? 30 : 12); let same = 0, male = false; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] === E.kind[i] && !(E.flags[j] & F.DEAD)) { same++; if (E.sex[j] === 0) male = true; } }
      if (male && same < K.herd * 2 + 3) { const b = C.spawn(sim, E.kind[i], E.x[i], E.y[i], { age: 0 }); if (b >= 0) sim.emit('cub', E.x[i], E.y[i]); } } };
  // ------------------------------------------------------------ module
  AL.Sim.modules.push({
    name: 'creatures',
    // each species gets one share of the global animal cap: a fast breeder (salmon) can no longer fill it alone
    init(sim) { C.byGround = AL.GROUND.map(g => AL.KINDS.filter(K => K.cls === 1 && K.biomes && K.biomes.includes(g.name)).map(K => K.kid)); sim.rise = C.rise = []; sim.nAnimals = 0; sim.kindCount = new Uint16Array(AL.KINDS.length); sim.kindLast = new Uint16Array(AL.KINDS.length); sim.animalCap = Math.round(sim.world.n * sim.world.n / 70); { sim.kindCap = new Uint16Array(AL.KINDS.length); const W = sim.world, N = W.n * W.n, area = new Float64Array(AL.GROUND.length); for (let t = 0; t < N; t++) area[W.ground[t]]++; const wt = new Float64Array(AL.KINDS.length); let sw = 0; AL.GROUND.forEach((g, gi) => { for (const kd of C.byGround[gi]) wt[kd] += area[gi] * (AL.KINDS[kd].density || 0.3); }); for (const K of AL.KINDS) if (K && K.cls === 1) sw += wt[K.kid]; for (const K of AL.KINDS) if (K && K.cls === 1) sim.kindCap[K.kid] = Math.max(8, Math.round(sim.animalCap * wt[K.kid] / Math.max(1, sw) * 1.25)); } C.rise.length = 0; if (!sim.cfg.noFauna && !sim.cfg.empty) { C.populate(sim, 1); const E = sim.E, c0 = new Uint16Array(AL.KINDS.length); for (let i = 0; i < E.hi; i++) if (E.alive[i]) c0[E.kind[i]]++; for (const K of AL.KINDS) if (K && K.cls === 1) sim.kindCap[K.kid] = Math.max(sim.kindCap[K.kid], Math.round(c0[K.kid] * 1.25)); } }, // the cap never starts below what the world was populated with
    tick(sim) { const E = sim.E, tk = sim.tick, np = AL.NPEOPLE, kc = sim.kindCount; let na = 0; kc.fill(0);
      for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.kind[i] < np) continue; if (E.flags[i] & F.DEAD) { if (--E.timer[i] <= 0) E.remove(i); continue; } const K = AL.KINDS[E.kind[i]]; if (K.cls === 1) { na++; kc[E.kind[i]]++; }
        E.hunger[i] += K.cls === 2 ? 0 : K.diet === 'pred' ? 0.016 : 0.06; if (K.diet === 'pred' && E.hunger[i] > 92 && ((i + tk) & 255) === 0 && sim.rng.chance(0.5)) E.hunger[i] -= 35; // mice, carrion
        if (E.hunger[i] >= 100) { E.hunger[i] = 100; E.hp[i] -= 0.1; if (E.hp[i] <= 0) { E.kill(sim, i, 'hunger'); continue; } } else if (E.hp[i] < E.hpMax[i]) E.hp[i] += 0.01;
        if (((i + tk) & 127) === 0) { C.life(sim, i, K); if (E.flags[i] & F.DEAD) continue; }
        if (E.flags[i] & F.CONTROLLED) { if (U.moving(E, i)) U.move(sim, i); else if (E.act[i] === CA.ATTACK) C.act(sim, i, K);
          // flyers and swimmers have no path: they glide straight to the ordered point
          else if ((K.fly || K.swim) && E.act[i] === CA.WANDER && E.phase[i] === 0) { E.anim[i] = K.fly ? AL.ANIM.fly : AL.ANIM.swim; E.spd[i] = 0.3 * K.speed; if (glide(sim, i, K)) { E.phase[i] = 1; E.act[i] = CA.IDLE; } } else E.anim[i] = AL.ANIM.idle; continue; }
        const a = E.act[i];
        if (a === CA.CHASE || a === CA.ATTACK) C.act(sim, i, K);
        else if ((K.fly || K.swim) && (a === CA.WANDER || a === CA.FLEE) && E.phase[i] === 0) { E.anim[i] = K.fly ? AL.ANIM.fly : AL.ANIM.swim; if (glide(sim, i, K)) E.phase[i] = 1; }
        else if (U.moving(E, i)) { U.move(sim, i); if (a === CA.FLEE) E.anim[i] = AL.ANIM.run; }
        else if (a !== CA.IDLE) C.act(sim, i, K); else E.anim[i] = K.fly ? AL.ANIM.fly : K.swim ? AL.ANIM.swim : AL.ANIM.idle;
        if (((i + tk) & 15) === 0 && (E.act[i] === CA.IDLE || (E.act[i] === CA.WANDER && K.cls !== 1) || E.act[i] === CA.GRAZE && K.cls === 1 && K.diet !== 'pred' && false)) C.think(sim, i, K);
        else if (((i + tk) & 31) === 0 && K.cls === 1 && K.diet !== 'pred' && (E.act[i] === CA.WANDER || E.act[i] === CA.GRAZE || E.act[i] === CA.SLEEP)) { const c = E.query(E.x[i], E.y[i], 4); for (let k = 0; k < c; k++) { const j = E.near[k], Kj = AL.KINDS[E.kind[j]]; if (j !== i && (Kj.cls === 2 || (Kj.diet === 'pred' && !Kj.fly) || (Kj.cls === 0 && E.act[j] === ACT.FIGHT && E.tE[j] === i))) { U.stop(E, i); E.act[i] = CA.IDLE; E.cool[i] = 0; C.think(sim, i, K); break; } } } }
      sim.nAnimals = na; sim.kindLast.set(kc); // kindCount is only complete at the end of the loop: breeding looks at this full count
      // the dead bitten by zombies rise again
      if (C.rise.length) { const zk = AL.K.zombie; for (let k = 0; k < C.rise.length; k += 2) if (zk != null && sim.kindLast[zk] < 48 && sim.rng.chance(0.45)) { const z = C.spawn(sim, zk, C.rise[k], C.rise[k + 1], { age: 0.2 }); if (z >= 0) sim.emit('rise', C.rise[k], C.rise[k + 1]); } C.rise.length = 0; }
      // migration: a species that has almost vanished comes back as a small band from the edge of the map
      if (tk % 1500 === 750 && !sim.cfg.noFauna && !sim.cfg.empty) { const W = sim.world, n = W.n, rng = sim.rng; for (let kd = np; kd < AL.KINDS.length; kd++) { const K = AL.KINDS[kd]; if (K.cls !== 1 || kc[kd] >= 4) continue; for (let t = 0; t < 60; t++) { const e = rng.int(4), q = 3 + rng.int(n - 6), d = 3 + rng.int(Math.max(4, n >> 3)), x = e === 0 ? d : e === 1 ? n - 1 - d : q, y = e === 2 ? d : e === 3 ? n - 1 - d : q, list = C.byGround[W.ground[y * n + x]]; if (!list || !list.includes(kd)) continue; let a0 = -1; for (let j = 0; j < 2 + rng.int(K.herd + 1); j++) { const b = C.spawn(sim, kd, x + rng.range(-1.5, 1.5), y + rng.range(-1.5, 1.5), null); if (b >= 0) { if (a0 < 0) a0 = b; else E.sex[b] = 1 - E.sex[a0]; } } if (a0 >= 0) sim.emit('migration', x, y, kd); break; } } }
      // wildlife wanders in from the wild when the world gets empty
      if (tk % 900 === 0 && na < sim.animalCap * 0.25 && !sim.cfg.noFauna && !sim.cfg.empty) C.populate(sim, 0.12); },
    // flora: saplings grow, forests spread and come back from stumps, meadows regrow
    // seedlings only take root where the canopy is not already dense (about 45% of a 5x5 window in a forest): woods stay open
    tile(sim, i, x, y, g) { const W = sim.world, f = W.feature[i], rng = sim.rng; if (W.fire[i]) return;
      if (!f) { if (AL.gFert[g] > 0.3 && !(W.flags[i] & 10) && rng.chance(0.00025)) { const fb = AL.floraByBiome[g]; if (fb.small.length) { W.feature[i] = fb.small[rng.int(fb.small.length)]; W.fgrow[i] = 255; W.mark(x, y); } } return; }
      const k = AL.fKind[f]; if (k === 1) { const v = W.fgrow[i]; if (v < 255) { const nv = Math.min(255, v + 2 + ((AL.FLORA[f].grow * 4 * (sim.growMul || 1)) | 0)); W.fgrow[i] = nv; if ((v < 70 && nv >= 70) || (v < 110 && nv >= 110)) W.mark(x, y); }
        else if (rng.chance(0.003)) { const n = W.n, X = x + rng.int(5) - 2, Y = y + rng.int(5) - 2; if (W.inb(X, Y)) { const j = Y * n + X, gj = W.ground[j]; if (!W.feature[j] && !(W.flags[j] & 10) && AL.gFert[gj] > 0.3 && AL.floraByBiome[gj].trees.includes(f) && W.road[j] < 60) { let near = 0; for (let d = 0; d < 4; d++) { const q = j + (d === 0 ? 1 : d === 1 ? -1 : d === 2 ? n : -n); if (q >= 0 && q < n * n && AL.fKind[W.feature[q]] === 1) near++; } if (near < 3) { let d25 = 0; for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) { const qx = X + xx, qy = Y + yy; if (qx >= 0 && qy >= 0 && qx < n && qy < n && AL.fKind[W.feature[qy * n + qx]] === 1) d25++; } if (d25 <= (gj === AL.G.jungle ? 11 : gj === AL.G.forest ? 9 : 5)) { W.feature[j] = f; W.fgrow[j] = 8; W.mark(X, Y); } } } } } }
      else if (f === AL.F.stump && rng.chance(0.03)) { const fb = AL.floraByBiome[g]; if (fb.trees.length && rng.chance(0.55) && !(W.flags[i] & 10) && W.road[i] < 60) { W.feature[i] = fb.trees[rng.int(fb.trees.length)]; W.fgrow[i] = 8; } else W.feature[i] = 0; W.mark(x, y); } },
    query(sim, m) { if (m.q === 'census') { const E = sim.E, c = {}; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & F.DEAD)) { const k = AL.KINDS[E.kind[i]].name; c[k] = (c[k] || 0) + 1; } return c; } },
    afterLoad(sim) { C.rise = sim.rise || (sim.rise = []); },
    onDeath(sim, i, cause) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE) sim.emit('death', E.x[i], E.y[i], E.kind[i], 2); },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
