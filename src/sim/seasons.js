// AL.Seasons — the four seasons (chantier B.8; decision in DECISIONS.md). A year is 1200 ticks, each season 300 (one day).
// Spring: plants and crops grow fast, animals breed. Summer: steady growth, dry storms. Autumn: the harvest is rich, a town
// with full granaries feasts. Winter: growth nearly stops, rain turns to snow, each town burns wood to keep warm and a town
// without wood suffers. The multipliers stack with those of the age (era).
(function (AL) {
  const Pw = AL.Powers, F = AL.Ents.F, Se = AL.Seasons = { LEN: AL.YEAR / 4, NAMES: ['spring', 'summer', 'autumn', 'winter'],
    GROW: [1.3, 1.1, 1.0, 0.6], CROP: [1.15, 1.1, 1.15, 0.6], BREED: [1.7, 1.0, 0.8, 0.5], RAIN: [1.25, 0.8, 1.15, 0.9] };
  const st = (sim, k, n) => { sim.stats[k] = (sim.stats[k] || 0) + (n == null ? 1 : n); };
  Se.of = tick => Math.floor((tick % AL.YEAR) / Se.LEN);
  Se.apply = function (sim) { const e = AL.ERAS[sim.era], s = sim.season; sim.growMul = e.grow * Se.GROW[s]; sim.cropMul = e.crop * Se.CROP[s]; sim.breedMul = Se.BREED[s]; sim.seasonRain = Se.RAIN[s]; sim.seasonCold = s === 3; };
  // the age changes: keep the season on top of its multipliers
  { const old = Pw.setEra; Pw.setEra = function (sim, id) { const r = old.apply(this, arguments); if (sim.season != null) Se.apply(sim); return r; }; }
  Se.turn = function (sim, s) { sim.season = s; Se.apply(sim); st(sim, 'season_' + Se.NAMES[s]); sim.emit('season', s);
    if (!sim.towns) return; const E = sim.E, RES = AL.RES;
    if (s === 3) { // winter: wood for the hearths, one log for twelve inhabitants
      for (const t of sim.towns) { if (!t.alive || t.pop < 4) continue; const need = Math.ceil(t.pop / 12); if (t.stock[RES.wood] >= need) { t.stock[RES.wood] -= need; t.cold = false; st(sim, 'hearthWood', need); } else { t.stock[RES.wood] = 0; t.cold = true; st(sim, 'coldWinters'); sim.emit('coldtown', t.cx, t.cy); } }
      for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.kind[i] < AL.NPEOPLE && E.town[i] >= 0 && !(E.flags[i] & F.DEAD)) { const t = sim.towns[E.town[i]]; if (t && t.cold) { E.mood[i] = Math.max(0, E.mood[i] - 12); E.energy[i] = Math.max(0, E.energy[i] - 10); } } }
    else if (s === 2) { // autumn: a town whose granaries are full holds a harvest feast
      for (const t of sim.towns) { if (!t.alive || t.pop < 8 || t.stock[RES.food] < t.pop * 4) continue; t.stock[RES.food] -= t.pop * 0.25; t.feastT = sim.tick; st(sim, 'feasts'); sim.emit('feast', t.cx, t.cy); }
      for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.kind[i] < AL.NPEOPLE && E.town[i] >= 0 && !(E.flags[i] & F.DEAD)) { const t = sim.towns[E.town[i]]; if (t && t.feastT === sim.tick) { E.mood[i] = Math.min(100, E.mood[i] + 12); E.social[i] = Math.min(100, E.social[i] + 20); } } }
    else if (s === 0) for (const t of sim.towns) t.cold = false; };
  AL.Sim.modules.push({ name: 'seasons',
    init(sim) { sim.season = 0; Se.apply(sim); const h = sim.hud; if (h) sim.hud = () => { const o = h(); o.season = sim.season; o.seasonP = (sim.tick % Se.LEN) / Se.LEN; return o; }; },
    tick(sim) { const s = Se.of(sim.tick); if (s !== sim.season) Se.turn(sim, s); if (sim.wx === 3) { if (sim.season === 3) { if (sim.tick % 50 === 0) st(sim, 'winterSnow'); } } },
    query(sim, m) { if (m.q === 'season') return { season: sim.season, name: Se.NAMES[sim.season] }; } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
