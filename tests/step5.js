// Step 5 robot: a people founds a village. Real mouse click with the spawn tool, real keys for speed, layer, zoom and pause.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html?play'); await p.waitForFunction(() => window.AL && AL.Game.ready, null, { timeout: 30000 });
  // look for open grass and bring it under the pointer by dragging the map with the right mouse button (real events)
  const spot = await p.evaluate(() => { const M = AL.Game.map, n = M.n; for (let k = 0; k < 9000; k++) { const x = 30 + ((AL.hash2(k, 1, 5) * (n - 60)) | 0), y = 30 + ((AL.hash2(k, 2, 5) * (n - 60)) | 0); let ok = true, trees = 0; for (let dy = -7; dy <= 7 && ok; dy++) for (let dx = -7; dx <= 7; dx++) { const t = (y + dy) * n + x + dx; if (M.ground[t] !== AL.G.grass) { ok = false; break; } if (AL.fKind[M.feature[t]] === 1) trees++; } if (ok && trees < 40) return [x, y]; } return null; });
  out.spot = !!spot; if (!spot) { console.log('no grass spot'); process.exit(1); }
  for (let k = 0; k < 40; k++) { const d = await p.evaluate(([x, y]) => { const c = AL.Game.cam, s = AL.Game.scale; return [(x * 8 - c.x) * c.z * s - 640, (y * 8 - c.y) * c.z * s - 360]; }, spot); if (Math.abs(d[0]) < 6 && Math.abs(d[1]) < 6) break;
    const mx = Math.max(-500, Math.min(500, d[0])), my = Math.max(-300, Math.min(300, d[1])); await p.mouse.move(640 + mx / 2, 360 + my / 2); await p.mouse.down({ button: 'right' }); await p.mouse.move(640 - mx / 2, 360 - my / 2, { steps: 4 }); await p.mouse.up({ button: 'right' }); }
  await p.evaluate(() => { AL.Game.tool = { id: 'spawn:human', size: 1, shape: 'round', count: 12 }; });
  await p.mouse.click(640, 360); await p.waitForTimeout(600);
  out.spawned = await p.evaluate(() => AL.Scene.cur ? Array.from(AL.Scene.cur.alive).reduce((a, v) => a + v, 0) : 0);
  // units move and are interpolated between snapshots
  // (unit 0 may be a sleeping animal: measure the people that were just dropped)
  const ppl = () => p.evaluate(() => { const m = AL.Scene.cur, o = []; for (let i = 0; i < m.n; i++) if (m.alive[i] && m.kind[i] < AL.NPEOPLE) o.push(m.x[i], m.y[i]); return o; }); const pos0 = await ppl(); await p.waitForTimeout(1500); const pos1 = await ppl(); let mv = 0; for (let i = 0; i < Math.min(pos0.length, pos1.length); i++) mv += Math.abs(pos0[i] - pos1[i]); out.moves = pos0.length > 0 && mv > 0.5;
  // speed up with the real key (Period = faster) until x50
  for (let i = 0; i < 6; i++) await p.keyboard.press('Period'); out.speed50 = await p.evaluate(() => AL.Game.speed) === 50;
  await p.waitForFunction(() => AL.Scene.blds && Array.from(AL.Scene.blds.state).filter((s, i) => AL.Scene.blds.alive[i] && s === 1).length >= 4, null, { timeout: 90000 }).catch(() => { });
  const towns = await p.evaluate(() => AL.Link.ask('towns')); out.town = towns && towns.length >= 1; out.townDone = towns && towns.length ? Math.max(...towns.map(t => t.done)) : 0; out.built = out.townDone >= 4;
  await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); out.speed1 = await p.evaluate(() => AL.Game.speed) === 1;
  await p.waitForTimeout(500); out.drawnUnits = await p.evaluate(() => AL.Scene.nUnits); out.drawnBlds = await p.evaluate(() => AL.Scene.nBlds); await p.screenshot({ path: 'shots/step5-village.png' });
  // kingdoms layer with the real key
  await p.keyboard.press('KeyL'); await p.waitForTimeout(300); out.layerOn = await p.evaluate(() => AL.Gfx.layerOn === 1 && AL.Game.map.owner.some(v => v > 0)); await p.screenshot({ path: 'shots/step5-layer.png' }); await p.keyboard.press('KeyL');
  // zoom in with the wheel, screenshot of villagers and buildings up close
  await p.mouse.move(640, 360); await p.mouse.wheel(0, -100); await p.waitForTimeout(700); await p.screenshot({ path: 'shots/step5-zoom2.png' }); await p.mouse.wheel(0, 100); await p.waitForTimeout(500);
  // pause with Space: the tick stops
  await p.keyboard.press('Space'); await p.waitForTimeout(300); const t0 = await p.evaluate(() => AL.Game.tick); await p.waitForTimeout(700); const t1 = await p.evaluate(() => AL.Game.tick); out.pause = t0 === t1; await p.keyboard.press('Space');
  // a long accelerated stretch: nobody starves, the village grows
  for (let i = 0; i < 6; i++) await p.keyboard.press('Period'); const s0 = await p.evaluate(() => AL.Link.ask('stats')); await p.waitForTimeout(+(process.env.LONG || 30000)); const s1 = await p.evaluate(() => AL.Link.ask('stats')); out.ticksRun = s1.tick - s0.tick; out.stats = s1; out.noStarve = s1.starved === 0; out.grew = s1.units >= 12;
  await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.waitForTimeout(500); await p.screenshot({ path: 'shots/step5-later.png' });
  out.perf = await p.evaluate(() => ({ fps: AL.Game.stats.fps, frameMs: +AL.Game.stats.frameMs.toFixed(2), sprites: AL.Game.stats.sprites }));
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['spot', 'spawned', 'moves', 'speed50', 'town', 'built', 'speed1', 'drawnUnits', 'drawnBlds', 'layerOn', 'pause', 'noStarve', 'grew'].filter(k => !out[k]); console.log(fails.length || errs.length ? 'STEP5 FAIL ' + fails : 'STEP5 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
