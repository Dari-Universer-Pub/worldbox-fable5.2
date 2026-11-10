// AL.Scene — what lives on the map: units (interpolated between simulation snapshots, animated from the people atlases),
// buildings (sites, finished, ruins), the kingdoms layer, the basic day/night ambience and the default key actions.
(function (AL) {
  'use strict';
  const Game = AL.Game, S = AL.Scene = { cur: null, prev: null, t0: 0, dur: 0.1, lastAt: 0, blds: null, nUnits: 0, nBlds: 0, night: 0, layer: 0 };
  const DIRN = ['down', 'left', 'up', 'right'], CAP = 8192;
  const animStart = new Float32Array(CAP), lastAnim = new Uint8Array(CAP).fill(255), lastGen = new Uint16Array(CAP), px = new Float32Array(CAP), py = new Float32Array(CAP);
  // frames[kind][look][anim][dir] -> array of atlas frames (lazy)
  const cache = [];
  const ANIM_SRC = { run: 'walk', eat: 'idle', fly: 'idle', swim: 'walk', special: 'joy' }, FPS = { idle: 4, walk: 9, work: 8, attack: 10, hit: 10, pray: 5, joy: 8, death: 9, sleep: 2 };
  function framesOf(kind, look, anim, dir) {
    const k0 = cache[kind] || (cache[kind] = []), k1 = k0[look] || (k0[look] = []), k2 = k1[anim] || (k1[anim] = []); let f = k2[dir]; if (f) return f;
    const K = AL.KINDS[kind], A = AL.Assets; let an = AL.ANIMN[anim] || 'idle'; an = ANIM_SRC[an] || an; const two = an === 'death' || an === 'sleep', d = two ? (dir === 1 || dir === 0 ? 'left' : 'right') : DIRN[dir];
    f = A.anim(K.name + '/' + AL.LOOKS[look] + '/' + an + '/' + d); if (!f.length) f = A.anim(K.name + '/villager/' + an + '/' + d); if (!f.length) f = A.anim(K.name + '/villager/idle/down'); if (!f.length) f = A.anim('human/villager/idle/down');
    f.fps = FPS[an] || 6; f.once = an === 'death'; return (k2[dir] = f);
  }
  S.teamOf = function (kind, kingdom) { const kr = Game.kingdomRamp; if (kr && kingdom >= 0 && kr[kingdom] != null && kr[kingdom] >= 0) return kr[kingdom]; const K = AL.KINDS[kind]; return AL.Assets.palette.ramps[K.team] || 9; };
  Game.on('ents', m => { if (!m.n) { S.cur = null; S.prev = null; return; } if (S.cur && m.tick === S.cur.tick) return; const now = performance.now() / 1000;
    S.prev = S.cur; S.cur = m; S.dur = Math.max(0.016, Math.min(0.25, now - S.lastAt)); S.lastAt = now; S.t0 = now; });
  Game.on('blds', m => { S.blds = m; S.bldFrames = null; });
  Game.on('owner', m => { if (!Game.map) return; Game.map.owner.set(m.owner); S.towns = m.towns; Game.kingdomRamp = m.kr || []; if (S.blds) { S.blds.tk = m.towns.map(t => t ? t[0] : -1); } if (S.layer) S.applyLayer(); });
  // ---- kingdoms layer: territory tint and borders
  S.applyLayer = function () { const M = Game.map, G = AL.Gfx, A = AL.Assets; if (!M) return; if (!S.layer) { G.layerOn = 0; return; }
    const n = M.n, ids = S._ids && S._ids.length === n * n ? S._ids : (S._ids = new Uint8Array(n * n)), o = M.owner, pal = new Uint8Array(1024), tw = S.towns || [];
    // one id per kingdom (towns of a kingdom merge into one territory); kingdom-less towns keep their own id
    for (let i = 0; i < ids.length; i++) { const v = o[i]; if (!v) { ids[i] = 0; continue; } const t = tw[v - 1]; ids[i] = t && t[0] >= 0 ? (t[0] % 200) + 1 : 201 + ((v - 1) % 54); }
    for (let t = 0; t < tw.length; t++) { if (!tw[t]) continue; const id = tw[t][0] >= 0 ? (tw[t][0] % 200) + 1 : 201 + (t % 54), ramp = S.teamOf(tw[t][1], tw[t][0]), c = A.palette.rgb[ramp * 6 + 3]; pal[id * 4] = c[0]; pal[id * 4 + 1] = c[1]; pal[id * 4 + 2] = c[2]; pal[id * 4 + 3] = 255; }
    G.setLayer(ids, pal); G.layerOn = 1; };
  S.setLayer = function (v) { S.layer = v; S.applyLayer(); };
  // ---- day / night ambience (refined with weather and ages in the effects module)
  const KEYS = [[0.00, 0.50, 0.52, 0.80], [0.05, 0.86, 0.72, 0.74], [0.12, 1.0, 0.98, 0.94], [0.50, 1.02, 1.0, 0.96], [0.62, 1.0, 0.86, 0.72], [0.70, 0.78, 0.60, 0.74], [0.76, 0.46, 0.48, 0.78], [1.0, 0.50, 0.52, 0.80]];
  S.update = function (dt, env) { const p = Game.tick == null ? 0.3 : ((Game.tick + (S.cur && Game.simSpeed ? 0 : 0)) % AL.DAY) / AL.DAY; let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++; const a = KEYS[k], b = KEYS[k + 1], f = (p - a[0]) / (b[0] - a[0]);
    if (!env.lockAmbient) { env.ambient[0] = a[1] + (b[1] - a[1]) * f; env.ambient[1] = a[2] + (b[2] - a[2]) * f; env.ambient[2] = a[3] + (b[3] - a[3]) * f; }
    S.night = p > 0.72 || p < 0.04 ? 1 : p > 0.66 ? (p - 0.66) / 0.06 : p < 0.08 ? 1 - (p - 0.04) / 0.04 : 0; env.night = S.night; env.sun[0] = 0.55 - (p - 0.4) * 0.5; };
  // ---- drawing
  const markUnit = () => S._mk || (S._mk = AL.Assets.frames['mark/unit/0']);
  S.draw = function (env) { const G = AL.Gfx, c = Game.cam, z = c.z, A = AL.Assets, vx0 = c.x - 40, vy0 = c.y - 40, vx1 = c.x + G.W / z + 40, vy1 = c.y + G.H / z + 70, far = z < 0.74, night = S.night > 0.5;
    // buildings
    const B = S.blds; let nb = 0;
    if (B) { const fr = S.bldFrames || (S.bldFrames = new Array(B.n)); for (let b = 0; b < B.n; b++) { if (!B.alive[b]) continue; const T = AL.BTYPES[B.type[b]], w = T.fp[0], h = T.fp[1], wx = (B.x[b] + w / 2) * 8, wy = (B.y[b] + h) * 8; if (wx < vx0 - 30 || wx > vx1 + 30 || wy < vy0 || wy > vy1 + 20) continue;
        const st = B.state[b], pr = B.prog[b], v = st === 1 ? 0 : st === 3 ? 3 : pr < 12 ? -1 : pr < 58 ? 1 : 2, key = b * 8 + v + 1 + B.stage[b] * 100; let f = fr[b];
        if (!f || f.key !== key) { const tp = B.town[b] >= 0 ? B.tp[B.town[b]] : 0, set = (AL.KINDS[tp] && AL.Assets.frames['bld/' + AL.KINDS[tp].buildSet + '/' + T.name + '/0/0']) ? AL.KINDS[tp].buildSet : 'human';
          f = v < 0 ? A.frames['bld/site/' + w + 'x' + h + '/0'] : A.frames['bld/' + set + '/' + T.name + '/' + B.stage[b] + '/' + v]; if (!f) f = A.frames['bld/human/house/0/0']; f = fr[b] = { f, key, ex: f[6] || null }; }
        const town = B.town[b], team = town >= 0 ? S.teamOf(B.tp[town], B.tk[town]) : 5, lit = night && st === 1 && (AL.hash2(b, 3, 1) < 0.8);
        G.spr(f.f, wx, wy, team, lit ? 0 : 64, 0, 1, 1, -2); nb++;
        if (lit && f.ex && f.ex.light && T.light) G.light(wx + f.ex.light[0], wy + f.ex.light[1] + 4, 26, 0.55 * S.night, 0);
        if (st === 1 && f.ex && f.ex.light && (T.name === 'forge' || T.name === 'temple') && !lit) G.light(wx + f.ex.light[0], wy + f.ex.light[1] + 2, 12, 0.25, 1);
        if (st === 1 && f.ex && f.ex.smoke && AL.Fx && AL.Fx.smoke) AL.Fx.smoke(b, wx + f.ex.smoke[0], wy + f.ex.smoke[1], T.name === 'forge'); } }
    S.nBlds = nb;
    // units
    const m = S.cur; let nu = 0; if (!m) { S.nUnits = 0; return; }
    const pv = S.prev, now = performance.now() / 1000, al = Math.min(1, (now - S.t0) / S.dur), t = Game.time, np = AL.NPEOPLE, mk = far ? markUnit() : null;
    for (let i = 0; i < m.n; i++) { if (!m.alive[i]) { lastAnim[i] = 255; continue; } let x = m.x[i], y = m.y[i];
      if (pv && i < pv.n && pv.alive[i] && pv.gen[i] === m.gen[i]) { const ox = pv.x[i], oy = pv.y[i], dx = x - ox, dy = y - oy; if (dx * dx + dy * dy < 9) { x = ox + dx * al; y = oy + dy * al; } }
      px[i] = x; py[i] = y; const an = m.anim[i]; if (an !== lastAnim[i] || m.gen[i] !== lastGen[i]) { lastAnim[i] = an; lastGen[i] = m.gen[i]; animStart[i] = t; }
      if (an === 14) continue; // inside a building
      const wx = x * 8, wy = y * 8 + 2; if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue; const kind = m.kind[i]; if (kind >= np && S.drawCreature(m, i, kind, an, wx, wy, t, far)) { nu++; continue; }
      const team = S.teamOf(kind, m.kd[i]), fl = m.flags[i];
      if (far) { if (mk) G.spr(mk, wx, wy, team, 0, 0, 1, 0.8 / z, 0); nu++; continue; }
      const fs = framesOf(kind, m.look[i], an, m.dir[i]); let fi; const el = t - animStart[i];
      if (fs.once) fi = Math.min(fs.length - 1, (el * fs.fps) | 0); else fi = (((an === 1 ? t : el) * fs.fps + (an === 1 ? i * 0.37 : 0)) | 0) % fs.length;
      const alpha = (fl & 1) && el > 6 ? Math.max(0, 1 - (el - 6) / 2.5) : 1;
      G.spr(fs[fi], wx, wy, team, ((fl & 8) || (fl & 16) ? 4 : 0) | (S.flash && S.flash[i] > t ? 2 : 0), 0, alpha, 1, 0); nu++;
      if (S.sel === i) S.selPos = [wx, wy]; }
    S.nUnits = nu; };
  // animals: frames '<species>/<anim>/<dir>/<i>'; humanoid monsters go through the people path
  const ccache = [], CMAP = { quad: { fly: 'idle', swim: 'walk', work: 'eat', pray: 'idle', joy: 'idle', special: 'attack', inside: 'idle' }, bird: { walk: 'fly', run: 'fly', eat: 'idle', sleep: 'idle', hit: 'fly', swim: 'fly' }, fish: { idle: 'swim', walk: 'swim', eat: 'swim', fly: 'swim', attack: 'run', hit: 'run', sleep: 'swim' } }, CFPS = { idle: 3, walk: 8, run: 12, eat: 4, attack: 10, hit: 8, death: 8, sleep: 1.5, fly: 9, swim: 6 };
  S.drawCreature = function (m, i, kind, an, wx, wy, t, far) { const K = AL.KINDS[kind]; if (K.humanoid) return false; if (far) return true; const G = AL.Gfx, c0 = ccache[kind] || (ccache[kind] = []), c1 = c0[an] || (c0[an] = []), dir = m.dir[i]; let fs = c1[dir];
    if (!fs) { const A = AL.Assets, rig = K.fly ? 'bird' : K.swim ? 'fish' : 'quad'; let a = AL.ANIMN[an] || 'idle'; a = CMAP[rig][a] || a; const two = a === 'death' || a === 'sleep'; fs = A.anim(K.name + '/' + a + '/' + (two ? (dir === 1 || dir === 0 ? 'left' : 'right') : DIRN[dir])); if (!fs.length) fs = A.anim(K.name + '/' + (rig === 'quad' ? 'idle' : rig === 'bird' ? 'fly' : 'swim') + '/down'); fs.fps = CFPS[a] || 6; fs.once = a === 'death'; fs.air = a === 'fly'; c1[dir] = fs; }
    if (!fs.length) return true; const el = t - animStart[i], fi = fs.once ? Math.min(fs.length - 1, (el * fs.fps) | 0) : ((t * fs.fps + i * 0.61) | 0) % fs.length, fl = m.flags[i], alpha = (fl & 1) && el > 6 ? Math.max(0, 1 - (el - 6) / 2.5) : 1;
    G.spr(fs[fi], wx, wy - (fs.air ? 10 : 0), 0, (K.swim ? 16 : 0) | (S.flash && S.flash[i] > t ? 2 : 0), 0, alpha, 1, fs.air ? 10 : 0); return true; };
  // world position of a unit as drawn (for following and picking)
  S.unitPos = function (i) { const m = S.cur; return m && i < m.n && m.alive[i] ? [px[i] * 8, py[i] * 8] : null; };
  S.pick = function (wx, wy) { const m = S.cur; if (!m) return -1; let best = -1, bd = 14 * 14; for (let i = 0; i < m.n; i++) { if (!m.alive[i] || m.anim[i] === 14) continue; const dx = px[i] * 8 - wx, dy = py[i] * 8 - 8 - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } } return best; };
  S.pickBld = function (tx, ty) { const B = S.blds; if (!B) return -1; for (let b = 0; b < B.n; b++) { if (!B.alive[b]) continue; const T = AL.BTYPES[B.type[b]]; if (tx >= B.x[b] && tx < B.x[b] + T.fp[0] && ty >= B.y[b] - 1 && ty < B.y[b] + T.fp[1]) return b; } return -1; };
  // ---- default actions (the interface module extends this)
  const SPEEDS = [0.5, 1, 2, 5, 10, 50];
  Game.onAction = function (a) { if (AL.UI && AL.UI.action && AL.UI.action(a)) return;
    if (a === 'zoomIn') Game.zoomAt(1); else if (a === 'zoomOut') Game.zoomAt(-1);
    else if (a === 'pause') { if (Game.speed > 0) { Game.pausedFrom = Game.speed; Game.setSpeed(0); } else Game.setSpeed(Game.pausedFrom || 1); }
    else if (a === 'faster' || a === 'slower') { const cur = Game.speed > 0 ? Game.speed : (Game.pausedFrom || 1); let i = SPEEDS.indexOf(cur); if (i < 0) i = 1; i = AL.clamp(i + (a === 'faster' ? 1 : -1), 0, SPEEDS.length - 1); Game.setSpeed(SPEEDS[i]); }
    else if (a === 'cancel') { if (Game.hud && Game.hud.ctl >= 0) AL.Tools.release(); Game.tool = { id: 'none', size: Game.tool.size, shape: Game.tool.shape }; }
    else if (a === 'layerNext') S.setLayer(S.layer ? 0 : 1);
    else if (a === 'brushBigger') Game.tool.size = Math.min(40, Game.tool.size + 1); else if (a === 'brushSmaller') Game.tool.size = Math.max(1, Game.tool.size - 1); };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
