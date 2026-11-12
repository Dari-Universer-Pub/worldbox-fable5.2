// Step 11 robot: the sound engine starts on the first real gesture; real actions trigger their sounds; the music follows
// the situation (calm by day, night track at night, war track during a disaster); ambience beds follow the camera.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] }), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html?play'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.Scene.cur && AL.UI.btn.cat0, null, { timeout: 30000 });
  const wait = ms => p.waitForTimeout(ms), ev = (f, a) => p.evaluate(f, a), cnt = n => ev(n => AL.Mixer.counts[n] || 0, n);
  const btn = async id => { await p.waitForFunction(id => AL.UI.btn[id] && AL.UI.btn[id][4] >= AL.UI.frameNo - 2, id, { timeout: 8000 }); const r = await ev(id => { const q = AL.UI.btn[id], k = (AL.Game.options.uiSize || 1) * AL.Game.scale; return [(q[0] + q[2] / 2) * k, (q[1] + q[3] / 2) * k]; }, id); await p.mouse.click(r[0], r[1]); await wait(150); };
  await ev(() => { const M = AL.Game.map, n = M.n; for (let k = 0; k < 40000; k++) { const x = 40 + ((AL.hash2(k, 1, 9) * (n - 80)) | 0), y = 40 + ((AL.hash2(k, 2, 9) * (n - 80)) | 0); let g = 0; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (M.ground[(y + dy) * n + x + dx] === AL.G.grass) g++; if (g > 150) { const c = AL.Game.cam; c.x = x * 8 - AL.Gfx.W / 2; c.y = y * 8 - AL.Gfx.H / 2 + 30; return; } } });
  out.silentBefore = await ev(() => !AL.Audio.ready);
  await btn('cat1'); await wait(300); out.started = await ev(() => AL.Audio.ready && AL.Audio.ctx.state); await btn('cat3'); out.uiClick = await cnt('ui_click') >= 1;
  await wait(1500); out.trackDay = await ev(() => AL.Mixer.track + ' / ' + (AL.Audio.Music.cur && AL.Audio.Music.cur.id)); out.amb = await ev(() => Object.keys(AL.Mixer.amb).filter(k => AL.Mixer.amb[k] > 0.05).join(','));
  // real actions and their sounds
  await btn('toollightning'); await p.mouse.click(700, 300); await wait(900); out.thunder = await cnt('thunder');
  await btn('cat4'); await btn('toolbomb'); await p.mouse.click(600, 350); await wait(900); out.boom = await cnt('boom');
  await btn('cat5'); await btn('toolheal'); await p.mouse.click(600, 350); await wait(600); out.heal = await cnt('heal');
  await btn('cat1'); await btn('toolspawn:human'); await p.mouse.click(640, 300); await wait(600); out.spawn = await cnt('spawn');
  await btn('cat0'); await btn('toolraise'); await p.mouse.move(800, 300); await p.mouse.down(); await p.mouse.move(820, 310, { steps: 3 }); await p.mouse.up(); await wait(300); out.earth = await cnt('earth');
  // disaster -> war track
  await btn('cat3'); await btn('tooltornado'); await p.mouse.click(640, 300); await wait(2500); out.trackDisaster = await ev(() => AL.Mixer.track); out.state = await ev(() => AL.Mixer.state);
  // night -> night track (time sped up with the real button, stopped at night in the page)
  await p.keyboard.press('Escape'); await btn('sp50'); await ev(() => new Promise(r => { const f = () => { const q = (AL.Game.tick % AL.DAY) / AL.DAY; if (AL.Scene.night >= 1 && q > 0.78 && q < 0.9 && !AL.Game.hud.phen.length) { AL.Game.setSpeed(1); r(); } else requestAnimationFrame(f); }; f(); })); await wait(2500);
  out.trackNight = await ev(() => AL.Mixer.track); out.nightAmb = await ev(() => AL.Mixer.amb.night > 0 || AL.Mixer.amb.waves > 0.5 || AL.Mixer.amb.ice > 0.5);
  await wait(6000); out.kinds = await ev(() => Object.keys(AL.Mixer.counts).length); out.played = await ev(() => Object.keys(AL.Mixer.counts).join(' '));
  // volume option reaches the engine
  await p.keyboard.press('KeyO'); await wait(300); const sl = await ev(() => { const s = AL.Game.scale; return [(AL.UI.btn.lgen[0] + 20) * s, (AL.UI.btn.lgen[1] + 27) * s]; }); await p.mouse.move(sl[0], sl[1]); await p.mouse.down(); await wait(120); await p.mouse.up(); await wait(200); out.volume = await ev(() => AL.Audio.vol.master); await p.keyboard.press('Escape');
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['silentBefore', 'uiClick', 'thunder', 'boom', 'heal', 'spawn', 'earth', 'nightAmb'].filter(k => !out[k]); if (out.started !== 'running') fails.push('started'); if (!/^calm/.test(out.trackDay)) fails.push('trackDay'); if (out.trackDisaster !== 'war') fails.push('trackDisaster'); if (out.trackNight !== 'night') fails.push('trackNight'); if (!(out.volume < 0.5)) fails.push('volume'); if (!(out.kinds >= 7)) fails.push('kinds');
  console.log(fails.length || errs.length ? 'STEP11 FAIL ' + fails : 'STEP11 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
