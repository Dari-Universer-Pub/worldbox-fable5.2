// AL.Bonds — ties between individuals (chantier B.7): a best friend, a rival, a love. Two villagers who meet (the SOCIAL
// action) may become friends or rivals according to their chemistry (shared traits, job, clan, faith, culture and a fixed
// draw for the pair); love now comes before marriage: two single people fall in love, and wed a day later. Someone who
// falls for a person already loved becomes the rival of the one who is loved back. Friends cheer each other up, rivals
// quarrel, and the death of a friend or a love is mourned.
(function (AL) {
  const U = AL.Units, F = AL.Ents.F, B = AL.Bonds = { WED_AFTER: 300 };
  const st = (sim, k) => { sim.stats[k] = (sim.stats[k] || 0) + 1; };
  const pop = v => { v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; };
  const ok = (E, j) => j >= 0 && E.alive[j] && !(E.flags[j] & F.DEAD) && E.kind[j] < AL.NPEOPLE;
  // chemistry of a pair, the same whoever asks: about -1 (cannot stand each other) to +1 (kindred)
  B.affinity = function (sim, i, j) { const E = sim.E, a = E.seed[i] & 0xffff, b = E.seed[j] & 0xffff; let v = (AL.hash2(Math.min(a, b), Math.max(a, b), 77) - 0.5) * 1.5;
    v += pop(E.traits0[i] & E.traits0[j]) * 0.1 - pop(E.traits0[i] ^ E.traits0[j]) * 0.03; if (E.job[i] === E.job[j]) v += 0.12; if (E.clan[i] >= 0 && E.clan[i] === E.clan[j]) v += 0.15;
    if (E.religion[i] >= 0 && E.religion[j] >= 0 && E.religion[i] !== E.religion[j]) v -= 0.3; if (E.culture[i] >= 0 && E.culture[j] >= 0 && E.culture[i] !== E.culture[j]) v -= 0.12; return v; };
  B.wed = function (sim, i, j) { const E = sim.E; E.spouse[i] = j; E.spouse[j] = i; E.lover[i] = j; E.lover[j] = i; sim.emit('love', E.x[i], E.y[i]); sim.emit('love', E.x[j], E.y[j]); E.mood[i] = Math.min(100, E.mood[i] + 15); E.mood[j] = Math.min(100, E.mood[j] + 15); st(sim, 'weddings'); };
  U.socialize = function (sim, i) { const E = sim.E; if (E.flags[i] & F.CHILD) return;
    // the one I love: we wed a day after falling in love; a love that went to another fades with time
    const l = E.lover[i]; if (l >= 0 && E.spouse[i] < 0) { if (!ok(E, l)) E.lover[i] = -1; else if (E.lover[l] === i && E.spouse[l] < 0) { if (sim.tick - E.bondT[i] >= B.WED_AFTER && E.town[l] === E.town[i]) B.wed(sim, i, l); } else if (sim.rng.chance(0.15)) { E.lover[i] = -1; E.mood[i] = Math.max(0, E.mood[i] - 8); st(sim, 'lovesLost'); } }
    const c = E.query(E.x[i], E.y[i], 3); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || E.town[j] !== E.town[i] || (E.flags[j] & (F.DEAD | F.CHILD)) || E.kind[j] >= AL.NPEOPLE) continue;
      // love
      if (E.spouse[i] < 0 && E.spouse[j] < 0 && E.sex[i] !== E.sex[j] && E.kind[i] === E.kind[j] && E.mother[i] !== j && E.mother[j] !== i && !(E.mother[i] >= 0 && E.mother[i] === E.mother[j])) {
        if (E.lover[i] < 0 && E.lover[j] < 0) { if (sim.rng.chance(0.35)) { E.lover[i] = j; E.lover[j] = i; E.bondT[i] = E.bondT[j] = sim.tick; sim.emit('love', E.x[i], E.y[i]); E.mood[i] = Math.min(100, E.mood[i] + 10); E.mood[j] = Math.min(100, E.mood[j] + 10); st(sim, 'loves'); } }
        else if (E.lover[i] < 0 && E.lover[j] !== i && sim.rng.chance(0.12)) { const r = E.lover[j]; E.lover[i] = j; E.bondT[i] = sim.tick; st(sim, 'lovesUnreturned'); if (ok(E, r) && E.lover[r] === j && E.rival[i] < 0 && E.rival[r] < 0) { E.rival[i] = r; E.rival[r] = i; st(sim, 'rivalries'); st(sim, 'loveRivals'); sim.emit('quarrel', E.x[i], E.y[i]); } } }
      // friendship and rivalry
      if (E.friend[i] === j) { E.mood[i] = Math.min(100, E.mood[i] + 4); E.mood[j] = Math.min(100, E.mood[j] + 4); E.social[i] = Math.min(100, E.social[i] + 10); st(sim, 'friendMeets'); }
      else if (E.rival[i] === j) { E.mood[i] = Math.max(0, E.mood[i] - 6); E.mood[j] = Math.max(0, E.mood[j] - 6); st(sim, 'quarrels'); if (sim.rng.chance(0.35)) sim.emit('quarrel', E.x[i], E.y[i]); }
      else if (E.spouse[i] !== j && E.lover[i] !== j) { const a = B.affinity(sim, i, j);
        if (a > 0.3 && E.friend[i] < 0 && E.friend[j] < 0) { if (sim.rng.chance(0.5)) { E.friend[i] = j; E.friend[j] = i; E.mood[i] = Math.min(100, E.mood[i] + 8); E.mood[j] = Math.min(100, E.mood[j] + 8); st(sim, 'friendships'); sim.emit('friend', E.x[i], E.y[i]); } }
        else if (a < -0.4 && E.rival[i] < 0 && E.rival[j] < 0 && sim.rng.chance(0.3)) { E.rival[i] = j; E.rival[j] = i; st(sim, 'rivalries'); sim.emit('quarrel', E.x[i], E.y[i]); } }
      E.social[j] = Math.min(100, E.social[j] + 10); break; } };
  AL.Sim.modules.push({ name: 'bonds',
    // the dead leave their friends, rivals and loves: grief for a friend or a love, nothing for a rival
    onDeath(sim, i) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE) return; const f = E.friend[i], r = E.rival[i]; E.friend[i] = -1; E.rival[i] = -1;
      if (f >= 0 && E.friend[f] === i) { E.friend[f] = -1; if (E.alive[f]) { E.mood[f] = Math.max(0, E.mood[f] - 20); st(sim, 'griefs'); } } if (r >= 0 && E.rival[r] === i) E.rival[r] = -1;
      if (E.lover[i] >= 0 || (E.flags[i] & F.CHILD) === 0) for (let k = 0; k < E.hi; k++) if (E.lover[k] === i && E.alive[k]) { E.lover[k] = -1; if (k !== i) { E.mood[k] = Math.max(0, E.mood[k] - 25); st(sim, 'griefs'); } } E.lover[i] = -1; } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
