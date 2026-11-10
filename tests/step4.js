// Step 4 robot: camera (wheel, keys, drag), brushes with real mouse events, far view, performance measure.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  const t0 = Date.now(); await p.goto('file://' + process.cwd() + '/game/index.html'); await p.waitForFunction(() => window.AL && AL.Game.ready, null, { timeout: 30000 }); out.loadMs = Date.now() - t0;
  const cam = () => p.evaluate(() => ({ x: AL.Game.cam.x, y: AL.Game.cam.y, z: AL.Game.cam.z }));
  const c0 = await cam(); await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD'); const c1 = await cam(); out.keyPan = c1.x > c0.x + 20;
  await p.mouse.move(640, 360); await p.mouse.wheel(0, -100); await p.waitForTimeout(500); const c2 = await cam(); out.wheelZoomIn = c2.z === 2;
  await p.mouse.move(600, 300); await p.mouse.down({ button: 'right' }); await p.mouse.move(500, 250, { steps: 5 }); await p.mouse.up({ button: 'right' }); const c3 = await cam(); out.dragPan = c3.x > c2.x + 10 && c3.y > c2.y + 5;
  await p.mouse.wheel(0, 100); await p.waitForTimeout(400);
  // brushes: paint water with a real drag, then raise land, plant forest
  const tileAt = (x, y) => p.evaluate(([x, y]) => { const s = AL.Game.scale, w = AL.Game.screenToWorld(x / s, y / s), tx = Math.floor(w[0] / 8), ty = Math.floor(w[1] / 8), M = AL.Game.map; return { g: M.ground[ty * M.n + tx], h: M.height[ty * M.n + tx], f: M.feature[ty * M.n + tx] }; }, [x, y]);
  await p.evaluate(() => { AL.Game.tool = { id: 'ground:shallow', size: 6, shape: 'round' }; });
  await p.mouse.move(400, 300); await p.mouse.down(); await p.mouse.move(700, 420, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(400); out.paintWater = (await tileAt(550, 360)).g === 1;
  await p.evaluate(() => { AL.Game.tool = { id: 'raise', size: 9, shape: 'round' }; }); const h0 = (await tileAt(900, 500)).h; await p.mouse.move(900, 500); await p.mouse.down(); await p.waitForTimeout(900); await p.mouse.up(); await p.waitForTimeout(300); const h1 = (await tileAt(900, 500)).h; out.raise = h1 > h0 + 15; out.raiseFrom = h0; out.raiseTo = h1;
  await p.evaluate(() => { AL.Game.tool = { id: 'ground:grass', size: 12, shape: 'square' }; }); await p.mouse.click(300, 550); await p.evaluate(() => { AL.Game.tool = { id: 'forest', size: 10, shape: 'round' }; }); await p.mouse.move(300, 550); await p.mouse.down(); await p.mouse.move(330, 560, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(400);
  out.forest = await p.evaluate(() => { const M = AL.Game.map; let c = 0; const s = AL.Game.scale, w = AL.Game.screenToWorld(300 / s, 550 / s), tx = Math.floor(w[0] / 8), ty = Math.floor(w[1] / 8); for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (AL.fKind[M.feature[(ty + y) * M.n + tx + x]] === 1) c++; return c; }) > 15;
  await p.evaluate(() => { AL.Game.tool = { id: 'lava', size: 3, shape: 'line' }; }); await p.mouse.move(1000, 150); await p.mouse.down(); await p.mouse.move(1150, 250, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(400); out.lineLava = (await tileAt(1075, 200)).g === 2;
  await p.screenshot({ path: 'shots/step4-brushes.png' });
  // far views
  await p.mouse.move(640, 360); await p.mouse.wheel(0, 100); await p.waitForTimeout(600); await p.screenshot({ path: 'shots/step4-zoom05.png' }); await p.mouse.wheel(0, 100); await p.waitForTimeout(600); await p.screenshot({ path: 'shots/step4-zoom025.png' });
  // performance: synchronous GPU frame cost at 3 zooms (software GL in this environment)
  out.perf = await p.evaluate(() => { const r = {}; for (const z of [0.25, 1, 3]) { AL.Game.cam.z = AL.Game.cam.tz = z; const ts = []; for (let i = 0; i < 60; i++) { const t = performance.now(); AL.Gfx.begin(); AL.Game._drawFlora && AL.Game._drawFlora(); AL.Gfx.draw({ x: AL.Game.cam.x + i, y: AL.Game.cam.y, z }, AL.Game.env); AL.Gfx.finish(); ts.push(performance.now() - t); } ts.sort((a, b) => a - b); r['z' + z] = { avg: +(ts.reduce((a, b) => a + b) / 60).toFixed(2), p95: +ts[57].toFixed(2) }; } return r; });
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['keyPan', 'wheelZoomIn', 'dragPan', 'paintWater', 'raise', 'forest', 'lineLava'].filter(k => !out[k]); console.log(fails.length || errs.length ? 'STEP4 FAIL ' + fails : 'STEP4 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
