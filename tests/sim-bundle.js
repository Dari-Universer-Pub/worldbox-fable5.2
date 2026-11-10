(function(AL){AL.DATA={"flora":{"oak":{"id":1,"kind":"tree","sprite":"tree/oak","biomes":["grass","forest","hills"],"wood":6,"grow":0.5,"lod":["forest",3]},"birch":{"id":2,"kind":"tree","sprite":"tree/birch","biomes":["hills","grass","forest"],"wood":4,"grow":0.7,"lod":["grass",3]},"pine":{"id":3,"kind":"tree","sprite":"tree/pine","biomes":["forest","tundra","hills"],"wood":6,"grow":0.4,"lod":["forest",2]},"snowpine":{"id":4,"kind":"tree","sprite":"tree/snowpine","biomes":["snow"],"wood":5,"grow":0.3,"lod":["forest",3]},"palm":{"id":5,"kind":"tree","sprite":"tree/palm","biomes":["sand","desert"],"wood":3,"grow":0.5,"lod":["jungle",3]},"jungletree":{"id":6,"kind":"tree","sprite":"tree/jungle","biomes":["jungle"],"wood":8,"grow":0.8,"lod":["jungle",2]},"acacia":{"id":7,"kind":"tree","sprite":"tree/acacia","biomes":["savanna"],"wood":4,"grow":0.4,"lod":["swamp",3]},"willow":{"id":8,"kind":"tree","sprite":"tree/willow","biomes":["swamp"],"wood":5,"grow":0.5,"lod":["swamp",2]},"deadtree":{"id":9,"kind":"tree","sprite":"tree/dead","biomes":["tundra","volcanic"],"wood":2,"grow":0.1,"lod":["stone",2]},"cactus":{"id":10,"kind":"tree","sprite":"tree/cactus","biomes":["desert"],"wood":1,"grow":0.2,"lod":["jungle",2]},"bush":{"id":11,"kind":"bush","sprite":"bush","biomes":["grass","forest","hills","savanna"],"grow":0.6},"berry":{"id":12,"kind":"bush","sprite":"berry","biomes":["grass","forest","hills"],"food":3,"grow":0.5},"grasstuft":{"id":13,"kind":"decor","sprite":"grasstuft","biomes":["grass","savanna","hills","forest"],"grow":1,"graze":1},"reeds":{"id":14,"kind":"decor","sprite":"reeds","biomes":["swamp"],"grow":0.8},"flower_red":{"id":15,"kind":"decor","sprite":"flower_red","biomes":["grass","hills"],"grow":0.6},"flower_gold":{"id":16,"kind":"decor","sprite":"flower_gold","biomes":["grass","savanna"],"grow":0.6},"flower_blue":{"id":17,"kind":"decor","sprite":"flower_blue","biomes":["forest","tundra"],"grow":0.5},"flower_pink":{"id":18,"kind":"decor","sprite":"flower_pink","biomes":["jungle","grass"],"grow":0.6},"mushroom":{"id":19,"kind":"decor","sprite":"mushroom","biomes":["forest","swamp"],"food":1,"grow":0.4},"glowcap":{"id":20,"kind":"decor","sprite":"glowcap","biomes":["swamp","jungle"],"grow":0.2,"light":1},"rock":{"id":21,"kind":"rock","sprite":"rock","biomes":["hills","tundra","volcanic","desert","savanna"],"stone":8},"ore_copper":{"id":22,"kind":"rock","sprite":"ore_copper","biomes":["hills","savanna"],"ore":"copper","stone":4},"ore_iron":{"id":23,"kind":"rock","sprite":"ore_iron","biomes":["hills","tundra"],"ore":"iron","stone":4},"ore_gold":{"id":24,"kind":"rock","sprite":"ore_gold","biomes":["hills","desert"],"ore":"gold","stone":4},"ore_aether":{"id":25,"kind":"rock","sprite":"ore_aether","biomes":["volcanic","snow"],"ore":"aetherite","stone":4},"stump":{"id":26,"kind":"decor","sprite":"stump","biomes":[]},"bones":{"id":27,"kind":"decor","sprite":"bones","biomes":["desert"]},"ember":{"id":28,"kind":"decor","sprite":"ember","biomes":[],"light":1},"wheat":{"id":29,"kind":"crop","sprite":"wheat","biomes":[],"food":4,"grow":1},"peak":{"id":30,"kind":"rock","sprite":"peak","biomes":[],"stone":30,"lod":["stone",4]},"snowpeak":{"id":31,"kind":"rock","sprite":"snowpeak","biomes":[],"stone":30,"lod":["ice",5]}},"grounds":{"deep":{"id":0,"rank":0,"cost":0,"water":2,"flat":["water",1],"fert":0,"flam":0,"biome":"ocean"},"shallow":{"id":1,"rank":1,"cost":0,"water":1,"flat":["water",3],"fert":0,"flam":0,"biome":"coast"},"lava":{"id":2,"rank":2,"cost":0,"water":0,"flat":["fire",2],"fert":0,"flam":0,"biome":"volcanic","emissive":true},"sand":{"id":3,"rank":3,"cost":1.2,"water":0,"flat":["sand",5],"fert":0.1,"flam":0,"biome":"beach"},"soil":{"id":4,"rank":4,"cost":1,"water":0,"flat":["sand",2],"fert":1,"flam":0.1,"biome":"plains"},"road":{"id":5,"rank":5,"cost":0.6,"water":0,"flat":["sand",3],"fert":0,"flam":0,"biome":"plains"},"desert":{"id":6,"rank":6,"cost":1.3,"water":0,"flat":["sand",4],"fert":0.05,"flam":0,"biome":"desert"},"savanna":{"id":7,"rank":7,"cost":1,"water":0,"flat":["sand",3],"fert":0.5,"flam":0.7,"biome":"savanna"},"grass":{"id":8,"rank":8,"cost":1,"water":0,"flat":["grass",4],"fert":1,"flam":0.4,"biome":"plains"},"swamp":{"id":9,"rank":9,"cost":1.8,"water":0,"flat":["swamp",4],"fert":0.4,"flam":0.1,"biome":"swamp"},"forest":{"id":10,"rank":10,"cost":1.2,"water":0,"flat":["grass",3],"fert":0.8,"flam":0.6,"biome":"forest"},"jungle":{"id":11,"rank":11,"cost":1.5,"water":0,"flat":["jungle",3],"fert":0.9,"flam":0.3,"biome":"jungle"},"tundra":{"id":12,"rank":12,"cost":1.2,"water":0,"flat":["stone",4],"fert":0.2,"flam":0.1,"biome":"tundra"},"hills":{"id":13,"rank":13,"cost":1.7,"water":0,"flat":["grass",3],"fert":0.5,"flam":0.3,"biome":"hills"},"mountain":{"id":14,"rank":14,"cost":0,"water":0,"flat":["stone",4],"fert":0,"flam":0,"biome":"mountains"},"volcanic":{"id":15,"rank":15,"cost":1.4,"water":0,"flat":["stone",3],"fert":0.3,"flam":0,"biome":"volcanic"},"snow":{"id":16,"rank":16,"cost":1.6,"water":0,"flat":["ice",5],"fert":0,"flam":0,"biome":"snow"},"ice":{"id":17,"rank":17,"cost":1.4,"water":0,"flat":["ice",3],"fert":0,"flam":0,"biome":"ice"}},"keys":{"panLeft":{"codes":["KeyA","ArrowLeft"],"group":"camera"},"panRight":{"codes":["KeyD","ArrowRight"],"group":"camera"},"panUp":{"codes":["KeyW","ArrowUp"],"group":"camera"},"panDown":{"codes":["KeyS","ArrowDown"],"group":"camera"},"zoomIn":{"codes":["KeyE","NumpadAdd"],"group":"camera"},"zoomOut":{"codes":["KeyQ","NumpadSubtract"],"group":"camera"},"pause":{"codes":["Space"],"group":"time"},"slower":{"codes":["Comma"],"group":"time"},"faster":{"codes":["Period"],"group":"time"},"cancel":{"codes":["Escape"],"group":"ui"},"brushSmaller":{"codes":["BracketLeft"],"group":"tools"},"brushBigger":{"codes":["BracketRight"],"group":"tools"},"brushShape":{"codes":["KeyB"],"group":"tools"},"cat1":{"codes":["Digit1"],"group":"tools"},"cat2":{"codes":["Digit2"],"group":"tools"},"cat3":{"codes":["Digit3"],"group":"tools"},"cat4":{"codes":["Digit4"],"group":"tools"},"cat5":{"codes":["Digit5"],"group":"tools"},"cat6":{"codes":["Digit6"],"group":"tools"},"cat7":{"codes":["Digit7"],"group":"tools"},"nextPower":{"codes":["Tab"],"group":"tools"},"prevPower":{"codes":["Backquote"],"group":"tools"},"layerNext":{"codes":["KeyL"],"group":"view"},"minimap":{"codes":["KeyM"],"group":"view"},"cinema":{"codes":["KeyC"],"group":"view"},"follow":{"codes":["KeyF"],"group":"view"},"history":{"codes":["KeyH"],"group":"windows"},"kingdoms":{"codes":["KeyK"],"group":"windows"},"stats":{"codes":["KeyG"],"group":"windows"},"options":{"codes":["KeyO"],"group":"windows"},"saves":{"codes":["F5"],"group":"windows"},"fullscreen":{"codes":["F11"],"group":"ui"},"debug":{"codes":["F3"],"group":"ui"}},"music":{"instruments":{"lute":{"vol":0.9,"rev":0.25,"layers":[{"t":"pluck","g":0.55,"bright":0.55,"decay":0.994,"a":0.002,"sustained":true,"s":1,"r":0.5}]},"flute":{"vol":0.6,"rev":0.35,"layers":[{"t":"osc","w":"sine","g":0.4,"a":0.06,"d":0.2,"s":0.85,"sustained":true,"r":0.12,"vib":[5.2,0.006,0.25]},{"t":"osc","w":"triangle","ratio":2,"g":0.07,"a":0.08,"s":0.8,"sustained":true,"r":0.1},{"t":"noise","g":0.05,"a":0.02,"d":0.1,"s":0.4,"sustained":true,"r":0.08,"flt":["bandpass",2400,1.5],"fltTrack":false}]},"pad":{"vol":0.45,"rev":0.5,"layers":[{"t":"osc","w":"sawtooth","g":0.12,"a":0.5,"s":1,"sustained":true,"r":0.9,"detune":-7,"flt":["lowpass",900,0.6]},{"t":"osc","w":"sawtooth","g":0.12,"a":0.5,"s":1,"sustained":true,"r":0.9,"detune":8,"flt":["lowpass",900,0.6]},{"t":"osc","w":"sine","ratio":0.5,"g":0.12,"a":0.4,"s":1,"sustained":true,"r":0.8}]},"bass":{"vol":0.8,"layers":[{"t":"osc","w":"triangle","g":0.45,"a":0.01,"d":0.25,"s":0.7,"sustained":true,"r":0.12,"flt":["lowpass",500,0.7]}]},"bell":{"vol":0.5,"rev":0.5,"layers":[{"t":"osc","w":"sine","g":0.3,"a":0.002,"d":1.4,"dur":1.4,"r":0.4,"fm":[3.51,2.2,0.5,0.02]},{"t":"osc","w":"sine","ratio":2.76,"g":0.06,"a":0.002,"d":0.6,"dur":0.6,"r":0.2}]},"drum":{"vol":0.9,"layers":[{"t":"osc","w":"sine","f":[150,55,0.12],"g":0.7,"a":0.002,"d":0.2,"dur":0.2,"r":0.1},{"t":"noise","g":0.12,"a":0.001,"d":0.03,"dur":0.03,"r":0.03,"flt":["lowpass",1800,0.7]}]},"shaker":{"vol":0.35,"layers":[{"t":"noise","g":0.3,"a":0.004,"d":0.05,"dur":0.05,"r":0.04,"flt":["highpass",5000,0.8]}]}},"tracks":{"test":{"bpm":84,"form":["A"],"tracks":[{"inst":"lute","layer":"base","vel":0.6,"parts":{"A":"a2/4 e3/4 a3/4 e3/4 f2/4 c3/4 f3/4 c3/4"}},{"inst":"flute","layer":"melody","vel":0.5,"parts":{"A":"e5/6 d5/2 c5/4 a4/4 -/2 c5/6 a4/4 -/4"}}]}}},"sounds":{"ui_click":{"cat":"ui","bus":"ui","expect":{"dur":[0.02,0.2],"centroid":[800,6000]},"pitchVar":0.02,"layers":[{"t":"osc","w":"triangle","f":[1400,900,0.04],"g":0.35,"a":0.002,"d":0.05,"dur":0.05,"r":0.03},{"t":"noise","g":0.08,"a":0.001,"d":0.015,"dur":0.015,"r":0.01,"flt":["highpass",3000,0.7]}]},"chop":{"cat":"work","expect":{"dur":[0.05,0.4],"centroid":[300,5000]},"variants":[[{"t":"noise","g":0.5,"a":0.001,"d":0.05,"dur":0.05,"r":0.04,"flt":["bandpass",1800,1.2]},{"t":"osc","w":"triangle","f":[220,110,0.08],"g":0.5,"a":0.001,"d":0.09,"dur":0.09,"r":0.05}],[{"t":"noise","g":0.5,"a":0.001,"d":0.04,"dur":0.04,"r":0.05,"flt":["bandpass",2300,1.4]},{"t":"osc","w":"triangle","f":[260,120,0.07],"g":0.45,"a":0.001,"d":0.08,"dur":0.08,"r":0.05}]]},"thunder":{"cat":"disaster","pitchVar":0.12,"expect":{"dur":[1,4],"centroid":[40,900]},"layers":[{"t":"noise","nc":"brown","g":0.9,"a":0.01,"d":1.6,"dur":1.8,"r":0.9,"flt":["lowpass",900,0.5,[[1.8,120]]],"rev":0.5},{"t":"noise","g":0.35,"a":0.001,"d":0.12,"dur":0.12,"r":0.1,"flt":["highpass",1500,0.5]},{"t":"osc","w":"sine","f":[70,38,1.5],"g":0.6,"a":0.01,"d":1.2,"dur":1.4,"r":0.6}]}}};})(typeof self!=="undefined"?(self.AL=self.AL||{}):(globalThis.AL=globalThis.AL||{}));
// AL core shared by the simulation and the client: constants, seeded RNG, hashing, noise, data lookups.
(function (AL) {
  'use strict';
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

// AL.World — tile map state, procedural generation, brushes and tile systems (flooding, lava, growth).
(function (AL) {
  'use strict';
  const SEA = AL.SEA;
  function World(n) {
    this.n = n; const N = n * n;
    this.ground = new Uint8Array(N); this.height = new Uint8Array(N); this.feature = new Uint8Array(N); this.fgrow = new Uint8Array(N);
    this.fire = new Uint8Array(N); this.owner = new Uint16Array(N); this.road = new Uint8Array(N); this.flags = new Uint8Array(N); // flags: 1 river, 2 building, 4 scorched, 8 farmland
    this.region = new Uint16Array(N); this.temp = new Uint8Array(N); this.moist = new Uint8Array(N);
    this.dirty = { x0: n, y0: n, x1: -1, y1: -1 }; this.regionsDirty = true; this.slice = 0;
  }
  World.LAYERS = ['ground', 'height', 'feature', 'fgrow', 'fire', 'owner', 'road', 'flags', 'temp', 'moist'];
  const P = World.prototype;
  P.mark = function (x, y) { const d = this.dirty; if (x < d.x0) d.x0 = x; if (y < d.y0) d.y0 = y; if (x > d.x1) d.x1 = x; if (y > d.y1) d.y1 = y; };
  P.markAll = function () { this.dirty = { x0: 0, y0: 0, x1: this.n - 1, y1: this.n - 1 }; };
  P.inb = function (x, y) { return x >= 0 && y >= 0 && x < this.n && y < this.n; };
  P.walk = function (i) { return AL.gCost[this.ground[i]] > 0; };
  // the natural land ground for a tile from its climate and height (used by generation, raising land, regrowth)
  P.natural = function (i) {
    const G = AL.G, h = this.height[i], t = this.temp[i] / 255, m = this.moist[i] / 255;
    if (h < SEA - 14) return G.deep; if (h < SEA) return t < 0.1 ? G.ice : G.shallow;
    if (h >= 205) return t < 0.62 ? G.snow : G.mountain; if (h >= 178) return G.mountain;
    if (t < 0.13) return G.snow; if (t < 0.26) return m > 0.55 && h < 150 ? G.snow : G.tundra;
    if (h >= 158) return G.hills;
    if (h < SEA + 4 && t > 0.2) return m > 0.8 && t < 0.75 ? G.swamp : G.sand;
    if (t > 0.66) return m < 0.3 ? G.desert : m < 0.5 ? G.savanna : G.jungle;
    if (t > 0.56 && m < 0.3) return G.savanna;
    if (m > 0.8 && h < SEA + 14) return G.swamp; if (m > 0.56) return G.forest; return G.grass;
  };
  // ------------------------------------------------------------------ generation
  World.generate = function (cfg) {
    const n = AL.SIZES[cfg.size] || cfg.size || 256, W = new World(n), N = n * n, seed = (cfg.seed >>> 0) || 1, rng = new AL.Rng(seed), G = AL.G;
    W.cfg = { size: n, seed, water: cfg.water == null ? 0.5 : cfg.water, continents: cfg.continents || 3, climate: cfg.climate || 'temperate', empty: !!cfg.empty };
    const waterShare = AL.clamp(W.cfg.water, 0.05, 0.9), sc = 256 / n;
    if (cfg.empty) { for (let i = 0; i < N; i++) { W.height[i] = SEA - 30; W.ground[i] = G.deep; W.temp[i] = 140; W.moist[i] = 128; } W.markAll(); return W; }
    // 1. continents: blobs around k centres, domain-warped noise
    const k = W.cfg.continents, cs = []; for (let i = 0; i < k; i++) { let bx = 0, by = 0, bd = -1; for (let t = 0; t < 12; t++) { const x = rng.range(0.16, 0.84), y = rng.range(0.16, 0.84); let d = 9; for (const c of cs) d = Math.min(d, Math.hypot(c[0] - x, c[1] - y)); if (d > bd) { bd = d; bx = x; by = y; } } cs.push([bx, by, rng.range(0.75, 1.2) * (0.62 / Math.sqrt(k))]); }
    const e = new Float32Array(N);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const u = x / n, v = y / n, wx = u + (AL.fbm(u * 3.1, v * 3.1, seed + 5, 3) - 0.5) * 0.28, wy = v + (AL.fbm(u * 3.1 + 9, v * 3.1 + 4, seed + 6, 3) - 0.5) * 0.28;
      let c = 0; for (const p of cs) { const d = Math.hypot(wx - p[0], wy - p[1]) / p[2]; c = Math.max(c, 1 - d * d); }
      const edge = Math.min(u, v, 1 - u, 1 - v), nz = AL.fbm(u * 6, v * 6, seed + 1, 5), ridge = 1 - Math.abs(AL.fbm(u * 4.5, v * 4.5, seed + 2, 4) - 0.5) * 2;
      e[y * n + x] = Math.max(c, -0.6) * 0.55 + nz * 0.5 + Math.pow(ridge, 3) * 0.22 * Math.max(0, c + 0.2) - (edge < 0.06 ? (0.06 - edge) * 9 : 0); }
    // 2. sea level by quantile -> exact water share; heights 0..255 with SEA at the shoreline
    const sorted = Float32Array.from(e).sort(), sea = sorted[Math.min(N - 1, Math.floor(N * waterShare))], lo = sorted[0], hi = sorted[N - 1];
    for (let i = 0; i < N; i++) { const v = e[i]; W.height[i] = v < sea ? Math.max(0, Math.round(SEA - 1 - (sea - v) / (sea - lo + 1e-6) * 99)) : Math.min(255, Math.round(SEA + Math.pow((v - sea) / (hi - sea + 1e-6), 1.35) * 155)); }
    // 3. distance to water (BFS) for moisture and beaches
    const dist = new Uint8Array(N).fill(255), q = new Int32Array(N); let qh = 0, qt = 0;
    for (let i = 0; i < N; i++) if (W.height[i] < SEA) { dist[i] = 0; q[qt++] = i; }
    while (qh < qt) { const i = q[qh++], x = i % n, y = (i / n) | 0, d = dist[i] + 1; if (d > 60) continue;
      if (x > 0 && dist[i - 1] > d) { dist[i - 1] = d; q[qt++] = i - 1; } if (x < n - 1 && dist[i + 1] > d) { dist[i + 1] = d; q[qt++] = i + 1; } if (y > 0 && dist[i - n] > d) { dist[i - n] = d; q[qt++] = i - n; } if (y < n - 1 && dist[i + n] > d) { dist[i + n] = d; q[qt++] = i + n; } }
    // 4. climate
    const cl = W.cfg.climate, tBase = cl === 'cold' ? -0.22 : cl === 'hot' ? 0.24 : 0, flat = cl === 'mixed';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, u = x / n, v = y / n, lat = 1 - Math.abs(v - 0.5) * 2;
      let t = (flat ? (AL.fbm(u * 2.2, v * 2.2, seed + 40, 3) - 0.5) * 2.4 + 0.5 : 0.16 + lat * 0.62) + tBase + (AL.fbm(u * 3.2, v * 3.2, seed + 41, 4) - 0.5) * 0.95 - Math.max(0, W.height[i] - SEA - 40) / 255 * 0.6;
      let m = (AL.fbm(u * 3.6 + 7, v * 3.6 + 3, seed + 42, 4) - 0.5) * 2.1 + 0.5 + Math.max(0, 0.16 - dist[i] * 0.01 * sc);
      W.temp[i] = AL.clamp(t, 0, 1) * 255; W.moist[i] = AL.clamp(m, 0, 1) * 255; }
    // 5. rivers: steepest descent from high sources, carving a bed
    const nr = Math.round(n / 14 * (1 - waterShare) * 2);
    for (let r = 0, tries = 0; r < nr && tries < nr * 30; tries++) { let x = rng.int(n), y = rng.int(n), i = y * n + x; if (W.height[i] < 165 || W.height[i] > 225 || W.temp[i] < 50) continue; r++;
      let h = W.height[i], len = 0; const path = [];
      while (len++ < n * 2) { path.push(i); if (W.height[i] < SEA || (W.flags[i] & 1)) break; let bi = -1, bh = 1e9;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= n - 1 || Y >= n - 1) continue; const j = Y * n + X; if (path.includes(j, Math.max(0, path.length - 40))) continue; const hh = W.height[j] + AL.hash2(X, Y, seed + r) * 5; if (hh < bh) { bh = hh; bi = j; } }
        if (bi < 0) break; i = bi; x = i % n; y = (i / n) | 0; h = Math.min(h, W.height[i]); W.height[i] = Math.max(SEA - 2, Math.min(W.height[i], h)); }
      if (path.length > 12 && W.height[i] < SEA + 0 || (W.flags[i] & 1)) for (let p = 0; p < path.length; p++) { const j = path[p]; W.flags[j] |= 1; if (p > path.length * 0.25 && (j % n) < n - 1) W.flags[j + 1] |= 1; if (p > path.length * 0.6 && j + n < N) { W.flags[j + n] |= 1; if ((j % n) < n - 1) W.flags[j + n + 1] |= 1; } } }
    // 6. grounds
    for (let i = 0; i < N; i++) { let g = W.natural(i); if ((W.flags[i] & 1) && W.height[i] >= SEA) { g = W.temp[i] < 26 ? G.ice : G.shallow; W.height[i] = Math.min(W.height[i], 250); } else W.flags[i] &= ~1;
      if (g === G.sand && dist[i] > 2) g = W.natural2(i); W.ground[i] = g; }
    // beaches along warm coasts
    for (let i = 0; i < N; i++) { const g = W.ground[i]; if (dist[i] === 1 && W.temp[i] > 70 && W.height[i] < 140 && (g === G.grass || g === G.forest || g === G.savanna || g === G.jungle || g === G.desert) && AL.fbm((i % n) * 0.09, ((i / n) | 0) * 0.09, seed + 50, 2) > 0.38) W.ground[i] = G.sand; }
    // 7. smoothing: a tile surrounded by >= 6 tiles of another single land ground adopts it (removes speckles, softens borders)
    const cnt = new Uint8Array(AL.NG);
    for (let pass = 0; pass < 2; pass++) for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) { const i = y * n + x, g = W.ground[i]; if (W.flags[i] & 1) continue; cnt.fill(0); let best = g, bc = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const o = W.ground[i + dy * n + dx]; if (++cnt[o] > bc) { bc = cnt[o]; best = o; } }
      if (best !== g && bc >= 6 && (AL.gWater[best] > 0) === (AL.gWater[g] > 0)) W.ground[i] = best; }
    // 8. volcanoes
    const nv = Math.max(1, Math.round(n / 160)); for (let v = 0, tries = 0; v < nv && tries < 4000; tries++) { const x = rng.int(n - 20) + 10, y = rng.int(n - 20) + 10, i = y * n + x; if (W.ground[i] !== G.mountain && W.ground[i] !== G.hills) continue; v++; const R = 4 + rng.int(4);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const d = Math.hypot(dx, dy) + (AL.hash2(x + dx, y + dy, seed) - 0.5) * 1.6; if (d > R) continue; const j = (y + dy) * n + x + dx; if (AL.gWater[W.ground[j]]) continue; W.ground[j] = d < 1.6 ? G.lava : G.volcanic; W.height[j] = Math.max(W.height[j], 200 - d * 6) | 0; } }
    // 9. flora
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, g = W.ground[i], fb = AL.floraByBiome[g]; if (!AL.gCost[g] && g !== G.mountain) continue;
      const dens = AL.fbm(x * 0.11, y * 0.11, seed + 60, 3), r = AL.hash2(x, y, seed + 61);
      const treeP = g === G.forest ? 0.55 : g === G.jungle ? 0.6 : g === G.swamp ? 0.22 : g === G.grass ? (dens > 0.62 ? 0.3 : 0.025) : g === G.hills ? 0.1 : g === G.snow ? 0.08 : g === G.tundra ? 0.05 : g === G.savanna ? 0.022 : g === G.desert ? 0.012 : g === G.sand ? 0.02 : g === G.volcanic ? 0.03 : 0;
      if (fb.trees.length && r < treeP * (0.5 + dens)) { W.feature[i] = fb.trees[(AL.hash2(x >> 3, y >> 3, seed + 62) * fb.trees.length * 0.999 + (AL.hash2(x, y, seed + 63) < 0.2 ? 1 : 0)) % fb.trees.length | 0]; W.fgrow[i] = 120 + AL.hash2(x, y, seed + 64) * 135; }
      else if (fb.rocks.length && r > 0.975 - (g === G.hills ? 0.03 : 0)) { W.feature[i] = fb.rocks[(AL.hash2(x, y, seed + 65) * fb.rocks.length) | 0]; W.fgrow[i] = 255; }
      else if (fb.small.length && r > 0.72 && r < 0.72 + (g === G.grass ? 0.14 : 0.08)) { W.feature[i] = fb.small[(AL.hash2(x, y, seed + 66) * fb.small.length) | 0]; W.fgrow[i] = 255; }
      else if ((g === G.mountain || (g === G.snow && W.height[i] >= 200)) && AL.hash2(x >> 1, y >> 1, seed + 69) < 0.4 && ((x + (y >> 1)) & 1) === 0 && (y & 1) === 0) { W.feature[i] = g === G.snow || W.height[i] > 215 ? AL.F.snowpeak : AL.F.peak; W.fgrow[i] = 255; }
      else if (g === G.mountain && r > 0.975) { W.feature[i] = AL.hash2(x, y, seed + 67) < 0.5 ? AL.F.rock : [AL.F.ore_copper, AL.F.ore_iron, AL.F.ore_iron, AL.F.ore_gold][(AL.hash2(x, y, seed + 68) * 4) | 0]; W.fgrow[i] = 255; } }
    W.markAll(); return W;
  };
  // natural ground ignoring the beach rule
  P.natural2 = function (i) { const G = AL.G, t = this.temp[i] / 255, m = this.moist[i] / 255; if (t > 0.66) return m < 0.3 ? G.desert : m < 0.5 ? G.savanna : G.jungle; if (t > 0.56 && m < 0.3) return G.savanna; return m > 0.56 ? G.forest : G.grass; };
  // ------------------------------------------------------------------ regions (connected walkable components)
  P.computeRegions = function () {
    const n = this.n, N = n * n, reg = this.region, q = this._q || (this._q = new Int32Array(N)); reg.fill(0); let id = 0; this.regionSize = [0];
    for (let s = 0; s < N; s++) { if (reg[s] || !this.walk(s)) continue; id++; let qh = 0, qt = 0, c = 0; q[qt++] = s; reg[s] = id;
      while (qh < qt) { const i = q[qh++], x = i % n; c++; if (x > 0 && !reg[i - 1] && this.walk(i - 1)) { reg[i - 1] = id; q[qt++] = i - 1; } if (x < n - 1 && !reg[i + 1] && this.walk(i + 1)) { reg[i + 1] = id; q[qt++] = i + 1; } if (i >= n && !reg[i - n] && this.walk(i - n)) { reg[i - n] = id; q[qt++] = i - n; } if (i < N - n && !reg[i + n] && this.walk(i + n)) { reg[i + n] = id; q[qt++] = i + n; } }
      this.regionSize.push(c); if (id >= 65534) break; }
    this.regionsDirty = false; this.regionVersion = (this.regionVersion || 0) + 1;
  };
  // ------------------------------------------------------------------ brushes
  // op: {tool, x, y, x0, y0, size, shape:'round'|'square', ground, strength}. Applies along the segment (x0,y0)-(x,y).
  P.brush = function (op, sim) {
    const n = this.n, r = Math.max(0, (op.size || 1) - 1) / 2, x0 = op.x0 == null ? op.x : op.x0, y0 = op.y0 == null ? op.y : op.y0, steps = Math.max(1, Math.ceil(Math.hypot(op.x - x0, op.y - y0)));
    const seen = this._seen || (this._seen = new Uint32Array(n * n)); const stamp = this._stamp = (this._stamp || 0) + 1; let changed = 0;
    for (let s = 0; s <= steps; s++) { const cx = x0 + (op.x - x0) * s / steps, cy = y0 + (op.y - y0) * s / steps;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { if (!this.inb(x, y)) continue; const dx = x - cx, dy = y - cy;
        if (op.shape === 'square' ? Math.max(Math.abs(dx), Math.abs(dy)) > r + 0.5 : dx * dx + dy * dy > (r + 0.5) * (r + 0.5)) continue; const i = y * n + x; if (seen[i] === stamp) continue; seen[i] = stamp;
        this.apply(op, i, x, y, sim); changed++; } }
    return changed;
  };
  P.setGround = function (i, g) { if (this.ground[i] === g) return; const was = AL.gCost[this.ground[i]] > 0, now = AL.gCost[g] > 0; this.ground[i] = g; if (was !== now) this.regionsDirty = true; this.mark(i % this.n, (i / this.n) | 0);
    const f = this.feature[i]; if (f && (AL.gWater[g] || g === AL.G.lava)) { this.feature[i] = 0; } if (AL.gWater[g] || g === AL.G.lava) { this.road[i] = 0; this.flags[i] &= ~8; } };
  P.apply = function (op, i, x, y, sim) {
    const G = AL.G, t = op.tool;
    if (t === 'raise' || t === 'lower' || t === 'dig') { const d = (op.strength || 10) * (t === 'raise' ? 1 : t === 'dig' ? -2.5 : -1), h = AL.clamp(this.height[i] + d, 0, 255) | 0; this.height[i] = h; if (t !== 'raise') this.flags[i] &= ~1; this.setGround(i, this.natural(i)); this.mark(x, y); }
    else if (t === 'ground') { const g = op.ground; this.setGround(i, g); const gw = AL.gWater[g];
      // keep heights coherent with the painted ground so that later raise/lower behave
      if (gw === 2) this.height[i] = Math.min(this.height[i], SEA - 20); else if (gw === 1) this.height[i] = AL.clamp(this.height[i], SEA - 10, SEA - 1); else if (this.height[i] < SEA) this.height[i] = SEA + 6;
      if (g === G.mountain) this.height[i] = Math.max(this.height[i], 185); else if (g === G.hills) this.height[i] = AL.clamp(this.height[i], 160, 176); else if (!gw && g !== G.snow && g !== G.volcanic && g !== G.lava && this.height[i] > 157) this.height[i] = 150; this.flags[i] &= ~1; }
    else if (t === 'river') { this.setGround(i, G.shallow); this.flags[i] |= 1; this.height[i] = Math.max(this.height[i], SEA); }
    else if (t === 'grass') { if (!AL.gWater[this.ground[i]] && this.ground[i] !== G.lava) { this.setGround(i, G.grass); if (this.height[i] > 157) this.height[i] = 150; if (!this.feature[i] && AL.hash2(x, y, this._stamp) < 0.15) { this.feature[i] = AL.F.grasstuft; this.fgrow[i] = 255; } } }
    else if (t === 'forest') { const g = this.ground[i], fb = AL.floraByBiome[g]; if (fb.trees.length && !(this.flags[i] & 2) && AL.hash2(x, y, this._stamp) < 0.6) { this.feature[i] = fb.trees[(AL.hash2(x, y, this._stamp + 1) * fb.trees.length) | 0]; this.fgrow[i] = 40 + AL.hash2(x, y, 9) * 200; this.mark(x, y); } }
    else if (t === 'lava') { this.setGround(i, G.lava); this.height[i] = Math.max(this.height[i], SEA + 4); }
    else if (t === 'erase') { if (this.feature[i]) { this.feature[i] = 0; this.mark(x, y); } this.fire[i] = 0; }
    else if (t === 'feature') { if (!AL.gWater[this.ground[i]]) { this.feature[i] = op.feature; this.fgrow[i] = 255; this.mark(x, y); } }
    if (sim && sim.onTileChanged) sim.onTileChanged(i, x, y, op);
  };
  // ------------------------------------------------------------------ tile systems, processed in slices of 1/32 of the map per tick
  P.tick = function (sim) {
    const n = this.n, G = AL.G, rows = Math.max(1, n >> 5), y0 = this.slice; this.slice = (this.slice + rows) % n; const rng = sim.rng;
    for (let y = y0; y < y0 + rows && y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, g = this.ground[i];
      // flooding: land below sea level next to water becomes water (dug canals, lowered coasts)
      if (!AL.gWater[g] && this.height[i] < SEA && g !== G.lava) { if ((x > 0 && AL.gWater[this.ground[i - 1]]) || (x < n - 1 && AL.gWater[this.ground[i + 1]]) || (y > 0 && AL.gWater[this.ground[i - n]]) || (y < n - 1 && AL.gWater[this.ground[i + n]])) { this.setGround(i, this.height[i] < SEA - 14 ? G.deep : G.shallow); if (sim.onFlood) sim.onFlood(i, x, y); } }
      else if (g === G.lava) { // lava: ignites neighbours, creeps downhill a little, cools at the rim
        if (rng.chance(0.25)) { const d = rng.int(4), j = i + (d === 0 ? 1 : d === 1 ? -1 : d === 2 ? n : -n); if (j >= 0 && j < n * n) { const og = this.ground[j]; if (AL.gWater[og]) { if (rng.chance(0.5)) this.setGround(i, G.volcanic); } else if (og !== G.lava) { if (this.feature[j] && sim.ignite) sim.ignite(j); if (this.height[j] < this.height[i] - 3 && rng.chance(0.3)) { this.setGround(j, G.lava); if (sim.onLava) sim.onLava(j); } else if (rng.chance(0.012) && this.height[i] < 190) this.setGround(i, G.volcanic); } } } }
      if (sim.tileSystems) sim.tileSystems(i, x, y, g);
    }
  };
  AL.World = World;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Sim — the simulation: owns the world, runs fixed ticks, executes commands, produces snapshots.
