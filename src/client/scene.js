// AL.Scene — what lives on the map: units (interpolated between simulation snapshots, animated from the people atlases),
// buildings (sites, finished, ruins), the kingdoms layer, the basic day/night ambience and the default key actions.
(function (AL) {
  'use strict';
  const Game = AL.Game, S = AL.Scene = { cur: null, prev: null, t0: 0, dur: 0.1, lastAt: 0, blds: null, nUnits: 0, nBlds: 0, night: 0, layer: 0 };
  // dir 0 down, 1 left, 2 up, 3 right (what the simulation writes). The baker's 'left' and 'right' frames are named by the sign of the
  // yaw it renders with and show the opposite side on screen ('left' frames look right), so the labels are crossed here: a being walking
  // right (dir 3) takes the frames labelled 'left'. Checked on sheets for people, quadrupeds and birds.
  const DIRN = ['down', 'right', 'up', 'left'], CAP = 8192;
  const animStart = new Float32Array(CAP), lastAnim = new Uint8Array(CAP).fill(255), lastGen = new Uint16Array(CAP), px = new Float32Array(CAP), py = new Float32Array(CAP);
  // frames[kind][look][anim][dir] -> array of atlas frames (lazy)
  const cache = [];
  const ANIM_SRC = { run: 'walk', eat: 'idle', fly: 'idle', swim: 'walk', special: 'joy' }, FPS = { idle: 4, walk: 9, work: 8, attack: 10, hit: 10, pray: 5, joy: 8, death: 9, sleep: 2 };
  function framesOf(kind, look, anim, dir) {
    const k0 = cache[kind] || (cache[kind] = []), k1 = k0[look] || (k0[look] = []), k2 = k1[anim] || (k1[anim] = []); let f = k2[dir]; if (f) return f;
    const K = AL.KINDS[kind], A = AL.Assets; let an = AL.ANIMN[anim] || 'idle'; an = ANIM_SRC[an] || an; const two = an === 'death' || an === 'sleep', d = two ? (dir === 1 || dir === 0 ? 'right' : 'left') : DIRN[dir];
    f = A.anim(K.name + '/' + AL.LOOKS[look] + '/' + an + '/' + d); if (!f.length) f = A.anim(K.name + '/villager/' + an + '/' + d); if (!f.length) f = A.anim(K.name + '/villager/idle/down'); if (!f.length) f = A.anim('human/villager/idle/down');
    f.fps = FPS[an] || 6; f.once = an === 'death'; return (k2[dir] = f);
  }
  S.teamOf = function (kind, kingdom) { const kr = Game.kingdomRamp; if (kr && kingdom >= 0 && kr[kingdom] != null && kr[kingdom] >= 0) return kr[kingdom]; const K = AL.KINDS[kind]; return AL.Assets.palette.ramps[K.team] || 9; };
  Game.on('ents', m => { if (!m.n) { S.cur = null; S.prev = null; return; } if (S.cur && m.tick === S.cur.tick) return; const now = performance.now() / 1000;
    S.prev = S.cur; S.cur = m; S.dur = Math.max(0.016, Math.min(0.25, now - S.lastAt)); S.lastAt = now; S.t0 = now; });
  Game.on('blds', m => { S.blds = m; S.bldFrames = null; });
  Game.on('boats', m => { S.boats = m.n ? m : null; });
  Game.on('machines', m => { S.machines = m.n ? m : null; });
  // siege machines (chantier B.4): move = wheels turning, attack = the phase sent by the simulation, wreck = one burnt frame
  const MNAME = ['ram', 'catapult'], mpos = {};
  S.drawMachines = function (G, vx0, vy0, vx1, vy1, t, far) { const m = S.machines; if (!m) return; const A = AL.Assets;
    for (let k = 0; k < m.n; k++) { const id = m.id[k]; let p = mpos[id]; const tx = m.x[k], ty = m.y[k]; if (!p || Math.abs(p[0] - tx) + Math.abs(p[1] - ty) > 4) p = mpos[id] = [tx, ty]; else { p[0] += (tx - p[0]) * 0.2; p[1] += (ty - p[1]) * 0.2; }
      const wx = p[0] * 8, wy = p[1] * 8 + 3; if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue; const st = m.st[k], an = st === 3 ? 'wreck' : st === 1 ? 'attack' : 'move', fs = A.anim('machine/' + MNAME[m.type[k]] + '/' + an + '/' + BDIR[m.dir[k]]); if (!fs.length) continue;
      const fi = st === 1 ? Math.min(fs.length - 1, (m.ph[k] / 1000 * fs.length) | 0) : st === 0 ? ((t * 6) | 0) % fs.length : 0, team = S.teamOf(m.people[k], m.kd[k]);
      if (far) G.spr(fs[fi], wx, wy, team, 0, 0, 1, Math.min(2, 0.75 / Game.cam.z), 0); else G.spr(fs[fi], wx, wy, team, 0, 0, 1, 1, 0); } };
  const BDIR = ['down', 'left', 'up', 'right'], BNAME = ['fishboat', 'ship'], bpos = {};
  // boats (chantier B.2): drawn between the buildings and the units, smoothed toward their simulated place; a wake while under way
  S.drawBoats = function (G, vx0, vy0, vx1, vy1, t, far) { const m = S.boats; if (!m) return; const fr = AL.Assets.frames;
    for (let k = 0; k < m.n; k++) { const id = m.id[k]; let p = bpos[id]; const tx = m.x[k], ty = m.y[k]; if (!p || Math.abs(p[0] - tx) + Math.abs(p[1] - ty) > 4) p = bpos[id] = [tx, ty, 0]; else { p[0] += (tx - p[0]) * 0.18; p[1] += (ty - p[1]) * 0.18; }
      const wx = p[0] * 8, wy = p[1] * 8 + 2; if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue; const st = m.st[k], moving = st === 0 || st === 2 || st === 4, f = fr['boat/' + BNAME[m.type[k]] + '/' + BDIR[m.dir[k]] + '/' + (((t * (moving ? 5 : 2.5) + id * 1.7) | 0) & 3)]; if (!f) continue;
      const team = S.teamOf(m.people[k], m.kd[k]); if (far) { G.spr(f, wx, wy, team, 0, 0, 1, Math.min(2.2, 0.75 / Game.cam.z), 0); continue; } G.spr(f, wx, wy, team, 0, 0, 1, 1, 0);
      if (moving && AL.Fx && t - p[2] > (m.type[k] ? 0.28 : 0.4)) { p[2] = t; AL.Fx.add('ripple', wx, wy + 3, { zb: -20, life: 0.7 }); } } };
  Game.on('owner', m => { if (!Game.map) return; Game.map.owner.set(m.owner); S.towns = m.towns; S.kw = m.kw || []; S.ka = m.ka || []; S.kn = m.kn || []; Game.kingdomRamp = m.kr || []; if (S.blds) { S.blds.tk = m.towns.map(t => t ? t[0] : -1); } if (S.layer) S.applyLayer(); });
  // ---- kingdoms layer: territory tint and borders
  // map layers: 1 kingdoms, 2 wars, 3 alliances, 4 religions, 5 cultures, 6 resources, 7 population. One id per group, one colour per id.
  const LRAMP = [9, 14, 13, 10, 11, 15, 6, 2, 3, 12, 7, 0];
  S.applyLayer = function () { const M = Game.map, G = AL.Gfx, A = AL.Assets; if (!M) return; if (!S.layer) { G.layerOn = 0; return; }
    const n = M.n, ids = S._ids && S._ids.length === n * n ? S._ids : (S._ids = new Uint8Array(n * n)), o = M.owner, pal = new Uint8Array(1024), tw = S.towns || [], L = S.layer, kw = S.kw || [], ka = S.ka || [];
    const setc = (id, ramp, tone) => { const c = A.palette.rgb[ramp * 6 + tone]; pal[id * 4] = c[0]; pal[id * 4 + 1] = c[1]; pal[id * 4 + 2] = c[2]; pal[id * 4 + 3] = 255; };
    if (L === 6) { const ft = M.feature, F = AL.F, gr = M.ground; setc(1, 10, 2); setc(2, 5, 4); setc(3, 10, 4); setc(4, 11, 4); setc(5, 1, 2); setc(6, 5, 2); setc(7, 6, 4);
      for (let i = 0; i < ids.length; i++) { const f = ft[i]; ids[i] = f === F.ore_copper ? 1 : f === F.ore_iron ? 2 : f === F.ore_gold ? 3 : f === F.ore_aether ? 4 : AL.fKind[f] === 1 ? 5 : f === F.rock || gr[i] === AL.G.mountain ? 6 : gr[i] === AL.G.shallow ? 7 : 0; } G.setLayer(ids, pal); G.layerOn = 1; return; }
    const idOf = [];
    for (let t = 0; t < tw.length; t++) { const T = tw[t]; if (!T) { idOf[t] = 0; continue; } const kd = T[0]; let id, ramp, tone = 3;
      if (L === 1) { id = kd >= 0 ? (kd % 200) + 1 : 201 + (t % 54); ramp = S.teamOf(T[1], kd); }
      else if (L === 2) { const w = kd >= 0 && kw[kd] > 0; id = w ? 1 + (kd % 100) : 150; ramp = w ? S.teamOf(T[1], kd) : 5; tone = 3; }
      else if (L === 3) { const a = kd >= 0 ? ka[kd] : -1; id = a >= 0 ? 1 + (a % 100) : 150; ramp = a >= 0 ? LRAMP[(a + 1) % LRAMP.length] : 5; }
      else if (L === 4) { const r = T[5]; id = r >= 0 ? 1 + (r % 100) : 150; ramp = r >= 0 ? LRAMP[(r * 5 + 3) % LRAMP.length] : 5; tone = r >= 0 ? 3 + (r % 2) : 3; }
      else if (L === 5) { const c = T[6]; id = c >= 0 ? 1 + (c % 100) : 150; ramp = c >= 0 ? LRAMP[(c * 7 + 1) % LRAMP.length] : 5; tone = c >= 0 ? 2 + (c % 3) : 3; }
      else { const p = T[7] || 0, b = p < 10 ? 1 : p < 25 ? 2 : p < 50 ? 3 : 4; id = b; ramp = 10; tone = b; }
      idOf[t] = id; setc(id, ramp, tone); }
    for (let i = 0; i < ids.length; i++) { const v = o[i]; ids[i] = v ? (idOf[v - 1] || 0) : 0; }
    // wars layer: the front line, two tiles thick, where the lands of two kingdoms at war touch
    if (L === 2 && S.warPairs && S.warPairs.size) { const wp = S.warPairs; setc(250, 10, 4); for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) { const i = y * n + x, v = o[i]; if (!v) continue; const ta = tw[v - 1]; if (!ta || ta[0] < 0) continue;
        for (let d = 0; d < 2; d++) { const j = d ? i + n : i + 1, u = o[j]; if (!u || u === v) continue; const tb = tw[u - 1]; if (!tb || tb[0] < 0 || tb[0] === ta[0]) continue; const lo = Math.min(ta[0], tb[0]), hi = Math.max(ta[0], tb[0]); if (wp.has(lo * 4096 + hi)) { ids[i] = 250; ids[j] = 250; } } } }
    G.setLayer(ids, pal); G.layerOn = 1; };
  // ---- reading the war (chantier B.5): armies on the march, fronts, sieges and towns taken, drawn over the wars layer at a constant size on the screen
  Game.on('warmap', m => { S.warmap = m; let key = m.pairs.join(','); if (key !== S._wpk) { S._wpk = key; const wp = S.warPairs = new Set(); for (let k = 0; k < m.pairs.length; k += 2) wp.add(m.pairs[k] * 4096 + m.pairs[k + 1]); if (S.layer === 2) S.applyLayer(); } });
  S.drawWar = function (G, t) { const m = S.warmap; if (!m || S.layer !== 2) return; const fr = AL.Assets.frames, z = Game.cam.z, sc = Math.max(0.7, Math.min(8, 2 / z)), ZB = 3000, FLG = 40; let nd = 0;
    const fF = fr['mark/front'], fD = fr['mark/far'], fS = fr['mark/siege'], fT = fr['mark/taken'], fP = fr['mark/step']; if (!fF) return;
    for (let k = 0; k < m.fronts.length; k++) { const f = m.fronts[k], pulse = ((t * 2 + k * 0.37) | 0) & 1; G.spr(f[4] ? fD : fF, f[0] * 8, f[1] * 8 - (f[4] ? 0 : pulse * sc), 0, FLG, 0, 1, sc, ZB); nd++; }
    for (let k = 0; k < m.taken.length; k++) { const c = m.taken[k]; let bes = false; for (let q = 0; q < m.sieges.length; q++) if (m.sieges[q][0] === c[0] && m.sieges[q][1] === c[1]) bes = true; if (bes) continue; G.spr(fT, c[0] * 8, c[1] * 8 - 14 * sc, S.teamOf(c[3], c[2]), FLG, 0, 1, sc, ZB + 1); nd++; }
    for (let k = 0; k < m.sieges.length; k++) { const c = m.sieges[k], bob = ((t * 3 + k) | 0) & 1; G.spr(fS, c[0] * 8, c[1] * 8 - (14 + bob) * sc, 0, FLG, 0, 1, sc, ZB + 2); nd++; }
    for (let k = 0; k < m.armies.length; k++) { const a = m.armies[k], team = S.teamOf(a[4], a[3]), ax = a[0] * 8, ay = a[1] * 8, tx = a[5] * 8, ty = a[6] * 8, dx = tx - ax, dy = ty - ay, len = Math.sqrt(dx * dx + dy * dy);
      if (!a[7] && len > 22 * sc) { const ux = dx / len, uy = dy / len, gap = 6 * sc, end = len - 9 * sc, ph = (t * 1.6) % 1; let q = 0; for (let d = 7 * sc + ph * gap; d < end && q < 90; d += gap, q++) G.spr(fP, ax + ux * d, ay + uy * d, team, FLG, 0, 1, sc, ZB + 3);
        const h = fr['mark/head/' + ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8)]; if (h) G.spr(h, ax + ux * end, ay + uy * end, team, FLG, 0, 1, sc, ZB + 3); }
      const f = fr['mark/army/' + (a[2] < 8 ? 0 : a[2] < 20 ? 1 : 2)]; if (f) { G.spr(f, ax, ay - (4 + (((t * 2.5 + k) | 0) & 1)) * sc, team, FLG, 0, 1, sc, ZB + 4); nd++; } }
    S.warDrawn = nd; };
  S.setLayer = function (v) { S.layer = v; S.applyLayer(); };
  // ---- day / night ambience (refined with weather and ages in the effects module)
  const STINT = [[0.99, 1.03, 0.98], [1.04, 1.02, 0.95], [1.07, 0.98, 0.88], [0.92, 0.97, 1.07]];
  const SCOVER = [null, null, { a: ['sand', 3], b: ['earth', 4], w: { forest: 34, grass: 14, hills: 8, swamp: 10, soil: 10 } }, { a: ['ice', 5], b: ['ice', 4], w: { grass: 55, forest: 50, soil: 50, road: 22, hills: 65, mountain: 70, tundra: 75, swamp: 35, sand: 12, volcanic: 20 } }];
  const KEYS = [[0.00, 0.50, 0.52, 0.80], [0.05, 0.86, 0.72, 0.74], [0.12, 1.0, 0.98, 0.94], [0.50, 1.02, 1.0, 0.96], [0.62, 1.0, 0.86, 0.72], [0.70, 0.78, 0.60, 0.74], [0.76, 0.46, 0.48, 0.78], [1.0, 0.50, 0.52, 0.80]];
  S.update = function (dt, env) { const p = Game.tick == null ? 0.3 : ((Game.tick + (S.cur && Game.simSpeed ? 0 : 0)) % AL.DAY) / AL.DAY; let k = 0; while (k < KEYS.length - 2 && p > KEYS[k + 1][0]) k++; const a = KEYS[k], b = KEYS[k + 1], f = (p - a[0]) / (b[0] - a[0]);
    if (!env.lockAmbient) { env.ambient[0] = a[1] + (b[1] - a[1]) * f; env.ambient[1] = a[2] + (b[2] - a[2]) * f; env.ambient[2] = a[3] + (b[3] - a[3]) * f; }
    // seasons (chantier B.8): colour of the light, cover on the ground (snow, fallen leaves), frost on the trees
    { const h = Game.hud, se = h && h.season != null ? h.season : 1, sp = h && h.seasonP != null ? h.seasonP : 0.5, edge = Math.min(1, sp / 0.15, (1 - sp) / 0.15), G = AL.Gfx, A = AL.Assets, T = STINT[se], N = STINT[(se + 1) % 4], P = STINT[(se + 3) % 4], wn = sp > 0.85 ? (sp - 0.85) / 0.3 : 0, wp = sp < 0.15 ? (0.15 - sp) / 0.3 : 0;
      if (!env.lockAmbient) for (let k = 0; k < 3; k++) env.ambient[k] *= T[k] * (1 - wn - wp) + N[k] * wn + P[k] * wp;
      if (S.season !== se) { S.season = se; G.seasW.fill(0); const C = SCOVER[se]; if (C) { for (const g in C.w) if (AL.G[g] != null) G.seasW[AL.G[g]] = C.w[g]; G.seasA = A.ix(C.a[0], C.a[1]); G.seasB = A.ix(C.b[0], C.b[1]); } }
      G.seasAmt = SCOVER[se] ? edge : 0; S.frost = se === 3 && edge > 0.5; S.seasonEdge = edge; }
    S.night = p > 0.72 || p < 0.04 ? 1 : p > 0.66 ? (p - 0.66) / 0.06 : p < 0.08 ? 1 - (p - 0.04) / 0.04 : 0; env.night = S.night; env.sun[0] = 0.55 - (p - 0.4) * 0.5; };
  // ---- drawing
  let bellF = null;
  const LOADF = [], LOX = [0, -5, 0, 5], LOY = [-2, -3, -3, -3], LOZ = [4, 5, 5, 5], loadOf = r => LOADF[r] !== undefined ? LOADF[r] : (LOADF[r] = AL.Assets.frames['load/' + AL.RESN[r]] || null);
  const markUnit = () => S._mk || (S._mk = AL.Assets.frames['mark/unit/0']);
  const VEILM = [0, 0.55, 1, 1.6], VEILZ = [0.75, 1, 1.5, 2, 3];   // old saved choices (index into this list); the option now stores the zoom itself in veilzv   // clearing size; zoom from which the clearing starts to open (option, default x1)
  S.draw = function (env) { const G = AL.Gfx, c = Game.cam, z = c.z, A = AL.Assets, vx0 = c.x - 40, vy0 = c.y - 40, vx1 = c.x + G.W / z + 40, vy1 = c.y + G.H / z + 70, far = z < 0.74, night = S.night > 0.5, vz = Game.options && Game.options.veilzv != null ? Game.options.veilzv : (Game.options && Game.options.veilz != null ? VEILZ[Game.options.veilz] : 1) || 1, vs = Math.max(vz, 0.75), vm = z < vs ? 0 : VEILM[Game.options && Game.options.veil != null ? Game.options.veil : 2] || 0; G.veilStart = vz < 0.75 ? 0.74 : vz; G.veilFade = vz < 0.75 ? 0.1 : 0.5; // size of the clearing opened in the trees (option: off, small, medium, large)
    // buildings
    const B = S.blds; let nb = 0;
    if (B) { const fr = S.bldFrames || (S.bldFrames = new Array(B.n)); for (let b = 0; b < B.n; b++) { if (!B.alive[b]) continue; const T = AL.BTYPES[B.type[b]], w = T.fp[0], h = T.fp[1], wx = (B.x[b] + w / 2) * 8, wy = (B.y[b] + h) * 8; if (wx < vx0 - 30 || wx > vx1 + 30 || wy < vy0 || wy > vy1 + 20) continue;
        const st = B.state[b], pr = B.prog[b], v = st === 1 ? 0 : st === 3 ? 3 : pr < 12 ? -1 : pr < 58 ? 1 : 2, key = b * 8 + v + 1 + B.stage[b] * 100; let f = fr[b];
        if (!f || f.key !== key) { const tp = B.town[b] >= 0 ? B.tp[B.town[b]] : 0, set = T.people || ((AL.KINDS[tp] && AL.Assets.frames['bld/' + AL.KINDS[tp].buildSet + '/' + T.name + '/0/0']) ? AL.KINDS[tp].buildSet : 'human'); // a people's own building keeps its people's look whoever holds the town
          f = v < 0 ? A.frames['bld/site/' + w + 'x' + h + '/0'] : A.frames['bld/' + set + '/' + T.name + '/' + B.stage[b] + '/' + v]; if (!f) f = A.frames['bld/human/house/0/0']; f = fr[b] = { f, key, ex: f[6] || null }; }
        const town = B.town[b], team = town >= 0 ? S.teamOf(B.tp[town], B.tk[town]) : 5, lit = night && st === 1 && (AL.hash2(b, 3, 1) < 0.8);
        G.spr(f.f, wx, wy, team, lit ? 0 : 64, 0, 1, 1, -2); nb++; if (vm) G.occ(wx + f.f[2] / 2 - f.f[4], wy - f.f[5] + f.f[3] * 0.55, Math.max(f.f[2], f.f[3]) * (0.45 + 0.5 * vm), 0.9, wy - 2);
        if (lit && f.ex && f.ex.light && T.light) G.light(wx + f.ex.light[0], wy + f.ex.light[1] + 4, 26, 0.55 * S.night, 0);
        if (st === 1 && f.ex && f.ex.light && (T.name === 'forge' || T.name === 'temple') && !lit) G.light(wx + f.ex.light[0], wy + f.ex.light[1] + 2, 12, 0.25, 1);
        if (st === 1 && f.ex && f.ex.smoke && AL.Fx && AL.Fx.smoke) AL.Fx.smoke(b, wx + f.ex.smoke[0], wy + f.ex.smoke[1], T.name === 'forge'); } }
    S.nBlds = nb;
    S.drawBoats(G, vx0, vy0, vx1, vy1, Game.time, far);
    S.drawMachines(G, vx0, vy0, vx1, vy1, Game.time, far);
    if (S.layer === 2) S.drawWar(G, Game.time);
    // units
    const m = S.cur; let nu = 0; S.selPos = null; if (!m) { S.nUnits = 0; return; }
    const pv = S.prev, now = performance.now() / 1000, al = Math.min(1, (now - S.t0) / S.dur), t = Game.time, np = AL.NPEOPLE, mk = far ? markUnit() : null;
    for (let i = 0; i < m.n; i++) { if (!m.alive[i]) { lastAnim[i] = 255; continue; } let x = m.x[i], y = m.y[i];
      if (pv && i < pv.n && pv.alive[i] && pv.gen[i] === m.gen[i]) { const ox = pv.x[i], oy = pv.y[i], dx = x - ox, dy = y - oy; if (dx * dx + dy * dy < 9) { x = ox + dx * al; y = oy + dy * al; } }
      px[i] = x; py[i] = y; const an = m.anim[i]; if (an !== lastAnim[i] || m.gen[i] !== lastGen[i]) { lastAnim[i] = an; lastGen[i] = m.gen[i]; animStart[i] = t; }
      if (an === 14) continue; // inside a building
      const wx = x * 8, wy = y * 8 + 2; if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue; if (S.sel === i) S.selPos = [wx, wy]; const kind = m.kind[i]; if (vm && an !== 14) { const sz = AL.KINDS[kind].size || 24; G.occ(wx, wy - sz * 0.4, Math.max(30, sz * 1.15) * vm, 1, wy); } if (kind >= np && S.drawCreature(m, i, kind, an, wx, wy, t, far)) { if (!far && m.hd && m.hd[i] && an !== 7) { const bf = bellF || (bellF = AL.Assets.frames['mark/bell']); if (bf) G.spr(bf, wx, wy - AL.KINDS[kind].size * 0.42, 0, 0, 0, 1, 1, 14); } nu++; continue; }
      const team = S.teamOf(kind, m.kd[i]), fl = m.flags[i];
      if (far) { if (mk) G.spr(mk, wx, wy, team, 0, 0, 1, 0.8 / z, 0); nu++; continue; }
      const fs = framesOf(kind, m.look[i], an, m.dir[i]); let fi; const el = t - animStart[i];
      if (fs.once) fi = Math.min(fs.length - 1, (el * fs.fps) | 0); else fi = (((an === 1 ? t : el) * fs.fps + (an === 1 ? i * 0.37 : 0)) | 0) % fs.length;
      const alpha = (fl & 1) && el > 6 ? Math.max(0, 1 - (el - 6) / 2.5) : 1;
      G.spr(fs[fi], wx, wy, team, ((fl & 8) || (fl & 16) ? 4 : 0) | (S.flash && S.flash[i] > t ? 2 : 0), 0, alpha, 1, 0); nu++;
      // what the villager carries (chantier B.7): held in front when facing us, on the back when walking away, at the hip from the side
      if (m.carry[i] && m.cr && an <= 1 && !(fl & 1)) { const lf = loadOf(m.cr[i]); if (lf) { const d = m.dir[i], bob = an === 1 ? ((t * 8 + i * 0.37) | 0) & 1 : 0; G.spr(lf, wx + LOX[d], wy + LOY[d] - bob, 0, 0, 0, alpha, 1, LOZ[d]); } }
      if (S.sel === i) S.selPos = [wx, wy]; }
    S.nUnits = nu; };
  // animals: frames '<species>/<anim>/<dir>/<i>'; humanoid monsters go through the people path
  const ccache = [], CMAP = { quad: { fly: 'idle', swim: 'walk', work: 'eat', pray: 'idle', joy: 'idle', special: 'attack', inside: 'idle' }, bird: { walk: 'fly', run: 'fly', eat: 'idle', sleep: 'idle', hit: 'fly', swim: 'fly' }, fish: { idle: 'swim', walk: 'swim', eat: 'swim', fly: 'swim', attack: 'run', hit: 'run', sleep: 'swim' } }, CALT = { run: ['walk', 'swim'], eat: ['idle'], attack: ['walk', 'fly', 'swim'], hit: ['idle', 'walk', 'swim'], sleep: ['idle'], swim: ['walk'], walk: ['swim'] }, CFPS = { idle: 3, walk: 8, run: 12, eat: 4, attack: 10, hit: 8, death: 8, sleep: 1.5, fly: 9, swim: 6 };
  S.drawCreature = function (m, i, kind, an, wx, wy, t, far) { const K = AL.KINDS[kind]; if (K.humanoid) return false; if (far) return true; const G = AL.Gfx, c0 = ccache[kind] || (ccache[kind] = []), c1 = c0[an] || (c0[an] = []), dir = m.dir[i]; let fs = c1[dir];
    if (!fs) { const A = AL.Assets, rig = K.fly ? 'bird' : K.swim ? 'fish' : 'quad'; let a = AL.ANIMN[an] || 'idle'; a = CMAP[rig][a] || a; const two = a === 'death' || a === 'sleep'; fs = A.anim(K.name + '/' + a + '/' + (two ? (dir === 1 || dir === 0 ? 'right' : 'left') : DIRN[dir])); if (!fs.length) { const alt = CALT[a], d2 = (two ? (dir === 1 || dir === 0 ? 'right' : 'left') : DIRN[dir]); for (let q = 0; alt && q < alt.length && !fs.length; q++) { a = alt[q]; fs = A.anim(K.name + '/' + a + '/' + d2); } } if (!fs.length) fs = A.anim(K.name + '/' + (rig === 'quad' ? 'idle' : rig === 'bird' ? 'fly' : 'swim') + '/down'); fs.fps = CFPS[a] || 6; fs.once = a === 'death'; fs.air = a === 'fly'; c1[dir] = fs; }
    if (!fs.length) return true; const el = t - animStart[i], fi = fs.once ? Math.min(fs.length - 1, (el * fs.fps) | 0) : ((t * fs.fps + i * 0.61) | 0) % fs.length, fl = m.flags[i], alpha = (fl & 1) && el > 6 ? Math.max(0, 1 - (el - 6) / 2.5) : 1;
    G.spr(fs[fi], wx, wy - (fs.air ? 10 : 0), 0, (K.swim ? 16 : 0) | (S.flash && S.flash[i] > t ? 2 : 0), 0, alpha, 1, fs.air ? 10 : 0); return true; };
  // world position of a unit as drawn (for following and picking)
  S.unitPos = function (i) { const m = S.cur; return m && i < m.n && m.alive[i] ? [px[i] * 8, py[i] * 8] : null; };
  S.pick = function (wx, wy) { const m = S.cur; if (!m) return -1; let best = -1, bd = 18 * 18; for (let i = 0; i < m.n; i++) { if (!m.alive[i] || m.anim[i] === 14) continue; const dx = px[i] * 8 - wx, dy = py[i] * 8 - 8 - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } } return best; };
  S.pickBld = function (tx, ty) { const B = S.blds; if (!B) return -1; for (let b = 0; b < B.n; b++) { if (!B.alive[b]) continue; const T = AL.BTYPES[B.type[b]]; if (tx >= B.x[b] && tx < B.x[b] + T.fp[0] && ty >= B.y[b] - 1 && ty < B.y[b] + T.fp[1]) return b; } return -1; };
  // ---- default actions (the interface module extends this)
  const SPEEDS = [0.5, 1, 2, 5, 10, 50];
  Game.onAction = function (a) { if (AL.UI && AL.UI.action && AL.UI.action(a)) return;
    if (a === 'zoomIn') Game.zoomAt(1); else if (a === 'zoomOut') Game.zoomAt(-1);
    else if (a === 'pause') { if (Game.speed > 0) { Game.pausedFrom = Game.speed; Game.setSpeed(0); } else Game.setSpeed(Game.pausedFrom || 1); }
    else if (a === 'faster' || a === 'slower') { const cur = Game.speed > 0 ? Game.speed : (Game.pausedFrom || 1); let i = SPEEDS.indexOf(cur); if (i < 0) i = 1; i = AL.clamp(i + (a === 'faster' ? 1 : -1), 0, SPEEDS.length - 1); Game.setSpeed(SPEEDS[i]); }
    else if (a === 'cancel') { if (Game.hud && Game.hud.ctl >= 0) AL.Tools.release(); Game.tool = { id: 'none', size: Game.tool.size, shape: Game.tool.shape }; }
    else if (a === 'layerNext') S.setLayer((S.layer + 1) % 8);
    else if (a === 'brushBigger') Game.tool.size = Math.min(40, Game.tool.size + 1); else if (a === 'brushSmaller') Game.tool.size = Math.max(1, Game.tool.size - 1); };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
