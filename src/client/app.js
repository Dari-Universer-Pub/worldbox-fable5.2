// AL.App — the title screen: the menu sits over a living world (two villages are seeded and the camera drifts over them),
// the menu track plays. "Play" keeps that world; "New world", "Continue" and "Load" replace it. '?play' in the URL skips
// the title and starts the default world at once (used by the test robots).
(function (AL) {
  'use strict';
  const Game = AL.Game, App = AL.App = { title: false, t: 0, seeded: false, hasAuto: false, own: false };
  const DEF = { size: 'medium', seed: 7, water: 0.5, continents: 3, climate: 'temperate' };
  App.skip = () => /(^|[?&#])play\b/.test(location.search.slice(1)) || /(^|[?&#])play\b/.test(location.hash.slice(1));
  App.start = function () {
    if (App.skip()) { Game.newWorld(DEF); return; }
    App.title = true; if (AL.Mixer) AL.Mixer.menu = true;
    const nw = Game.newWorld, lb = Game.loadBuf;
    Game.newWorld = function (cfg) { if (App.title && !App.own) App.leave(); return nw.call(Game, cfg); };
    Game.loadBuf = function (buf) { if (App.title) App.leave(); return lb.call(Game, buf); };
    if (AL.Store) AL.Store.list().then(l => { App.hasAuto = l.some(s => s.key === 'auto'); }).catch(() => { });
    App.own = true; Game.newWorld(Object.assign({}, DEF, { seed: 1 + (Date.now() % 90000) })); App.own = false;
  };
  // a place for a village: a wide patch of grass or forest, found on the client's copy of the map
  function spot(k0) { const M = Game.map, n = M.n; for (let k = k0; k < k0 + 30000; k++) { const x = 30 + ((AL.hash2(k, 1, 5) * (n - 60)) | 0), y = 30 + ((AL.hash2(k, 2, 5) * (n - 60)) | 0); let ok = true;
      for (let dy = -5; dy <= 5 && ok; dy += 5) for (let dx = -7; dx <= 7; dx += 7) { const gn = AL.GROUND[M.ground[(y + dy) * n + x + dx]].name; if (gn !== 'grass' && gn !== 'forest' && gn !== 'savanna') { ok = false; break; } } if (ok) return [x, y]; } return null; }
  App.frame = function (dt) { if (!App.title) return; App.t += dt; const c = Game.cam, G = AL.Gfx;
    if (!App.seeded && Game.ready && Game.map && AL.Scene && AL.Scene.cur) { App.seeded = true; const a = spot(0), b = a && spot(4000);
      if (a) { AL.Link.send({ t: 'spawn', kind: 'human', x: a[0] + 0.5, y: a[1] + 0.5, count: 16 }); App.home = a; c.z = c.tz = 2; c.x = a[0] * 8 - G.W / 4; c.y = a[1] * 8 - G.H / 4 - 12; }
      if (b && (Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]) > 30)) AL.Link.send({ t: 'spawn', kind: 'orc', x: b[0] + 0.5, y: b[1] + 0.5, count: 16 });
      Game.setSpeed(2); }
    if (App.home) { c.x = App.home[0] * 8 - G.W / 2 / c.z + Math.sin(App.t * 0.05) * 60; c.y = App.home[1] * 8 - G.H / 2 / c.z - 12 + Math.cos(App.t * 0.037) * 28; } };
  App.leave = function () { if (!App.title) return; App.title = false; App.home = null; if (AL.Mixer) AL.Mixer.menu = false; Game.follow = -1; };
  App.play = function () { App.leave(); Game.setSpeed(1); const c = Game.cam; c.ax = AL.Gfx.W / 2; c.ay = AL.Gfx.H / 2; c.tz = 1; };
  App.resume = function () { return Game.loadSlot('auto'); };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
