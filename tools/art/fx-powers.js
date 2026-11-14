// Effect sources of the 56 powers of chantier A.7 (one drawn effect per power, nothing shared). Loaded by fx.js, which
// hands over its helpers. Same rules as fx.js: palette ramps only, clean masses, light from the top-left.
'use strict';
module.exports = function (E, h) {
  const { AL, Img, ix, R, nz, sm, field, clean, FIRE, SMOKE, SOOT, DUST, K1, ring, spray, glyphRise } = h;
  const K = Object.assign({}, K1, { A: ix('earth', 0), B: ix('earth', 1), E: ix('earth', 2), F: ix('earth', 3), D: ix('stone', 1), S: ix('stone', 2), T: ix('stone', 3), U: ix('stone', 4), V: ix('stone', 5),
    N: ix('sand', 3), M: ix('sand', 4), L: ix('sand', 5), G: ix('grass', 3), H: ix('grass', 4), j: ix('magic', 1), l: ix('magic', 2), J: ix('magic', 0), R: ix('red', 2), Q: ix('red', 1), f: ix('fire', 2), I: ix('ice', 4), W: ix('water', 3), X: ix('water', 4), Y: ix('water', 5), P: ix('pink', 3) });
  const G = rows => Img.fromGrid(rows, K), TAU = 6.2832;
  const part = rows => ({ w: Math.max(...rows.map(r => r.length)), h: rows.length, n: 1, pivot: [0, 0], fn: () => G(rows) });
  const dot = (im, x, y, c) => im.set(Math.round(x), Math.round(y), c);
  const ln = (im, x0, y0, x1, y1, c) => { const L = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let k = 0; k <= L; k++) im.set(Math.round(x0 + (x1 - x0) * k / L), Math.round(y0 + (y1 - y0) * k / L), c); };
  const ball = (im, cx, cy, r, fn) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d <= r) { const c = fn(x + 0.5 - cx, y + 0.5 - cy, d); if (c !== 255) im.set(x, y, c); } } };
  // crystal / rock spikes growing out of the ground: [baseX, height, halfWidth, lean]
  const spikes = (im, list, t, base, lit, mid, dark) => { for (const [bx, H, w, lean] of list) { const hh = H * t; for (let y = 0; y < hh; y++) { const v = y / hh, ww = w * (1 - v), cx = bx + lean * v; for (let x = Math.floor(cx - ww); x <= Math.ceil(cx + ww); x++) { const u = (x + 0.5 - cx) / (ww + 0.01); if (Math.abs(u) > 1) continue; im.set(x, base - y, u < -0.25 ? lit : u < 0.35 ? mid : dark); } } } };

  // ---- weather particles
  E['p/drizzle'] = part(['e', 'd']); E['p/monsoon'] = part(['..e', '..e', '.d.', '.d.', 'd..', 'd..']); E['p/hail'] = part(['.w.', 'wIv', '.v.']); E['p/blizzard'] = part(['..ww', 'wv..']);
  E['hailhit'] = { size: 16, n: 4, fn: spray(16, R('ice', [3, 4, 5]), 5, { reach: 0.35, up: 1.4, big: 1, seed: 21 }) };
  // tempest: streaks of wind that end in a curl
  E['gust'] = { w: 32, h: 16, n: 6, pivot: [16, 8], fn: (f, n) => { const im = new Img(32, 16), t = f / n, C = [ix('ice', 5), ix('ice', 4), ix('ice', 3)];
    for (let k = 0; k < 3; k++) { const y0 = 4 + k * 4, off = (t * 32 + k * 11) % 32, L = 15 - k * 3; for (let s = 0; s < L; s++) im.set(((off + s) % 32) | 0, Math.round(y0 + Math.sin(s / L * 3.1 + k) * 1.3), s > L - 5 ? C[0] : s > L / 2 ? C[1] : C[2]);
      const hx = off + L, hy = y0 + Math.sin(3.1 + k) * 1.3; for (let a = 0; a < 4.6; a += 0.45) im.set(Math.round(hx + Math.sin(a) * 1.7) % 32, Math.round(hy - 1.7 + Math.cos(a) * 1.7), C[0]); }
    return im; } };
  // frostbite: three shards of ice shoot up, then glint
  E['icicle'] = { size: 16, n: 6, pivot: [8, 15], fn: (f, n) => { const im = new Img(16, 16), t = Math.min(1, (f + 1) / (n - 2)); spikes(im, [[4, 8, 2.2, -1.5], [12, 9, 2.2, 1.5], [8, 13, 3, 0.5]], t, 15, ix('ice', 5), ix('ice', 4), ix('ice', 2));
    if (f >= n - 2) { const gx = f === n - 2 ? 8 : 12, gy = f === n - 2 ? 2 : 6; im.set(gx, gy, ix('ice', 5)); im.set(gx - 1, gy, ix('ice', 4)); im.set(gx + 1, gy, ix('ice', 4)); im.set(gx, gy - 1, ix('ice', 4)); im.set(gx, gy + 1, ix('ice', 4)); } return im; } };
  // scorch: a shaft of burning sunlight with a white-hot spot on the ground
  E['sunray'] = { w: 32, h: 64, n: 6, pivot: [16, 58], fn: (f, n) => { const t = f / n; return clean(field(0, (x, y) => { const u = Math.abs(x - 16);
    if (y > 53) { const d = Math.hypot((x - 16) / 13, (y - 58) / 4.5); if (d < 1) return AL.clamp(1 - d * 0.8 + 0.1 * Math.sin(t * TAU), 0.3, 0.999); }
    const w = 3 + y / 64 * 8 + Math.sin(y * 0.35 + t * TAU) * 0.5; if (u > w || y > 58) return 0; const ray = Math.sin((x - 16) * 1.3) * 0.5 + 0.5, a = (1 - u / w) * 0.7 + ray * 0.25 + 0.1 * Math.sin(t * TAU * 2 + y * 0.2); return a < 0.24 ? 0 : AL.clamp(a, 0.05, 0.999); }, [ix('fire', 3), ix('fire', 4), ix('fire', 5), ix('sand', 5)], 32, 64)); } };
  // great drought: wavering lines of hot air
  E['heatshim'] = { size: 16, n: 6, fn: (f, n) => { const im = new Img(16, 16), t = f / n; for (let k = 0; k < 3; k++) { const bx = 3 + k * 5, top = (t + k / 3) % 1; for (let y = 0; y < 9; y++) { const yy = 15 - y - Math.round(top * 6); if (yy < 0) continue; im.set(bx + Math.round(Math.sin(y * 0.9 + t * TAU + k * 2) * 1.4), yy, y > 6 ? ix('sand', 3) : y > 2 ? ix('sand', 5) : ix('fire', 4)); } } return im; } };
  // acid fog: a low bank of green vapour
  E['acidmist'] = { size: 64, n: 2, pivot: [32, 32], fn: f => field(64, (x, y) => { let v = 0; for (const [cx, cy, r] of [[22, 30, 16], [40, 28, 15], [32, 38, 17], [50, 36, 9], [13, 36, 9]]) { const d = Math.hypot(x - cx, (y - cy) * 1.9) / (r + f); if (d < 1) v = Math.max(v, 1 - d); }
    if (v <= 0) return 0; v += (nz(x * 0.12 + f * 3, y * 0.2, 77) - 0.5) * 0.5; return v < 0.1 ? 0 : v < 0.3 ? 0.2 : v < 0.6 ? 0.5 : 0.9; }, [ix('swamp', 3), ix('jungle', 3), ix('jungle', 4)]) };
  // thunderclap: ball lightning that jumps from victim to victim
  E['chain'] = { size: 16, n: 4, pivot: [8, 8], fn: f => { const im = new Img(16, 16); for (let k = 0; k < 4; k++) { let a = k * 1.571 + f * 0.7, x = 8, y = 8; for (let s = 0; s < 3; s++) { const nx = x + Math.cos(a) * 2.3, ny = y + Math.sin(a) * 2.3; ln(im, x, y, nx, ny, s < 2 ? ix('royal', 5) : ix('royal', 4)); x = nx; y = ny; a += (AL.hash2(k, s + f * 3, 9) - 0.5) * 2.4; } }
    ball(im, 8, 8, 2.6, (dx, dy, d) => d < 1.5 ? ix('ice', 5) : ix('royal', 5)); return im; } };
  // firestorm: a spindle of spinning flame
  E['firewhirl'] = { w: 32, h: 64, n: 6, pivot: [16, 62], fn: (f, n) => { const im = new Img(32, 64), t = f / n;
    for (let y = 3; y < 63; y++) { const v = 1 - (y - 3) / 60, cx = 16 + Math.sin(v * 4 + t * TAU) * 3 * v, w = 2.5 + Math.sin(Math.min(1, v * 1.25) * 3.14) * 7.5 + Math.sin(y * 0.8 + t * TAU * 2) * 0.9;
      for (let x = 0; x < 32; x++) { const u = (x + 0.5 - cx) / w; if (Math.abs(u) > 1) continue; if (v > 0.72 && nz(x * 0.45 + t * 3, y * 0.2 - t * 6, 5) < (v - 0.72) * 3.2) continue; const band = Math.sin(y * 0.5 - Math.asin(u) * 2.4 - t * TAU * 2), heat = 0.72 - Math.abs(u) * 0.45 + band * 0.28 - v * 0.3; im.set(x, y, FIRE[AL.clamp((heat * 6) | 0, 0, 5)]); } }
    for (let k = 0; k < 6; k++) { const a = t * TAU + k * 1.05, r = 7 + k * 1.3; dot(im, 16 + Math.cos(a) * r, 56 - k * 8 + Math.sin(a) * 2, FIRE[4]); dot(im, 16 + Math.cos(a) * r, 57 - k * 8 + Math.sin(a) * 2, FIRE[2]); } return im; } };
  // wildfire: a running wall of flames
  E['flamewall'] = { size: 32, n: 6, pivot: [16, 31], fn: (f, n) => { const t = f / n; return clean(field(32, (x, y) => { const e = Math.min(1, Math.min(x, 32 - x) / 5), hgt = (11 + 13 * nz(x * 0.28 + t * 1.5, t * 4, 61) + 4 * Math.sin(x * 0.9 + t * TAU)) * e, v = (32 - y) / Math.max(1, hgt); if (v >= 1) return 0;
    return AL.clamp((1 - v) * 1.1 + 0.08 - (nz(x * 0.5, y * 0.4 + t * 5, 62) - 0.5) * 0.3, 0.05, 0.999); }, FIRE)); } };
  // twister: a slim dust devil made of ribbons
  E['twister'] = { w: 16, h: 32, n: 6, pivot: [8, 30], fn: (f, n) => { const im = new Img(16, 32), t = f / n, tn = [ix('earth', 3), ix('sand', 3), ix('sand', 4), ix('sand', 5)];
    for (let y = 2; y < 31; y++) { const v = 1 - (y - 2) / 29, cx = 8 + Math.sin(v * 5 + t * TAU) * 1.6 * v, w = 1 + v * 5.5; for (let x = 0; x < 16; x++) { const u = (x + 0.5 - cx) / w; if (Math.abs(u) > 1) continue; const band = Math.sin(y * 0.9 - Math.asin(u) * 2 - t * TAU * 2); if (band < -0.35 && v > 0.15) continue; im.set(x, y, tn[AL.clamp(((0.55 - u * 0.4 + band * 0.25) * 4) | 0, 0, 3)]); } }
    for (let k = 0; k < 4; k++) { const a = t * TAU + k * 1.57; dot(im, 8 + Math.cos(a) * 4, 29 + Math.sin(a), tn[1]); } return im; } };
  // tremor: a fissure that opens across the ground
  E['fissure'] = { size: 32, n: 4, pivot: [16, 16], fn: f => { const im = new Img(32, 32); for (let x = 2; x < 30; x++) { const cy = 16 + (nz(x * 0.3, 3, 8) - 0.5) * 14, tp = Math.sin((x - 2) / 28 * 3.14), w = (0.5 + f * 1.1) * tp, y0 = Math.round(cy - w), y1 = Math.round(cy + w), wall = Math.min(3, Math.max(1, (y1 - y0) >> 1));
      im.set(x, y0 - 1, ix('earth', 1)); for (let y = y0; y <= y1; y++) { const k = y - y0; im.set(x, y, k < wall ? (k === 0 ? ix('earth', 2) : k === 1 ? ix('earth', 1) : ix('earth', 0)) : ix('stone', 0)); } if (tp > 0.25 && (x % 5) !== 4) im.set(x, y1 + 1, ix('earth', f > 0 ? 4 : 3)); } // the far wall lit at its top, the void, the near lip catching the light
    if (f > 0) { let x = 12, y = 16 + (nz(12 * 0.3, 3, 8) - 0.5) * 14; for (let k = 0; k < 3 + f * 2; k++) { x -= 0.6; y -= 1; im.set(Math.round(x + (k & 1)), Math.round(y), ix('earth', 0)); im.set(Math.round(x + (k & 1)), Math.round(y) - 1, ix('earth', 1)); } x = 21; y = 17 + (nz(21 * 0.3, 3, 8) - 0.5) * 14 + f; for (let k = 0; k < 2 + f * 2; k++) { x += 0.7; y += 1; im.set(Math.round(x), Math.round(y), ix('earth', 0)); } }
    if (f > 1) for (const [rx, ry] of [[6, 22], [25, 9], [15, 25 + (f > 2 ? 1 : 0)]]) { if (im.get(rx, ry) !== 255) continue; im.set(rx, ry, ix('earth', 3)); im.set(rx + 1, ry, ix('earth', 3)); im.set(rx, ry + 1, ix('earth', 1)); im.set(rx + 1, ry + 1, ix('earth', 1)); } return im; } };
  // cataclysm: a ridge of rock thrusts out of the ground
  E['upheave'] = { size: 32, n: 6, pivot: [16, 28], fn: (f, n) => { const im = new Img(32, 32), t = Math.sin(Math.min(1, (f + 1) / (n - 1)) * 1.571); spikes(im, [[6, 12, 3.5, -2], [26, 11, 3.5, 2.5], [21, 19, 4.5, 1.5], [12, 24, 5.5, -1]], t, 28, ix('stone', 4), ix('stone', 3), ix('stone', 1));
    for (let x = 2; x < 30; x++) { const hh = 1 + ((nz(x * 0.6, f, 12) * 3) | 0); for (let y = 0; y < hh; y++) im.set(x, 29 - y + 1, y === hh - 1 ? ix('earth', 3) : ix('earth', 1)); }
    if (f < n - 1) for (let k = 0; k < 5; k++) dot(im, 4 + k * 6 + (f & 1), 26 - f * 2 - (k % 3) * 3, DUST[k % 3]); return im; } };
  // falling bodies: head toward the bottom-left, tail toward the top-right
  function fall(S, hx, hy, hr, len, tones, rock) { return (f, n) => { const t = f / n, im = field(S, (x, y) => { const px = x - hx, py = y - hy, along = (px - py) * 0.707, across = (px + py) * 0.707; if (along < -hr - 1) return 0;
      const w = along < 0 ? Math.sqrt(Math.max(0, (hr + 1) * (hr + 1) - along * along)) : (hr + 1) * (1 - along / len) + (nz(along * 0.35 - t * 4, across * 0.4, 9) - 0.5) * hr * 0.7; if (Math.abs(across) > w || along > len) return 0;
      return AL.clamp((1 - Math.abs(across) / w) * 0.6 + (1 - along / len) * 0.5, 0.05, 0.999); }, tones);
    ball(im, hx, hy, hr, (dx, dy, d) => d > hr - 0.9 ? rock[0] : (dx + dy < -hr * 0.3 ? rock[3] : dx + dy < hr * 0.3 ? rock[2] : rock[1])); return clean(im); }; }
  E['shard'] = { size: 16, n: 4, pivot: [5, 11], fn: fall(16, 5, 11, 2, 10, FIRE.slice(1), R('earth', [0, 1, 2, 3])) };
  E['comet'] = { size: 64, n: 4, pivot: [14, 50], fn: fall(64, 14, 50, 6, 46, [ix('royal', 2), ix('royal', 3), ix('royal', 4), ix('teal', 4), ix('ice', 4), ix('ice', 5)], R('ice', [1, 2, 3, 5])) };
  // tsunami: a tall wall of water with a foaming lip
  E['crest'] = { w: 64, h: 32, n: 4, pivot: [32, 28], fn: (f, n) => { const t = f / n; return clean(field(0, (x, y) => { const e = Math.pow(Math.sin(x / 64 * 3.14), 0.4), top = 26 - 20 * e * (0.85 + 0.15 * Math.sin(x * 0.25 + t * TAU)), d = y - top; if (d < 0 || y > 29) return 0; if (d < 2.2) return 0.97; if (d < 5) return nz(x * 0.5 - t * 6, y * 0.6, 3) > 0.42 ? 0.97 : 0.75;
    const b = (y - top) / (30 - top), streak = nz(x * 0.35, y * 0.12 - t * 3, 4); return b < 0.45 ? (streak > 0.6 ? 0.75 : 0.55) : b < 0.8 ? 0.35 : 0.12; }, R('water', [1, 2, 3, 4]).concat([ix('ice', 5)]), 64, 32)); } };
  // spring: a jet of water that fans out and falls back
  E['geyser'] = { w: 16, h: 32, n: 6, pivot: [8, 30], fn: (f, n) => { const im = new Img(16, 32), t = f / (n - 1), H = 6 + 22 * Math.sin(Math.min(1, t * 1.3) * 1.571), top = 30 - H;
    for (let y = Math.round(top); y < 31; y++) { const v = (y - top) / H, w = v < 0.25 ? 1.9 + Math.sin(v * 12.566) * 3.6 : 1.9 + 0.5 * Math.sin(y * 0.8 + f * 2); for (let x = 0; x < 16; x++) { const u = (x + 0.5 - 8) / w; if (Math.abs(u) > 1) continue; if (v < 0.25 && nz(x * 0.7, y * 0.7 + f, 4) < 0.35) continue; im.set(x, y, v < 0.12 ? ix('ice', 5) : u < -0.2 ? ix('water', 5) : u < 0.5 ? ix('water', 4) : ix('water', 3)); } }
    for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.45, d = t * 9; dot(im, 8 + Math.sin(a) * (3 + d), top + 2 + d * d * 0.12 + Math.abs(k - 2), ix('water', 5)); } for (let x = -3; x <= 3; x++) im.set(8 + x, 30, ix('ice', 5)); return im; } };
  // caldera: a rolling column of ash over a glowing vent (loops)
  E['ashplume'] = { size: 64, n: 6, pivot: [32, 60], fn: (f, n) => { const t = f / n, im = new Img(64, 64), tn = R('stone', [0, 1, 2, 3, 4]), lz = (a, b, s) => nz(a, b + t * 2.4, s) * (1 - t) + nz(a, b + (t - 1) * 2.4, s) * t;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const X = x + 0.5 - 32, Y = y + 0.5, v = (60 - Y) / 58; if (v < 0 || v > 1) continue; const w = 4 + Math.pow(v, 0.7) * 22, sway = Math.sin(v * 3 + t * TAU) * 3 * v, lump = lz(x * 0.13, y * 0.13, 91) - 0.5, d = Math.abs(X - sway) / w + lump * 0.7; if (d > 1) continue;
      if (v > 0.85 && nz(x * 0.2, y * 0.2, 93) < (v - 0.85) * 5) continue; if (v < 0.12) { im.set(x, y, FIRE[AL.clamp(((1 - d) * 5 + (0.12 - v) * 20) | 0, 1, 5)]); continue; } im.set(x, y, tn[AL.clamp(((0.55 - (X - sway) / w * 0.35 + lump * 0.9 + (v - 0.5) * 0.2) * 5) | 0, 0, 4)]); }
    return clean(im); } };
  // firecracker: a festive star burst
  E['cracker'] = { size: 16, n: 5, pivot: [8, 8], fn: (f, n) => { const im = new Img(16, 16), t = (f + 1) / n, cs = [ix('pink', 5), ix('fire', 5), ix('teal', 5)]; for (let k = 0; k < 9; k++) { const a = k * 0.698 + 0.2, r0 = t * 4.5, r1 = 1.5 + t * 6.5; for (let r = r0; r <= r1; r += 0.8) dot(im, 8 + Math.cos(a) * r, 8 + Math.sin(a) * r * 0.9, cs[k % 3]); }
    if (f < 2) ball(im, 8, 8, 1.6, () => ix('ice', 5)); return im; } };
  // minefield: a spiked mine half buried, its lamp blinking
  E['mine'] = { size: 16, n: 2, pivot: [8, 10], fn: f => { const im = new Img(16, 16); im.blit(G(['....D.D....', '..D.STS.D..', '...STUUS...', '.DSTUUTTSD.', '..ST' + (f ? 'z' : 'R') + 'TTDS..', '.DSTTTDDSD.', '...SDDDS...', '..B.DDD.B..', '.BEEFFEEEB.']), 2, 3); if (f) { im.set(6, 6, ix('fire', 4)); im.set(5, 7, ix('fire', 4)); } return im; } };
  // carpet bombing: a finned bomb, nose down
  E['bombfall'] = { size: 16, n: 2, pivot: [8, 12], fn: f => { const im = new Img(16, 16); im.blit(G([f ? 'S.T.S' : '.STS.', 'S.T.S', '.STS.', '..T..', '.DTU.', 'DSTUU', 'DSTUU', 'DSTTU', '.DST.', '..D..']), 5, 2); return im; } };
  // megabomb: two rings of fire racing outward
  E['shockring'] = { size: 64, n: 6, pivot: [32, 32], fn: (f, n) => { const a = ring(64, [ix('fire', 2), ix('fire', 4), ix('ice', 5)], 0.17)(f, n); if (f < 1) return a; const b = ring(64, [ix('red', 2), ix('fire', 3)], 0.1)(f - 1, n + 2); b.blit(a, 0, 0); return b; } };
  // tsar: a fireball dome, then a double-capped mushroom with a white collar of condensation
  E['tsar'] = { size: 64, n: 12, pivot: [32, 60], fn: (f, n) => { const t = f / (n - 1), im = new Img(64, 64), rise = sm(0.1, 0.6, t), fade = sm(0.78, 1, t), dome = 1 - sm(0.12, 0.4, t), capY = 52 - rise * 38, capR = 8 + rise * 20, stemW = 2.5 + rise * 3.5;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const X = x + 0.5 - 32, Y = y + 0.5; let heat = -9, lit = 0; const lump = nz(x * 0.15, y * 0.15 - t * 2, 141) - 0.5;
      if (dome > 0) { const dd = Math.hypot(X, (Y - 58) * 1.3) / (10 + t * 40); if (dd < 1 && Y < 60) { heat = (1 - dd) * 0.6 + dome * 0.7; lit = 0.5; } }
      const dc = Math.hypot(X, (Y - capY) * 2.1) / capR + lump * 0.3; if (heat < -8 && dc < 1) { heat = (1 - dc) * (1.2 - t * 1.7) + (0.4 - t); lit = 0.62 - X / capR * 0.3 - (Y - capY) / capR * 0.9; }
      const d2 = Math.hypot(X, (Y - (capY - capR * 0.32)) * 1.7) / (capR * 0.55) + lump * 0.3; if (heat < -8 && d2 < 1 && rise > 0.3) { heat = (1 - d2) * (1.3 - t * 1.7) + (0.5 - t); lit = 0.7 - X / capR * 0.4 - (Y - capY + capR * 0.3) / capR; }
      const sw = stemW * (1 + 0.9 * Math.pow(AL.clamp((Y - capY) / (58 - capY + 0.01), 0, 1), 4)) + lump * 1.5; if (heat < -8 && Y > capY && Y < 59 && Math.abs(X) < sw) { heat = (1 - Math.abs(X) / sw) * (0.8 - t * 1.5); lit = 0.5 - X / sw * 0.4; }
      const br = 10 + sm(0, 0.5, t) * 21, db = Math.hypot(X / br, (Y - 58) / 3.6) + lump * 0.4; if (heat < -8 && db < 1 && Y < 62) { heat = (1 - db) * (0.6 - t * 2); lit = 0.45 - X / br * 0.3; }
      if (heat < -8) { const ry = capY + capR * 0.55, rr = capR * 0.85, e = Math.abs(Math.hypot(X / rr, (Y - ry) / (rr * 0.22)) - 1); if (rise > 0.45 && t < 0.85 && e < 0.2 && (Y > ry || Math.abs(X) > stemW + 1)) im.set(x, y, Y > ry ? ix('ice', 5) : ix('ice', 4)); continue; }
      if (fade > 0 && nz(x * 0.3, y * 0.3, 143) < fade * 0.9) continue;
      if (heat > 0.06) im.set(x, y, heat > 0.85 ? ix('ice', 5) : FIRE[Math.min(5, (AL.clamp(heat, 0, 0.999) * 6) | 0)]); else im.set(x, y, (t > 0.55 ? SMOKE : SOOT)[AL.clamp((lit * 3) | 0, 0, 2)]); }
    return clean(im); } };
  // acid flood: a bubbling green pool
  E['acidpool'] = { size: 16, n: 4, pivot: [8, 9], fn: f => { const im = field(16, (x, y) => { const d = Math.hypot((x - 8) / 7, (y - 9) / 3.6) + (nz(x * 0.5, y * 0.5, 33) - 0.5) * 0.3; return d > 1 ? 0 : d > 0.75 ? 0.2 : d > 0.4 ? 0.55 : 0.9; }, [ix('jungle', 2), ix('jungle', 3), ix('jungle', 4)]);
    const bb = [[5, 9], [10, 8], [8, 10], [11, 10]], b = bb[f], c = bb[(f + 2) % 4]; im.set(b[0], b[1] - 1, ix('jungle', 5)); im.set(b[0], b[1], ix('jungle', 5)); im.set(b[0] + 1, b[1] - 1, ix('ice', 5)); im.set(c[0], c[1], ix('jungle', 5)); return im; } };
  // smite: a spear of gold from the sky and its flare on the ground
  E['smite'] = { w: 32, h: 64, n: 5, pivot: [16, 58], fn: f => { const im = new Img(32, 64), W = [1.2, 3.2, 2.2, 1, 0.5][f], bot = [30, 58, 58, 58, 58][f], tn = [ix('fire', 3), ix('fire', 4), ix('fire', 5), ix('sand', 5)];
    for (let y = 0; y < bot; y++) { const w = W * (0.6 + 0.4 * y / 60) + 0.8; for (let x = 0; x < 32; x++) { const u = Math.abs(x + 0.5 - 16) / w; if (u > 1) continue; if (f === 4 && ((x + y) & 3)) continue; im.set(x, y, tn[AL.clamp(((1 - u) * 4) | 0, 0, 3)]); } }
    if (f >= 1 && f <= 3) { const r = [0, 11, 14, 9][f]; for (let k = 0; k < 8; k++) { const a = k * 0.785, L = (k & 1) ? r * 0.55 : r; for (let s = 2; s < L; s++) dot(im, 16 + Math.cos(a) * s, 58 + Math.sin(a) * s * 0.5, s < L * 0.5 ? tn[3] : s < L * 0.8 ? tn[2] : tn[1]); } ball(im, 16, 58, f === 2 ? 3.2 : 2.4, (dx, dy, d) => d < 1.5 ? ix('ice', 5) : tn[3]); }
    return im; } };
  // annihilate: a sphere of nothing swells, then folds into a point
  E['voidball'] = { size: 32, n: 8, pivot: [16, 16], fn: f => { const im = new Img(32, 32), r = [3, 7, 10, 12, 12.5, 9, 5, 1.6][f];
    ball(im, 16, 16, r, (dx, dy, d) => { if (d > r - 1.2) return f > 4 ? ix('ice', 5) : ix('magic', 5); if (d > r - 2.6) return ix('magic', 3); const a = Math.atan2(dy, dx) + d * 0.5 - f * 0.9; return Math.sin(a * 2) > 0.75 && d > 1.5 ? ix('magic', 2) : ix('magic', 0); });
    if (f >= 5) for (let k = 0; k < 6; k++) { const a = k * 1.047 + f, q = r + 2 + (7 - f); ln(im, 16 + Math.cos(a) * q, 16 + Math.sin(a) * q, 16 + Math.cos(a) * (q + 3), 16 + Math.sin(a) * (q + 3), ix('magic', 4)); } return im; } };
  // mend: a mason's hammer and the sparks of repair
  E['mend'] = { size: 16, n: 6, fn: glyphRise(16, [{ x: 5, rows: ['TUUV.', 'STUUV', '..F..', '..F..', '..E..'], sway: 0.8 }, { x: 1, rows: ['.c.', 'cbc', '.c.'] }, { x: 12, rows: ['z', 'y'], sway: 0.6 }], K) };
  // sanctuary: a dome of golden light (rim, meridians, a travelling glint)
  E['dome'] = { size: 64, n: 4, pivot: [32, 44], fn: f => { const im = new Img(64, 64);
    for (let a = 0; a < 360; a += 1.5) { const A = a * Math.PI / 180, back = a > 180; if (back && ((a / 6 | 0) + f) % 2) continue; dot(im, 32 + Math.cos(A) * 30, 44 + Math.sin(A) * 9, back ? ix('fire', 3) : ((a / 20 | 0) + f) % 4 === 0 ? ix('sand', 5) : ix('fire', 4)); }
    const arc = (rx, dotted, c0, c1) => { for (let a = 0; a <= 180; a += 1.2) { if (dotted && ((a / 7 | 0) + f) % 2) continue; const A = a * Math.PI / 180; dot(im, 32 + Math.cos(A) * rx, 44 - Math.sin(A) * 32, ((a / 22 | 0) + f) % 4 === 0 ? c1 : c0); } };
    arc(30, 0, ix('fire', 4), ix('sand', 5)); arc(16, 1, ix('fire', 3), ix('fire', 5)); arc(0.01, 1, ix('fire', 3), ix('fire', 5));
    const sp = [[20, 22], [43, 18], [32, 30], [12, 36]][f]; for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) im.set(sp[0] + dx, sp[1] + dy, dx || dy ? ix('sand', 5) : ix('ice', 5)); return im; } };
  // might: chevrons of strength climbing around the champion
  E['aura'] = { size: 16, n: 6, fn: glyphRise(16, [{ x: 5, rows: ['..z..', '.zyz.', 'zy.yz', 'y...y'] }, { x: 1, rows: ['.y.', 'yxy', 'x.x'], sway: 0.5 }, { x: 11, rows: ['.y.', 'yxy', 'x.x'], sway: 0.5 }, { x: 6, rows: ['.s.', 's.s'] }], K) };
  // bloom: a flower opens and sheds its petals
  E['petal'] = { size: 16, n: 6, pivot: [8, 13], fn: (f, n) => { const im = new Img(16, 16), t = f / (n - 1), r = 1.2 + t * 2.4; im.set(8, 13, ix('grass', 2)); im.set(8, 12, ix('grass', 3)); im.set(8, 11, ix('grass', 3)); im.set(7, 12, ix('grass', 4)); im.set(9, 11, ix('grass', 4));
    for (let k = 0; k < 5; k++) { const a = k * 1.257 - 1.57 + t * 0.6; dot(im, 8 + Math.cos(a) * r, 8.5 + Math.sin(a) * r * 0.9, ix('pink', 5)); dot(im, 8 + Math.cos(a) * r * 0.5, 8.5 + Math.sin(a) * r * 0.45, ix('pink', 4)); if (t > 0.5) dot(im, 8 + Math.cos(a + 0.5) * r, 8.5 + Math.sin(a + 0.5) * r * 0.9, ix('pink', 3)); }
    im.set(8, 8, ix('fire', 5)); im.set(8, 9, ix('fire', 4)); for (let k = 0; k < 3; k++) { const a = k * 2.1 + t * 4; dot(im, 8 + Math.cos(a) * (4 + t * 3), 5 + Math.sin(a) * 3 - t * 3, ix('pink', k ? 4 : 5)); } return im; } };
  // hex: a six-pointed seal turning on the ground
  E['hexsign'] = { size: 32, n: 6, pivot: [16, 16], fn: (f, n) => { const im = new Img(32, 32), t = f / n, P = (a, r) => [16 + Math.cos(a) * r, 16 + Math.sin(a) * r * 0.55];
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + t * 2.094, p = P(a, 12), q = P(a + 2.094, 12), p2 = P(a + 1.047, 12), q2 = P(a + 3.141, 12); ln(im, p2[0], p2[1], q2[0], q2[1], ix('magic', 2)); ln(im, p[0], p[1], q[0], q[1], ix('magic', 3)); }
    for (let a = 0; a < TAU; a += 0.04) { const p = P(a, 14.5); dot(im, p[0], p[1], Math.sin(a * 3 + t * TAU) > 0.3 ? ix('magic', 5) : ix('magic', 4)); } for (let k = 0; k < 3; k++) { const p = P(k * 2.094 + t * 2.094, 12); im.set(Math.round(p[0]), Math.round(p[1]), ix('pink', 5)); }
    ball(im, 16, 16, 1.6, () => ix('magic', 5)); return im; } };
  // venom: two fangs drip into a puddle
  E['venom'] = { size: 16, n: 6, fn: (f, n) => { const im = new Img(16, 16); im.blit(G(['ww', 'wv', 'wv', 'w.', 'w.']), 4, 1); im.blit(G(['ww', 'vw', 'vw', '.w', '.w']), 10, 1); const y = 6 + f * 1.4; if (f < 5) { im.set(4, Math.round(y), ix('jungle', 5)); im.set(4, Math.round(y) + 1, ix('jungle', 4)); } const y2 = 6 + ((f + 3) % 6) * 1.4; if ((f + 3) % 6 < 5) { im.set(11, Math.round(y2), ix('jungle', 5)); im.set(11, Math.round(y2) + 1, ix('jungle', 4)); }
    const w = 2 + (f >> 1); for (let x = -w; x <= w; x++) { im.set(8 + x, 14, ix('jungle', Math.abs(x) < w - 1 ? 4 : 3)); if (Math.abs(x) < w - 1) im.set(8 + x, 15, ix('jungle', 2)); } return im; } };
  // pestilence: a cloud of flies
  E['flies'] = { size: 16, n: 4, pivot: [8, 10], fn: f => { const im = new Img(16, 16); for (let x = 4; x < 12; x++) for (let y = 8; y < 13; y++) if (Math.hypot(x - 7.5, (y - 10) * 1.6) < 4 && ((x + y + f) & 1)) im.set(x, y, ix('swamp', 2));
    for (let k = 0; k < 7; k++) { const a = k * 0.9 + f * 1.571, x = Math.round(8 + Math.cos(a * 1.3 + k) * (3 + k % 3 * 1.5)), y = Math.round(7 + Math.sin(a + k * 2) * (2 + k % 2 * 2.5)); im.set(x, y, ix('stone', 0)); im.set(x + ((f + k) & 1 ? 1 : -1), y - 1, ix('ice', 3)); } return im; } };
  // frenzy: three claw strokes
  E['fang'] = { size: 16, n: 4, pivot: [8, 8], fn: f => { const im = new Img(16, 16), L = [4, 8, 11, 11][f]; for (let k = 0; k < 3; k++) for (let s = 0; s < L; s++) { if (f === 3 && (s & 1)) continue; const x = 13 - k * 4 - s * 0.75 + k, y = 1 + s + k; im.set(Math.round(x), Math.round(y), s > L - 3 && f < 3 ? ix('pink', 5) : ix('red', 4)); if (s > 1 && s < L - 1) im.set(Math.round(x) + 1, Math.round(y), ix('red', 2)); } return im; } };
  // delirium: a hypnotic spiral
  E['spiral'] = { size: 16, n: 6, pivot: [8, 8], fn: (f, n) => { const im = new Img(16, 16), t = f / n; for (let a = 0.6; a < 15; a += 0.12) { const r = a * 0.45, A = a + t * TAU; dot(im, 8 + Math.cos(A) * r, 8 + Math.sin(A) * r, (a % 6.283) < 3.14 ? ix('pink', 5) : ix('magic', 4)); } im.set(8, 8, ix('ice', 5)); return im; } };
  // genius: a star of insight lights up overhead
  E['idea'] = { size: 16, n: 5, pivot: [8, 12], fn: f => { const im = new Img(16, 16), L = [1, 3, 5, 4, 2][f], cy = 9 - f; for (let s = 1; s <= L; s++) { const c = s > L - 1 ? ix('royal', 4) : ix('royal', 5); im.set(8 + s, cy, c); im.set(8 - s, cy, c); im.set(8, cy + s, c); im.set(8, cy - s, c); if (s <= L >> 1) { im.set(8 + s, cy + s, ix('royal', 4)); im.set(8 - s, cy - s, ix('royal', 4)); im.set(8 + s, cy - s, ix('royal', 4)); im.set(8 - s, cy + s, ix('royal', 4)); } }
    im.set(8, cy, ix('ice', 5)); if (L > 2) { im.set(9, cy, ix('ice', 5)); im.set(7, cy, ix('ice', 5)); im.set(8, cy - 1, ix('ice', 5)); im.set(8, cy + 1, ix('ice', 5)); } return im; } };
  // revival: a bird of flame rises from the ashes
  E['phoenix'] = { size: 32, n: 8, pivot: [16, 29], fn: (f, n) => { const im = new Img(32, 32), t = f / (n - 1), cy = 22 - t * 8, ang = -0.5 + Math.sin(Math.min(1, t * 1.4) * 1.571) * 1.5, L = 4 + Math.min(1, t * 2) * 9, H = new Float32Array(1024);
    const put = (x, y, r, hh) => { for (let j = Math.floor(y - r); j <= y + r; j++) for (let i = Math.floor(x - r); i <= x + r; i++) { if (i < 0 || j < 0 || i > 31 || j > 31) continue; const d = Math.hypot(i + 0.5 - x, j + 0.5 - y); if (d <= r) { const v = hh * (1 - d / (r + 0.5) * 0.5); if (v > H[j * 32 + i]) H[j * 32 + i] = v; } } };
    for (const s of [-1, 1]) for (let q = 0; q <= 1; q += 0.04) { const a = ang - q * 0.5, x = 16 + s * (1.5 + q * L * Math.cos(a)), y = cy - 1 - q * L * Math.sin(a) + q * q * 2; put(x, y, 2.4 * (1 - q * 0.75), 0.75 - q * 0.4); if (((q * 25) | 0) % 6 === 3) put(x, y + 2 + (1 - q) * 2, 0.9, 0.4); }
    put(16, cy, 2.6, 1); put(16, cy + 3, 2, 0.9); put(16, cy - 3.5, 1.7, 1); for (let k = -1; k <= 1; k++) for (let q = 0; q < 1; q += 0.1) put(16 + k * (1 + q * 3), cy + 5 + q * 6, 1.2 * (1 - q * 0.6), 0.6 - q * 0.4);
    for (let i = 0; i < 1024; i++) { const v = H[i]; if (v > 0.05) { if (t > 0.8 && AL.hash2(i, f, 3) < (t - 0.8) * 3.5) continue; im.d[i] = FIRE[AL.clamp((v * 6) | 0, 0, 5)]; } }
    im.set(17, Math.round(cy - 4), ix('stone', 0)); im.set(18, Math.round(cy - 3), ix('fire', 5)); if (t < 0.6) for (let x = -5; x <= 5; x++) { im.set(16 + x, 29, ix('stone', 2)); if (Math.abs(x) < 3) im.set(16 + x, 28, ix('stone', 3)); } return clean(im); } };
  // armory: a shield and a blade handed down
  E['arms'] = { size: 16, n: 5, pivot: [8, 13], fn: f => { const im = new Img(16, 16), oy = [4, 1, 0, 1, 1][f]; im.blit(G(['..........w.', '.........wI.', '..dddd..wI..', '.deeeedwI...', '.deyzewId...', '.deyywIed...', '.deeFIeed...', '..dFFdd.....', '..F.dd......']), 2, 3 + oy);
    if (f === 3) { im.set(12, 2 + oy, ix('ice', 5)); im.set(11, 3 + oy, ix('ice', 5)); im.set(13, 3 + oy, ix('ice', 5)); im.set(12, 4 + oy, ix('ice', 5)); } return im; } };
  // crusade: a war banner snapping in the wind
  E['banner'] = { w: 16, h: 32, n: 6, pivot: [4, 30], fn: (f, n) => { const im = new Img(16, 32), t = f / n; for (let y = 4; y < 31; y++) { im.set(3, y, ix('earth', 3)); im.set(4, y, ix('earth', 1)); } im.set(3, 3, ix('fire', 5)); im.set(4, 3, ix('fire', 4)); im.set(3, 2, ix('fire', 5));
    for (let x = 5; x < 15; x++) { const o = Math.sin(x * 0.75 - t * TAU) * 1.3 * (x - 5) / 9, sl = Math.cos(x * 0.75 - t * TAU), top = Math.round(5 + o), hh = 11 - ((x - 5) >> 2); for (let y = 0; y < hh; y++) { const em = Math.hypot(x - 9.5, y - 5) < 2.3; im.set(x, top + y, em ? ix('fire', sl > 0 ? 5 : 4) : y === 0 || y === hh - 1 ? ix('red', 2) : ix('red', sl > 0.3 ? 4 : sl > -0.4 ? 3 : 2)); } } return im; } };
  // truce: a white bird carrying a green twig
  E['dove'] = { size: 16, n: 6, pivot: [8, 12], fn: f => { const im = new Img(16, 16), up = ['..w......', '..ww.....', '...ww.ww.', '.wwwwwwwx', 'w.vvvv..h', '.........'], dn = ['......ww.', '.wwwwwwwx', 'w.vwwv..h', '...ww....', '..ww.....', '.........']; im.blit(G(f & 1 ? dn : up), 3, 9 - f - (f & 1 ? 0 : 1)); return im; } };
  // wolf pack: a crescent moon and the howl that climbs to it
  E['moonhowl'] = { size: 32, n: 5, pivot: [16, 16], fn: (f, n) => { const im = new Img(32, 32); ball(im, 16, 9, 7, (dx, dy, d) => Math.hypot(dx - 3.2, dy + 1.5) < 6.2 ? 255 : d > 6 ? ix('ice', 3) : dx + dy < -4 ? ix('ice', 5) : ix('ice', 4));
    for (let k = 0; k <= f && k < 4; k++) { const r = 4 + (f - k) * 3.2; if (r > 13) continue; for (let a = -2.3; a <= -0.84; a += 0.05) dot(im, 16 + Math.cos(a) * r, 30 + Math.sin(a) * r, k === f ? ix('royal', 5) : ix('royal', 4)); } return im; } };
  // herd: cloven prints stamped one after the other
  E['hoof'] = { size: 16, n: 4, pivot: [8, 8], fn: f => { const im = new Img(16, 16), pr = [[2, 11], [6, 7], [9, 10], [12, 3]]; for (let k = 0; k <= f; k++) { im.blit(G(k === f ? ['A.A', 'A.A', 'B.B'] : ['B.B', 'B.B', 'E.E']), pr[k][0], pr[k][1]); if (k === f) { im.set(pr[k][0] - 1, pr[k][1] + 3, DUST[1]); im.set(pr[k][0] + 3, pr[k][1] + 3, DUST[2]); im.set(pr[k][0] + 1, pr[k][1] + 4, DUST[1]); } } return im; } };
  // flock: a shepherd's crook and tufts of wool
  E['crook'] = { size: 16, n: 5, pivot: [8, 14], fn: f => { const im = new Img(16, 16); im.blit(G(['.FFF.', 'F...F', 'E...F', '....F', '...F.', '...F.', '...E.', '...E.', '...E.', '...E.', '...B.', '...B.']), 3, 2);
    const tf = [[11, 10], [13, 6], [1, 9], [10, 3], [12, 12]]; for (let k = 0; k <= f; k++) { const p = tf[k]; im.blit(G(['.ww', 'wwv', '.v.']), p[0], p[1] - (f - k)); } return im; } };
  // swarm: rats on the run
  E['gnaw'] = { size: 16, n: 4, pivot: [8, 8], fn: f => { const im = new Img(16, 16); for (const [x, y, k] of [[1, 3, 0], [6, 8, 1], [0, 12, 2]]) { const X = x + f * 2 + (k & 1); im.blit(G(['..SST.', 'pSSSTk', f + k & 1 ? '.D..D.' : '..DD..']), X, y); im.set(X - 1, y + 1, ix('pink', 3)); } return im; } };
  // pride: bared fangs and the roar that rolls out of them
  E['roar'] = { size: 32, n: 5, pivot: [16, 16], fn: f => { const im = new Img(32, 32), o = [1, 2.2, 3.2, 3.6, 3][f]; for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const X = x + 0.5 - 16, Y = y + 0.5 - 16; if (Math.hypot(X / 6.5, Y / (o + 1.6)) < 1) im.set(x, y, Math.hypot(X / 5.5, Y / (o + 0.6)) < 1 ? (Y > o * 0.3 ? ix('red', 3) : ix('red', 1)) : ix('sand', 3)); }
    for (const sx of [-4, -1.5, 1.5, 4]) { const big = Math.abs(sx) > 2, hh = big ? 3 : 2; for (let k = 0; k < hh; k++) { im.set(Math.round(16 + sx - 0.5), Math.round(16 - o + k), ix('ice', 5)); im.set(Math.round(16 + sx - 0.5), Math.round(16 + o - k), ix('ice', 4)); } }
    for (let k = 0; k < 3; k++) { const r = 9 + k * 3 + f * 0.8; if (k > f) continue; for (const s of [-1, 1]) for (let a = -0.7; a <= 0.7; a += 0.06) dot(im, 16 + s * Math.cos(a) * r, 16 + Math.sin(a) * r * 0.9, k === 0 ? ix('sand', 5) : k === 1 ? ix('fire', 4) : ix('fire', 3)); } return im; } };
  // undead horde: a hand of bone breaks out of the earth
  E['gravehand'] = { size: 16, n: 6, pivot: [8, 15], fn: f => { const im = new Img(16, 16), rise = [1, 3, 6, 8, 9, 9][f], hand = G(f < 4 ? ['.www.', '.wwwv', 'wwwwv', '.wwv.', '.wv..', '.wv..', '.wv..', '.wv..', '.wv..'] : ['w.w.w', 'w.w.v', 'wwwwv', 'vwwv.', '.wv..', '.wv..', '.wv..', '.wv..', '.wv..']); im.blit(hand, 6, 14 - rise);
    for (let y = 13; y < 16; y++) for (let x = 0; x < 16; x++) im.set(x, y, 255); im.blit(G(['....BEEFEB....', '..BEEFFEEEEB..', '.BEEEEEEBBEEB.']), 1, 13); if (f > 0 && f < 5) { im.set(4 - f, 12 - f, ix('earth', 2)); im.set(12 + f, 11 - f, ix('earth', 3)); im.set(3, 11 - (f >> 1), ix('earth', 1)); } return im; } };
  // bone guard: bones circling their master
  E['bonering'] = { size: 32, n: 6, pivot: [16, 16], fn: (f, n) => { const im = new Img(32, 32), t = f / n, L = []; for (let k = 0; k < 6; k++) L.push(k * 1.047 + t * 1.047); L.sort((a, b) => Math.sin(a) - Math.sin(b));
    for (const a of L) { const x = 16 + Math.cos(a) * 12, y = 16 + Math.sin(a) * 6, tx = -Math.sin(a), ty = Math.cos(a) * 0.5, back = Math.sin(a) < 0, c = back ? ix('ice', 3) : ix('ice', 5), c2 = back ? ix('stone', 2) : ix('ice', 3); ln(im, x - tx * 3, y + 1 - ty * 3, x + tx * 3, y + 1 + ty * 3, c2); ln(im, x - tx * 3, y - ty * 3, x + tx * 3, y + ty * 3, c);
      for (const s of [-1, 1]) { const ex = Math.round(x + tx * 3 * s), ey = Math.round(y + ty * 3 * s); im.set(ex, ey - 1, c); im.set(ex, ey + 1, c2); im.set(ex, ey, c); } }
    for (let a = 0; a < TAU; a += 0.5) dot(im, 16 + Math.cos(a + t * 1.047) * 5, 17 + Math.sin(a + t * 1.047) * 2.5, ix('magic', 4)); return im; } };
  // hell gate: a horned arch of black stone around a whirl of fire (loops)
  E['hellgate'] = { size: 32, n: 6, pivot: [16, 30], fn: (f, n) => { const t = f / n, im = new Img(32, 32), st = R('stone', [0, 1, 2, 3]);
    for (let y = 0; y < 31; y++) for (let x = 0; x < 32; x++) { const X = x + 0.5 - 16, Y = y + 0.5, rin = Y > 14 ? Math.abs(X) : Math.hypot(X, Y - 14), inner = rin < 6, outer = rin < 10;
      if (inner) { const a = Math.atan2(Y - 19, X), d = Math.hypot(X, (Y - 19) * 0.7), hh = 0.55 + Math.sin(a * 2 + d * 0.9 - t * TAU) * 0.33 - d * 0.03 + (rin > 4.8 ? -0.3 : 0); im.set(x, y, FIRE[AL.clamp((hh * 6) | 0, 0, 5)]); }
      else if (outer) { const edge = rin > 8.8, brick = (((y + 2) >> 2) + (x >> 2)) & 1; im.set(x, y, st[AL.clamp((X + (Y - 14) * 0.6 < -4 ? 3 : X < 2 ? 2 : 1) - (edge && X > 0 ? 1 : 0) - (brick ? 1 : 0), 0, 3)]); } }
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const hx = Math.round(16 + s * (7.5 + k * 0.8) - 0.5), hy = 6 - k; im.set(hx, hy, st[s < 0 ? 3 : 2]); if (k < 3) im.set(hx - s, hy, st[s < 0 ? 2 : 1]); } return im; } };
  // dragon call: the eye of the wyrm opens in fire
  E['dragonsign'] = { size: 32, n: 6, pivot: [16, 16], fn: f => { const o = [0.2, 0.55, 0.9, 1, 1, 0.6][f], im = new Img(32, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const X = x + 0.5 - 16, Y = y + 0.5 - 16, hy = 7 * o * (1 - Math.pow(Math.abs(X) / 13, 1.6)); if (Math.abs(X) < 13 && Math.abs(Y) < hy) { const pup = Math.abs(X) < 1.5 * (1.25 - Math.abs(Y) / 8) && Math.abs(Y) < hy - 0.5, d = Math.hypot(X, Y * 1.3); im.set(x, y, pup ? ix('stone', 0) : Math.abs(Y) > hy - 1.1 ? ix('red', 2) : d < 4.5 ? ix('fire', 5) : d < 8 ? ix('fire', 4) : ix('fire', 3)); }
      else if (Math.abs(X) < 14 && Y < 0 && -Y < hy + 1.8) im.set(x, y, ix('red', 1)); }
    if (o > 0.5) for (let k = -1; k <= 1; k++) { const bx = 16 + k * 7, by = 16 - 7 * o - 2 + Math.abs(k) * 2; ln(im, bx - 2, by, bx, by - 4, ix('red', 3)); ln(im, bx, by - 4, bx + 2, by, ix('red', 1)); ln(im, bx - 1, by, bx + 1, by, ix('red', 2)); } return im; } };
  // colossus call: the print of a foot as wide as a house
  E['footfall'] = { size: 64, n: 5, pivot: [32, 32], fn: f => { const im = new Img(64, 64), inP = (x, y) => { if (Math.hypot((x - 32) / 9, (y - 36) / 12) < 1) return 1; for (const [tx, ty, r] of [[23, 21, 3.2], [29, 18, 3.4], [35.5, 18, 3.2], [41, 21, 2.8]]) if (Math.hypot(x - tx, (y - ty) * 0.9) < r) return 1; return 0; };
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const X = x + 0.5, Y = y + 0.5; if (inP(X, Y)) im.set(x, y, !inP(X - 1.6, Y - 1.6) ? ix('stone', 0) : !inP(X + 1.6, Y + 1.6) ? ix('earth', 3) : ix('earth', 1));
      else { const d = Math.hypot(X - 32, (Y - 32) * 1.5), r = 17 + f * 3.3, e = Math.abs(d - r); if (e < 2.4 - f * 0.3 && nz(x * 0.4, y * 0.4, f + 3) > 0.35 + f * 0.08) im.set(x, y, DUST[e < 1 ? 2 : 1]); } } return clean(im); } };
  // leviathan call: a whirlpool
  E['maelstrom'] = { size: 64, n: 6, pivot: [32, 32], fn: (f, n) => { const t = f / n; return field(64, (x, y) => { const X = x - 32, Y = (y - 32) * 1.8, d = Math.hypot(X, Y) / 30; if (d > 1) return 0; if (d < 0.1) return 0.05; const s = Math.sin(Math.atan2(Y, X) * 2 + Math.log(d + 0.05) * 5 + t * TAU); if (d > 0.85 && s < 0.2) return 0;
    return s > 0.75 ? 0.95 : s > 0.2 ? 0.7 : s > -0.4 ? 0.5 : d < 0.35 ? 0.15 : 0.3; }, [ix('water', 0), ix('water', 1), ix('water', 2), ix('water', 3), ix('ice', 5)]); } };
  // giant call: boulders tumble down and bounce
  E['rockfall'] = { size: 32, n: 6, pivot: [16, 30], fn: (f, n) => { const im = new Img(32, 32), t = f / (n - 1); [[8, 3.2, 0], [24, 2.6, 1], [16, 4.2, 2]].forEach(([bx, r, k]) => { const tt = AL.clamp(t * 1.7 - k * 0.22, 0, 1.6), gy = 29 - r, y = tt < 1 ? 3 + (gy - 3) * tt * tt : gy - 6 * Math.sin((tt - 1) / 0.6 * 3.14), rot = tt * 4 + k;
      ball(im, bx + (tt > 1 ? (tt - 1) * 4 * (k - 1) : 0), y, r + 0.6, (dx, dy, d) => { const rr = r + 0.5 * Math.sin((Math.atan2(dy, dx) + rot) * 3); return d > rr ? 255 : d > rr - 1 && dx + dy > 0 ? ix('stone', 0) : dx + dy < -r * 0.5 ? ix('stone', 4) : dx + dy < r * 0.3 ? ix('stone', 3) : ix('stone', 1); });
      if (tt >= 1 && tt < 1.3) for (let q = -2; q <= 2; q++) im.set(Math.round(bx + q * 2), 30 - (q & 1), DUST[(q + 2) % 3]); }); return im; } };
  // feywild: a ring of little mushrooms and rising motes
  E['feyring'] = { size: 32, n: 6, pivot: [16, 18], fn: (f, n) => { const im = new Img(32, 32), t = f / n, L = []; for (let k = 0; k < 9; k++) L.push(k * 0.698); L.sort((a, b) => Math.sin(a) - Math.sin(b));
    for (let k = 0; k < 5; k++) { const ph = (t + k / 5) % 1, x = 9 + k * 3.5, y = 20 - ph * 16; if (ph < 0.85) { im.set(Math.round(x + Math.sin(ph * 6 + k)), Math.round(y), ix('teal', 5)); if (k & 1) im.set(Math.round(x + Math.sin(ph * 6 + k)), Math.round(y) + 1, ix('teal', 3)); } }
    for (const a of L) { const x = Math.round(16 + Math.cos(a) * 12), y = Math.round(19 + Math.sin(a) * 6), tall = (a * 7 | 0) & 1; im.set(x, y, ix('ice', 5)); if (tall) im.set(x, y - 1, ix('ice', 4)); const cy = y - 1 - tall; im.set(x - 1, cy, ix('pink', 3)); im.set(x, cy, ix('pink', 4)); im.set(x + 1, cy, ix('pink', 3)); im.set(x, cy - 1, ix('pink', 5)); im.set(x - 1, cy - 1, ix('pink', 4)); } return im; } };
  // void rift: a tear in the world, stars behind it (loops)
  E['rift'] = { w: 32, h: 64, n: 6, pivot: [16, 60], fn: (f, n) => { const im = new Img(32, 64), t = f / n; for (let y = 4; y < 61; y++) { const v = (y - 4) / 56, w = Math.pow(Math.sin(v * 3.14), 0.7) * (4.2 + 1.4 * Math.sin(t * TAU + v * 5)), zz = Math.abs(((y / 7) % 2) - 1) * 5 - 2.5, cx = 16 + zz;
      for (let x = 0; x < 32; x++) { const u = Math.abs(x + 0.5 - cx); if (u > w + 2) continue; im.set(x, y, u > w + 1 ? ix('magic', 2) : u > w ? ix('magic', 5) : u > w - 1.2 ? ix('magic', 3) : AL.hash2(x, y, 5 + ((f + ((x * 3 + y) % 6)) / 3 | 0)) > 0.94 ? ix('ice', 5) : ix('magic', 0)); } }
    for (let k = 0; k < 4; k++) { const y0 = 14 + k * 11, s = k & 1 ? 1 : -1, zz = Math.abs(((y0 / 7) % 2) - 1) * 5 - 2.5; for (let q = 0; q < 5 + ((f + k) % 3); q++) dot(im, 16 + zz + s * (5 + q), y0 - q * q * 0.18 - Math.sin(t * TAU + k) * 1, ix('magic', 4)); } return im; } };
};
