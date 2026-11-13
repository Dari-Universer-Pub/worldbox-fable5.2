// AL.Game — boot, simulation link (Blob Worker), camera, input, frame loop.
(function (AL) {
  'use strict';
  const Game = AL.Game = { cam: { x: 0, y: 0, z: 1, tz: 1 }, map: null, time: 0, tool: { id: 'none', size: 5, shape: 'round' }, mouse: { x: 0, y: 0, wx: 0, wy: 0, down: false, tileX: 0, tileY: 0 }, keys: {}, stats: { fps: 0, frameMs: 0, maxMs: 0, sprites: 0 }, speed: 1, hud: null, listeners: {} };
  const ZOOMS = [0.25, 0.5, 1, 2, 3, 4];
  // ---------------- simulation link
  const Link = AL.Link = { worker: null, cbs: {}, nextId: 1, mode: '' };
  Link.start = function () {
    const src = '(' + self.AL_SIM_BUNDLE.toString() + ')()';
    try { const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); Link.worker = new Worker(url); Link.worker.onmessage = e => Link.recv(e.data); Link.worker.onerror = e => { console.error('sim worker error', e.message); }; Link.mode = 'worker'; }
    catch (err) { // fallback: same bundle on the main thread
      const host = AL.SimHost(m => setTimeout(() => Link.recv(m), 0)); Link.worker = { postMessage: m => host.message(m) }; Link.mode = 'main-thread'; }
  };
  Link.send = function (m, tr) { Link.worker.postMessage(m, tr || []); };
  Link.ask = function (q, args) { return new Promise(ok => { const id = Link.nextId++; Link.cbs[id] = ok; Link.send(Object.assign({ t: 'query', id, q }, args || {})); }); };
  Link.request = function (m) { return new Promise(ok => { const id = Link.nextId++; Link.cbs[id] = ok; Link.send(Object.assign({ id }, m)); }); };
  Link.recv = function (m) {
    if (m.t === 'tiles') Game.onTiles(m);
    else if (m.t === 'ready') { Game.onReady(m); }
    else if (m.t === 'hud') { Game.tick = m.tick; Game.effSpeed = m.eff; Game.simSpeed = m.speed; if (m.hud) Game.hud = m.hud; if (m.ev.length) Game.onEvents(m.ev); }
    else if (m.t === 'reply' || m.t === 'preview' || m.t === 'saved') { const cb = Link.cbs[m.id]; if (cb) { delete Link.cbs[m.id]; cb(m.t === 'reply' ? m.r : m); } }
    else if (Game.listeners[m.t]) Game.listeners[m.t](m);
  };
  Game.on = function (t, fn) { Game.listeners[t] = fn; };
  Game.onEvents = function (ev) { if (AL.Fx) for (const e of ev) AL.Fx.event(e); };
  // ---------------- world data mirror
  Game.onReady = function (m) { const n = m.n; Game.map = { n, ground: new Uint8Array(n * n), height: new Uint8Array(n * n), feature: new Uint8Array(n * n), fgrow: new Uint8Array(n * n), fire: new Uint8Array(n * n), flags: new Uint8Array(n * n), owner: new Uint16Array(n * n), road: new Uint8Array(n * n) };
    Game.worldCfg = m.cfg; AL.Gfx.setWorld(n); Game.cam.z = Game.cam.tz = 1; Game.cam.x = n * 4 - AL.Gfx.W / 2; Game.cam.y = n * 4 - AL.Gfx.H / 2; Game.ready = false; if (Game.onWorld) Game.onWorld(m); };
  Game.onTiles = function (m) { const M = Game.map, n = M.n; for (const k in m.L) { const src = m.L[k], dst = M[k]; for (let y = 0; y < m.h; y++) dst.set(src.subarray(y * m.w, (y + 1) * m.w), (m.y + y) * n + m.x); }
    AL.Gfx.updateTiles(M, m.x, m.y, m.w, m.h); Game.ready = true; Game.mapVersion = (Game.mapVersion || 0) + 1; if (Game.onMapChanged) Game.onMapChanged(m); };
  Game.newWorld = function (cfg) { Game.ready = false; Link.send({ t: 'new', cfg }); };
  Game.setSpeed = function (v) { Game.speed = v; Link.send({ t: 'speed', v }); };
  // ---------------- camera
  Game.screenToWorld = function (sx, sy) { const c = Game.cam; return [c.x + sx / c.z, c.y + sy / c.z]; };
  Game.zoomAt = function (factorIdx, sx, sy) { const c = Game.cam; let i = ZOOMS.indexOf(c.tz); if (i < 0) i = 2; i = AL.clamp(i + factorIdx, 0, ZOOMS.length - 1); c.tz = ZOOMS[i]; c.ax = sx == null ? AL.Gfx.W / 2 : sx; c.ay = sy == null ? AL.Gfx.H / 2 : sy; };
  function camUpdate(dt) { const c = Game.cam, G = AL.Gfx;
    if (c.z !== c.tz) { const [wx, wy] = Game.screenToWorld(c.ax, c.ay); const k = 1 - Math.exp(-dt * 14); let z = c.z + (c.tz - c.z) * k; if (Math.abs(z - c.tz) < 0.004) z = c.tz; c.z = z; c.x = wx - c.ax / z; c.y = wy - c.ay / z; }
    const sp = 260 / c.z * dt * (Game.keys.ShiftLeft ? 2.2 : 1), K = Game.bind || {}; let dx = 0, dy = 0;
    if (Game.isDown('panLeft')) dx -= 1; if (Game.isDown('panRight')) dx += 1; if (Game.isDown('panUp')) dy -= 1; if (Game.isDown('panDown')) dy += 1;
    if (dx || dy) { c.x += dx * sp; c.y += dy * sp; Game.follow = -1; }
    if (Game.follow >= 0 && AL.Scene) { const up = AL.Scene.unitPos(Game.follow); if (up) { const k = 1 - Math.exp(-dt * 6); c.x += (up[0] - G.W / 2 / c.z - c.x) * k; c.y += (up[1] - 8 - G.H / 2 / c.z - c.y) * k; } else Game.follow = -1; }
    if (Game.map) { const m = Game.map.n * 8, vw = G.W / c.z, vh = G.H / c.z, mg = 80 / c.z; c.x = vw > m + 2 * mg ? (m - vw) / 2 : AL.clamp(c.x, -mg, m - vw + mg); c.y = vh > m + 2 * mg ? (m - vh) / 2 : AL.clamp(c.y, -mg, m - vh + mg); } }
  // ---------------- key bindings (physical codes, from data, remappable)
  Game.loadBinds = function () { const def = AL.DATA.keys; Game.bind = {}; let user = {}; try { user = JSON.parse(localStorage.getItem('aeonloom.keys') || '{}'); } catch (e) { } for (const a in def) Game.bind[a] = (user[a] || def[a].codes).slice(); Game.codeToAction = {}; for (const a in Game.bind) for (const c of Game.bind[a]) Game.codeToAction[c] = a; };
  Game.isDown = function (action) { const b = Game.bind[action]; if (!b) return false; for (const c of b) if (Game.keys[c]) return true; return false; };
  // ---------------- flora sprites
  let floraFrames = null;
  function buildFlora() { const A = AL.Assets; floraFrames = []; AL.FLORA.forEach((f, id) => { if (!f) return; const v = []; for (let k = 0; k < 4; k++) { const fr = A.anim(f.sprite + '/' + k); if (!fr.length) break; v.push(fr); } floraFrames[id] = v; }); floraFrames.sapling = A.anim('sapling/0'); }
  Game._drawFlora = function () { drawFlora(Game.env); };
  const WARMF = [];
  function drawFlora(env) {
    const M = Game.map, n = M.n, c = Game.cam, G = AL.Gfx, z = c.z; if (z < 0.74) return; // far view: canopy marks are drawn by the terrain shader
    const x0 = Math.max(0, Math.floor(c.x / 8) - 2), y0 = Math.max(0, Math.floor(c.y / 8) - 1), x1 = Math.min(n - 1, Math.ceil((c.x + G.W / z) / 8) + 2), y1 = Math.min(n - 1, Math.ceil((c.y + G.H / z) / 8) + 5);
    const ft = M.feature, gw = M.fgrow, wind = env.wind || 0.35, t = Game.time; const frost = AL.Scene && AL.Scene.frost; if (!WARMF.done) { WARMF.done = 1; for (const k of ['palm', 'jungletree', 'acacia', 'cactus', 'deadtree']) if (AL.F[k] != null) WARMF[AL.F[k]] = 1; }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * n + x, f = ft[i]; if (!f) continue; const vs = floraFrames[f]; if (!vs || !vs.length) continue;
      const h = AL.hash2(x, y, 7), kind = AL.fKind[f]; let fr;
      if (kind === 1 && gw[i] < 70) fr = floraFrames.sapling; else if (kind === 5) fr = vs[Math.min(vs.length - 1, gw[i] >> 6)]; else fr = vs[(h * vs.length) | 0];
      // sway: a gust travels across the map; each plant has its own phase
      const gust = Math.sin(t * 0.7 + x * 0.21 + y * 0.13) * 0.5 + 0.5, ph = (t * (1.2 + wind * 2.2) + h * 4 + x * 0.3) % 4; const fi = (gust < 1 - wind * 1.4) ? 0 : (ph | 0) % fr.length;
      const jx = kind === 1 ? ((h * 5) | 0) - 2 : ((h * 7) | 0) - 3, jy = kind === 1 ? 0 : ((AL.hash2(x, y, 8) * 5) | 0) - 2;
      G.spr(fr[fi], x * 8 + 4 + jx, y * 8 + 7 + jy, 0, (kind === 3 || kind === 5) ? 32 : 0, frost && kind === 1 && !WARMF[f] ? 1 : 0, 1, 1, kind === 3 ? -6 : 0);
      if (M.fire[i]) { /* fire sprites are added by AL.Fx */ } }
  }
  // ---------------- frame
  let last = 0, fpsAcc = 0, fpsN = 0, fpsT = 0;
  Game.env = { ambient: [1, 1, 1], tint: [0, 0, 0, 0], sun: [0.55, 0.38], time: 0, frame: 0, vig: 0.55, fade: 0, flash: 0, wind: 0.35 };
  function frame(now) {
    requestAnimationFrame(frame); const dt = Math.min(0.1, (now - last) / 1000 || 0.016); last = now; if (document.hidden) return;
    const t0 = performance.now(); if (Game.hitStop > 0) Game.hitStop -= dt; else Game.time += dt; camUpdate(dt);
    const env = Game.env; env.time = Game.time; env.frame = (Game.time * 3.2) | 0;
    if (Game.map && Game.ready) { const G = AL.Gfx; G.begin(); if (AL.Scene) AL.Scene.update(dt, env); drawFlora(env); if (AL.Scene) AL.Scene.draw(env); if (AL.Fx) AL.Fx.draw(dt, env);
      const c = Game.cam, snap = c.z === c.tz, cx = snap ? Math.round(c.x * c.z) / c.z : c.x, cy = snap ? Math.round(c.y * c.z) / c.z : c.y; G.draw({ x: cx, y: cy, z: c.z }, env); Game.stats.sprites = G.count(); }
    if (AL.Tools) AL.Tools.frame(dt); if (AL.UI) AL.UI.frame(dt); if (AL.Mixer) AL.Mixer.frame(dt);
    const ms = performance.now() - t0; fpsAcc += ms; fpsN++; fpsT += dt; Game.stats.maxMs = Math.max(Game.stats.maxMs * 0.995, ms);
    if (fpsT >= 0.5) { Game.stats.fps = Math.round(fpsN / fpsT); Game.stats.frameMs = fpsAcc / fpsN; fpsAcc = 0; fpsN = 0; fpsT = 0; }
  }
  // ---------------- layout: integer scaling
  Game.layout = function () { const st = document.getElementById('stage'), ww = window.innerWidth, wh = window.innerHeight, opt = Game.options || {}; let W = 640, H = 360, s;
    if (opt.fill !== false) { s = Math.max(1, Math.min(Math.floor(ww / 480), Math.floor(wh / 270))); if (opt.scale) s = Math.max(1, Math.min(s, opt.scale)); s = Math.max(1, Math.min(s, Math.floor(Math.min(ww / 320, wh / 200)))); W = Math.ceil(ww / s); H = Math.ceil(wh / s); }
    else { s = Math.max(1, Math.min(Math.floor(ww / 640), Math.floor(wh / 360))); }
    Game.scale = s; st.style.width = W * s + 'px'; st.style.height = H * s + 'px'; if (AL.Gfx.gl && (AL.Gfx.W !== W || AL.Gfx.H !== H)) AL.Gfx.resize(W, H); if (AL.UI) AL.UI.resize(W * s, H * s, s); };
  // ---------------- input (mouse, wheel, keyboard, touch)
  function bindInput() {
    const ui = document.getElementById('ui'), M = Game.mouse;
    const pos = e => { const r = ui.getBoundingClientRect(); M.cx = e.clientX - r.left; M.cy = e.clientY - r.top; M.x = M.cx / Game.scale; M.y = M.cy / Game.scale; const w = Game.screenToWorld(M.x, M.y); M.wx = w[0]; M.wy = w[1]; M.tileX = Math.floor(w[0] / 8); M.tileY = Math.floor(w[1] / 8); };
    ui.addEventListener('mousemove', e => { const px = M.x, py = M.y; pos(e); if (M.pan) { Game.cam.x -= (M.x - px) / Game.cam.z; Game.cam.y -= (M.y - py) / Game.cam.z; Game.follow = -1; } else if (AL.UI && AL.UI.mouseMove(M.cx, M.cy)) return; else if (M.down && Game.onDrag) Game.onDrag(M); });
    ui.addEventListener('mousedown', e => { pos(e); if (AL.Audio && AL.Audio.ready) AL.Audio.resume(); if (e.button === 1 || e.button === 2 || (e.button === 0 && Game.keys.Space)) { M.pan = true; e.preventDefault(); return; } if (AL.UI && AL.UI.mouseDown(M.cx, M.cy, e.button)) return; if (e.button === 0) { M.down = true; M.lastTX = M.tileX; M.lastTY = M.tileY; if (Game.onPress) Game.onPress(M); } });
    window.addEventListener('mouseup', e => { if (M.pan) { M.pan = false; return; } if (AL.UI && AL.UI.mouseUp(M.cx, M.cy, e.button)) { M.down = false; return; } if (M.down) { M.down = false; if (Game.onRelease) Game.onRelease(M); } });
    ui.addEventListener('contextmenu', e => e.preventDefault());
    ui.addEventListener('wheel', e => { e.preventDefault(); pos(e); if (AL.UI && AL.UI.wheel(M.cx, M.cy, e.deltaY)) return; Game.zoomAt(e.deltaY < 0 ? 1 : -1, M.x, M.y); }, { passive: false });
    window.addEventListener('keydown', e => { if (AL.UI && AL.UI.keyDown(e)) { e.preventDefault(); return; } Game.keys[e.code] = true; const a = Game.codeToAction[e.code]; if (a) { if (!e.repeat && Game.onAction) Game.onAction(a); if (!e.ctrlKey && !e.metaKey) e.preventDefault(); } });
    window.addEventListener('keyup', e => { Game.keys[e.code] = false; });
    window.addEventListener('blur', () => { Game.keys = {}; M.pan = false; M.down = false; });
    // touch: one finger = tool / tap, two fingers = pan + pinch zoom
    let tch = null;
    ui.addEventListener('touchstart', e => { e.preventDefault(); if (e.touches.length === 1) { const t = e.touches[0]; pos(t); if (AL.UI && AL.UI.mouseDown(M.cx, M.cy, 0)) { tch = { ui: true }; return; } M.down = true; tch = { one: true }; if (Game.onPress) Game.onPress(M); }
      else if (e.touches.length === 2) { if (M.down) { M.down = false; } const a = e.touches[0], b = e.touches[1]; tch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), mx: (a.clientX + b.clientX) / 2, my: (a.clientY + b.clientY) / 2 }; } }, { passive: false });
    ui.addEventListener('touchmove', e => { e.preventDefault(); if (!tch) return; if (e.touches.length === 1 && tch.one) { pos(e.touches[0]); if (Game.onDrag) Game.onDrag(M); } else if (e.touches.length === 1 && tch.ui) { pos(e.touches[0]); AL.UI.mouseMove(M.cx, M.cy); }
      else if (e.touches.length === 2 && tch.d) { const a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2; Game.cam.x -= (mx - tch.mx) / Game.scale / Game.cam.z; Game.cam.y -= (my - tch.my) / Game.scale / Game.cam.z; tch.mx = mx; tch.my = my; if (d > tch.d * 1.35) { Game.zoomAt(1, mx / Game.scale, my / Game.scale); tch.d = d; } else if (d < tch.d * 0.74) { Game.zoomAt(-1, mx / Game.scale, my / Game.scale); tch.d = d; } } }, { passive: false });
    ui.addEventListener('touchend', e => { e.preventDefault(); if (tch && tch.ui) AL.UI.mouseUp(M.cx, M.cy, 0); else if (M.down) { M.down = false; if (Game.onRelease) Game.onRelease(M); } if (e.touches.length === 0) tch = null; }, { passive: false });
    window.addEventListener('resize', Game.layout);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { Game.hiddenSpeed = Game.speed; Link.send({ t: 'speed', v: 0 }); if (AL.Audio.ctx && AL.Audio.ctx.suspend) AL.Audio.ctx.suspend(); } else { Link.send({ t: 'speed', v: Game.hiddenSpeed == null ? Game.speed : Game.hiddenSpeed }); if (AL.Audio.ctx && AL.Audio.ctx.resume) AL.Audio.ctx.resume(); } });
  }
  // ---------------- boot
  Game.boot = function () {
    const t0 = performance.now(); AL.initData(); AL.Assets.load(); Game.loadBinds(); try { Game.options = JSON.parse(localStorage.getItem('aeonloom.options') || '{}'); } catch (e) { Game.options = {}; }
    AL.Gfx.init(document.getElementById('world')); buildFlora(); Link.start(); bindInput(); Game.layout(); if (AL.UI) AL.UI.init(document.getElementById('ui')); Game.layout();
    Game.bootMs = performance.now() - t0; requestAnimationFrame(frame); if (AL.App) AL.App.start(); else Game.newWorld({ size: 'medium', seed: 7, water: 0.5, continents: 3, climate: 'temperate' });
  };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
