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
