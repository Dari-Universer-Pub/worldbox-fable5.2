// AL.Path — bounded A* for individual trips, cached flow fields (Dijkstra) for shared/long destinations.
(function (AL) {
  'use strict';
  function Path(world) { const N = world.n * world.n; this.w = world; this.g = new Float32Array(N); this.stamp = new Uint32Array(N); this.par = new Int32Array(N); this.closed = new Uint32Array(N); this.cur = 0;
    this.heap = new Int32Array(8192); this.hf = new Float32Array(8192); this.hn = 0; this.fields = new Map(); this.maxFields = N > 200000 ? 14 : 28; this.fq = new Int32Array(N); this.stats = { astar: 0, fail: 0, fields: 0 }; this.budget = 0; }
  const P = Path.prototype;
  P.push = function (i, f) { let k = this.hn++; const h = this.heap, hf = this.hf; while (k > 0) { const p = (k - 1) >> 1; if (hf[p] <= f) break; h[k] = h[p]; hf[k] = hf[p]; k = p; } h[k] = i; hf[k] = f; };
  P.pop = function () { const h = this.heap, hf = this.hf, top = h[0], n = --this.hn; if (n > 0) { const li = h[n], lf = hf[n]; let k = 0; for (;;) { let c = k * 2 + 1; if (c >= n) break; if (c + 1 < n && hf[c + 1] < hf[c]) c++; if (hf[c] >= lf) break; h[k] = h[c]; hf[k] = hf[c]; k = c; } h[k] = li; hf[k] = lf; } return top; };
  // cost to enter tile j (0 = blocked). Buildings block; water blocks walkers.
  P.cost = function (j) { const w = this.w; if (w.flags[j] & 2) return 0; const c = AL.gCost[w.ground[j]]; return c > 0 && w.road[j] > 120 ? c * 0.6 : c; };
  // A* from (sx,sy) to (tx,ty). Writes the path (tile indices, start excluded) into out at offset, max len. Returns length, 0 if none, -1 if too far (use a flow field).
  P.find = function (sx, sy, tx, ty, out, off, max, limit) {
    const w = this.w, n = w.n, s = sy * n + sx, t = ty * n + tx; if (s === t) return 0; if (w.region[s] !== w.region[t] && w.region[t] !== 0 && w.region[s] !== 0) return 0;
    const cur = ++this.cur, g = this.g, st = this.stamp, par = this.par, cl = this.closed; this.hn = 0; g[s] = 0; st[s] = cur; par[s] = -1; this.push(s, 0); let exp = 0; const lim = limit || 1800; this.stats.astar++;
    while (this.hn > 0) { const i = this.pop(); if (i === t) break; if (cl[i] === cur) continue; cl[i] = cur; if (++exp > lim || this.hn > 8000) { this.stats.fail++; return -1; } const x = i % n, y = (i / n) | 0, gi = g[i];
      for (let d = 0; d < 8; d++) { const dx = d === 0 ? 1 : d === 1 ? -1 : d < 4 ? 0 : (d & 1 ? 1 : -1), dy = d === 2 ? 1 : d === 3 ? -1 : d < 4 ? 0 : (d < 6 ? 1 : -1), X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X; let c = this.cost(j); if (c <= 0) { if (j !== t) continue; c = 1; }
        if (d >= 4) { if (this.cost(y * n + X) <= 0 || this.cost(Y * n + x) <= 0) continue; c *= 1.414; } const ng = gi + c; if (st[j] === cur && g[j] <= ng) continue; g[j] = ng; st[j] = cur; par[j] = i; const hx = Math.abs(X - tx), hy = Math.abs(Y - ty); this.push(j, ng + (hx + hy) * 0.6 + Math.max(hx, hy) * 0.35); } }
    if (st[t] !== cur) return 0; let len = 0, k = t; while (k !== s && k >= 0) { len++; k = par[k]; } if (len > max) { // keep only the first `max` steps (the unit re-plans when it gets there)
      let skip = len - max; k = t; while (skip-- > 0) k = par[k]; len = max; let q = len - 1; while (k !== s && q >= 0) { out[off + q--] = k; k = par[k]; } return len; }
    let q = len - 1; k = t; while (k !== s) { out[off + q--] = k; k = par[k]; } return len;
  };
  // flow field toward tile t: Uint16 distance (x8 fixed point), 65535 unreachable. Cached.
  P.field = function (t) { const w = this.w, n = w.n, N = n * n; let f = this.fields.get(t); if (f && f.ver === w.regionVersion) { f.use = ++this.cur; return f; }
    if (!f) { if (this.fields.size >= this.maxFields) { let ok = -1, ou = Infinity; for (const [k, v] of this.fields) if (v.use < ou) { ou = v.use; ok = k; } f = this.fields.get(ok); this.fields.delete(ok); } else f = { d: new Uint16Array(N) }; this.fields.set(t, f); }
    f.ver = w.regionVersion; f.use = ++this.cur; const d = f.d; d.fill(65535); this.hn = 0; d[t] = 0; this.push(t, 0); this.stats.fields++;
    // Dijkstra with the heap; heap may hold up to 8192 entries: frontier of a grid stays far below that
    while (this.hn > 0) { const i = this.pop(), di = d[i], x = i % n, y = (i / n) | 0; for (let k = 0; k < 4; k++) { const X = x + (k === 0 ? 1 : k === 1 ? -1 : 0), Y = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X, c = this.cost(j); if (c <= 0) continue; const nd = di + Math.max(1, (c * 8) | 0); if (nd < d[j] && nd < 65000) { d[j] = nd; if (this.hn < 8190) this.push(j, nd); } } }
    return f; };
  // next tile from (x,y) following field f (lowest neighbour); -1 if none
  P.follow = function (f, x, y) { const n = this.w.n, d = f.d, i = y * n + x; let best = d[i], bj = -1; for (let k = 0; k < 8; k++) { const dx = k === 0 ? 1 : k === 1 ? -1 : k < 4 ? 0 : (k & 1 ? 1 : -1), dy = k === 2 ? 1 : k === 3 ? -1 : k < 4 ? 0 : (k < 6 ? 1 : -1), X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X; if (d[j] >= best) continue; if (k >= 4 && (d[y * n + X] === 65535 || d[Y * n + x] === 65535)) continue; best = d[j]; bj = j; } return bj; };
  AL.Path = Path;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
