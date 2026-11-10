// Step 6 robot: wildlife is present, the spawn tool drops animals and monsters with real clicks, predators hunt, zombies attack a village.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.Scene.cur, null, { timeout: 30000 });
  const c0 = await p.evaluate(() => AL.Link.ask('census')); out.census0 = c0; out.wild = Object.keys(c0).length >= 6;
  const spot = await p.evaluate(() => { const M = AL.Game.map, n = M.n; for (let k = 0; k < 9000; k++) { const x = 30 + ((AL.hash2(k, 1, 5) * (n - 60)) | 0), y = 30 + ((AL.hash2(k, 2, 5) * (n - 60)) | 0); let ok = true, trees = 0; for (let dy = -7; dy <= 7 && ok; dy++) for (let dx = -7; dx <= 7; dx++) { const t = (y + dy) * n + x + dx; if (M.ground[t] !== AL.G.grass) { ok = false; break; } if (AL.fKind[M.feature[t]] === 1) trees++; } if (ok && trees < 40) return [x, y]; } return null; });
  for (let k = 0; k < 40; k++) { const d = await p.evaluate(([x, y]) => { const c = AL.Game.cam, s = AL.Game.scale; return [(x * 8 - c.x) * c.z * s - 640, (y * 8 - c.y) * c.z * s - 360]; }, spot); if (Math.abs(d[0]) < 6 && Math.abs(d[1]) < 6) break;
    const mx = Math.max(-500, Math.min(500, d[0])), my = Math.max(-300, Math.min(300, d[1])); await p.mouse.move(640 + mx / 2, 360 + my / 2); await p.mouse.down({ button: 'right' }); await p.mouse.move(640 - mx / 2, 360 - my / 2, { steps: 4 }); await p.mouse.up({ button: 'right' }); }
  await p.mouse.move(640, 360); await p.mouse.wheel(0, -100); await p.waitForTimeout(600);
  const drop = async (kind, count, x, y) => { await p.evaluate(([kind, count]) => { AL.Game.tool = { id: 'spawn:' + kind, size: 1, shape: 'round', count }; }, [kind, count]); await p.mouse.click(x, y); await p.waitForTimeout(150); };
  await drop('deer', 5, 520, 300); await drop('sheep', 5, 760, 300); await drop('rabbit', 5, 640, 250); await drop('boar', 3, 520, 440); await drop('bear', 1, 800, 440); await drop('eagle', 2, 640, 200); await drop('wolf', 3, 400, 360);
  await p.waitForTimeout(700); const c1 = await p.evaluate(() => AL.Link.ask('census')); out.dropped = c1.deer >= (c0.deer || 0) + 5 && c1.wolf >= (c0.wolf || 0) + 3 && c1.bear >= (c0.bear || 0) + 1;
  await p.screenshot({ path: 'shots/step6-animals.png' });
  await p.keyboard.press('Period'); await p.keyboard.press('Period'); await p.keyboard.press('Period'); const k0 = (await p.evaluate(() => AL.Link.ask('stats'))).killed; await p.waitForTimeout(12000); const k1 = (await p.evaluate(() => AL.Link.ask('stats'))).killed; out.hunted = k1 > k0; out.kills = k1 - k0;
  await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.screenshot({ path: 'shots/step6-hunt.png' });
  // a village, then monsters
  await drop('human', 20, 640, 360); for (let i = 0; i < 6; i++) await p.keyboard.press('Period'); await p.waitForTimeout(9000); for (let i = 0; i < 6; i++) await p.keyboard.press('Comma'); await p.keyboard.press('Period');
  await drop('zombie', 4, 760, 360); await drop('skeleton', 3, 520, 360); await drop('demon', 1, 640, 470); await p.waitForTimeout(2500); await p.screenshot({ path: 'shots/step6-monsters.png' });
  const s0 = await p.evaluate(() => AL.Link.ask('stats')); await p.keyboard.press('Period'); await p.keyboard.press('Period'); await p.waitForTimeout(9000); const s1 = await p.evaluate(() => AL.Link.ask('stats')); out.battle = s1.killed > s0.killed; out.census1 = await p.evaluate(() => AL.Link.ask('census'));
  await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.keyboard.press('Comma'); await p.screenshot({ path: 'shots/step6-after.png' });
  console.log(JSON.stringify(out)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['wild', 'dropped', 'hunted', 'battle'].filter(k => !out[k]); console.log(fails.length || errs.length ? 'STEP6 FAIL ' + fails : 'STEP6 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
