// AL.Envoys — the own trades of the two first peoples (chantier C.0).
// Humans: a town with a chancery sends ENVOYS to the towns of other kingdoms. An envoy who arrives warms the relation of
// the two crowns, leaves a gift from his town's surplus, and, when the two kingdoms have been at war for a long time,
// may bring back a peace. One envoy per foreign kingdom and per half-year.
// Orcs: a town with a war camp sends REAVERS, in a band, to the nearest town of another kingdom that is not an ally.
// They take from its stores (food first, then gold, tools, weapons…), sometimes set a building alight, and carry the loot
// home; watchtowers and soldiers can drive them off, wounded. Each raid cools the relation of the two kingdoms.
// Both walk with ACT.TRADE like merchants; E.tB tells the errands apart (ENVOY, RAID), E.army holds the target town.
(function (AL) {
  const U = AL.Units, T = AL.Towns, R = AL.Realm, ACT = U.ACT, En = AL.Envoys = { ENVOY: -20, RAID: -21, VISIT: 600, RANGE: 150, RAIDRANGE: 100 };
  const st = (sim, k, n) => { sim.stats[k] = (sim.stats[k] || 0) + (n == null ? 1 : n); };
  const LOOT = ['food', 'gold', 'tools', 'weapons', 'iron', 'copper', 'wood', 'stone'];
  // ---- the envoy leaves for the nearest foreign town he has not visited lately
  En.startEnvoy = function (sim, i, town) { const E = sim.E, W = sim.world, kd = sim.kingdoms[town.kingdom]; if (!kd || !kd.alive || E.carryN[i]) return false;
    const reg = W.region[town.cy * W.n + town.cx], seen = kd.envoyT || (kd.envoyT = {}); let best = null, bs = En.RANGE;
    for (const t of sim.towns) { if (!t.alive || t.kingdom < 0 || t.kingdom === town.kingdom || W.region[t.cy * W.n + t.cx] !== reg) continue; const ok = sim.kingdoms[t.kingdom]; if (!ok || !ok.alive) continue;
      if (seen[ok.id] != null && sim.tick - seen[ok.id] < En.VISIT) continue; const war = kd.wars[ok.id]; if (war != null && sim.tick - war < AL.YEAR * 2) continue;
      const s = Math.abs(t.cx - town.cx) + Math.abs(t.cy - town.cy) + ((kd.rel[ok.id] || 0) > 50 ? 50 : 0) - (ok.capital === t.id ? 12 : 0); if (s < bs) { bs = s; best = t; } }
    if (!best) return false; if (!U.begin(sim, i, ACT.TRADE, best.cx, best.cy)) return false; E.tB[i] = En.ENVOY; E.army[i] = best.id; seen[best.kingdom] = sim.tick; st(sim, 'envoysSent'); return true; };
  En.arriveEnvoy = function (sim, i, home, other) { const E = sim.E, rng = sim.rng, ka = sim.kingdoms[home.kingdom], kb = sim.kingdoms[other.kingdom]; if (!ka || !kb || !ka.alive || !kb.alive || ka === kb) return;
    const x = E.x[i], y = E.y[i], mul = AL.KINDS[E.kind[i]].diplomacy || 1;
    if (ka.wars[kb.id] != null) { // a long war: the envoy asks for peace
      if (rng.chance(0.3)) { R.peace(sim, ka, kb, 'envoy'); st(sim, 'envoyPeace'); sim.emit('envoy', x, y, 1); } else { st(sim, 'envoyRebuffed'); sim.emit('envoy', x, y, 2); } E.cool[i] = 60; return; }
    let gain = 5 * mul; const a = home.stock, b = other.stock; let gr = -1, gv = 0; for (let r = 0; r < AL.NRES; r++) { const v = a[r] / Math.max(1, home.pop) - b[r] / Math.max(1, other.pop); if (a[r] > 14 && v > gv) { gv = v; gr = r; } }
    if (gr >= 0) { a[gr] -= 3; b[gr] += 3; gain += 2 * mul; st(sim, 'envoyGifts'); }
    const rel = AL.clamp((ka.rel[kb.id] || 0) + gain, -100, 100); ka.rel[kb.id] = kb.rel[ka.id] = rel; st(sim, 'envoys'); sim.emit('envoy', x, y, 0); E.cool[i] = 60;
    const lg = ka.envoyLog || (ka.envoyLog = {}); if (lg[kb.id] == null || sim.tick - lg[kb.id] > AL.YEAR * 15) { lg[kb.id] = sim.tick; R.log(sim, 'envoy', ['log.envoy', ka.name, kb.name, other.name], other.cx, other.cy, ka.id, kb.id); } };
  // ---- the reaver leaves with the band for the nearest town of another kingdom
  En.startRaid = function (sim, i, town) { const E = sim.E, W = sim.world, kd = sim.kingdoms[town.kingdom]; if (!kd || !kd.alive || E.carryN[i]) return false; let best = null;
    if (town.raidTgt != null && sim.tick - town.raidTgtT < 150) { best = sim.towns[town.raidTgt]; if (!best || !best.alive || best.kingdom === town.kingdom) best = null; } // the band goes together
    if (!best) { if (town.raidTgtT != null && sim.tick - town.raidTgtT < 420) return false; // the camp rests between two raids
      const reg = W.region[town.cy * W.n + town.cx]; let bs = En.RAIDRANGE;
      for (const t of sim.towns) { if (!t.alive || t.kingdom < 0 || t.kingdom === town.kingdom || W.region[t.cy * W.n + t.cx] !== reg) continue; const ok = sim.kingdoms[t.kingdom]; if (!ok || !ok.alive || kd.allies[ok.id] || ok.vassalOf === kd.id || kd.vassalOf === ok.id) continue;
        const s = Math.abs(t.cx - town.cx) + Math.abs(t.cy - town.cy) + (t.raidT != null && sim.tick - t.raidT < 900 ? 40 : 0); if (s < bs) { bs = s; best = t; } }
      if (!best) return false; town.raidTgt = best.id; town.raidTgtT = sim.tick; st(sim, 'raidBands'); }
    if (!U.begin(sim, i, ACT.TRADE, best.cx, best.cy)) return false; E.tB[i] = En.RAID; E.army[i] = best.id; st(sim, 'reaversOut'); return true; };
  En.arriveRaid = function (sim, i, home, victim) { const E = sim.E, B = sim.B, rng = sim.rng, J = AL.JOB, ka = sim.kingdoms[home.kingdom], kb = sim.kingdoms[victim.kingdom], x = E.x[i], y = E.y[i]; if (!ka || !kb || ka === kb) return;
    const towers = victim.count[AL.BT.watchtower] || 0, hv = victim.have || [], guards = (hv[J.soldier] || 0) + (hv[J.archer] || 0) + (hv[J.knight] || 0);
    if (rng.chance(Math.min(0.7, 0.1 + towers * 0.12 + guards * 0.03))) { st(sim, 'raidsRepelled'); sim.emit('raidfail', x, y); ka.rel[kb.id] = kb.rel[ka.id] = AL.clamp((ka.rel[kb.id] || 0) - 2, -100, 100); E.cool[i] = 30; AL.Fight.hit(sim, -1, i, 25 + rng.int(30), 'raid'); return; }
    const s = victim.stock, mul = AL.KINDS[E.kind[i]].lootMul || 1; const fed = home.stock[AL.RES.food] / Math.max(1, home.pop) > 8; let r = -1; for (let k = fed ? 1 : 0; k < LOOT.length && r < 0; k++) { const q = AL.RES[LOOT[k]]; if (s[q] >= (k ? 6 : 3)) r = q; } if (r < 0 && fed && s[AL.RES.food] >= 3) r = AL.RES.food; // a hungry camp takes food first, a fed one the richer things
    if (r < 0) { st(sim, 'raidsEmpty'); E.cool[i] = 30; return; }
    const v = Math.max(1, Math.min(Math.round(6 * mul), Math.floor(s[r] * 0.12))); s[r] -= v; E.carry[i] = r; E.carryN[i] = v; victim.raidT = sim.tick; st(sim, 'raids'); st(sim, 'raidLoot', v); st(sim, 'raid_' + AL.RESN[r], v);
    ka.rel[kb.id] = kb.rel[ka.id] = AL.clamp((ka.rel[kb.id] || 0) - 6, -100, 100); sim.emit('raid', x, y);
    if (rng.chance(0.2) && victim.blds.length > 1) { const b = victim.blds[rng.int(victim.blds.length)]; if (B.alive[b] && B.state[b] === 1 && b !== victim.hall) { T.damage(sim, b, 30 + rng.int(30), i); st(sim, 'raidBurned'); sim.emit('siege', B.x[b] + B.w[b] / 2, B.y[b] + B.h[b] / 2, b); } }
    const lg = home.raidLog || (home.raidLog = {}); if (lg[victim.id] == null || sim.tick - lg[victim.id] > AL.YEAR * 10) { lg[victim.id] = sim.tick; R.log(sim, 'raid', ['log.raid', home.name, victim.name, '~res.' + AL.RESN[r]], victim.cx, victim.cy, ka.id, kb.id); } };
  const prevExtra = AL.UnitsExtra;
  AL.UnitsExtra = function (sim, i, a, tm) { const E = sim.E;
    if (a === ACT.TRADE && (E.tB[i] === En.ENVOY || E.tB[i] === En.RAID)) { const raid = E.tB[i] === En.RAID, other = sim.towns[E.army[i]], home = sim.towns[E.town[i]]; E.army[i] = -1; E.tB[i] = -1; E.act[i] = ACT.NONE;
      if (other && other.alive && home && home.alive && other.kingdom >= 0 && home.kingdom >= 0) { if (raid) En.arriveRaid(sim, i, home, other); else En.arriveEnvoy(sim, i, home, other); } return true; }
    return prevExtra ? prevExtra(sim, i, a, tm) : false; };
  AL.Sim.modules.push({ name: 'envoys', init() { }, tick() { } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
