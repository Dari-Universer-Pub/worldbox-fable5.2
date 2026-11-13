// AL.Diplo — the rest of diplomacy (chantier B.6): kingdoms that become one (union of two crowns after a royal marriage, a
// vassal absorbed by its lord, a kingdom put back together after a civil war), civil wars (the least loyal towns follow a
// pretender and fight the crown), and the leader of each alliance (the strongest member: it calls the others to its wars and
// its peace ends theirs). Royal marriages, rebellions and captures already existed in realm.js: they are counted and shown here.
(function (AL) {
  const R = AL.Realm, T = AL.Towns, U = AL.Units, F = AL.Ents.F, D = AL.Diplo = {};
  const st = (sim, k, n) => { sim.stats[k] = (sim.stats[k] || 0) + (n == null ? 1 : n); };
  const capOf = (sim, kd) => { const t = sim.towns[kd.capital]; return t && t.alive ? t : null; };
  // ---- one kingdom joins another: towns, people and soldiers change crown; the old crown is no more
  D.unite = function (sim, big, small, how) { if (!big.alive || !small.alive || big === small) return false; const E = sim.E, cap = capOf(sim, big), sc = capOf(sim, small);
    if (big.wars[small.id] != null) { delete big.wars[small.id]; delete small.wars[big.id]; }
    if (small.ruler >= 0 && E.alive[small.ruler] && E.gen[small.ruler] === small.rulerGen) { const r = small.ruler; E.flags[r] &= ~F.RULER; if (E.job[r] === AL.JOB.ruler) E.job[r] = 0; T.setLook(E, r); }
    for (const tid of small.towns) { const t = sim.towns[tid]; if (!t || !t.alive) continue; t.kingdom = big.id; t.loyalty = Math.max(t.loyalty, 55); big.towns.push(tid); }
    for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.kingdom[i] === small.id) { E.kingdom[i] = big.id; if (E.flags[i] & F.MOBILIZED) { E.flags[i] &= ~F.MOBILIZED; E.army[i] = -1; if (E.act[i] === U.ACT.MARCH || E.act[i] === U.ACT.SIEGE) { U.stop(E, i); E.act[i] = U.ACT.NONE; } } }
    // the wars of the smaller crown end with it; its friends stay friends of the new realm
    for (const o of sim.kingdoms) { if (o === small || o === big || !o.alive) continue; if (small.allies[o.id] && big.wars[o.id] == null) { big.allies[o.id] = o.allies[big.id] = sim.tick; } delete o.wars[small.id]; delete o.allies[small.id]; if (o.vassalOf === small.id) o.vassalOf = big.id; if (o.civilOf === small.id) o.civilOf = -1; }
    if (big.vassalOf === small.id) big.vassalOf = -1; if (big.civil === small.id) big.civil = -1; if (big.civilOf === small.id) big.civilOf = -1; if (big.wed === small.id) big.wed = -1;
    small.towns = []; small.wars = {}; small.allies = {}; small.alive = false; small.mergedInto = big.id; big.stability = AL.clamp(big.stability + (how === 'civil' ? 8 : 4), 0, 100);
    const x = sc ? sc.cx : cap ? cap.cx : 0, y = sc ? sc.cy : cap ? cap.cy : 0; R.log(sim, 'union', ['log.union.' + how, small.name, big.name], x, y, big.id, small.id); sim.emit('union', x, y, big.id); if (cap && sc) sim.emit('union', cap.cx, cap.cy, big.id);
    st(sim, 'unions'); st(sim, 'union_' + how); sim.ownerDirty = true; R.refreshWarFlags(sim); return true; };
  // ---- civil war: the least loyal towns of a troubled kingdom follow a pretender
  D.civilWar = function (sim, a) { const E = sim.E, cap = capOf(sim, a); if (!cap) return false; const cand = []; for (const tid of a.towns) { const t = sim.towns[tid]; if (t && t.alive && t !== cap && t.adults >= 5) cand.push(t); }
    if (cand.length < 2) return false; cand.sort((p, q) => p.loyalty - q.loyalty || p.id - q.id); const n = Math.max(1, Math.min(cand.length - 1, Math.ceil(cand.length / 2))), reb = cand.slice(0, n), seat = reb.reduce((b, t) => t.pop > b.pop ? t : b, reb[0]);
    // the pretender: an adult of the seat town, from a rival clan if there is one, else kin of the crown
    let pre = -1, ps = -1; for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] !== seat.id || (E.flags[i] & (F.DEAD | F.CHILD | F.RULER)) || E.kind[i] >= AL.NPEOPLE) continue; let s = sim.rng.f(); if (E.clan[i] >= 0 && E.clan[i] !== a.clan) s += 10; else if (E.clan[i] >= 0) s += 4; if (E.flags[i] & F.NOTABLE) s += 3; if (E.flags[i] & F.ELDER) s -= 2; if (s > ps) { ps = s; pre = i; } }
    if (pre < 0) return false;
    for (const t of reb) { a.towns.splice(a.towns.indexOf(t.id), 1); t.kingdom = -1; }
    const kd = R.create(sim, seat, pre); kd.civilOf = a.id; a.civil = kd.id; kd.stability = 60; a.stability = Math.max(20, a.stability - 10);
    for (const t of reb) { if (t !== seat) { t.kingdom = kd.id; kd.towns.push(t.id); } t.loyalty = 75; sim.emit('revolt', t.cx, t.cy, kd.id); }
    for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.kingdom[i] === a.id) { const t = sim.towns[E.town[i]]; if (t && t.kingdom === kd.id) { E.kingdom[i] = kd.id; E.flags[i] &= ~F.MOBILIZED; E.army[i] = -1; } }
    kd.rel[a.id] = a.rel[kd.id] = -70; R.log(sim, 'civilwar', ['log.civilwar', a.name, kd.rulerName, n, kd.name], seat.cx, seat.cy, kd.id, a.id); R.declare(sim, kd, a, 'the crown'); st(sim, 'civilWars'); st(sim, 'civilTowns', n); sim.ownerDirty = true; return true; };
  // ---- the yearly look of one kingdom
  D.year = function (sim, a) { const E = sim.E, rng = sim.rng, sa = R.strength(sim, a);
    // a civil war that has ended: the weaker half comes back under the stronger crown, or the split becomes final
    if (a.civilOf != null && a.civilOf >= 0) { const p = sim.kingdoms[a.civilOf]; if (!p || !p.alive) a.civilOf = -1; else if (a.wars[p.id] == null) { const sp = R.strength(sim, p); if (sa < sp * 0.7) { D.unite(sim, p, a, 'civil'); return; } if (sp < sa * 0.7) { D.unite(sim, a, p, 'civil'); return; }
        a.civilOf = -1; p.civil = -1; R.log(sim, 'partition', ['log.partition', p.name, a.name], 0, 0, a.id, p.id); st(sim, 'partitions'); } }
    if (a.civil != null && a.civil >= 0 && (!sim.kingdoms[a.civil] || !sim.kingdoms[a.civil].alive)) a.civil = -1;
    // a marriage between two friendly houses of the same people: when the rulers are not free, kin of the two clans are wed and the
    // one of the weaker house goes to live at the other court
    for (const b of sim.kingdoms) { if (!b.alive || b === a || b.id < a.id || a.people !== b.people || a.wars[b.id] != null || (a.rel[b.id] || 0) <= 22 || a.wed === b.id || a.clan < 0 || b.clan < 0 || a.clan === b.clan || !rng.chance(0.35)) continue;
      const ca = capOf(sim, a), cb = capOf(sim, b); if (!ca || !cb) continue; let x = -1, y = -1; for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || (E.flags[i] & (F.DEAD | F.CHILD | F.ELDER | F.RULER | F.CONTROLLED)) || E.spouse[i] >= 0 || E.kind[i] >= AL.NPEOPLE) continue; if (x < 0 && E.kingdom[i] === a.id && E.clan[i] === a.clan) x = i; else if (y < 0 && E.kingdom[i] === b.id && E.clan[i] === b.clan && (x < 0 || E.sex[i] !== E.sex[x])) y = i; }
      if (x < 0 || y < 0 || E.sex[x] === E.sex[y]) continue; E.spouse[x] = y; E.spouse[y] = x; E.flags[x] |= F.NOTABLE; E.flags[y] |= F.NOTABLE; a.rel[b.id] = b.rel[a.id] = Math.min(100, (a.rel[b.id] || 0) + 30);
      const mover = sa <= R.strength(sim, b) ? x : y, court = mover === x ? cb : ca, from = sim.towns[E.town[mover]]; if (from && from.alive && from !== court) { const h = E.home[mover]; if (h >= 0 && sim.B.occ[h] > 0) sim.B.occ[h]--; const w = E.work[mover]; if (w >= 0 && sim.B.workers[w] > 0) sim.B.workers[w]--; from.pop--; U.joinTown(sim, mover, court); }
      R.log(sim, 'marriage', ['log.marriagehouse', AL.Lang.unitName(sim, x), sim.clans[a.clan].name, a.name, AL.Lang.unitName(sim, y), sim.clans[b.clan].name, b.name], ca.cx, ca.cy, a.id, b.id); st(sim, 'houseMarriages'); break; }
    // union of two crowns: the two houses are wed and friends; after three years the smaller realm joins the larger
    if (a.wed != null && a.wed >= 0) { const b = sim.kingdoms[a.wed]; if (!b || !b.alive) a.wed = -1; else if (b.wed === a.id && a.people === b.people && a.wars[b.id] == null && (a.rel[b.id] || 0) > 30 && sim.tick - (a.wedT || 0) > 3 * AL.YEAR && sa <= R.strength(sim, b) && !(a.civilOf >= 0) && !(a.civil >= 0) && rng.chance(0.3)) { D.unite(sim, b, a, 'crowns'); return; } }
    // a vassal of the same people, loyal for fifteen years, is absorbed by its lord
    if (a.vassalOf >= 0) { const lord = sim.kingdoms[a.vassalOf]; if (lord && lord.alive) { if (a.vassalT == null || a.vassalLord !== lord.id) { a.vassalT = sim.tick; a.vassalLord = lord.id; } else if (a.people === lord.people && sim.tick - a.vassalT > 15 * AL.YEAR && (a.rel[lord.id] || 0) > 20 && a.wars[lord.id] == null && rng.chance(0.25)) { D.unite(sim, lord, a, 'vassal'); return; } } } else a.vassalT = null;
    // civil war: an unstable kingdom of three towns or more, at least twenty years old, not already torn
    if (!(a.civil >= 0) && !(a.civilOf >= 0) && sim.tick - a.founded > 20 * AL.YEAR && a.towns.length >= 3 && R.popOf(sim, a) >= 90) { let low = 0, nt = 0; const cap = capOf(sim, a); for (const tid of a.towns) { const t = sim.towns[tid]; if (t && t.alive && t !== cap) { nt++; if (t.loyalty < 45) low++; } }
      const p = (a.stability < 45 ? 0.3 : a.stability < 60 ? 0.08 : 0.015) + (nt && low * 2 >= nt ? 0.12 : 0) + (sim.tick - (a.dynT || -1e9) < 3 * AL.YEAR ? 0.3 : 0); if (rng.chance(Math.min(0.7, p))) D.civilWar(sim, a); } };
  // ---- alliances: groups of allied kingdoms and their leader
  D.leagues = function (sim) { const ks = sim.kingdoms, n = ks.length, grp = D._grp && D._grp.length >= n ? D._grp : (D._grp = new Int32Array(n + 64)); for (let k = 0; k < n; k++) grp[k] = k;
    const find = k => { while (grp[k] !== k) { grp[k] = grp[grp[k]]; k = grp[k]; } return k; };
    for (let k = 0; k < n; k++) if (ks[k].alive) for (const o in ks[k].allies) { const b = +o; if (ks[b] && ks[b].alive) { const ra = find(k), rb = find(b); if (ra !== rb) grp[Math.max(ra, rb)] = Math.min(ra, rb); } }
    for (let k = 0; k < n; k++) { const a = ks[k]; if (!a.alive) continue; const g = find(k); let size = 0, best = null, bs = -1, old = null; for (let q = 0; q < n; q++) if (ks[q].alive && find(q) === g) { size++; const s = R.strength(sim, ks[q]) + R.popOf(sim, ks[q]) * 0.1; if (s > bs) { bs = s; best = ks[q]; } if (ks[q].leagueLead === ks[q].id && ks[q].league === g) old = ks[q]; }
      if (size < 2) { a.league = -1; a.leagueLead = -1; continue; } if (g !== k) continue; // once per group, on its lowest id
      // the sitting leader keeps the seat unless another member is a fifth stronger
      let lead = best; if (old && old !== best && bs < (R.strength(sim, old) + R.popOf(sim, old) * 0.1) * 1.2) lead = old;
      const changed = !old || old !== lead; for (let q = 0; q < n; q++) if (ks[q].alive && find(q) === g) { ks[q].league = g; ks[q].leagueLead = lead.id; ks[q].leagueSize = size; }
      if (changed) { const c = capOf(sim, lead); R.log(sim, 'league', [old ? 'log.leaguenew' : 'log.league', lead.name, size], c ? c.cx : 0, c ? c.cy : 0, lead.id); if (c) sim.emit('league', c.cx, c.cy, lead.id); st(sim, 'leagueLeaders'); }
      // the leader calls its allies to its wars; its peace is theirs
      for (const w in lead.wars) { const x = ks[+w]; if (!x || !x.alive) continue; for (let q = 0; q < n; q++) { const m = ks[q]; if (!m.alive || m === lead || m === x || find(q) !== g || m.wars[x.id] != null || m.allies[x.id] || (m.treaty[x.id] || 0) > sim.tick || m.vassalOf === x.id) continue;
          if (R.popOf(sim, m) >= 40 && sim.rng.chance(0.45)) { m.wars[x.id] = sim.tick; x.wars[m.id] = sim.tick; m.rel[x.id] = x.rel[m.id] = Math.min(m.rel[x.id] || 0, -50); delete m.allies[x.id]; delete x.allies[m.id]; (m.called = m.called || {})[x.id] = lead.id; R.log(sim, 'war', ['log.calltoarms', lead.name, m.name, x.name], 0, 0, m.id, x.id); st(sim, 'callsToArms'); R.refreshWarFlags(sim); } } }
      for (let q = 0; q < n; q++) { const m = ks[q]; if (!m.alive || !m.called) continue; for (const w in m.called) { const x = ks[+w], ld = ks[m.called[w]]; if (m.wars[+w] == null || !x || !x.alive) { delete m.called[w]; continue; } if (ld && ld.alive && ld.wars[+w] == null) { delete m.called[w]; R.peace(sim, m, x, 'the alliance leader'); st(sim, 'leaguePeaces'); } } } } };
  // ---- what already existed, now counted and shown: royal marriage, rebellion, capture, change of dynasty
  { const old = R.log; R.log = function (sim, type, text, x, y, a, b) { const r = old.apply(this, arguments);
      if (type === 'marriage') { st(sim, 'marriages'); const ka = sim.kingdoms[a], kb = sim.kingdoms[b]; if (ka && kb) { ka.wed = kb.id; kb.wed = ka.id; ka.wedT = kb.wedT = sim.tick; const c = capOf(sim, ka), d = capOf(sim, kb); if (c) sim.emit('wedding', c.cx, c.cy, ka.id); if (d) sim.emit('wedding', d.cx, d.cy, kb.id); } }
      else if (type === 'rebellion') { st(sim, 'rebellions'); sim.emit('revolt', x, y, a); }
      else if (type === 'capture' && text && text[0] === 'log.capture') st(sim, 'captures');
      else if (type === 'dynasty') { const kd = sim.kingdoms[a]; if (kd) kd.dynT = sim.tick; st(sim, 'dynasties'); }
      else if (type === 'independence') st(sim, 'independences'); else if (type === 'vassal') st(sim, 'vassals'); else if (type === 'betrayal') st(sim, 'betrayals');
      return r; }; }
  AL.Sim.modules.push({ name: 'diplo',
    tick(sim) { const ks = sim.kingdoms, tk = sim.tick; if (!ks) return; for (let k = 0; k < ks.length; k++) { const kd = ks[k]; if (kd.alive && (tk + k * 150) % AL.YEAR === 900) D.year(sim, kd); } if (tk % AL.YEAR === 450) D.leagues(sim); } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
