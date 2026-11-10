// Palette validator. Checks: 64..96 colors, ramps of 5..7 tones, hue rotation >= 15° per ramp,
// monotonic luminance, no pure black/white, min distance between any two colors.
// With file args (PNG): reports colors outside the palette.  node tools/validate-palette.js [png...]
'use strict';
const { palette, readPNG } = require('./lib/img');
const p = palette(); let fail = 0;
const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const n = p.rgb.length;
if (n < 64 || n > 96) { console.log('FAIL color count ' + n); fail++; }
if (p.tones < 5 || p.tones > 7) { console.log('FAIL tones per ramp'); fail++; }
const rows = [];
p.rampNames.forEach((name, ri) => {
  const hs = [], ls = [];
  for (let t = 0; t < p.tones; t++) { hs.push(p.hsv[ri * p.tones + t][0]); ls.push(lum(p.rgb[ri * p.tones + t])); }
  // total hue travel along the ramp (shortest arcs, summed with sign)
  let travel = 0; for (let t = 1; t < hs.length; t++) { let d = hs[t] - hs[t - 1]; d = ((d + 540) % 360) - 180; travel += d; }
  const mono = ls.every((l, i) => i === 0 || l > ls[i - 1] + 4);
  if (Math.abs(travel) < 15) { console.log('FAIL hue rotation ' + name + ' ' + travel); fail++; }
  if (!mono) { console.log('FAIL luminance not monotonic ' + name + ' ' + ls.map(v => v.toFixed(0))); fail++; }
  rows.push(name.padEnd(7) + ' hue travel ' + String(Math.round(travel)).padStart(5) + '°  lum ' + ls.map(v => v.toFixed(0).padStart(3)).join(' ') + '  ' + p.hex.slice(ri * 6, ri * 6 + 6).join(' '));
});
for (const c of p.rgb) { if (lum(c) < 12 || lum(c) > 250 || (c[0] === c[1] && c[1] === c[2] && (c[0] === 0 || c[0] === 255))) { console.log('FAIL pure black/white ' + c); fail++; } }
let minD = 1e9, pair = '';
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const a = p.rgb[i], b = p.rgb[j], d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); if (d < minD) { minD = d; pair = p.hex[i] + ' ' + p.hex[j]; } }
if (minD < 6) { console.log('FAIL two colors nearly identical ' + pair); fail++; }
if (!process.argv.includes('--quiet')) { console.log(rows.join('\n')); console.log('colors ' + n + ', min pair distance ' + minD.toFixed(1) + ' (' + pair + ')'); }
const set = new Set(p.rgb.map(c => (c[0] << 16) | (c[1] << 8) | c[2]));
for (const f of process.argv.slice(2).filter(a => a.endsWith('.png'))) {
  const im = readPNG(f); let bad = 0; const badset = new Set();
  for (let i = 0; i < im.w * im.h; i++) { if (im.data[i * 4 + 3] === 0) continue; const k = (im.data[i * 4] << 16) | (im.data[i * 4 + 1] << 8) | im.data[i * 4 + 2]; if (!set.has(k)) { bad++; badset.add(k); } }
  console.log((bad ? 'FAIL ' : 'ok   ') + f + ' off-palette pixels: ' + bad + (bad ? ' (' + [...badset].slice(0, 6).map(k => '#' + k.toString(16).padStart(6, '0')).join(',') + ')' : ''));
  if (bad) fail++;
}
console.log(fail ? 'PALETTE: ' + fail + ' FAILURES' : 'PALETTE OK');
process.exit(fail ? 1 : 0);
