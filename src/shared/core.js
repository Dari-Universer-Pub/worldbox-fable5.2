// AL core shared by the simulation and the client: constants, seeded RNG, hashing, noise, data lookups.
(function (AL) {
  'use strict';
  // Day and night last as long as each other (asked by Julien, so that night music is heard as much as day music). The rest of the game keeps
  // thinking in the former phase q, where the day ran from 0.04 to 0.72 and the night was shorter: AL.dayQ turns the real phase p of the day
  // (0..1) into q, the day being 0.04..0.54 of p and the night the other half. Simulation (sleep, evening, spirits) and lighting both use q.
  AL.dayQ = p => p < 0.04 ? 0.0144 + 0.64 * p : p < 0.54 ? 0.04 + (p - 0.04) * 1.36 : (0.72 + (p - 0.54) * 0.64) % 1;
  AL.TICK_HZ = 10; AL.DAY = 300; AL.YEAR = 1200; AL.TILE = 8; AL.SEA = 100;
  AL.SIZES = { small: 128, medium: 256, large: 384, giant: 512 };
  // xoshiro128** — every random number of the simulation comes from here
  function Rng(seed) { this.s = new Uint32Array(4); this.seed(seed); }
  Rng.prototype.seed = function (seed) { let z = (seed >>> 0) || 0x9e3779b9; for (let i = 0; i < 4; i++) { z = (z + 0x9e3779b9) >>> 0; let t = z; t = Math.imul(t ^ (t >>> 16), 0x85ebca6b); t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35); this.s[i] = (t ^ (t >>> 16)) >>> 0; } };
  Rng.prototype.u32 = function () { const s = this.s, r = Math.imul(((Math.imul(s[1], 5) << 7) | (Math.imul(s[1], 5) >>> 25)), 9) >>> 0, t = s[1] << 9; s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = (s[3] << 11) | (s[3] >>> 21); return r; };
  Rng.prototype.f = function () { return this.u32() / 4294967296; };
  Rng.prototype.int = function (n) { return (this.f() * n) | 0; };
  Rng.prototype.range = function (a, b) { return a + this.f() * (b - a); };
  Rng.prototype.chance = function (p) { return this.f() < p; };
  Rng.prototype.pick = function (arr) { return arr[(this.f() * arr.length) | 0]; };
  Rng.prototype.state = function () { return Array.from(this.s); };
  Rng.prototype.restore = function (a) { this.s.set(a); };
  AL.Rng = Rng;
  // texts for players: AL.t('key') in the current language (src/data/i18n.json), AL.tn(dataItem) for data with en/fr fields
  AL.lang = 'en';
  AL.t = function (key, fallback) { const T = AL.DATA && AL.DATA.i18n; if (!T) return fallback == null ? key : fallback; const v = (T[AL.lang] && T[AL.lang][key]); return v != null ? v : (T.en[key] != null ? T.en[key] : (fallback == null ? key : fallback)); };
  AL.tn = function (o) { return o ? (o[AL.lang] || o.en || o.name || '') : ''; };
  // {0}, {1}… in a template. An argument can name something to translate: '~key' (a text), '%e:id' (an age), '%d:1,2,3' (dogmas).
  AL.fmt = function (tpl, args, lang) {
    const T = AL.DATA && AL.DATA.i18n, nm = o => o ? (o[lang] || o.en || o.name || '') : '';
    const val = a => { a = String(a); if (a[0] === '~') { const k = a.slice(1), v = (T && ((T[lang] && T[lang][k]) || (T.en && T.en[k]))) || k; return k.startsWith('res.') ? v.charAt(0).toLowerCase() + v.slice(1) : v; } if (a.startsWith('%e:')) return nm(AL.ERAS ? AL.ERAS[+a.slice(3)] : (AL.DATA && AL.DATA.eras ? Object.values(AL.DATA.eras).find(q => q.id === +a.slice(3)) : null)); if (a.startsWith('%d:')) return a.slice(3).split(',').map(d => nm(AL.DOGMAS ? AL.DOGMAS[+d] : (AL.DATA && AL.DATA.dogmas ? Object.values(AL.DATA.dogmas).find(q => q.id === +d) : null))).join(', '); return a; };
    return String(tpl).replace(/\{(\d+)\}/g, (m, n) => args[+n] != null ? val(args[+n]) : '');
  };
  // text of a chronicle entry in the language now selected (older saves only have the English sentence)
  AL.logText = function (e) { if (!e.i) return e.s; const T = AL.DATA && AL.DATA.i18n, tpl = T && ((T[AL.lang] && T[AL.lang][e.i]) || (T.en && T.en[e.i])); return tpl ? AL.fmt(tpl, e.g ? String(e.g).split('\u0001') : [], AL.lang) : e.s; };
  AL.hash2 = function (x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  AL.strHash = function (str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
  // value noise + fbm (deterministic, seedable)
  const sm = t => t * t * (3 - 2 * t);
  AL.vnoise = function (x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi), h = AL.hash2, a = h(xi, yi, s), b = h(xi + 1, yi, s), c = h(xi, yi + 1, s), d = h(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
  AL.fbm = function (x, y, s, oct) { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < (oct || 4); i++) { v += AL.vnoise(x * f, y * f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; } return v / n; };
  AL.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  // data lookups built once: ground list by id, flora by id
  AL.initData = function () {
    const D = AL.DATA; if (D._ready) return; D._ready = true;
    AL.G = {}; AL.GROUND = []; for (const k in D.grounds) { const g = D.grounds[k]; g.name = k; AL.G[k] = g.id; AL.GROUND[g.id] = g; }
    AL.F = {}; AL.FLORA = []; for (const k in D.flora) { const f = D.flora[k]; f.name = k; AL.F[k] = f.id; AL.FLORA[f.id] = f; }
    AL.NG = AL.GROUND.length;
    AL.gCost = new Float32Array(AL.NG); AL.gWater = new Uint8Array(AL.NG); AL.gFert = new Float32Array(AL.NG); AL.gFlam = new Float32Array(AL.NG);
    AL.GROUND.forEach((g, i) => { AL.gCost[i] = g.cost; AL.gWater[i] = g.water; AL.gFert[i] = g.fert; AL.gFlam[i] = g.flam; });
    AL.fKind = new Uint8Array(64); AL.FLORA.forEach((f, i) => { if (f) AL.fKind[i] = { tree: 1, bush: 2, decor: 3, rock: 4, crop: 5 }[f.kind]; });
    AL.floraByBiome = AL.GROUND.map(g => ({ trees: AL.FLORA.filter(f => f && f.kind === 'tree' && f.biomes.includes(g.name)).map(f => f.id), small: AL.FLORA.filter(f => f && (f.kind === 'decor' || f.kind === 'bush') && f.biomes.includes(g.name)).map(f => f.id), rocks: AL.FLORA.filter(f => f && f.kind === 'rock' && f.biomes.includes(g.name)).map(f => f.id) }));
  };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
// ---- kinds (every living species: peoples, animals, monsters), resources, jobs, buildings, traits lookups
(function (AL) {
  'use strict';
  const base = AL.initData;
  AL.initData = function () {
    const D = AL.DATA; if (D._ready) return; base();
    AL.KINDS = []; AL.K = {};
    const add = (name, cls, d) => { d.name = name; d.cls = cls; d.kid = AL.KINDS.length; AL.K[name] = d.kid; AL.KINDS.push(d); };
    for (const k in D.peoples) add(k, 0, D.peoples[k]);
    AL.NPEOPLE = AL.KINDS.length;
    if (D.animals) for (const k in D.animals) add(k, 1, D.animals[k]);
    if (D.monsters) for (const k in D.monsters) add(k, 2, D.monsters[k]);
    AL.RES = {}; AL.RESN = []; for (const k in D.resources) { AL.RES[k] = D.resources[k].id; AL.RESN[D.resources[k].id] = k; } AL.NRES = AL.RESN.length;
    AL.JOB = {}; AL.JOBS = []; for (const k in D.jobs) { const j = D.jobs[k]; j.name = k; AL.JOB[k] = j.id; AL.JOBS[j.id] = j; }
    AL.BT = {}; AL.BTYPES = []; for (const k in D.buildings) { const b = D.buildings[k]; b.name = k; AL.BT[k] = b.id; AL.BTYPES[b.id] = b; }
    AL.TRAIT = {}; AL.TRAITS = []; for (const k in D.traits) { const t = D.traits[k]; t.name = k; AL.TRAIT[k] = t.id; AL.TRAITS[t.id] = t; }
    AL.LOOKS = ['villager', 'lumberjack', 'miner', 'farmer', 'builder', 'hunter', 'fisher', 'herder', 'blacksmith', 'merchant', 'soldier', 'archer', 'knight', 'priest', 'scholar', 'ruler', 'child', 'elder', 'warden', 'delver', 'sporer', 'diver', 'healer', 'engineer', 'hero', 'champion', 'refugee', 'warrior', 'halberdier', 'rider', 'envoy', 'reaver'];
    AL.LOOK = {}; AL.LOOKS.forEach((l, i) => AL.LOOK[l] = i);
    AL.ANIM = { idle: 0, walk: 1, work: 2, attack: 3, hit: 4, pray: 5, joy: 6, death: 7, sleep: 8, run: 9, eat: 10, fly: 11, swim: 12, special: 13, inside: 14 };
    AL.ANIMN = Object.keys(AL.ANIM);
  };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
