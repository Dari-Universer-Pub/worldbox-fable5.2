// Palette generator: ramps defined as hand-chosen [hue°, sat%, val%] keys -> tools/art/palette.json
// Source of truth for the 96-color palette. Run: node tools/make-palette.js
'use strict';
const fs = require('fs'), path = require('path');
const RAMPS = [
  ['grass',  [[168,48,22],[150,50,34],[128,52,46],[104,55,58],[84,56,70],[66,50,84]]],
  ['forest', [[200,45,16],[186,48,25],[168,50,33],[150,50,42],[128,48,52],[104,45,64]]],
  ['jungle', [[178,70,24],[160,72,36],[138,72,50],[112,72,62],[88,72,74],[68,62,88]]],
  ['sand',   [[18,42,38],[26,42,52],[33,42,66],[39,40,78],[45,36,88],[52,28,95]]],
  ['earth',  [[330,35,16],[348,38,25],[8,42,35],[20,45,46],[28,46,58],[36,42,72]]],
  ['stone',  [[255,24,18],[245,20,29],[232,16,41],[215,12,54],[190,9,68],[60,8,84]]],
  ['water',  [[242,60,26],[228,64,38],[214,66,52],[202,62,66],[190,52,80],[176,36,92]]],
  ['ice',    [[236,34,46],[226,30,62],[214,24,76],[204,16,87],[190,9,94],[70,6,97]]],
  ['skin',   [[345,45,28],[0,48,42],[12,48,58],[20,46,74],[27,40,88],[36,28,96]]],
  ['red',    [[325,60,24],[340,68,38],[352,74,54],[2,76,70],[12,72,84],[24,60,94]]],
  ['fire',   [[8,80,48],[18,84,66],[28,86,82],[38,82,92],[48,66,97],[56,40,99]]],
  ['magic',  [[262,58,24],[268,58,38],[276,56,54],[288,52,68],[302,44,82],[318,30,94]]],
  ['swamp',  [[275,38,20],[190,34,23],[160,32,31],[110,32,40],[78,36,50],[60,36,62]]],
  ['teal',   [[222,60,22],[204,64,34],[188,66,48],[174,64,62],[162,54,76],[150,38,90]]],
  ['royal',  [[258,62,30],[244,66,44],[230,68,60],[218,64,74],[206,52,86],[194,34,95]]],
  ['pink',   [[300,48,26],[314,54,40],[326,58,56],[338,58,72],[350,48,86],[10,32,95]]],
];
function hsv(h, s, v) {
  h = ((h % 360) + 360) % 360; s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
const out = { tones: 6, ramps: {}, rampNames: [], rgb: [], hex: [], hsv: [], teamPreviewRamp: 9, emissiveRamp: 10,
  teamRamps: ['red', 'royal', 'fire', 'magic', 'teal', 'pink', 'jungle', 'ice', 'earth', 'sand', 'stone', 'water'] };
RAMPS.forEach(([name, keys], ri) => {
  out.ramps[name] = ri; out.rampNames.push(name);
  for (const k of keys) { const c = hsv(...k); out.rgb.push(c); out.hsv.push(k); out.hex.push('#' + c.map(v => v.toString(16).padStart(2, '0')).join('')); }
});
fs.writeFileSync(path.join(__dirname, 'art/palette.json'), JSON.stringify(out));
console.log('palette: ' + out.rgb.length + ' colors, ' + RAMPS.length + ' ramps');
