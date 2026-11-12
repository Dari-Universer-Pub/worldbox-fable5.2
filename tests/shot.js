// helper: open the built game, wait until the world is ready, run steps, take screenshots.  node tests/shot.js <out.png> [js-to-eval] [wait-ms]
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: +(process.env.VW || 1280), height: +(process.env.VH || 720) } }); const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html' + (process.env.Q == null ? '?play' : process.env.Q)); await p.waitForFunction(() => window.AL && AL.Game.ready, null, { timeout: 30000 }).catch(() => errs.push('not ready'));
  if (process.argv[3]) { const r = await p.evaluate(process.argv[3]).catch(e => errs.push('eval ' + e.message)); if (r !== undefined) console.log(JSON.stringify(r)); }
  await p.waitForTimeout(+(process.argv[4] || 700)); await p.screenshot({ path: process.argv[2] }); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close(); })();
