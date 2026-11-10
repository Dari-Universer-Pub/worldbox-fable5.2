// AL.Lang (languages: names of people, places, cultures and faiths built from the sounds of each people, with sound shifts
// that accumulate slowly per culture), AL.Culture (cultures with values that steer towns and kingdoms, daughter cultures,
// assimilation), AL.Faith (religions founded by prophets, 3 dogmas each with effects, conversion, missions, schisms) and
// the history book (years, ages, notable characters living and dead).
(function (AL) {
  'use strict';
  const L = AL.Lang = {}, C = AL.Culture = {}, Fa = AL.Faith = {}, F = AL.Ents.F, R = AL.Realm, U = AL.Units;
  const KEYS = ['mood', 'loyal', 'war', 'convert', 'fertility', 'hunger', 'crop', 'heal', 'learn'];
  // ------------------------------------------------------------ languages
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function base(lang, h, syl) { const D = AL.DATA.languages[lang] || AL.DATA.languages.human; let s = ''; for (let k = 0; k < syl; k++) { s += D.on[h % D.on.length]; h = (h / D.on.length) | 0; s += D.vo[h % D.vo.length]; h = (h / D.vo.length) | 0; if (k === syl - 1 || (h & 3) === 0) s += D.co[(h >>> 2) % D.co.length]; h = Math.imul(h ^ 0x9e3779b1, 0x85ebca6b) >>> 0; } return s; }
  // apply the sound shifts a culture had accumulated at tick `at`
  L.shift = function (cult, w, at) { if (!cult) return w; const S = cult.shifts; for (let k = 0; k < S.length; k++) { if (at != null && S[k][2] > at) break; w = w.split(S[k][0]).join(S[k][1]); } return w; };
  const cultOf = id => (L.sim && id != null && id >= 0 ? L.sim.cultures[id] : null);
  L.person = function (seed, kind, cult, born, sex) { const K = AL.KINDS[kind], D = AL.DATA.languages[K.lang] || AL.DATA.languages.human, c = cultOf(cult), h = seed >>> 3; let w = base(K.lang, h, 1 + (seed & 1)); const e = sex ? D.f : D.m; w += e[(seed >>> 9) % e.length]; return cap(L.shift(c, w, born)); };
  L.place = function (seed, kind, cult, at) { const K = AL.KINDS[kind], D = AL.DATA.languages[K.lang] || AL.DATA.languages.human; return cap(L.shift(cultOf(cult), base(K.lang, seed >>> 5, 1 + ((seed >>> 2) & 1)) + D.place[(seed >>> 11) % D.place.length], at)); };
  L.word = function (seed, kind, cult, at, syl) { const K = AL.KINDS[kind]; return cap(L.shift(cultOf(cult), base(K.lang, seed >>> 4, syl || 2), at)); };
  L.unitName = function (sim, i) { const E = sim.E; return L.person(E.seed[i], E.kind[i], E.culture[i], E.born[i], E.sex[i]); };
  // ------------------------------------------------------------ cultures
  C.create = function (sim, people, town, parent) { const K = AL.KINDS[people], D = AL.DATA.languages[K.lang] || AL.DATA.languages.human, rng = sim.rng, id = sim.cultures.length, p = parent >= 0 ? sim.cultures[parent] : null, src = p ? p.values : K.culture, values = {};
    for (const k in src) values[k] = AL.clamp(src[k] + rng.range(-0.14, 0.14), 0.02, 0.98);
    const c = { id, alive: true, people, parent: parent >= 0 ? parent : -1, values, founded: sim.tick, origin: town ? town.id : -1, ox: town ? town.cx : 0, oy: town ? town.cy : 0, shifts: p ? p.shifts.map(s => s.slice()) : [], seed: rng.u32(), members: 0, name: '', lang: '' };
    sim.cultures.push(c); if (p) { C.drift(sim, c); C.drift(sim, c); }
    c.name = L.word(c.seed, people, id, null, 2) + D.folk; c.lang = c.name.replace(/(an|ai|ir|ek|im|jin)$/, '') + (K.lang === 'orc' ? 'ukh' : 'ish');
    R.log(sim, 'culture', p ? 'The ' + c.name + ' people part ways with the ' + p.name : 'The ' + c.name + ' people take their name', c.ox, c.oy); return c; };
  // one more sound shift in the language of a culture
  C.drift = function (sim, c) { const D = AL.DATA.languages[AL.KINDS[c.people].lang] || AL.DATA.languages.human, rng = sim.rng; for (let t = 0; t < 8; t++) { const s = D.shifts[rng.int(D.shifts.length)]; if (c.shifts.some(q => q[0] === s[0] || q[1] === s[0] || q[0] === s[1])) continue; c.shifts.push([s[0], s[1], sim.tick]); return true; } return false; };
  C.setTown = function (sim, town, c) { town.culture = c.id; town.cultureValues = c.values; };
  // ------------------------------------------------------------ religions
  Fa.tab = {}; for (const k of KEYS) Fa.tab[k] = new Float32Array(257).fill(1);
  Fa.m = function (sim, rel, key) { return rel == null || rel < 0 || rel > 255 ? 1 : Fa.tab[key][rel + 1]; };
  Fa.rebuild = function (sim) { for (const k of KEYS) { const t = Fa.tab[k]; t.fill(1); for (const r of sim.religions) { if (r.id > 255) break; let v = 1; for (const d of r.dogmas) { const m = AL.DOGMAS[d].mods[k]; if (m != null) v *= m; } t[r.id + 1] = v; } } };
  Fa.pickDogmas = function (sim, keep, n) { const rng = sim.rng, out = keep.slice(); for (let t = 0; t < 200 && out.length < n; t++) { const d = rng.int(AL.DOGMAS.length), D = AL.DOGMAS[d]; if (out.includes(d)) continue; if (out.some(o => AL.DOGMAS[o].opposite === D.name || D.opposite === AL.DOGMAS[o].name)) continue; out.push(d); } return out; };
  Fa.found = function (sim, i, town, parent) { const E = sim.E, rng = sim.rng, K = AL.KINDS[E.kind[i]], D = AL.DATA.languages[K.lang] || AL.DATA.languages.human, id = sim.religions.length, p = parent >= 0 ? sim.religions[parent] : null;
    let keep = []; if (p) { keep = p.dogmas.slice(); keep.splice(rng.int(keep.length), 1); }
    const seed = rng.u32(), r = { id, alive: true, people: E.kind[i], parent: p ? p.id : -1, founded: sim.tick, founder: L.unitName(sim, i), founderGen: E.gen[i], holy: town ? town.id : -1, dogmas: Fa.pickDogmas(sim, keep, 3), followers: 0, towns: 0, seed, name: L.word(seed, E.kind[i], E.culture[i], null, 2) + D.faith[seed % D.faith.length] };
    sim.religions.push(r); Fa.rebuild(sim); E.religion[i] = id; E.faith[i] = 100; E.flags[i] |= F.NOTABLE; if (!E.hasTrait(i, AL.TRAIT.prophet)) { E.addTrait(i, AL.TRAIT.prophet); E.recalc(i); } sim.stats.prophets = (sim.stats.prophets || 0) + (p ? 0 : 0);
    if (town) { for (let j = 0; j < E.hi; j++) if (E.alive[j] && E.town[j] === town.id && !(E.flags[j] & F.DEAD) && j !== i && (E.religion[j] < 0 ? rng.chance(0.75) : rng.chance(p ? 0.55 : 0.3))) { E.religion[j] = id; E.faith[j] = Math.max(E.faith[j], 70); } town.religion = id; }
    const dn = r.dogmas.map(d => AL.DOGMAS[d].en).join(', ');
    R.log(sim, p ? 'schism' : 'religion', p ? r.founder + ' breaks with ' + p.name + ' and preaches ' + r.name + ' (' + dn + ')' : r.founder + ' founds the faith of ' + r.name + (town ? ' at ' + town.name : '') + ' (' + dn + ')', E.x[i], E.y[i], id); Fa.count(sim); return r; };
  Fa.count = function (sim) { const E = sim.E, RL = sim.religions, TW = sim.towns, nr = RL.length; if (!nr) return; for (const r of RL) { r.followers = 0; r.towns = 0; } const per = Fa._per && Fa._per.length >= TW.length * nr ? Fa._per : (Fa._per = new Uint16Array(Math.max(64, TW.length * nr * 2))); per.fill(0);
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || (E.flags[i] & F.DEAD) || E.kind[i] >= AL.NPEOPLE) continue; const r = E.religion[i]; if (r < 0 || r >= nr) continue; RL[r].followers++; const t = E.town[i]; if (t >= 0 && t < TW.length) per[t * nr + r]++; }
    for (const t of TW) { if (!t.alive) continue; let best = -1, bn = 0; for (let r = 0; r < nr; r++) { const c = per[t.id * nr + r]; if (c > bn) { bn = c; best = r; } } if (best >= 0 && bn >= Math.max(2, t.pop * 0.4)) { if (t.religion !== best && t.religion >= 0 && bn > t.pop * 0.5) R.log(sim, 'convert', t.name + ' turns to the faith of ' + RL[best].name, t.cx, t.cy, best); if (t.religion < 0 || bn > t.pop * 0.5) t.religion = best; } if (t.religion >= 0) RL[t.religion].towns++; }
    for (const r of RL) if (r.alive && r.followers === 0 && sim.tick - r.founded > AL.YEAR) { r.alive = false; R.log(sim, 'faithlost', 'The faith of ' + r.name + ' is forgotten', 0, 0, r.id); }
    for (const kd of sim.kingdoms) { if (!kd.alive) continue; const cap = sim.towns[kd.capital]; kd.religion = cap && cap.alive ? cap.religion : -1; } };
  Fa.onPray = function (sim, i, town) { const E = sim.E, r = town.religion; if (r < 0 || E.religion[i] === r) return; if (sim.rng.chance(0.3 * Fa.m(sim, r, 'convert'))) { E.religion[i] = r; E.faith[i] = Math.max(E.faith[i], 60); } };
  // a priest at work: the faithful nearby are strengthened, strangers may be won over
  Fa.preach = function (sim, i, town) { const E = sim.E, r = E.religion[i] >= 0 ? E.religion[i] : town.religion; if (r < 0) return; const c = E.query(E.x[i], E.y[i], 4); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || E.kind[j] >= AL.NPEOPLE || (E.flags[j] & F.DEAD)) continue; if (E.religion[j] === r) E.faith[j] = Math.min(100, E.faith[j] + 4); else if (sim.rng.chance(0.08 * Fa.m(sim, r, 'convert'))) { E.religion[j] = r; E.faith[j] = 55; } } };
  function prophetIn(sim, town) { const E = sim.E; let best = -1, bs = -1; for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] !== town.id || (E.flags[i] & (F.DEAD | F.CHILD | F.RULER))) continue; const s = E.faith[i] + (E.job[i] === AL.JOB.priest ? 60 : 0) + (E.hasTrait(i, AL.TRAIT.pious) ? 40 : 0) + (E.seed[i] & 15); if (s > bs) { bs = s; best = i; } } return best; }
  // ------------------------------------------------------------ history: notable characters
  function titleOf(sim, i) { const E = sim.E; if (E.flags[i] & F.RULER) return E.sex[i] ? 'queen' : 'king'; if (E.hasTrait(i, AL.TRAIT.prophet)) return 'prophet'; if (E.hasTrait(i, AL.TRAIT.hero)) return 'hero'; if (E.hasTrait(i, AL.TRAIT.veteran)) return 'veteran'; return 'notable'; }
  function notable(sim, i) { const E = sim.E, kd = sim.kingdoms[E.kingdom[i]], t = sim.towns[E.town[i]]; return { i, name: L.unitName(sim, i), title: titleOf(sim, i), kind: E.kind[i], born: 1 + Math.floor(E.born[i] / AL.YEAR), kills: E.kills[i], kingdom: kd ? kd.name : '', town: t ? t.name : '', religion: E.religion[i] >= 0 && sim.religions[E.religion[i]] ? sim.religions[E.religion[i]].name : '', x: E.x[i], y: E.y[i] }; }
  // ------------------------------------------------------------ yearly pass
  function yearly(sim) { const E = sim.E, rng = sim.rng, TW = sim.towns, CU = sim.cultures;
    // members, assimilation, heroes
    for (const c of CU) c.members = 0; let nPeople = 0;
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || (E.flags[i] & F.DEAD) || E.kind[i] >= AL.NPEOPLE) continue; nPeople++; const t = TW[E.town[i]]; if (t && t.alive && t.culture >= 0 && E.culture[i] !== t.culture && (E.culture[i] < 0 || rng.chance(0.2))) E.culture[i] = t.culture; if (E.culture[i] >= 0 && CU[E.culture[i]]) CU[E.culture[i]].members++;
      if (E.kills[i] >= 5 && AL.JOBS[E.job[i]].military && !E.hasTrait(i, AL.TRAIT.hero) && !(E.flags[i] & F.RULER) && rng.chance(0.5)) { E.addTrait(i, AL.TRAIT.hero); E.recalc(i); E.flags[i] |= F.NOTABLE; const kd = sim.kingdoms[E.kingdom[i]]; R.log(sim, 'hero', L.unitName(sim, i) + (kd ? ' of ' + kd.name : '') + ' is hailed as a hero after ' + E.kills[i] + ' kills', E.x[i], E.y[i]); } }
    // values follow the life of the culture; the language drifts
    for (const c of CU) { if (!c.members) { if (c.alive && sim.tick - c.founded > AL.YEAR) { c.alive = false; R.log(sim, 'culturelost', 'The ' + c.name + ' people are no more', c.ox, c.oy); } continue; } c.alive = true; const v = c.values; let war = 0, towns = 0, temples = 0, libs = 0, markets = 0, ports = 0;
      for (const t of TW) { if (!t.alive || t.culture !== c.id) continue; towns++; const kd = sim.kingdoms[t.kingdom]; if (kd && kd.alive && Object.keys(kd.wars).length) war++; const n = t.count; temples += n.temple ? 1 : 0; libs += n.library ? 1 : 0; markets += n.market ? 1 : 0; ports += n.port ? 1 : 0; }
      if (towns) { const nud = (k, on) => { v[k] = AL.clamp(v[k] + (on ? 0.012 : -0.004) + rng.range(-0.006, 0.006), 0.02, 0.98); }; nud('war', war > 0); nud('faith', temples > 0); nud('lore', libs > 0); nud('trade', markets > 0); nud('sea', ports > 0); nud('land', towns > 1); }
      if (rng.chance(0.045)) { if (C.drift(sim, c)) { const s = c.shifts[c.shifts.length - 1]; R.log(sim, 'language', 'The ' + c.name + ' now say "' + s[1] + '" where their elders said "' + s[0] + '"', c.ox, c.oy); } } }
    for (const kd of sim.kingdoms) { if (!kd.alive) continue; const cap = TW[kd.capital]; if (cap && cap.culture >= 0 && CU[cap.culture]) kd.culture = CU[cap.culture].values; }
    // religions: counts, loyalty, natural prophets, missions, schisms
    Fa.count(sim);
    for (const t of TW) { if (!t.alive) continue; if (t.religion >= 0) { t.loyalty = AL.clamp(t.loyalty + (Fa.m(sim, t.religion, 'loyal') - 1) * 12, 0, 100); const kd = sim.kingdoms[t.kingdom]; if (kd && kd.alive && kd.religion >= 0 && kd.religion !== t.religion) t.loyalty = Math.max(0, t.loyalty - 3); }
      if (t.religion < 0 && t.pop >= 12 && (t.count.temple || t.pop >= 30) && rng.chance(t.count.temple ? 0.3 : 0.06)) { const i = prophetIn(sim, t); if (i >= 0) Fa.found(sim, i, t, -1); }
      else if (t.religion >= 0 && t.pop >= 16) { const r = sim.religions[t.religion], age = (sim.tick - r.founded) / AL.YEAR;
        if (r.holy !== t.id && r.towns >= 2 && age > 12 && rng.chance(0.02)) { const i = prophetIn(sim, t); if (i >= 0) Fa.found(sim, i, t, r.id); }
        else { // missionaries walk to a nearby town of another faith
          for (const o of TW) { if (!o.alive || o === t || o.religion === t.religion || o.pop < 4) continue; const d = Math.hypot(o.cx - t.cx, o.cy - t.cy); if (d > 70 && o.kingdom !== t.kingdom) continue; if (!rng.chance(0.1 * Fa.m(sim, t.religion, 'convert'))) continue; let n = 0; for (let j = 0; j < E.hi && n < 3; j++) if (E.alive[j] && E.town[j] === o.id && !(E.flags[j] & F.DEAD) && E.religion[j] !== t.religion && rng.chance(0.3)) { E.religion[j] = t.religion; n++; } if (n && o.religion < 0) R.log(sim, 'mission', 'Preachers of ' + r.name + ' reach ' + o.name, o.cx, o.cy, r.id); break; } } } }
    Fa.count(sim); }
  // ------------------------------------------------------------ module
  AL.Sim.modules.push({
    name: 'culture',
    init(sim) { if (!AL.DOGMAS) { AL.DOGMAS = []; AL.DOGMA = {}; for (const k in AL.DATA.dogmas) { const d = AL.DATA.dogmas[k]; d.name = k; AL.DOGMAS[d.id] = d; AL.DOGMA[k] = d.id; } } sim.cultures = []; sim.religions = []; sim.legends = []; L.sim = sim; Fa.rebuild(sim); },
    tick(sim) { const tk = sim.tick; L.sim = sim; if (tk % AL.YEAR === AL.YEAR - 7) yearly(sim);
      // mending dogmas heal, joyful dogmas lift the mood (staggered over 64 ticks)
      if (sim.religions.length) { const E = sim.E, HT = Fa.tab.heal, MT = Fa.tab.mood, ph = tk & 63; for (let i = ph; i < E.hi; i += 64) { if (!E.alive[i]) continue; const r = E.religion[i]; if (r < 0 || r > 255) continue; const h = HT[r + 1]; if (h > 1 && E.hp[i] < E.hpMax[i]) E.hp[i] = Math.min(E.hpMax[i], E.hp[i] + (h - 1) * 1.5); const m = MT[r + 1]; if (m > 1 && E.mood[i] < 100) E.mood[i] = Math.min(100, E.mood[i] + (m - 1) * 3); } } },
    onTownFounded(sim, town, founder) { const E = sim.E, rng = sim.rng; L.sim = sim; let c = founder >= 0 && E.culture[founder] >= 0 ? sim.cultures[E.culture[founder]] : null;
      if (!c) c = C.create(sim, town.people, town, -1); else if (c.people === town.people && Math.hypot(town.cx - c.ox, town.cy - c.oy) > 60 && rng.chance(0.4)) c = C.create(sim, town.people, town, c.id);
      C.setTown(sim, town, c); if (founder >= 0) { E.culture[founder] = c.id; if (E.religion[founder] >= 0) town.religion = E.religion[founder]; } town.name = L.place(town.seed, town.people, c.id, sim.tick); },
    onProphet(sim, i, town) { L.sim = sim; const E = sim.E; if (town && E.culture[i] < 0) E.culture[i] = town.culture; Fa.found(sim, i, town, town && town.religion >= 0 ? town.religion : -1); },
    onDeath(sim, i, cause) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE || !(E.flags[i] & F.NOTABLE)) return; L.sim = sim; const n = notable(sim, i); n.died = R.year(sim); n.cause = cause; n.i = -1; sim.legends.push(n); if (sim.legends.length > 200) sim.legends.shift(); },
    query(sim, m) { L.sim = sim;
      if (m.q === 'cultures') return sim.cultures.map(c => ({ id: c.id, alive: c.alive, name: c.name, people: c.people, parent: c.parent, values: c.values, members: c.members, founded: 1 + Math.floor(c.founded / AL.YEAR), lang: c.lang, shifts: c.shifts.map(s => s[0] + '>' + s[1]) }));
      if (m.q === 'languages') return sim.cultures.map(c => ({ id: c.id, alive: c.alive, name: c.lang, family: AL.KINDS[c.people].lang, speakers: c.members, shifts: c.shifts.map(s => s[0] + '>' + s[1]), sample: [1, 2, 3, 4].map(k => L.word(Math.imul(c.seed ^ k, 2654435761) >>> 0, c.people, c.id, null, 2)) }));
      if (m.q === 'religions') return sim.religions.map(r => ({ id: r.id, alive: r.alive, name: r.name, founder: r.founder, founded: 1 + Math.floor(r.founded / AL.YEAR), parent: r.parent, dogmas: r.dogmas.map(d => AL.DOGMAS[d].name), followers: r.followers, towns: r.towns, holy: r.holy >= 0 && sim.towns[r.holy] ? sim.towns[r.holy].name : '' }));
      if (m.q === 'notables') { const E = sim.E, out = []; for (let i = 0; i < E.hi && out.length < 120; i++) if (E.alive[i] && (E.flags[i] & F.NOTABLE) && !(E.flags[i] & F.DEAD) && E.kind[i] < AL.NPEOPLE) out.push(notable(sim, i)); return { living: out, dead: sim.legends.slice(-(m.n || 80)) }; }
      if (m.q === 'history') { const e = AL.ERAS ? AL.ERAS[sim.era] : null; return { year: R.year(sim), era: e ? e.name : '', eraYear: 1 + Math.floor((sim.tick - (sim.eraStart || 0)) / AL.YEAR), entries: sim.chron.slice(-(m.n || 200)).map(c => ({ y: 1 + Math.floor(c.t / AL.YEAR), k: c.k, s: c.s, x: c.x, y2: c.y })) }; }
      if (m.q === 'name') return L.unitName(sim, m.i); },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