(function (AL) {
  'use strict';
  function Sim(cfg) {
    AL.initData();
    this.cfg = cfg; this.rng = new AL.Rng((cfg.seed >>> 0) ^ 0x5bd1e995); this.tick = 0; this.speed = 1; this.acc = 0; this.events = []; this.effSpeed = 1;
    this.world = AL.World.generate(cfg); this.world.computeRegions();
    for (const m of Sim.modules) if (m.init) m.init(this);
  }
  Sim.modules = []; // later steps register systems here: {init, tick, save, load, command, query}
  const P = Sim.prototype;
  P.step = function () {
    this.tick++; const w = this.world;
    w.tick(this);
    for (const m of Sim.modules) if (m.tick) m.tick(this);
    if (w.regionsDirty && this.tick % 10 === 0) w.computeRegions();
  };
  // advance by real seconds; returns ticks run. Budget keeps the worker responsive at x50.
  P.advance = function (dt, budgetMs) {
    if (this.speed <= 0) return 0; this.acc += dt * AL.TICK_HZ * this.speed; if (this.acc > AL.TICK_HZ * this.speed * 0.5) this.acc = AL.TICK_HZ * this.speed * 0.5;
    const t0 = Sim.now(); let nrun = 0; while (this.acc >= 1) { this.step(); this.acc -= 1; nrun++; if (Sim.now() - t0 > (budgetMs || 10)) { this.acc = Math.min(this.acc, 1); break; } }
    return nrun;
  };
  Sim.now = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() : () => 0;
  P.emit = function (type, a, b, c, d) { this.events.push([type, a, b, c, d]); };
  P.command = function (m) {
    if (m.t === 'speed') this.speed = m.v;
    else if (m.t === 'brush') { this.world.brush(m.op, this); }
    else for (const mod of Sim.modules) if (mod.command && mod.command(this, m)) break;
  };
  P.query = function (m) { for (const mod of Sim.modules) if (mod.query) { const r = mod.query(this, m); if (r !== undefined) return r; } return null; };
  // tile data for the client: full layers or the dirty rectangle
  const TL = ['ground', 'height', 'feature', 'fgrow', 'fire', 'flags', 'owner', 'road'];
  P.takeTiles = function (full) {
    const w = this.world, d = w.dirty, n = w.n; if (!full && d.x1 < 0) return null;
    const x0 = full ? 0 : d.x0, y0 = full ? 0 : d.y0, x1 = full ? n - 1 : d.x1, y1 = full ? n - 1 : d.y1, rw = x1 - x0 + 1, rh = y1 - y0 + 1, out = { t: 'tiles', n, x: x0, y: y0, w: rw, h: rh, L: {} }, tr = [];
    for (const k of TL) { const src = w[k], a = new src.constructor(rw * rh); for (let y = 0; y < rh; y++) a.set(src.subarray((y0 + y) * n + x0, (y0 + y) * n + x0 + rw), y * rw); out.L[k] = a; tr.push(a.buffer); }
    w.dirty = { x0: n, y0: n, x1: -1, y1: -1 }; out._tr = tr; return out;
  };
  // low-resolution colour preview of a world config (for the creation screen): returns ground ids at 1/k scale
  Sim.preview = function (cfg, res) { AL.initData(); const w = AL.World.generate(cfg), n = w.n, k = Math.max(1, Math.floor(n / (res || 128))), m = Math.floor(n / k), g = new Uint8Array(m * m), f = new Uint8Array(m * m);
    for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) { g[y * m + x] = w.ground[(y * k) * n + x * k]; f[y * m + x] = AL.fKind[w.feature[(y * k) * n + x * k]] === 1 ? w.feature[(y * k) * n + x * k] : 0; } return { t: 'preview', m, g, f }; };
  AL.Sim = Sim;

  // ---- host: message protocol (worker, or main-thread fallback through the same functions)
  AL.SimHost = function (post) {
    let sim = null, last = Sim.now(), lastSnap = 0, timer = null;
    function send(msg) { const tr = msg._tr; delete msg._tr; post(msg, tr || []); }
    function loop() { const now = Sim.now(), dt = Math.min(0.25, (now - last) / 1000); last = now; if (!sim) return;
      const ran = sim.advance(dt, 12); sim.effSpeed = sim.effSpeed * 0.9 + (dt > 0 ? ran / (dt * AL.TICK_HZ) : 0) * 0.1;
      if (now - lastSnap >= 33) { lastSnap = now; const tl = sim.takeTiles(false); if (tl) send(tl); for (const m of Sim.modules) if (m.snapshot) { const s = m.snapshot(sim); if (s) send(s); }
        send({ t: 'hud', tick: sim.tick, speed: sim.speed, eff: sim.effSpeed, hud: sim.hud ? sim.hud() : null, ev: sim.events.splice(0) }); } }
    return { message(m) {
      if (m.t === 'new') { sim = new Sim(m.cfg); last = Sim.now(); send({ t: 'ready', n: sim.world.n, cfg: sim.world.cfg }); send(sim.takeTiles(true)); if (!timer) timer = setInterval(loop, 8); }
      else if (m.t === 'preview') send(Object.assign(Sim.preview(m.cfg, m.res), { id: m.id }));
      else if (m.t === 'query') send({ t: 'reply', id: m.id, r: sim ? sim.query(m) : null });
      else if (m.t === 'save') { const buf = AL.Save.write(sim); send({ t: 'saved', id: m.id, buf, _tr: [buf] }); }
      else if (m.t === 'load') { sim = AL.Save.read(m.buf); last = Sim.now(); send({ t: 'ready', n: sim.world.n, cfg: sim.world.cfg, loaded: true }); send(sim.takeTiles(true)); if (!timer) timer = setInterval(loop, 8); }
      else if (sim) sim.command(m); }, get sim() { return sim; } };
  };
  if (typeof self !== 'undefined' && typeof self.document === 'undefined' && typeof self.postMessage === 'function' && typeof importScripts === 'function') {
    const host = AL.SimHost((m, tr) => self.postMessage(m, tr)); self.onmessage = e => host.message(e.data);
  }
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

module.exports=globalThis.AL;
