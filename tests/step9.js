// Step 9 robot: humans and orcs dropped with real clicks build in two different architectures, belong to two cultures with
// names in two languages; a prophet called with a real click founds a religion; the history book has dated entries.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {};
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + process.cwd() + '/game/index.html?play'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.Scene.cur, null, { timeout: 30000 });
  const spot = await p.evaluate(() => { const M = AL.Game.map, n = M.n; const ok = (x, y) => { for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (M.ground[(y + dy) * n + x + dx] !== AL.G.grass) return false; return true; }; for (let k = 0; k < 20000; k++) { const x = 30 + ((AL.hash2(k, 1, 9) * (n - 100)) | 0), y = 30 + ((AL.hash2(k, 2, 9) * (n - 60)) | 0); if (ok(x, y) && ok(x + 34, y)) { let land = true; for (let i = 0; i < 34; i++) if (AL.GROUND[M.ground[y * n + x + i]].cost <= 0) land = false; if (land) return [x + 17, y]; } } return null; });
  if (!spot) { console.log('no spot'); process.exit(1); }
  const goto = async (x, y) => { await p.evaluate(([x, y]) => { const c = AL.Game.cam; c.x = x * 8 - AL.Gfx.W / 2 / c.z; c.y = y * 8 - AL.Gfx.H / 2 / c.z; }, [x, y]); await p.mouse.move(640, 360); await p.waitForTimeout(250); };
  await goto(spot[0], spot[1]);
  const drop = async (kind, count, x, y) => { await p.evaluate(([kind, count]) => { AL.Game.tool = { id: 'spawn:' + kind, size: 1, shape: 'round', count }; }, [kind, count]); await p.mouse.click(x, y); await p.waitForTimeout(150); };
  await drop('human', 18, 640 - 17 * 16, 360); await drop('orc', 18, 640 + 17 * 16, 360);
  for (let i = 0; i < 6; i++) await p.keyboard.press('Period');
  await p.waitForFunction(async () => { const t = await AL.Link.ask('towns'); return t.length >= 2 && t.every(x => x.blds >= 5 || x.pop >= 20); }, null, { timeout: 120000, polling: 1500 }).catch(() => { });
  await p.waitForTimeout(20000); for (let i = 0; i < 6; i++) await p.keyboard.press('Comma'); await p.keyboard.press('Period');
  const towns = await p.evaluate(() => AL.Link.ask('towns')); out.towns = towns.map(t => t.name + '/' + ['human', 'orc'][t.people] + '/pop' + t.pop);
  const ht = towns.find(t => t.people === 0), ot = towns.find(t => t.people === 1); out.both = !!ht && !!ot;
  out.orcSet = await p.evaluate(() => { const B = AL.Scene.blds; let n = 0; for (let b = 0; b < B.n; b++) if (B.alive[b] && B.town[b] >= 0 && AL.KINDS[B.tp[B.town[b]]].buildSet === 'orc') n++; return n; }) > 2;
  out.orcFrames = await p.evaluate(() => !!AL.Assets.frames['bld/orc/house/0/0'] && !!AL.Assets.frames['bld/orc/temple/2/0']);
  if (ot) { await goto(ot.cx, ot.cy); await p.mouse.wheel(0, -100); await p.waitForTimeout(900); await p.screenshot({ path: 'shots/step9-orc-village.png' }); await p.mouse.wheel(0, 100); await p.waitForTimeout(600); }
  if (ht) { await goto(ht.cx, ht.cy); await p.mouse.wheel(0, -100); await p.waitForTimeout(900); await p.screenshot({ path: 'shots/step9-human-village.png' }); await p.mouse.wheel(0, 100); await p.waitForTimeout(600);
    // the prophet: real click on the human town
    await goto(ht.cx, ht.cy); await p.evaluate(() => { AL.Game.tool = { id: 'prophet', size: 1 }; }); await p.mouse.click(660, 380); await p.waitForTimeout(1200); }
  const rel = await p.evaluate(() => AL.Link.ask('religions')); out.religions = rel.map(r => r.name + ' by ' + r.founder + ' [' + r.dogmas + '] ' + r.followers); out.religion = rel.length >= 1 && rel[0].dogmas.length === 3 && rel[0].followers >= 3;
  const cu = await p.evaluate(() => AL.Link.ask('cultures')); out.cultures = cu.map(c => c.name + '/' + c.lang + '/war ' + c.values.war.toFixed(2)); out.twoCultures = new Set(cu.map(c => c.people)).size >= 2 && new Set(cu.map(c => c.name)).size >= 2;
  const la = await p.evaluate(() => AL.Link.ask('languages')); out.samples = la.map(l => l.name + ': ' + l.sample.join(' '));
  const hi = await p.evaluate(() => AL.Link.ask('history')); out.year = hi.year; out.era = hi.era; out.history = hi.entries.length >= 4 && hi.entries.every(e => e.y >= 1) && hi.entries.some(e => e.k === 'religion');
  const no = await p.evaluate(() => AL.Link.ask('notables')); out.notables = no.living.slice(0, 6).map(n => n.name + ' ' + n.title); out.hasNotables = no.living.some(n => n.title === 'prophet') && no.living.some(n => n.title === 'king' || n.title === 'queen');
  console.log(JSON.stringify(out, null, 1)); if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n')); await b.close();
  const fails = ['both', 'orcSet', 'orcFrames', 'religion', 'twoCultures', 'history', 'hasNotables'].filter(k => !out[k]); console.log(fails.length || errs.length ? 'STEP9 FAIL ' + fails : 'STEP9 OK'); process.exit(fails.length || errs.length ? 1 : 0); })();
