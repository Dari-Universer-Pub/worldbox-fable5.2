// Step 7 robot: two peoples dropped with real clicks become two kingdoms with their own colours; the kingdoms layer (key L)
// shows two territories; a war is incited and soldiers are mobilised.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html?play'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.Scene.cur, null, { timeout: 30000 });
  const spot = await p.evaluate(() => { const M = AL.Game.map, n = M.n; const ok = (x, y) => { for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (M.ground[(y + dy) * n + x + dx] !== AL.G.grass) return false; return true; }; for (let k = 0; k < 20000; k++) { const x = 30 + ((AL.hash2(k, 1, 9) * (n - 100)) | 0), y = 30 + ((AL.hash2(k, 2, 9) * (n - 60)) | 0); if (ok(x, y) && ok(x + 34, y)) { let land = true; for (let i = 0; i < 34; i++) if (AL.GROUND[M.ground[y * n + x + i]].cost <= 0) land = false; if (land) return [x + 17, y]; } } return null; });
  out.spot = !!spot; if (!spot) { console.log('no spot'); process.exit(1); }
  for (let k = 0; k < 40; k++) { const d = await p.evaluate(([x, y]) => { const c = AL.Game.cam, s = AL.Game.scale; return [(x * 8 - c.x) * c.z * s - 640, (y * 8 - c.y) * c.z * s - 360]; }, spot); if (Math.abs(d[0]) < 6 && Math.abs(d[1]) < 6) break;
    const mx = Math.max(-500, Math.min(500, d[0])), my = Math.max(-300, Math.min(300, d[1])); await p.mouse.move(640 + mx / 2, 360 + my / 2); await p.mouse.down({ button: 'right' }); await p.mouse.move(640 - mx / 2, 360 - my / 2, { steps: 4 }); await p.mouse.up({ button: 'right' }); }
  const drop = async (kind, count, x, y) => { await p.evaluate(([kind, count]) => { AL.Game.tool = { id: 'spawn:' + kind, size: 1, shape: 'round', count }; }, [kind, count]); await p.mouse.click(x, y); await p.waitForTimeout(150); };
  await drop('human', 18, 640 - 17 * 16, 360); await drop('orc', 18, 640 + 17 * 16, 360);
  for (let i = 0; i < 6; i++) await p.keyboard.press('Period');
  await p.waitForFunction(async () => { const k = await AL.Link.ask('kingdoms'); return k.filter(x => x.alive).length >= 2; }, null, { timeout: 60000, polling: 1000 }).catch(() => { });
  await p.waitForTimeout(25000); let ks = await p.evaluate(() => AL.Link.ask('kingdoms')); out.kingdoms = ks.filter(k => k.alive).map(k => k.name + '/' + k.ramp + '/' + k.rulerName + '/pop' + k.pop); out.two = ks.filter(k => k.alive).length >= 2; out.colours = new Set(ks.filter(k => k.alive).map(k => k.ramp)).size >= 2; out.rulers = ks.filter(k => k.alive).every(k => k.rulerName);
  for (let i = 0; i < 6; i++) await p.keyboard.press('Comma'); await p.keyboard.press('Period');
  await p.keyboard.press('KeyL'); await p.waitForTimeout(700); out.layer = await p.evaluate(() => AL.Gfx.layerOn === 1); await p.screenshot({ path: 'shots/step7-kingdoms.png' }); await p.keyboard.press('KeyL');
  const al = ks.filter(k => k.alive); await p.evaluate(([a, b]) => AL.Link.send({ t: 'incite', a, b, war: true }), [al[0].id, al[1].id]);
  for (let i = 0; i < 5; i++) await p.keyboard.press('Period'); await p.waitForTimeout(30000); for (let i = 0; i < 6; i++) await p.keyboard.press('Comma'); await p.keyboard.press('Period');
  const ch = await p.evaluate(() => AL.Link.ask('chronicle', { n: 200 })); out.chron = ch.slice(-12).map(c => c.k + ': ' + c.s); out.war = ch.some(c => c.k === 'war'); out.march = ch.some(c => c.k === 'march'); const st = await p.evaluate(() => AL.Link.ask('stats')); out.killed = st.killed;
  // go and look at the front: centre on a mobilised soldier
  await p.evaluate(() => { const m = AL.Scene.cur; for (let i = 0; i < m.n; i++) if (m.alive[i] && (m.flags[i] & 4096)) { AL.Game.cam.x = m.x[i] * 8 - AL.Gfx.W / 2 / AL.Game.cam.z; AL.Game.cam.y = m.y[i] * 8 - AL.Gfx.H / 2 / AL.Game.cam.z; break; } }); await p.mouse.move(640, 360); await p.mouse.wheel(0, -100); await p.waitForTimeout(900); await p.screenshot({ path: 'shots/step7-war.png' });
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['two', 'colours', 'rulers', 'layer', 'war', 'march'].filter(k => !out[k]); console.log(fails.length || errs.length ? 'STEP7 FAIL ' + fails : 'STEP7 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
