// AL.Herds — livestock and migrations (chantier B.9).
// Livestock: a town with a pen sends its herders to tame the wild sheep, cows, goats, horses, camels and yaks of its land.
// A tamed animal belongs to the town (E.herdOf): it grazes near the pen, comes back to it at night and in winter, and is
// tended in turn — milk, wool and cheese come home as food without killing it; old animals and the surplus are culled
// for their meat; the young of a tamed mother are born tamed while the pen has room.
// Migrations: when autumn comes the wild herds and flocks that migrate (animals.json "migrates") leave for warmer land,
// and go back to cooler land in spring, each herd as one band toward one place.
(function (AL) {
  const C = AL.Creatures, U = AL.Units, T = AL.Towns, R = AL.Realm, F = AL.Ents.F, ACT = U.ACT, CA = C.ACT, H = AL.Herds = { TAME: -8, TEND: -9, CULL: -10, PER_PEN: 6 };
  const YIELD = { sheep: 3, cow: 5, goat: 3, yak: 4, camel: 3, horse: 2 };
  const st = (sim, k, n) => { sim.stats[k] = (sim.stats[k] || 0) + (n == null ? 1 : n); };
  H.penOf = function (sim, town) { const B = sim.B, bt = AL.BT.pen; let b = town.penB; if (b != null && b >= 0 && B.alive[b] && B.type[b] === bt && B.town[b] === town.id && B.state[b] === 1) return b;
    town.penB = -1; town.pens = 0; for (const q of town.blds) if (B.alive[q] && B.type[q] === bt && B.state[q] === 1) { if (town.penB < 0) town.penB = q; town.pens++; } return town.penB; };
  H.cap = (sim, town) => (town.pens || 1) * (H.PER_PEN + town.stage);
  // ---- the herder's work: tame, tend or cull. Returns true when a walk has started.
  H.work = function (sim, i, town) { const E = sim.E, B = sim.B, np = AL.NPEOPLE, pb = H.penOf(sim, town); if (pb < 0) return false; const px = T.doorX(B, pb), py = T.doorY(B, pb);
    let n = 0, least = -1, lt = 1e18, old = -1; for (let j = 0; j < E.hi; j++) { if (!E.alive[j] || E.herdOf[j] !== town.id || E.kind[j] < np || (E.flags[j] & F.DEAD)) continue; n++; if (E.tendT[j] < lt) { lt = E.tendT[j]; least = j; } if (sim.tick - E.born[j] > E.life[j] * 0.8) old = j; }
    town.livestock = n; const cap = H.cap(sim, town); let tgt = -1, mode = 0;
    if (old >= 0 || n > cap) { tgt = old >= 0 ? old : least; mode = H.CULL; }
    else if (n < cap) { const c = E.query(px, py, 26); let bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] < np || (E.flags[j] & F.DEAD) || E.herdOf[j] >= 0) continue; const K = AL.KINDS[E.kind[j]]; if (!K.livestock || sim.tick - E.born[j] > E.life[j] * 0.7) continue; const d = Math.abs(E.x[j] - px) + Math.abs(E.y[j] - py); if (d < bd) { bd = d; tgt = j; } } if (tgt >= 0) mode = H.TAME; }
    if (tgt < 0 && least >= 0 && sim.tick - lt > 240) { tgt = least; mode = H.TEND; }
    if (tgt < 0) return false; if (!U.begin(sim, i, ACT.WORK, E.x[tgt] | 0, E.y[tgt] | 0)) return false; E.tE[i] = mode; E.tB[i] = tgt;
    // the animal waits for the herder
    if (mode !== H.TAME || sim.rng.chance(0.7)) { U.stop(E, tgt); E.act[tgt] = CA.IDLE; E.cool[tgt] = 120; } return true; };
  // ---- the herder has arrived
  H.done = function (sim, i, town, tgt) { if (tgt !== H.TAME && tgt !== H.TEND && tgt !== H.CULL) return false; const E = sim.E, j = E.tB[i]; E.tB[i] = -1; E.tE[i] = -1;
    if (j < 0 || !E.alive[j] || (E.flags[j] & F.DEAD) || E.kind[j] < AL.NPEOPLE || Math.abs(E.x[j] - E.x[i]) + Math.abs(E.y[j] - E.y[i]) > 6) { st(sim, 'stockMissed'); return true; } const K = AL.KINDS[E.kind[j]];
    if (tgt === H.TAME) { if (E.herdOf[j] >= 0) return true; E.herdOf[j] = town.id; E.tendT[j] = sim.tick; E.mig[j] = -1; st(sim, 'stockTamed'); st(sim, 'tamed_' + K.name); sim.emit('tame', E.x[j], E.y[j]); town.livestock = (town.livestock || 0) + 1;
      if (!town.herdLog) { town.herdLog = 1; R.log(sim, 'herd', ['log.herd', town.name, '~kind.' + K.name], town.cx, town.cy, town.kingdom); } }
    else if (E.herdOf[j] !== town.id) return true;
    else if (tgt === H.TEND) { const y = YIELD[K.name] || 2; E.tendT[j] = sim.tick; E.carry[i] = AL.RES.food; E.carryN[i] = y; st(sim, 'stockTended'); st(sim, 'stockFood', y); sim.emit('milk', E.x[j], E.y[j]); }
    else { E.herdOf[j] = -1; AL.Fight.hit(sim, i, j, 9999, 'cull'); if (!E.carryN[i]) { E.carry[i] = AL.RES.food; E.carryN[i] = K.meat || 2; } st(sim, 'stockCulled'); town.livestock = Math.max(0, (town.livestock || 1) - 1); }
    return true; };
  // the young of a tamed mother
  H.born = function (sim, mother, baby) { const E = sim.E, t = sim.towns[E.herdOf[mother]]; if (!t || !t.alive) return; if ((t.livestock || 0) < H.cap(sim, t) + 2) { E.herdOf[baby] = t.id; E.tendT[baby] = sim.tick; t.livestock = (t.livestock || 0) + 1; st(sim, 'stockBorn'); } };
  // ---- how a tamed animal and a migrating animal think (before the common animal thinking)
  { const old = C.think; C.think = function (sim, i, K) { const E = sim.E; if (K.cls !== 1 || E.cool[i] > 0) return old(sim, i, K); const W = sim.world, n = W.n, h = E.herdOf[i];
      if (h >= 0) { const t = sim.towns[h], pb = t && t.alive ? H.penOf(sim, t) : -1; if (pb < 0) { E.herdOf[i] = -1; st(sim, 'stockLost'); }
        else { const px = T.doorX(sim.B, pb), py = T.doorY(sim.B, pb), d = Math.abs(E.x[i] - px) + Math.abs(E.y[i] - py), home = U.isNight(sim) || sim.season === 3, lim = home ? 4 : 9;
          if (d > lim) { const q = U.randomNear(sim, px, py, home ? 2 : 4); if (q >= 0 && C.go(sim, i, K, q % n, (q / n) | 0, CA.WANDER)) { if (home) st(sim, 'stockHome'); return; } }
          else if (home && sim.rng.chance(0.7)) { E.act[i] = U.isNight(sim) ? CA.SLEEP : CA.IDLE; E.timer[i] = 0; E.cool[i] = 24; return; } } }
      else if (E.mig[i] >= 0) { const tx = E.mig[i] % n, ty = (E.mig[i] / n) | 0, dx = tx - E.x[i], dy = ty - E.y[i], d = Math.sqrt(dx * dx + dy * dy);
        if (d < 7) { E.mig[i] = -1; st(sim, 'migArrived'); } else if (sim.tick - E.tendT[i] > 700 || E.stuck[i] > 8) { E.mig[i] = -1; E.stuck[i] = 0; st(sim, 'migGivenUp'); }
        else if (E.hunger[i] < 75 && sim.rng.chance(0.75)) { if (K.fly) { if (C.go(sim, i, K, tx, ty, CA.WANDER)) return; } else { const s = Math.min(d, 12), q = U.randomNear(sim, E.x[i] + dx / d * s, E.y[i] + dy / d * s, 3); if (q >= 0 && C.go(sim, i, K, q % n, (q / n) | 0, CA.WANDER)) { E.stuck[i] = 0; return; } } E.stuck[i]++; } }
      return old(sim, i, K); }; }
  // hunters leave the town herds alone
  { const old = C.startHunt; C.startHunt = function (sim, i, town, task) { const r = old(sim, i, town, task); const E = sim.E; if (r && E.tE[i] >= 0 && E.herdOf[E.tE[i]] >= 0) { E.act[i] = ACT.NONE; E.tE[i] = -1; return false; } return r; }; }
  // ---- migrations: at the turn of autumn (toward warmth) and of spring (back to the cool)
  H.migrate = function (sim, s) { const E = sim.E, W = sim.world, n = W.n, np = AL.NPEOPLE, rng = sim.rng, memo = new Map(); let herds = 0, cnt = 0;
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.kind[i] < np || (E.flags[i] & F.DEAD) || E.herdOf[i] >= 0) continue; const K = AL.KINDS[E.kind[i]]; if (!K.migrates) continue;
      const key = E.kind[i] * 65536 + ((E.y[i] / 14) | 0) * 256 + ((E.x[i] / 14) | 0); let t = memo.get(key);
      if (t === undefined) { t = -1; const here = (E.y[i] | 0) * n + (E.x[i] | 0), reg = W.region[here]; let bs = s === 2 ? W.temp[here] + 10 : W.temp[here] - 10;
        for (let k = 0; k < 30; k++) { const a = rng.f() * 6.283, r = 26 + rng.f() * 44, X = (E.x[i] + Math.cos(a) * r) | 0, Y = (E.y[i] + Math.sin(a) * r) | 0; if (X < 4 || Y < 4 || X > n - 5 || Y > n - 5) continue; const j = Y * n + X, g = W.ground[j]; if (AL.gWater[g] || g === AL.G.lava || (!K.fly && W.region[j] !== reg)) continue;
          const tv = W.temp[j]; if (s === 2 ? tv > bs : tv < bs) { bs = tv; t = j; } }
        memo.set(key, t); if (t >= 0) { herds++; sim.emit('migrate', E.x[i], E.y[i], s); } }
      if (t >= 0) { E.mig[i] = t; E.tendT[i] = sim.tick; E.stuck[i] = 0; cnt++; st(sim, 'mig_' + K.name); } }
    if (herds) { st(sim, 'migrations', herds); st(sim, 'migrants', cnt); st(sim, s === 2 ? 'migAutumn' : 'migSpring', herds); } };
  { const Se = AL.Seasons; if (Se) { const old = Se.turn; Se.turn = function (sim, s) { old(sim, s); if ((s === 2 || s === 0) && !sim.cfg.noFauna) H.migrate(sim, s); }; } }
  AL.Sim.modules.push({ name: 'herds',
    tick(sim) { if (sim.tick % 600 === 300 && sim.towns) for (const t of sim.towns) if (t.alive && t.penB != null) { H.penOf(sim, t); } } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
