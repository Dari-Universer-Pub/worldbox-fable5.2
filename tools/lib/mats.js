// Material helpers: map a ramp name + tone numbers to palette indices.
// INK: every material is outlined with tone 0 of a dark "ink" ramp of its own colour family (relative luminance <= 0.012),
// so that a unit keeps >= 4:1 contrast on every walkable ground (grounds are kept at luminance >= 0.21, see STYLE.md).
'use strict';
const { palette } = require('./img');
const P = palette();
const ix = (ramp, tone) => P.ramps[ramp] * 6 + tone;
const INK = { grass: 'forest', forest: 'forest', jungle: 'forest', sand: 'earth', earth: 'earth', stone: 'stone', water: 'water', ice: 'water', skin: 'earth', red: 'red', fire: 'red', magic: 'magic', swamp: 'swamp', teal: 'teal', royal: 'water', pink: 'red' };
// material from a ramp: tones list (dark->light). outline = ink tone 0, outlineLit = ink tone 1 (edges facing the light)
function mat(ramp, tones, o = {}) {
  const ink = o.ink || INK[ramp];
  return Object.assign({ tones: tones.map(v => ix(ramp, v)), outline: ix(ink, 0), outlineLit: ix(ink, 1), ramp }, o.extra || {});
}
// team-coloured material (indices 128..133); inked in dark earth
function team(tones, o = {}) { return Object.assign({ tones: tones.map(v => 128 + v), outline: ix('earth', 0), outlineLit: ix('earth', 1), ramp: 'team' }, o.extra || {}); }
// emissive material (144..149): glows at night
function glow(tones, o = {}) { return Object.assign({ tones: tones.map(v => 144 + v), outline: ix('earth', 0), outlineLit: ix('earth', 1), ramp: 'emissive' }, o.extra || {}); }
module.exports = { ix, mat, team, glow, P, INK };
