// AL.Fx — everything that flashes, burns, falls and shakes: effect sprites and particles (frames 'fx/<name>/<i>'), tile and
// building fires with their lights, weather (global and local zones), moving phenomena (tornado, meteor, flood, eruption),
// state icons above units, screen shake, flash, hit-stop, the tint of the current age, and the sounds of all of it.
(function (AL) {
  'use strict';
  const Game = AL.Game, G = AL.Gfx, S = AL.Scene, Fx = AL.Fx = { n: 0, shake: 0, flash: 0, quakeT: 0, lastBrush: 0, wAmb: [1, 1, 1], tint: [0, 0, 0, 0], tor: {}, counts: {} };
  const CAP = 2048, FR = new Array(CAP), X = new Float32Array(CAP), Y = new Float32Array(CAP), Z = new Float32Array(CAP), VX = new Float32Array(CAP), VY = new Float32Array(CAP), VZ = new Float32Array(CAP), GR = new Float32Array(CAP),
    AGE = new Float32Array(CAP), LIFE = new Float32Array(CAP), FL = new Uint8Array(CAP), SC = new Float32Array(CAP), ZB = new Float32Array(CAP), AL0 = new Float32Array(CAP), FIX = new Int8Array(CAP), END = new Uint8Array(CAP), TONE = new Int8Array(CAP);
  const anims = {}, an = name => anims[name] || (anims[name] = AL.Assets.anim('fx/' + name));
  const rnd = (a, b) => a + Math.random() * (b - a);
  S.flash = new Float32Array(8192);
  // flags: 8 emissive, 32 no shadow (always set here)
  const EM = { 'fire/a': 1, 'fire/b': 1, 'fire/big': 1, boom: 1, blast: 1, mushroom: 1, 'bolt/a': 1, 'bolt/b': 1, 'bolt/c': 1, spark: 1, ember: 1, heal: 1, holy: 1, bless: 1, curse: 1, magic: 1, teleport: 1, meteor: 1, 'p/ember': 1, shock: 1, heart: 1, rage: 1, dark: 1 };
  // add(name, wx, wy, {vx, vy, z, vz, g, life, delay, scale, zb, alpha, fix, end, tone})
  Fx.add = function (name, wx, wy, o) { const f = an(name); if (!f.length || Fx.n >= CAP) return -1; const i = Fx.n++; o = o || Fx._o; FR[i] = f; X[i] = wx; Y[i] = wy; Z[i] = o.z || 0; VX[i] = o.vx || 0; VY[i] = o.vy || 0; VZ[i] = o.vz || 0; GR[i] = o.g || 0;
    AGE[i] = -(o.delay || 0); LIFE[i] = o.life || f.length / 12; FL[i] = 32 | (EM[name] ? 8 : 0) | (o.flip ? 1 : 0); SC[i] = o.scale || 1; ZB[i] = o.zb == null ? 6 : o.zb; AL0[i] = o.alpha || 1; FIX[i] = o.fix == null ? -1 : o.fix; END[i] = o.end || 0; TONE[i] = o.tone || 0; Fx.counts[name] = (Fx.counts[name] || 0) + 1; return i; };
  Fx._o = {};
  Fx.vis = function (wx, wy, m) { const c = Game.cam; m = m || 60; return wx > c.x - m && wy > c.y - m && wx < c.x + G.W / c.z + m && wy < c.y + G.H / c.z + m; };
  Fx.snd = function (name, wx, wy, vol) { const A = AL.Audio; if (!A || !A.play) return; const c = Game.cam, sx = (wx - c.x) * c.z / G.W, sy = (wy - c.y) * c.z / G.H, off = Math.max(0, -sx, sx - 1, -sy, sy - 1); if (off > 1.2) return; A.play(name, { vol: (vol || 1) * (1 - off * 0.7) * AL.clamp(0.45 + c.z * 0.3, 0.4, 1), pan: AL.clamp(sx * 2 - 1, -1, 1) }); };
  Fx.kick = function (shake, flash, stop) { if (shake > Fx.shake) Fx.shake = shake; if (flash > Fx.flash) Fx.flash = flash; if (stop) Game.hitStop = Math.max(Game.hitStop || 0, stop); };
  const burst = (name, wx, wy, n, spread, o) => { for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = Math.random() * spread; Fx.add(name, wx + Math.cos(a) * d, wy + Math.sin(a) * d * 0.7, o); } };
  const fling = (name, wx, wy, n, sp, up, life) => { for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, v = sp * (0.4 + Math.random() * 0.6); Fx.add(name, wx, wy, { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: up * (0.5 + Math.random() * 0.7), g: 260, life: life * (0.7 + Math.random() * 0.5), fix: (Math.random() * 3) | 0 }); } };
  function explosion(wx, wy, r) { const big = r > 3.2; Fx.add(big ? 'blast' : 'boom', wx, wy + (big ? 20 : 10), { scale: big ? Math.max(1, Math.round(r / 5)) : 1, zb: 40, life: big ? 0.9 : 0.6 }); Fx.add('shock', wx, wy + 24, { scale: Math.max(1, Math.round(r / 4)), zb: -30, life: 0.45 });
    fling('debris', wx, wy, Math.min(14, 3 + r * 1.5) | 0, 30 + r * 9, 90 + r * 8, 0.9); burst('smoke', wx, wy - 6, Math.min(12, 2 + r) | 0, r * 5, { vy: -9, life: 1.5, delay: 0.25, zb: 30 }); burst('scorch', wx, wy, Math.min(8, 1 + r) | 0, r * 4, { life: 26, zb: -40, fix: 0 });
    Fx.kick(Math.min(9, 1.5 + r * 0.8), Math.min(0.7, 0.12 + r * 0.05), big ? 0.07 : 0.04); Fx.glow.push([wx, wy, 30 + r * 10, 1.3, 1, 0.5]); }
  Fx.glow = []; // transient lights [wx, wy, radius, intensity, kind, life]
  const GOOD = { heal: 1, strength: 1, fertility: 1, resurrect: 1, prophet: 1, inspire: 1, peace: 1, relic: 1 }, OWNFX = { bolt: 1, meteor: 1, wave: 1, crack: 1, mushroom: 1, boom: 1, blast: 1, teleport: 1 };
  const EV = {
    hit(x, y, t, d) { S.flash[t] = Game.time + 0.12; if (!Fx.vis(x, y)) return; Fx.add('spark', x + rnd(-3, 3), y - 9); if (d >= 10) { Fx.add('blood', x, y - 6); } Fx.snd(d >= 10 ? 'hit_heavy' : 'hit', x, y, 0.7); },
    death(x, y, k, c) { if (!Fx.vis(x, y)) return; if (c === 2) Fx.add('blood', x, y - 4); else Fx.add('soot', x, y - 6, { vy: -6, life: 1 }); Fx.snd(k < AL.NPEOPLE ? 'death' : 'death_beast', x, y, 0.6); },
    chop(x, y) { if (!Fx.vis(x, y)) return; Fx.add('dust', x + rnd(-4, 4), y - 2); Fx.snd('chop', x, y, 0.6); },
    mine(x, y) { if (!Fx.vis(x, y)) return; Fx.add('spark', x + rnd(-4, 4), y - 6); Fx.snd('pick', x, y, 0.6); },
    hammer(x, y) { if (!Fx.vis(x, y)) return; Fx.add('dust', x + rnd(-5, 5), y - 3); Fx.snd('hammer', x, y, 0.55); },
    anvil(x, y) { if (!Fx.vis(x, y)) return; Fx.add('spark', x + rnd(-3, 3), y - 8); Fx.add('ember', x, y - 8, { vy: -10 }); Fx.snd('anvil', x, y, 0.55); },
    treefall(x, y) { x = x * 8 + 4; y = y * 8 + 6; if (!Fx.vis(x, y)) return; burst('dust', x, y, 3, 8); burst('p/leaf', x, y - 14, 5, 8, { vy: 14, vx: rnd(-8, 8), life: 1.1 }); Fx.snd('treefall', x, y, 0.8); },
    built(x, y) { if (!Fx.vis(x, y)) return; burst('dust', x, y - 4, 5, 16); Fx.add('holy', x, y, { zb: -20 }); Fx.snd('built', x, y, 0.8); },
    collapse(x, y) { if (!Fx.vis(x, y, 200)) return; fling('debris', x, y - 10, 8, 40, 100, 0.9); burst('dust', x, y - 6, 8, 18); burst('smoke', x, y - 12, 4, 12, { vy: -8, life: 1.6, delay: 0.2 }); Fx.kick(2.5, 0, 0); Fx.snd('collapse', x, y, 1); },
    splash(x, y) { if (Fx.vis(x, y)) { Fx.add('splash', x, y); Fx.snd('splash', x, y, 0.5); } },
    love(x, y) { if (Fx.vis(x, y)) Fx.add('heart', x, y - 22, { vy: -8, life: 0.9 }); },
    birth(x, y) { if (Fx.vis(x, y)) { Fx.add('heart', x, y - 20, { vy: -8, life: 0.9 }); Fx.snd('birth', x, y, 0.5); } },
    cub(x, y) { if (Fx.vis(x, y)) Fx.add('heart', x, y - 12, { vy: -8, life: 0.9 }); },
    spawn(x, y) { if (Fx.vis(x, y)) { Fx.add('magic', x, y + 4, { zb: 20 }); Fx.glow.push([x, y, 26, 0.8, 3, 0.5]); Fx.snd('spawn', x, y, 0.7); } },
    rise(x, y) { if (Fx.vis(x, y)) { Fx.add('dark', x, y + 8, { zb: -20 }); burst('soot', x, y - 4, 3, 6, { vy: -8, life: 1 }); Fx.snd('rise', x, y, 0.7); } },
    risen(x, y) { if (Fx.vis(x, y)) { Fx.add('holy', x, y + 8, { zb: -20 }); burst('heal', x, y - 8, 4, 8, { vy: -10 }); Fx.glow.push([x, y, 30, 0.9, 5, 0.6]); } },
    stomp(x, y) { if (!Fx.vis(x, y, 200)) return; Fx.add('shock', x, y + 24, { zb: -30, life: 0.4 }); burst('dust', x, y, 6, 20); Fx.kick(3.5, 0, 0.03); Fx.snd('stomp', x, y, 1); },
    arrow(x0, y0, x, y) { if (!Fx.vis(x0, y0) && !Fx.vis(x, y)) return; const dx = x - x0, dy = y - y0, d = Math.hypot(dx, dy) || 1, T = Math.max(0.12, d / 150), ax = Math.abs(dx), ay = Math.abs(dy); Fx.add('arrow', x0, y0, { z: 10, vx: dx / T, vy: dy / T, vz: d * 0.25 / T, g: d * 0.5 / (T * T), life: T, fix: ax > 2 * ay ? 0 : ay > 2 * ax ? 2 : 1, flip: dx < 0 }); Fx.snd('bow', x0, y0, 0.5); },
    bomb(x0, y0, x, y) { if (!Fx.vis(x0, y0, 300) && !Fx.vis(x, y, 100)) return; const dx = x - x0, dy = y - y0, T = 1.1; Fx.add('fire/a', x0, y0, { z: 8, vx: dx / T, vy: dy / T, vz: 150, g: 2 * 150 / T + 14, life: T, end: 1, zb: 30 }); },
    bolt(x, y) { const k = 'abc'[(Math.random() * 3) | 0]; Fx.add('bolt/' + k, x, y + 2, { life: 0.28, zb: 30, flip: Math.random() < 0.5 }); Fx.add('scorch', x, y + 2, { life: 20, zb: -40, fix: 0 }); burst('spark', x, y - 2, 3, 6); const v = Fx.vis(x, y, 40); Fx.kick(v ? 3 : 0.6, v ? 0.55 : 0.22, v ? 0.03 : 0); Fx.glow.push([x, y - 20, 90, 1.6, 2, 0.3]); Fx.snd('thunder', x, y, 1); },
    boom(x, y, r) { explosion(x, y, r); Fx.snd(r > 3.2 ? 'boom_big' : 'boom', x, y, 1); },
    nuke(x, y, r) { Fx.add('mushroom', x, y + 30, { scale: 3, life: 2.6, zb: 200 }); Fx.add('shock', x, y + 30, { scale: 5, zb: -30, life: 0.9 }); Fx.add('shock', x, y + 30, { scale: 3, zb: -30, life: 0.6, delay: 0.25 }); fling('debris', x, y, 20, 160, 220, 1.4); burst('smoke', x, y, 22, r * 6, { vy: -7, life: 2.6, delay: 0.6, zb: 40 }); burst('scorch', x, y, 14, r * 5, { life: 40, zb: -40, fix: 1 });
      Fx.kick(14, 1, 0.14); Fx.glow.push([x, y, 300, 2.2, 1, 2.2]); Fx.snd('nuke', x, y, 1); },
    impact(x, y, r) { explosion(x, y, r * 1.5); burst('fire/a', x, y, 6, r * 6, { life: 1.2 }); Fx.snd('boom_big', x, y, 1); },
    meteor(x, y) { const T = 1.4 / Math.max(0.5, Game.effSpeed || Game.speed || 1); Fx.add('meteor', x + 150, y, { z: 300, vx: -150 / T, vz: -300 / T, life: T, zb: 300, scale: 2 }); Fx.snd('meteor_fall', x, y, 0.9); },
    quake(x, y, r) { Fx.quakeT = 6 / Math.max(0.5, Game.effSpeed || 1); Fx.snd('quake', x, y, 1); },
    crack(x, y) { x = x * 8 + 4; y = y * 8 + 6; if (!Fx.vis(x, y)) return; Fx.add('crack', x, y + 8, { life: 30, zb: -40, fix: 2, flip: Math.random() < 0.5 }); Fx.add('dust', x, y); },
    flood(x, y) { Fx.snd('wave', x, y, 1); Fx.kick(1.5, 0, 0); },
    teleport(x0, y0, x, y) { Fx.add('teleport', x0, y0 + 4, { zb: 20 }); Fx.add('teleport', x, y + 4, { zb: 20, delay: 0.15 }); Fx.glow.push([x, y, 40, 1, 3, 0.6]); Fx.snd('magic', x, y, 0.9); },
    town(x, y) { x *= 8; y *= 8; if (Fx.vis(x, y)) { Fx.add('holy', x, y + 8, { zb: -20 }); burst('heal', x, y - 6, 5, 16, { vy: -9 }); } Fx.snd('town', x, y, 0.8); },
    stage(x, y) { x *= 8; y *= 8; if (Fx.vis(x, y)) { Fx.add('holy', x, y + 8, { zb: -20, scale: 2 }); burst('bless', x, y - 6, 8, 30, { vy: -9 }); } Fx.snd('stage', x, y, 0.9); },
    capture(x, y) { x *= 8; y *= 8; if (Fx.vis(x, y)) { Fx.add('dark', x, y + 8, { zb: -20, scale: 2 }); burst('smoke', x, y - 6, 6, 30, { vy: -8, life: 1.6 }); } Fx.snd('horn', x, y, 0.9); },
    siege(x, y) { if (Fx.vis(x, y)) { fling('debris', x, y - 8, 3, 26, 70, 0.7); Fx.add('dust', x, y - 4); Fx.snd('siege', x, y, 0.7); } },
    era() { Fx.kick(0, 0.5, 0); const A = AL.Audio; if (A && A.play) A.play('era', { vol: 1 }); },
    weather() { },
    pw(id, x, y, r) { const d = AL.DATA.powers[id]; if (!d) return; x *= 1; if (d.fx && !OWNFX[d.fx] && d.kind !== 'brush') { const n = AL.clamp((r * r * 0.7) | 0, 3, 36), big = an(d.fx)[0] && an(d.fx)[0][2] > 16; for (let k = 0; k < (big ? Math.max(1, n >> 3) : n); k++) { const a = Math.random() * 6.283, q = Math.sqrt(Math.random()) * r * 8 * 0.9; Fx.add(d.fx, x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8 - (big ? 0 : 6), { delay: Math.random() * 0.5, vy: big ? 0 : -8, zb: 20 }); } }
      if (d.cat === 'divine') { const good = GOOD[id]; Fx.add(good ? 'holy' : 'dark', x, y + 8 * Math.max(1, Math.round(r / 2.5)), { zb: -30, scale: Math.max(1, Math.round(r / 2.5)) }); Fx.glow.push([x, y, 20 + r * 9, 0.9, good ? 5 : 3, 0.7]); }
      if (d.zone) Fx.glow.push([x, y, r * 8, 0.5, 2, 0.5]);
      if (d.snd && d.fx !== 'bolt' && !/boom|nuke/.test(d.snd)) Fx.snd(d.snd, x, y, 1); }
  };
  const TILEEV = { hit: 1, death: 1, chop: 1, mine: 1, hammer: 1, anvil: 1, built: 1, collapse: 1, splash: 1, love: 1, birth: 1, cub: 1, spawn: 1, rise: 1, risen: 1, stomp: 1, bolt: 1, boom: 1, nuke: 1, impact: 1, meteor: 1, quake: 1, flood: 1, siege: 1 };
  Fx.event = function (e) { const t = e[0], h = EV[t]; Fx.counts['ev:' + t] = (Fx.counts['ev:' + t] || 0) + 1; if (!h) return;
    if (t === 'pw') h(e[1], e[2] * 8, e[3] * 8, e[4]); else if (t === 'arrow' || t === 'bomb' || t === 'teleport') h(e[1] * 8, e[2] * 8, e[3] * 8 + (t === 'bomb' ? 4 : 0), e[4] * 8 + (t === 'bomb' ? 4 : 0)); else if (TILEEV[t]) h(e[1] * 8, e[2] * 8, e[3], e[4]); else h(e[1], e[2], e[3], e[4]); };
  // chimney smoke (called by the scene for each visible finished building with a chimney)
  Fx.smoke = function (b, wx, wy, forge) { if (Game.cam.z < 0.74 || Fx.n > CAP - 300) return; if (Math.random() < (forge ? 0.07 : 0.035)) Fx.add(forge ? 'soot' : 'smoke', wx + rnd(-1, 1), wy, { vy: -7, vx: Fx.windX * 6 + rnd(-1, 1), life: forge ? 1.5 : 2.2, zb: 40, alpha: 0.85 }); };
  Fx.brushFeedback = function (id, M) { const now = Game.time; if (now - Fx.lastBrush < 0.07) return; Fx.lastBrush = now; const key = id.split(':')[0], d = AL.DATA.powers[key] || AL.DATA.powers.ground, sz = (Game.tool.size || 1) * 4;
    if (key === 'spawn') return; for (let k = 0; k < Math.min(4, 1 + (sz >> 4)); k++) Fx.add(d.fx || 'dust', M.wx + rnd(-sz, sz), M.wy + rnd(-sz, sz) * 0.8, { vy: -6 }); if (d.snd) Fx.snd(d.snd, M.wx, M.wy, 0.5); };
  Fx.windX = 0.3; Fx.windY = 0;
  // ---- per frame
  const WAMB = [[1, 1, 1], [0.8, 0.84, 0.94], [0.6, 0.64, 0.8], [0.93, 0.96, 1.04], [0.9, 0.92, 0.95]], ZFX = [null, 'p/rain', 'p/acid', 'p/rain2', 'p/sand', 'p/snow', 'p/sand', 'p/ash'];
  const ICON = [[9, 'toxic'], [10, 'poison'], [3, 'rage'], [2, 'mad'], [1, 'curse'], [0, 'heal'], [4, 'bless']];
  function precip(name, nDrops, speed, slant, alpha, c, z, t) { const f = an(name); if (!f.length) return; const W = G.W, H = G.H + 24, sc = z < 1 ? Math.round(1 / z) : 1, ox = c.x * z, oy = c.y * z;
    for (let k = 0; k < nDrops; k++) { const h1 = AL.hash2(k, 11, 3), h2 = AL.hash2(k, 12, 3), h3 = AL.hash2(k, 13, 3), sp = speed * (0.75 + h3 * 0.5); let sx = (h1 * W - ox + t * slant * sp) % W, sy = (h2 * H - oy + t * sp) % H; if (sx < 0) sx += W; if (sy < 0) sy += H;
      G.spr(f[(k + ((t * 6) | 0)) % f.length], c.x + sx / z, c.y + (sy - 12) / z, 0, 32, 0, alpha, sc, 3000); } }
  Fx.draw = function (dt, env) { const c = Game.cam, z = c.z, t = Game.time, M = Game.map, n = M.n, hud = Game.hud, far = z < 0.74;
    if (Game.hitStop > 0) dt = 0;
    const wx = hud ? hud.wx : 0; if (hud && hud.wind) { Fx.windX += (hud.wind[0] - Fx.windX) * 0.05; Fx.windY += (hud.wind[1] - Fx.windY) * 0.05; env.wind = AL.clamp(0.2 + Math.hypot(Fx.windX, Fx.windY) * 0.5 + (wx === 2 ? 0.3 : 0), 0.15, 0.9); }
    // --- ambience: weather darkening, tint of the age
    const wa = WAMB[wx] || WAMB[0], k = Math.min(1, dt * 0.8); for (let q = 0; q < 3; q++) { Fx.wAmb[q] += (wa[q] - Fx.wAmb[q]) * k; if (!env.lockAmbient) env.ambient[q] *= Fx.wAmb[q]; }
    if (!AL.ERAS) { AL.ERAS = []; for (const q in AL.DATA.eras) { const e = AL.DATA.eras[q]; e.name = q; AL.ERAS[e.id] = e; } }
    const era = hud ? AL.ERAS[hud.era] : null, tt = era ? era.tint : null; if (tt) { const fogA = wx === 4 ? 0.1 : 0; for (let q = 0; q < 3; q++) Fx.tint[q] += ((fogA && !tt[3] ? 0.78 : tt[q]) - Fx.tint[q]) * k; Fx.tint[3] += (Math.max(tt[3], fogA) - Fx.tint[3]) * k * 0.6; if (!env.lockTint) { env.tint[0] = Fx.tint[0]; env.tint[1] = Fx.tint[1]; env.tint[2] = Fx.tint[2]; env.tint[3] = Fx.tint[3]; } }
    // --- shake, flash
    if (Fx.quakeT > 0) { Fx.quakeT -= dt; if (Fx.shake < 3) Fx.shake = 3; }
    if (Fx.shake > 0.05) { env.shakeX = Math.round((Math.random() * 2 - 1) * Fx.shake); env.shakeY = Math.round((Math.random() * 2 - 1) * Fx.shake); Fx.shake *= Math.exp(-dt * 5); } else { env.shakeX = env.shakeY = 0; Fx.shake = 0; }
    if (Game.options && Game.options.noShake) env.shakeX = env.shakeY = 0;
    env.flash = Fx.flash > 0.01 ? Fx.flash : 0; Fx.flash *= Math.exp(-dt * 7);
    // --- fires and lava lights on visible tiles
    const x0 = Math.max(0, Math.floor(c.x / 8) - 1), y0 = Math.max(0, Math.floor(c.y / 8) - 1), x1 = Math.min(n - 1, Math.ceil((c.x + G.W / z) / 8) + 1), y1 = Math.min(n - 1, Math.ceil((c.y + G.H / z) / 8) + 2), fire = M.fire, gr = M.ground, LAVA = AL.G.lava, fa = an('fire/a'), fb = an('fire/b'), fsc = far ? Math.round(0.5 / z) + 1 : 1; let nf = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * n + x;
      if (fire[i]) { const h = AL.hash2(x, y, 5); nf++; if (far && h > 0.5) continue; const f = h < 0.5 ? fa : fb, px = x * 8 + 4 + ((h * 5) | 0) - 2, py = y * 8 + 8; G.spr(f[((t * 11 + h * 9) | 0) % f.length], px, py, 0, 40, 0, 1, fsc, 3);
        if (h < (far ? 0.2 : 0.45)) G.light(px, py - 4, far ? 34 : 22 + ((t * 9 + h * 7) | 0) % 3 * 2, 0.7, 1);
        if (!far && Fx.n < CAP - 400 && Math.random() < dt * 0.9) Fx.add(Math.random() < 0.6 ? 'smoke' : 'ember', px + rnd(-3, 3), py - 10, { vy: -12, vx: Fx.windX * 10, life: 1.4, zb: 30, alpha: 0.8 }); }
      else if (gr[i] === LAVA && !far && ((x + y * 3) & 3) === 0) G.light(x * 8 + 4, y * 8 + 4, 20 + Math.sin(t * 2 + x) * 2, 0.5, 1); }
    Fx.nFireSeen = nf;
    // --- burning buildings
    const B = S.blds; if (B && B.fire) { const fg = an('fire/big'); for (let b = 0; b < B.n; b++) { if (!B.alive[b] || !B.fire[b]) continue; const T = AL.BTYPES[B.type[b]], bx = (B.x[b] + T.fp[0] / 2) * 8, by = (B.y[b] + T.fp[1]) * 8; if (!Fx.vis(bx, by, 80)) continue;
        G.spr(fg[((t * 10 + b) | 0) % fg.length], bx, by - 6, 0, 40, 0, 1, 1, 4); G.spr(fa[((t * 11 + b * 3) | 0) % fa.length], bx - 9, by - 2, 0, 40, 0, 1, 1, 5); G.spr(fb[((t * 12 + b * 5) | 0) % fb.length], bx + 8, by - 14, 0, 40, 0, 1, 1, 5); G.light(bx, by - 12, 46, 0.95, 1);
        if (Fx.n < CAP - 300 && Math.random() < dt * 5) Fx.add('smoke', bx + rnd(-10, 10), by - 26, { vy: -14, vx: Fx.windX * 12, life: 2, zb: 50 }); } }
    // --- local weather zones and phenomena
    if (hud) { const Zs = hud.zones; for (let q = 0; q < Zs.length; q++) { const zo = Zs[q], kd = zo[0], zx = zo[1] * 8, zy = zo[2] * 8, r = zo[3] * 8; if (!Fx.vis(zx, zy, r + 60)) continue; const f = an(ZFX[kd] || 'p/rain'), nd = Math.min(140, (zo[3] * zo[3] * (kd === 4 || kd === 6 ? 0.12 : 0.4)) | 0), fall = kd === 5 || kd === 7 ? 22 : kd === 4 || kd === 6 ? 9 : 120;
        for (let d = 0; d < nd; d++) { const h1 = AL.hash2(d, q, 21), h2 = AL.hash2(d, q, 22), a = h1 * 6.283, rr = Math.sqrt(h2) * r, ph = (t * fall / 40 + h1 * 7) % 1; G.spr(f[(d + ((t * 6) | 0)) % f.length], zx + Math.cos(a) * rr + (kd === 4 || kd === 6 ? ph * 30 : 0), zy + Math.sin(a) * rr * 0.85 - (kd === 4 || kd === 6 ? 6 : (1 - ph) * 44), 0, 32 | (kd === 2 ? 8 : 0), 0, 0.9, far ? 2 : 1, 60); }
        if (kd <= 3 || kd === 7) { const cl = an('nimbus'), nc = Math.min(12, 3 + (zo[3] / 2.5) | 0); for (let d = 0; d < nc; d++) { const a = AL.hash2(d, q, 23) * 6.283 + t * 0.02, rr = (0.15 + AL.hash2(d, q, 24) * 0.75) * r; G.spr(cl[(d + ((t * 0.5) | 0)) % cl.length], zx + Math.cos(a) * rr + Math.sin(t * 0.3 + d) * 3, zy + Math.sin(a) * rr * 0.7 - 34, 0, 32 | (d & 1), kd === 3 ? -2 : kd === 7 ? -3 : kd === 2 ? -1 : -1, 0.85, far ? 2 : 1, 120); } }
        if (kd === 6 && !far) G.light(zx, zy, r, 0.18, 1); if (kd === 5 && !far) G.light(zx, zy, r, 0.14, 2); }
      const P = hud.phen, tf = an('tornado'), wv = an('wave'); for (let q = 0; q < P.length; q++) { const p = P[q], kd = p[0], px = p[1] * 8, py = p[2] * 8;
        if (kd === 'tornado') { const s = Fx.tor[q] || (Fx.tor[q] = { x: px, y: py }); if (Math.abs(s.x - px) > 80 || Math.abs(s.y - py) > 80) { s.x = px; s.y = py; } s.x += (px - s.x) * Math.min(1, dt * 4); s.y += (py - s.y) * Math.min(1, dt * 4); if (!Fx.vis(s.x, s.y, 80)) continue;
          G.spr(tf[((t * 12) | 0) % tf.length], s.x + Math.sin(t * 5) * 2, s.y + 4, 0, 32, 0, 1, far ? 2 : 1, 20); if (!far && Fx.n < CAP - 200 && Math.random() < dt * 14) { const a = Math.random() * 6.283; Fx.add(Math.random() < 0.6 ? 'dust' : 'debris', s.x + Math.cos(a) * 10, s.y + Math.sin(a) * 4, { vx: -Math.sin(a) * 50, vy: Math.cos(a) * 16, vz: 60, g: 90, life: 0.7, fix: Math.random() < 0.5 ? 1 : null }); } if (Math.random() < dt * 0.8) Fx.snd('wind', s.x, s.y, 0.8); }
        else if (kd === 'eruption') { if (!Fx.vis(px, py, 160)) continue; G.light(px, py, 90 + Math.sin(t * 6) * 6, 1.1, 1); if (Fx.n < CAP - 200 && Math.random() < dt * 9) Fx.add(Math.random() < 0.7 ? 'smoke' : 'ember', px + rnd(-12, 12), py - 8, { vy: -22, vx: Fx.windX * 12, life: 2.4, zb: 80, scale: Math.random() < 0.3 ? 2 : 1 }); if (Fx.shake < 1.2) Fx.shake = 1.2; }
        else if (kd === 'flood') { const R = p[3] * 8; if (R < 4 || !Fx.vis(px, py, R + 40)) continue; const nw = Math.min(40, (p[3] * 1.6) | 0); for (let d = 0; d < nw; d++) { const a = d / nw * 6.283 + AL.hash2(d, q, 31); G.spr(wv[((t * 7 + d) | 0) % wv.length], px + Math.cos(a) * R, py + Math.sin(a) * R * 0.9 + 6, 0, 32 | (Math.cos(a) < 0 ? 1 : 0), 0, 1, 1, 2); } } } }
    // --- global weather
    if (wx === 1) precip('p/rain', 170, 520, 0.18, 0.9, c, z, t); else if (wx === 2) { precip('p/rain2', 260, 640, 0.3, 1, c, z, t); precip('p/rain', 140, 560, 0.3, 0.9, c, z, t); } else if (wx === 3) precip('p/snow', 90, 46, 0.5 + Math.sin(t * 0.6) * 0.4, 0.95, c, z, t); else if (wx === 4) precip('p/fog', 16, 5, 3, 0.3, c, z, t);
    if (era && era.id === 5) precip('p/ash', 30, 26, 0.6, 0.8, c, z, t); else if (era && era.id === 4) precip('p/ember', 14, -22, 0.4, 0.9, c, z, t);
    // --- state icons above units, halo of prophets
    const m = S.cur; if (m && m.bf && !far) { const bf = m.bf; for (let i = 0; i < m.n; i++) { const v = bf[i]; if (!v || !m.alive[i] || m.anim[i] === 14 || (m.flags[i] & 1)) continue; const p = S.unitPos(i); if (!p || !Fx.vis(p[0], p[1], 20)) continue;
        if (v & 32) G.light(p[0], p[1] - 10, 18, 0.5, 5); if (v & 64) G.light(p[0], p[1] - 10, 12, 0.3, 0);
        for (let q = 0; q < ICON.length; q++) if (v & (1 << ICON[q][0])) { const f = an(ICON[q][1]); G.spr(f[((t * 8 + i) | 0) % f.length], p[0], p[1] - 20 + Math.round(Math.sin(t * 3 + i)), 0, 40, 0, 1, 1, 26); break; } } }
    // --- particles
    for (let i = 0; i < Fx.n; i++) { AGE[i] += dt; const a = AGE[i]; if (a < 0) continue;
      if (a >= LIFE[i] || (GR[i] && Z[i] < 0)) { if (END[i] === 1) { const ex = X[i], ey = Y[i]; kill(i); i--; Fx.add('boom', ex, ey + 10, { zb: 30, life: 0.5 }); Fx.add('scorch', ex, ey, { life: 20, zb: -40, fix: 0 }); Fx.glow.push([ex, ey, 40, 1, 1, 0.4]); Fx.snd('boom', ex, ey, 0.6); continue; } kill(i); i--; continue; }
      X[i] += VX[i] * dt; Y[i] += VY[i] * dt; Z[i] += VZ[i] * dt; VZ[i] -= GR[i] * dt; const f = FR[i], u = a / LIFE[i], fi = FIX[i] >= 0 ? Math.min(f.length - 1, FIX[i]) : Math.min(f.length - 1, (u * f.length) | 0);
      const al = LIFE[i] > 3 ? AL0[i] * Math.min(1, (1 - u) * 5) : AL0[i]; G.spr(f[fi], X[i], Y[i] - Z[i], 0, FL[i], TONE[i], al, far && SC[i] === 1 && LIFE[i] < 3 ? 2 : SC[i], ZB[i] + Z[i]); }
    // --- transient lights
    const GL = Fx.glow; for (let q = GL.length - 1; q >= 0; q--) { const g = GL[q]; if (g[6] == null) g[6] = g[5]; g[5] -= dt; if (g[5] <= 0) { GL.splice(q, 1); continue; } G.light(g[0], g[1], g[2], g[3] * (g[5] / g[6]), g[4]); }
  };
  function kill(i) { const l = --Fx.n; if (i !== l) { FR[i] = FR[l]; X[i] = X[l]; Y[i] = Y[l]; Z[i] = Z[l]; VX[i] = VX[l]; VY[i] = VY[l]; VZ[i] = VZ[l]; GR[i] = GR[l]; AGE[i] = AGE[l]; LIFE[i] = LIFE[l]; FL[i] = FL[l]; SC[i] = SC[l]; ZB[i] = ZB[l]; AL0[i] = AL0[l]; FIX[i] = FIX[l]; END[i] = END[l]; TONE[i] = TONE[l]; } FR[l] = null; }
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
