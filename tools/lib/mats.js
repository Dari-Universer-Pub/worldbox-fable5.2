// Material helpers: map a ramp name + tone numbers to palette indices.
'use strict';
const { palette } = require('./img');
const P = palette();
const ix = (ramp, tone) => P.ramps[ramp] * 6 + tone;
// material from ramp: tones list (dark->light), outline = darkest-1, outlineLit
function mat(ramp, tones, o = {}) {
  const t = tones.map(v => ix(ramp, v)), lo = Math.max(0, tones[0] - (o.od == null ? 1 : o.od));
  return Object.assign({ tones: t, outline: o.outline != null ? o.outline : ix(o.oramp || ramp, lo), outlineLit: o.outlineLit != null ? o.outlineLit : ix(o.oramp || ramp, Math.min(5, lo + 1)) }, o.extra || {});
}
// team-coloured material (indices 128..133)
function team(tones, o = {}) { return Object.assign({ tones: tones.map(v => 128 + v), outline: 128 + Math.max(0, tones[0] - 1), outlineLit: 128 + tones[0] }, o.extra || {}); }
module.exports = { ix, mat, team, P };
