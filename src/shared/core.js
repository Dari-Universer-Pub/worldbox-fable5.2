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
