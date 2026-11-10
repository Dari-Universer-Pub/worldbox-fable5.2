// Step 8 robot: the god's powers used with real clicks and drags; every one must leave a measurable trace in the world and
// on screen (effects, lights, weather). Screenshots: fire by day, storm, night with fire and lit windows, nuke, age tint.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.Scene.cur, null, { timeout: 30000 });
  const tool = (id, extra) => p.evaluate(([id, extra]) => { AL.Game.tool = Object.assign({ id, size: 4, shape: 'round' }, extra || {}); }, [id, extra]);
  const cnt = k => p.evaluate(k => AL.Fx.counts[k] || 0, k), wait = ms => p.waitForTimeout(ms);
  const goto = async (x, y) => { await p.evaluate(([x, y]) => { const c = AL.Game.cam; c.x = x * 8 - AL.Gfx.W / 2 / c.z; c.y = y * 8 - AL.Gfx.H / 2 / c.z; }, [x, y]); await p.mouse.move(640, 360); await wait(200); };
  // a meadow next to a forest
  const spot = await p.evaluate(() => { const M = AL.Game.map, n = M.n; for (let k = 0; k < 40000; k++) { const x = 40 + ((AL.hash2(k, 1, 9) * (n - 80)) | 0), y = 40 + ((AL.hash2(k, 2, 9) * (n - 80)) | 0); let g = 0, t = 0; for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const i = (y + dy) * n + x + dx; if (M.ground[i] === AL.G.grass || M.ground[i] === AL.G.forest) g++; if (AL.fKind[M.feature[i]] === 1) t++; } if (g > 280 && t > 40 && t < 120) return [x, y]; } return null; });
  if (!spot) { console.log('no spot'); process.exit(1); } await goto(spot[0], spot[1]);
  await tool('spawn:human', { count: 16 }); await p.mouse.click(640, 360); await wait(600);
  // --- blessing / curse on the group
  await tool('heal'); await p.mouse.click(640, 360); await wait(400); out.holy = await cnt('holy') > 0;
  await tool('curse'); await p.mouse.click(640, 360); await wait(600); out.cursed = await p.evaluate(() => { const m = AL.Scene.cur; let c = 0; for (let i = 0; i < m.n; i++) if (m.alive[i] && (m.bf[i] & 2)) c++; return c; });
  await tool('strength'); await p.mouse.click(640, 360); await wait(700); await p.mouse.move(900, 200); await wait(300); await p.screenshot({ path: 'shots/step8-divine.png' });
  // --- lightning, bomb
  await tool('lightning'); await p.mouse.click(760, 300); await wait(120); await p.screenshot({ path: 'shots/step8-bolt.png' }); await wait(400); out.bolt = await cnt('ev:bolt') > 0;
  const hBefore = await p.evaluate(() => { const M = AL.Game.map; let s = 0; for (let i = 0; i < M.height.length; i++) s += M.height[i]; return s; });
  await tool('bomb'); await p.mouse.click(840, 420); await wait(180); await p.screenshot({ path: 'shots/step8-bomb.png' }); await wait(700);
  out.boom = await cnt('ev:boom') > 0; out.crater = await p.evaluate(h => { const M = AL.Game.map; let s = 0; for (let i = 0; i < M.height.length; i++) s += M.height[i]; return h - s; }, hBefore);
  // --- fire dragged across the forest, then watch it spread
  await tool('fire'); await p.mouse.move(380, 250); await p.mouse.down(); await p.mouse.move(520, 290, { steps: 12 }); await p.mouse.up(); await wait(2500);
  out.fireTiles = await p.evaluate(() => AL.Game.map.fire.reduce((a, v) => a + (v ? 1 : 0), 0)); out.fireSeen = await p.evaluate(() => AL.Fx.nFireSeen); await p.screenshot({ path: 'shots/step8-fire-day.png' });
  // --- rain zone on the fire, storm weather
  await tool('rain'); await p.mouse.click(450, 270); await wait(1500); out.zone = await p.evaluate(() => AL.Game.hud.zones.length); await p.screenshot({ path: 'shots/step8-rainzone.png' });
  await p.evaluate(() => AL.Link.send({ t: 'weather', v: 2, dur: 400 })); await wait(2500); out.storm = await p.evaluate(() => AL.Game.hud.wx === 2); await p.screenshot({ path: 'shots/step8-storm.png' });
  await p.evaluate(() => AL.Link.send({ t: 'weather', v: 3, dur: 200 })); await wait(2200); await p.screenshot({ path: 'shots/step8-snow.png' }); await p.evaluate(() => AL.Link.send({ t: 'weather', v: 0, dur: 4000 }));
  // --- tornado and meteor
  await tool('tornado'); await p.mouse.click(700, 250); await wait(1200); out.tornado = await p.evaluate(() => AL.Game.hud.phen.some(q => q[0] === 'tornado')); await p.screenshot({ path: 'shots/step8-tornado.png' });
  await tool('meteor'); await p.mouse.click(960, 500); await wait(900); await p.screenshot({ path: 'shots/step8-meteor.png' }); await wait(1500); out.impact = await cnt('ev:impact') > 0; await p.screenshot({ path: 'shots/step8-impact.png' });
  // --- teleport by drag: the group must move
  const cen = () => p.evaluate(() => { const m = AL.Scene.cur; let sx = 0, c = 0; for (let i = 0; i < m.n; i++) if (m.alive[i] && m.kind[i] < AL.NPEOPLE) { sx += m.x[i]; c++; } return c ? sx / c : 0; });
  const cx0 = await cen(); const sp = await p.evaluate(() => { const m = AL.Scene.cur, c = AL.Game.cam, s = AL.Game.scale; for (let i = 0; i < m.n; i++) if (m.alive[i] && m.kind[i] < AL.NPEOPLE) return [(m.x[i] * 8 - c.x) * c.z * s, (m.y[i] * 8 - c.y) * c.z * s]; });
  await tool('teleport', { r: 6 }); await p.mouse.move(sp[0], sp[1]); await p.mouse.down(); await p.mouse.move(sp[0] + 300, sp[1] + 40, { steps: 8 }); await p.mouse.up(); await wait(700); out.teleported = Math.round((await cen() - cx0) * 10) / 10; out.teleport = await cnt('ev:teleport') > 0;
  // --- night: lights of the fires and of the windows
  await goto(spot[0], spot[1]); for (let i = 0; i < 6; i++) await p.keyboard.press('Period');
  // (the robot speeds time up with real key presses; the stop at nightfall is done in the page so that the night is not missed)
  await p.evaluate(() => new Promise(r => { const f = () => { const q = (AL.Game.tick % AL.DAY) / AL.DAY; if (AL.Scene.night >= 1 && q > 0.76 && q < 0.9) { AL.Game.setSpeed(1); r(); } else requestAnimationFrame(f); }; f(); }));
  out.night = await p.evaluate(() => AL.Scene.night); await tool('fire'); await p.mouse.move(420, 300); await p.mouse.down(); await p.mouse.move(520, 330, { steps: 8 }); await p.mouse.up(); await tool('lava', { size: 2 }); await p.mouse.click(820, 470); await wait(1800); await p.mouse.move(1000, 150); await p.screenshot({ path: 'shots/step8-night.png' });
  // --- nuke far from the camp, seen from afar
  await p.mouse.move(640, 360); await p.mouse.wheel(0, 100); await wait(600); await tool('nuke'); await p.mouse.click(900, 260); await wait(350); await p.screenshot({ path: 'shots/step8-nuke-a.png' }); await wait(900); await p.screenshot({ path: 'shots/step8-nuke-b.png' }); out.nuke = await cnt('ev:nuke') > 0; out.mushroom = await cnt('mushroom') > 0;
  await wait(2500); out.fallout = await p.evaluate(() => AL.Game.hud.zones.some(z => z[0] === 7));
  // --- ages: the tint of the screen follows the age
  await p.evaluate(() => AL.Link.send({ t: 'era', id: 3 })); for (let i = 0; i < 5; i++) await p.keyboard.press('Period'); await p.waitForFunction(() => AL.Scene.night < 0.05 && AL.Game.hud.era === 3, null, { timeout: 60000 }).catch(() => { }); for (let i = 0; i < 6; i++) await p.keyboard.press('Comma'); await p.keyboard.press('Period'); await wait(2500);
  out.eraTint = await p.evaluate(() => AL.Game.env.tint[3]); await p.screenshot({ path: 'shots/step8-era-rime.png' });
  // --- control a unit: click it, then order it to walk
  await p.mouse.wheel(0, -100); await wait(500); const u = await p.evaluate(() => { const m = AL.Scene.cur, c = AL.Game.cam, s = AL.Game.scale; for (let i = 0; i < m.n; i++) if (m.alive[i] && !(m.flags[i] & 1) && m.anim[i] !== 14) { const x = (m.x[i] * 8 - c.x) * c.z * s, y = (m.y[i] * 8 - c.y) * c.z * s; if (x > 100 && x < 1180 && y > 100 && y < 620) return [x, y - 10, i]; } return null; });
  if (u) { await tool('control'); await p.mouse.click(u[0], u[1]); await wait(600); out.ctl = await p.evaluate(() => AL.Game.hud.ctl); await p.keyboard.press('Escape'); await wait(500); out.released = await p.evaluate(() => AL.Game.hud.ctl) < 0; }
  out.particlesNow = await p.evaluate(() => AL.Fx.n); out.fps = await p.evaluate(() => AL.Game.stats.fps);
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['holy', 'cursed', 'bolt', 'boom', 'crater', 'fireTiles', 'fireSeen', 'zone', 'storm', 'tornado', 'impact', 'teleport', 'nuke', 'mushroom', 'fallout', 'released'].filter(k => !out[k]); if (!(out.teleported > 2)) fails.push('teleported'); if (!(out.eraTint > 0.05)) fails.push('eraTint'); if (!(out.ctl >= 0)) fails.push('ctl');
  console.log(fails.length || errs.length ? 'STEP8 FAIL ' + fails : 'STEP8 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
