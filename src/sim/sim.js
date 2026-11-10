// AL.Sim — the simulation: owns the world, runs fixed ticks, executes commands, produces snapshots.
(function (AL) {
  'use strict';
  function Sim(cfg) {
    AL.initData();
    this.cfg = cfg; this.rng = new AL.Rng((cfg.seed >>> 0) ^ 0x5bd1e995); this.tick = 0; this.speed = 1; this.acc = 0; this.events = []; this.effSpeed = 1;
    this.world = AL.World.generate(cfg); this.world.computeRegions();
    for (const m of Sim.modules) if (m.init) m.init(this);
    this.tileMods = Sim.modules.filter(m => m.tile);
  }
  Sim.modules = []; // later steps register systems here: {init, tick, save, load, command, query}
  const P = Sim.prototype;
  // per-tile systems (crops, flora, fire…) called by the world sweep: every tile once per 32 ticks
  P.tileSystems = function (i, x, y, g) { const tm = this.tileMods; for (let k = 0; k < tm.length; k++) tm[k].tile(this, i, x, y, g); };
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
    let sim = null, last = Sim.now(), lastSnap = 0, lastOwner = 0, timer = null;
    function send(msg) { const tr = msg._tr; delete msg._tr; post(msg, tr || []); }
    function loop() { const now = Sim.now(), dt = Math.min(0.25, (now - last) / 1000); last = now; if (!sim) return;
      const ran = sim.advance(dt, 12); sim.effSpeed = sim.effSpeed * 0.9 + (dt > 0 ? ran / (dt * AL.TICK_HZ) : 0) * 0.1;
      if (sim.ownerDirty && now - lastOwner >= 500) { lastOwner = now; sim.ownerDirty = false; const o = sim.world.owner.slice(); send({ t: 'owner', n: sim.world.n, owner: o, towns: sim.towns ? sim.towns.map(t => t.alive ? [t.kingdom, t.people, t.cx, t.cy, t.name] : null) : [], kr: sim.kingdoms ? sim.kingdoms.map(k => k.alive ? k.ramp : -1) : [], _tr: [o.buffer] }); }
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
