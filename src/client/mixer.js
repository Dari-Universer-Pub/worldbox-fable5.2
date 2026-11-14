// AL.Mixer — decides what is heard: starts the audio engine on the first gesture, picks the music track from what happens
// (night, war, disaster), mixes its layers (melody, pad, bells, rhythm, tension), cross-fades the ambience beds from the
// ground under the camera, the weather and the fires, and lets animals, towns and crowds be heard now and then.
(function (AL) {
  'use strict';
  const Game = AL.Game, A = AL.Audio, S = AL.Scene, Mx = AL.Mixer = { on: false, t: 0, life: 3, state: '', amb: {}, counts: {}, track: '', menu: false };
  // count what is played (tests and the debug overlay)
  const play0 = A.play; A.play = function (name, o) { const r = play0(name, o); if (r) Mx.counts[name] = (Mx.counts[name] || 0) + 1; return r; };
  Mx.start = function () { if (Mx.on) return; try { A.init(); } catch (e) { return; } Mx.on = true; const v = (Game.options && Game.options.vol) || {}; for (const k in v) A.setVolume(k, v[k]); A.setVolume('amb', (v.sfx == null ? 0.8 : v.sfx) * 0.7); };
  // phones (iOS Safari above all) only unlock audio on a finished touch: try on every kind of gesture, play one silent sample, keep trying until the context runs
  const unlock = () => { Mx.start(); if (!A.ready) return; A.resume(); const c = A.ctx; if (c && !Mx.unlocked) { try { const b = c.createBuffer(1, 1, 22050), src = c.createBufferSource(); src.buffer = b; src.connect(c.destination); src.start(0); } catch (e) { } } if (c && c.state === 'running') Mx.unlocked = true; };
  if (typeof window !== 'undefined') for (const ev of ['mousedown', 'keydown', 'touchstart', 'touchend', 'pointerup', 'click']) window.addEventListener(ev, unlock, { capture: true });
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && A.ready && Mx.unlocked) { try { const r = A.resume(); if (r && r.catch) r.catch(() => { }); } catch (e) { } } });
  const AMBG = { deep: 'waves', shallow: 'waves', sand: 'waves', desert: 'desert', savanna: 'desert', forest: 'forest', jungle: 'forest', swamp: 'forest', snow: 'ice', ice: 'ice', tundra: 'wind', mountain: 'wind', hills: 'wind', volcanic: 'wind', grass: 'forest' };
  const CLIM = { snow: 'frost', ice: 'frost', tundra: 'frost', desert: 'dunes', savanna: 'dunes', deep: 'tide', shallow: 'tide', sand: 'tide' };
  const CALLS = { wolf: 'wolf_howl', bear: 'bear_growl', deer: 'deer_call', sheep: 'sheep_bleat', boar: 'boar_grunt', eagle: 'eagle_cry', rabbit: 'rabbit_thump', salmon: 'fish_plop', zombie: 'zombie_moan', skeleton: 'skeleton_rattle', demon: 'demon_roar', fox: 'fox_bark', horse: 'horse_neigh', cow: 'cow_moo', goat: 'goat_bleat', lion: 'lion_roar', tiger: 'tiger_growl', panther: 'tiger_growl', elephant: 'elephant_trumpet', hyena: 'hyena_laugh', crow: 'crow_caw', gull: 'gull_cry', owl: 'owl_hoot', parrot: 'parrot_squawk', frog: 'frog_croak', rat: 'rat_squeak', crocodile: 'croc_hiss', camel: 'camel_groan', moose: 'moose_call', elk: 'moose_call', squirrel: 'squirrel_chatter', rhino: 'rhino_snort', bison: 'rhino_snort', yak: 'cow_moo', shark: 'whale_song', tuna: 'fish_plop', carp: 'fish_plop', pike: 'fish_plop', dragon: 'dragon_roar', hellhound: 'hellhound_growl', direwolf: 'wolf_howl', basilisk: 'croc_hiss', behemoth: 'dragon_roar', roc: 'eagle_cry', harpy: 'gull_cry', leviathan: 'leviathan_call', giant: 'giant_shout', golem: 'golem_grind', troll: 'troll_grunt', treant: 'golem_grind', spirit: 'spirit_wail', voidling: 'voidling_chirp', lich: 'lich_whisper', imp: 'voidling_chirp', colossus: 'colossus_step' };
  Mx.frame = function (dt) { if (!Mx.on || !A.ready) return; Mx.t -= dt; Mx.life -= dt; const G = AL.Gfx, c = Game.cam, hud = Game.hud, M = Game.map;
    if (Mx.t <= 0) { Mx.t = 0.5;
      if (Mx.menu || !M || !hud) { if (Mx.track !== 'menu') { Mx.track = 'menu'; A.Music.play('menu', 3); } A.Music.setLayers({ base: 1, melody: 1, pad: 0.8, bells: 0.6, rhythm: 0, tension: 0 }); A.ambience({ wind: 0.4 }); return; }
      // what is on screen
      const m = S.cur; let soldiers = 0, people = 0, monsters = 0; const x0 = c.x / 8, y0 = c.y / 8, x1 = x0 + G.W / c.z / 8, y1 = y0 + G.H / c.z / 8;
      if (m) for (let i = 0; i < m.n; i++) { if (!m.alive[i] || m.x[i] < x0 || m.x[i] > x1 || m.y[i] < y0 || m.y[i] > y1) continue; const k = m.kind[i]; if (k < AL.NPEOPLE) { people++; if (m.flags[i] & 4096) soldiers++; } else if (AL.KINDS[k].cls === 2) monsters++; }
      const fires = AL.Fx ? AL.Fx.nFireSeen || 0 : 0, dis = hud.phen.length > 0 || fires > 25 || (AL.Fx && AL.Fx.shake > 2), war = soldiers >= 3 || monsters >= 3, night = S.night > 0.6;
      let tr = war || dis ? 'war' : night ? 'night' : 'calm';
      { { const gn = M.ground ? AL.GROUND[M.ground[Math.min(M.n - 1, Math.max(0, ((y0 + y1) / 2) | 0)) * M.n + Math.min(M.n - 1, Math.max(0, ((x0 + x1) / 2) | 0))]] : null, cl = (gn && CLIM[gn.name]) || 'calm', now = performance.now(); if (cl !== Mx.climWant) { Mx.climWant = cl; Mx.climSince = now; } if (now - Mx.climSince > 6000) Mx.clim = cl; } if (dis && !war) tr = 'disaster'; else if (tr === 'calm') tr = Mx.clim || 'calm'; } // a climate takes over only after 6 s under the middle of the screen: no flipping while the camera pans
      Mx.state = (war ? 'war ' : '') + (dis ? 'disaster ' : '') + (night ? 'night' : 'day');
      // the director: `tr` above is only a wish. A day lasts 30 s at x1 and soldiers come and go around the thresholds, so obeying the wish
      // at once changed the music every few seconds. Rules: a quiet piece (calm, night, a climate) is played to the end of its loop, and
      // gives way there, to a wish that has held for 5 s (the night piece comes in as night falls, see below); war and disaster come in after 1.5 s of the same wish, stay at least 25 s, and
      // stay 20 s after the last sign of trouble before a quiet piece returns.
      { const now = performance.now() / 1000, urgent = tr === 'war' || tr === 'disaster', curUrg = Mx.track === 'war' || Mx.track === 'disaster';
        if (tr !== Mx.wish) { Mx.wish = tr; Mx.wishSince = now; } if (urgent) Mx.urgLast = now;
        const age = now - (Mx.since || 0), stable = now - Mx.wishSince, cur = A.Music.cur; let go = false;
        if (!Mx.track || Mx.track === 'menu') go = stable >= 3;                            // first piece of a game: a world is born at midnight, wait for the wish to settle
        else if (tr === Mx.track) go = false;
        else if (urgent) go = stable >= 1.5 && (!curUrg || age >= 25);
        else if (curUrg) go = now - (Mx.urgLast || 0) >= 20 && stable >= 3;
        else if (cur && cur.rec && cur.id === Mx.track) { const m = cur.meta, pos = A.ctx.currentTime - cur.t0, toEnd = pos < m.loopStart ? m.loopStart + m.loop - pos : m.loop - ((pos - m.loopStart) % m.loop); const heard = pos >= m.loopStart + m.loop - 1.2;
          // night music with short nights (a night lasts about 10 s at x1): once the piece that plays has been heard in full, the night piece starts the
          // moment it is night, and is itself heard in full before a day piece returns, the moment it is day. Between two day pieces: at the loop end.
          if (tr === 'night' || Mx.track === 'night') go = heard; else go = stable >= 5 && pos > 20 && toEnd <= 1.2; }
        else go = stable >= 5 && age >= 60;                                                // synthesized fallback, or a piece still loading
        if (go) { Mx.track = tr; Mx.since = now; A.Music.play(tr, urgent ? 1.5 : 4); }
        tr = Mx.track; }
      const town = S.nBlds > 2 ? 1 : 0, far = c.z < 0.74;
      A.Music.setLayers(tr === 'disaster' ? { base: 1, melody: 1, pad: 0.9, rhythm: 1, tension: fires > 3 || (AL.Fx && AL.Fx.shake > 2) ? 1 : 0.6, bells: far ? 0.4 : 0.8 } : tr === 'war' ? { base: 1, melody: war ? 1 : 0.4, pad: 0.8, rhythm: soldiers >= 6 || dis ? 1 : 0.5, tension: dis ? 1 : 0.3 } : tr === 'night' ? { base: 1, melody: 0.9, bells: far ? 0.3 : 0.8, pad: 0.7, rhythm: town * 0.6, tension: monsters ? 1 : fires > 3 ? 0.6 : 0 } : { base: 1, melody: 1, pad: far ? 1 : 0.6, bells: town ? 0.8 : 0.3, rhythm: town && people > 6 ? 0.9 : 0, tension: fires > 3 ? 0.8 : 0 });
      // ambience (chantier D.1): from what is NEAR the middle of the screen, not from the whole screen. Measured before: 25 points spread over the
      // screen, sand counting as sea, gave waves at 0.6 in every far view, and a town anywhere on screen gave the full town murmur. Now the 5x5
      // samples cover a disc of 40 tiles at most around the middle, the closest count the most, sand is silent, and the beds are lower in the far views.
      const am = { wind: 0.15, waves: 0, forest: 0, desert: 0, ice: 0, rain: 0, fire: 0, night: 0, town: 0, battle: 0 }; let ns = 0; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.min((x1 - x0) / 2, 40), ry = Math.min((y1 - y0) / 2, 40), zf = far ? 0.45 : 1;
      for (let sy = 0; sy < 5; sy++) for (let sx = 0; sx < 5; sx++) { const ux = (sx - 2) / 2, uy = (sy - 2) / 2, X = Math.floor(cx + ux * rx), Y = Math.floor(cy + uy * ry), wgt = 1 - 0.75 * Math.min(1, Math.hypot(ux, uy)); ns += wgt; if (X < 0 || Y < 0 || X >= M.n || Y >= M.n) continue; const g = AL.GROUND[M.ground[Y * M.n + X]], b = g.name === 'sand' ? null : AMBG[g.name], tree = AL.fKind[M.feature[Y * M.n + X]] === 1; if (b) am[b] += (tree && b !== 'forest' ? 0.5 : 1) * wgt; if (tree) am.forest += 0.6 * wgt; }
      for (const k of ['waves', 'forest', 'desert', 'ice', 'wind']) am[k] = Math.min(1, am[k] / Math.max(1, ns) * (k === 'wind' ? 1.4 : 1.2) + (k === 'wind' ? 0.15 + (far ? 0.25 : 0) : 0)) * (k === 'wind' ? 1 : zf); if (night) { am.forest *= 0.3; am.night = 0.8 * (1 - am.waves) * (1 - am.ice) * zf; }
      let rain = hud.wx === 1 ? 0.7 : hud.wx === 2 ? 1 : 0; for (const zn of hud.zones) if ((zn[0] === 1 || zn[0] === 2 || zn[0] === 3) && zn[1] > x0 - zn[3] && zn[1] < x1 + zn[3] && zn[2] > y0 - zn[3] && zn[2] < y1 + zn[3]) rain = Math.max(rain, 0.8); am.rain = rain * (far ? 0.6 : 1); am.rainlow = am.rain; if (hud.wx === 2 || hud.wx === 3) am.wind = Math.min(1, am.wind + 0.4);
      // town murmur and battle din: people and soldiers weighed by their distance to the middle of the screen (reach of the near sounds), silent in the far views
      let nearP = 0, nearS = 0; { const zn = AL.Fx.zoomNear(); if (m && zn > 0) for (let i = 0; i < m.n; i++) { if (!m.alive[i] || m.kind[i] >= AL.NPEOPLE || m.x[i] < x0 || m.x[i] > x1 || m.y[i] < y0 || m.y[i] > y1) continue; const h = AL.Fx.hear(m.x[i] * 8, m.y[i] * 8); if (h <= 0) continue; nearP += h; if (m.flags[i] & 4096) nearS += h; } nearP *= zn; nearS *= zn; }
      am.fire = Math.min(1, fires / 14); am.town = Math.min(1, nearP / 12) * (night ? 0.3 : 1); am.battle = Math.min(1, nearS / 5); Mx.amb = am; A.ambience(am); }
    // single drops through the rain (chantier D.3): spaced out, each at its own place, none in the far views
    if (Mx.amb.rain > 0.15 && !Mx.menu) { Mx.dropT = (Mx.dropT || 0) - dt; if (Mx.dropT <= 0) { Mx.dropT = (0.18 + Math.random() * 0.5) / Mx.amb.rain; const zn = AL.Fx.zoomNear(); if (zn > 0) A.play('raindrop', { vol: (0.25 + Math.random() * 0.3) * Mx.amb.rain * zn, pan: Math.random() * 2 - 1 }); } }
    // life: a call from something that is on screen, a bird, a bell, voices
    if (Mx.life <= 0 && Game.map && S.cur && !Mx.menu) { Mx.life = 2.5 + Math.random() * 5; const m = S.cur, far = c.z < 0.74; if (far) return; let pick = -1;
      for (let k = 0; k < 40 && pick < 0; k++) { const i = (Math.random() * m.n) | 0; if (m.alive[i] && !(m.flags[i] & 1) && AL.Fx.vis(m.x[i] * 8, m.y[i] * 8, 0)) pick = i; }
      if (pick < 0) { if (Mx.amb.forest > 0.3 && S.night < 0.5) AL.Fx.snd('bird_chirp', c.x + Math.random() * G.W / c.z, c.y + G.H / c.z / 2, 0.6); return; }
      const K = AL.KINDS[m.kind[pick]], wx = m.x[pick] * 8, wy = m.y[pick] * 8;
      if (K.cls === 0) { const an = m.anim[pick], r = Math.random(); AL.Fx.snd(an === AL.ANIM.pray ? 'pray_chant' : an === AL.ANIM.joy ? 'cheer' : (m.flags[pick] & 256) ? 'cry' : (m.flags[pick] & 4096) ? (r < 0.5 ? 'drum_war' : 'charge') : S.nBlds > 4 && r < 0.12 ? 'bell' : r < 0.6 ? 'chatter' : 'footstep', wx, wy, 0.6); }
      else if (CALLS[K.name] && (K.name !== 'wolf' || S.night > 0.5 || Math.random() < 0.3)) AL.Fx.snd(CALLS[K.name], wx, wy, 0.7);
      else if (Mx.amb.forest > 0.3 && S.night < 0.5) AL.Fx.snd('bird_chirp', wx, wy, 0.6); } };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
