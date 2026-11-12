// Step 13 robot: loading screen, title screen and delivery, with real mouse and keyboard events.
// Checks: the loading screen shows the logo and a progress bar before the game code is there; the title appears over a living
// world with the menu track selected; language buttons, options and new-world windows open from the title; "Enter this world"
// gives the normal interface; '?play' skips the title; the web-app files exist and are what they say; nothing is requested
// outside the game folder.   node tests/step13.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [], out = {}, fails = [], reqs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + String(e.stack).split('\n').slice(0, 3).join(' @ ').slice(0, 400))); p.on('request', r => reqs.push(r.url()));
  const url = 'file://' + process.cwd() + '/game/index.html', wait = ms => p.waitForTimeout(ms), ev = (f, a) => p.evaluate(f, a), t0 = Date.now();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  out.loading = await ev(() => { const l = document.getElementById('load'), im = l && l.querySelector('img'), bar = document.querySelector('#bar i'); return { overlay: !!l, logo: !!im && /logo\.png$/.test(im.src), bar: !!bar, gameCode: !!(window.AL && AL.Game) }; });
  await p.waitForFunction(() => { const im = document.querySelector('#load img'); return im && im.complete && im.naturalWidth > 0 && document.getElementById('msgi').naturalWidth > 0; }, null, { timeout: 8000 }).catch(() => fails.push('loading images'));
  await p.screenshot({ path: 'shots/step13-loading.png' }); out.logoPx = await ev(() => { const im = document.querySelector('#load img'); return im ? [im.naturalWidth, im.naturalHeight] : null; });
  await p.waitForFunction(() => window.AL && AL.Game.ready && AL.App && AL.App.title && AL.App.seeded && AL.App.t > 1.6 && AL.UI.btn.tplay, null, { timeout: 40000 }).catch(() => fails.push('title did not appear'));
  out.firstDisplayMs = Date.now() - t0; out.loadMs = await ev(() => window.AL_LOAD_MS); await wait(600);
  out.title = await ev(() => ({ overlayGone: !document.getElementById('load'), menu: AL.Mixer.menu, logo: !!AL.Assets.frames['logo/word'], icon: !!AL.Assets.frames['logo/icon'], bars: !!(AL.UI.btn.cat0 && AL.UI.btn.cat0[4] >= AL.UI.frameNo - 2), units: AL.Scene.nUnits, speed: AL.Game.speed }));
  await wait(2500); out.unitsLater = await ev(() => AL.Scene.nUnits); await p.screenshot({ path: 'shots/step13-title.png' });
  const btn = async id => { await p.waitForFunction(id => AL.UI.btn[id] && AL.UI.btn[id][4] >= AL.UI.frameNo - 2, id, { timeout: 8000 }); const r = await ev(id => { const q = AL.UI.btn[id], k = (AL.Game.options.uiSize || 1) * AL.Game.scale; return [(q[0] + q[2] / 2) * k, (q[1] + q[3] / 2) * k]; }, id); await p.mouse.click(r[0], r[1]); await wait(150); };
  // a click on the world behind the menu must not select anything, the wheel must not zoom
  await p.mouse.click(200, 500); await p.mouse.wheel(0, -300); await wait(300); out.inert = await ev(() => !AL.UI.sheet && AL.Game.cam.tz === 2 && AL.App.title);
  await btn('tlfr'); out.fr = await ev(() => AL.lang === 'fr' && AL.t('menu.play')); await wait(200); await p.screenshot({ path: 'shots/step13-title-fr.png' }); await btn('tlen'); out.en = await ev(() => AL.lang === 'en');
  await btn('topt'); out.options = await ev(() => AL.UI.win === 'options'); await wait(300); await p.screenshot({ path: 'shots/step13-options.png' }); await p.keyboard.press('Escape'); await wait(200); out.optClosed = await ev(() => !AL.UI.win && AL.App.title);
  await btn('tnew'); out.newWin = await ev(() => AL.UI.win === 'new'); await p.keyboard.press('Escape'); await wait(200);
  await btn('tload'); out.loadWin = await ev(() => AL.UI.win === 'saves'); await p.keyboard.press('Escape'); await wait(200);
  await btn('tplay'); await wait(600); out.play = await ev(() => ({ title: AL.App.title, menu: AL.Mixer.menu, speed: AL.Game.speed, bars: !!(AL.UI.btn.cat0 && AL.UI.btn.cat0[4] >= AL.UI.frameNo - 2), units: AL.Scene.nUnits }));
  await p.keyboard.press('Space'); await wait(200); out.pauseKey = await ev(() => AL.Game.speed === 0); await p.screenshot({ path: 'shots/step13-entered.png' });
  // a new world made from the title leaves the title
  await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.App.title && AL.App.t > 1.6 && AL.UI.btn.tnew, null, { timeout: 40000 }); await btn('tnew'); await btn('ncreate');
  await p.waitForFunction(() => !AL.App.title && AL.Game.ready && AL.UI.btn.cat0 && AL.UI.btn.cat0[4] >= AL.UI.frameNo - 2, null, { timeout: 30000 }).then(() => { out.newFromTitle = true; }).catch(() => { out.newFromTitle = false; });
  // '?play' skips the title
  await p.goto(url + '?play'); await p.waitForFunction(() => window.AL && AL.Game.ready && AL.UI.btn.cat0, null, { timeout: 40000 }); out.skip = await ev(() => !AL.App.title && !document.getElementById('load') || (!AL.App.title && document.getElementById('load').style.opacity === '0'));
  // delivery: files of the static folder
  const G = f => path.join('game', f), png = f => { const d = fs.readFileSync(G(f)); return d.slice(1, 4).toString() === 'PNG' ? [d.readUInt32BE(16), d.readUInt32BE(20)] : null; };
  const man = JSON.parse(fs.readFileSync(G('manifest.webmanifest'), 'utf8')), html = fs.readFileSync(G('index.html'), 'utf8'); let total = 0; for (const f of fs.readdirSync('game')) total += fs.statSync(G(f)).size;
  out.files = { i64: png('icon-64.png'), i192: png('icon-192.png'), i512: png('icon-512.png'), logo: png('logo.png'), name: man.name, icons: man.icons.map(i => i.sizes).join(','), title: /<title>Dustcrown<\/title>/.test(html), links: /rel="manifest"/.test(html) && /rel="icon"/.test(html) && /apple-touch-icon/.test(html), old: fs.existsSync(G('aeonloom.js')), weightKB: Math.round(total / 1024), readme: /Dustcrown/.test(fs.readFileSync('README.md', 'utf8')) && /game\/index\.html/.test(fs.readFileSync('README.md', 'utf8')) };
  const outside = reqs.filter(u => !u.startsWith('file://' + process.cwd() + '/game/') && !u.startsWith('blob:') && !u.startsWith('data:'));
  const L = out.loading, T = out.title || {}, F = out.files, P = out.play || {};
  if (!L.overlay || !L.logo || !L.bar) fails.push('loading screen'); if (L.gameCode) fails.push('loading screen appeared after the game code');
  if (!T.overlayGone || !T.menu || !T.logo || !T.icon || T.bars) fails.push('title state ' + JSON.stringify(T)); if (!(out.unitsLater > 20)) fails.push('no living world behind the title (' + out.unitsLater + ' units)');
  if (!out.inert) fails.push('world reacts under the title'); if (out.fr !== 'Entrer dans ce monde' || !out.en) fails.push('language buttons'); if (!out.options || !out.optClosed || !out.newWin || !out.loadWin) fails.push('windows from the title');
  if (P.title || P.menu || P.speed !== 1 || !P.bars) fails.push('enter the world ' + JSON.stringify(P)); if (!out.pauseKey) fails.push('keys after entering'); if (!out.newFromTitle) fails.push('new world from the title'); if (!out.skip) fails.push('?play');
  if (!F.i64 || F.i64[0] !== 64 || !F.i192 || F.i192[0] !== 192 || F.i192[1] !== 192 || !F.i512 || F.i512[0] !== 512 || !F.logo || F.name !== 'Dustcrown' || F.icons !== '192x192,512x512' || !F.title || !F.links || F.old || !F.readme) fails.push('delivery files ' + JSON.stringify(F));
  if (F.weightKB > 40 * 1024) fails.push('weight'); if (outside.length) fails.push('requests outside the game folder: ' + outside.slice(0, 3).join(' ')); if (errs.length) fails.push('errors: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify(out)); console.log(fails.length ? 'STEP13 FAIL ' + fails.join(' ; ') : 'STEP13 OK loading screen, title over a living world (' + out.unitsLater + ' beings), menu, languages, windows, enter, new world, ?play, icons and manifest, game/ ' + F.weightKB + ' KB, first display ' + out.firstDisplayMs + ' ms');
  await b.close(); process.exit(fails.length ? 1 : 0); })();
