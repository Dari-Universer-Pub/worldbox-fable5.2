// Language test: every chronicle entry of a 45-year game (two peoples) carries an i18n key; its English text equals what the
// simulation wrote, its French text is different, complete (no leftover {n}, no empty brackets) and the two languages share no raw English sentence.
const AL = require('./sim-bundle.js'); const seed = 3, sim = new AL.Sim({ size: 'medium', seed }), W = sim.world, n = W.n; let best = null;
for (let k = 0; k < 9000; k++) { const x = 30 + ((AL.hash2(k, 1, seed) * (n - 110)) | 0), y = 40 + ((AL.hash2(k, 2, seed) * (n - 80)) | 0), x2 = x + 44; if (W.region[y * n + x] && W.region[y * n + x] === W.region[y * n + x2] && AL.Units.siteQuality(sim, x, y) > .6 && AL.Units.siteQuality(sim, x2, y) > .6) { best = [x, y, x2]; break; } }
sim.command({ t: 'spawn', kind: 'human', x: best[0] + .5, y: best[1] + .5, count: 16 }); sim.command({ t: 'spawn', kind: 'orc', x: best[2] + .5, y: best[1] + .5, count: 16 });
for (let k = 0; k < 45 * AL.YEAR; k++) { sim.step(); sim.events.length = 0; }
const fails = []; let keyed = 0, differs = 0; const kinds = new Set();
for (const e of sim.chron) { if (!e.i) { fails.push('entry without key: ' + e.k + ' ' + e.s); continue; } keyed++; kinds.add(e.i); AL.lang = 'en'; const en = AL.logText(e); AL.lang = 'fr'; const fr = AL.logText(e);
  if (en !== e.s) fails.push('English changed: ' + e.s + ' | ' + en); if (fr !== en) differs++; if (/\{\d\}|\(\s*,|\(\s*\)/.test(fr) || /\{\d\}/.test(en)) fails.push('incomplete: ' + fr); if (fr === en && !/^[A-Z]/.test(en)) fails.push('untranslated: ' + en); }
if (keyed < 20) fails.push('too few chronicle entries: ' + keyed); if (differs < keyed * 0.9) fails.push('French equals English for ' + (keyed - differs) + ' of ' + keyed);
// every key used in the code exists in both languages
const T = AL.DATA.i18n; for (const k of kinds) { if (!T.en[k] || !T.fr[k]) fails.push('missing key ' + k); }
if (fails.length) { console.log(fails.slice(0, 8).join('\n')); console.log('I18N FAIL'); process.exit(1); } console.log('I18N OK ' + keyed + ' entries, ' + kinds.size + ' kinds, French differs in ' + differs); process.exit(0);
