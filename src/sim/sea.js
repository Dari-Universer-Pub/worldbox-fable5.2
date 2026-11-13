// AL.Sea — the sea (chantier B.2): fishing boats that work the open water from a port, and transport ships that carry settlers
// to another land. Boats are not living beings: they live in sim.sea.boats (plain objects, saved with the rest), follow a
// path of water tiles found by a breadth-first search from the port, and are sent to the client in their own snapshot.
(function (AL) {
  'use strict';
  const Sea = AL.Sea = {}, U = AL.Units, T = AL.Towns, F = AL.Ents.F, ACT = U.ACT;
  const ST = Sea.ST = { OUT: 0, FISH: 1, BACK: 2, DOCK: 3, CARRY: 4, LAND: 5 }, FISHB = 0, SHIP = 1;
  // breadth-first search over water from tile `from`; stop(i, depth) returns true on the tile wanted. Parents in sim._seaPar.
  Sea.search = function (sim, from, maxD, stop) { const W = sim.world, n = W.n, N = n * n, par = sim._seaPar || (sim._seaPar = new Int32Array(N)), dep = sim._seaDep || (sim._seaDep = new Uint16Array(N)), q = sim._seaQ || (sim._seaQ = new Int32Array(N));
    par.fill(-2); let qh = 0, qt = 0; q[qt++] = from; par[from] = -1; dep[from] = 0;
    while (qh < qt) { const i = q[qh++], d = dep[i]; if (stop(i, d)) return i; if (d >= maxD) continue; const x = i % n;
      for (let k = 0; k < 4; k++) { const j = k === 0 ? i + 1 : k === 1 ? i - 1 : k === 2 ? i + n : i - n; if (j < 0 || j >= N || (k === 0 && x === n - 1) || (k === 1 && x === 0) || par[j] !== -2 || !AL.gWater[W.ground[j]]) continue; par[j] = i; dep[j] = d + 1; q[qt++] = j; } }
    return -1; };
  Sea.pathTo = function (sim, end) { const par = sim._seaPar, out = []; for (let i = end; i >= 0; i = par[i]) out.push(i); return out.reverse(); };
  // the water tile a port's boats moor at: the nearest water with open water around it
  Sea.mooring = function (sim, b) { const W = sim.world, n = W.n, B = sim.B, cx = B.x[b] + (B.w[b] >> 1), cy = B.y[b] + (B.h[b] >> 1); let best = -1, bd = 1e9;
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const x = cx + dx, y = cy + dy; if (!W.inb(x, y) || x < 2 || y < 2 || x > n - 3 || y > n - 3) continue; const i = y * n + x; if (!AL.gWater[W.ground[i]]) continue; let open = 0; for (const j of [i - 1, i + 1, i - n, i + n]) if (AL.gWater[W.ground[j]]) open++; if (open < 2) continue; const d = dx * dx + dy * dy - open; if (d < bd) { bd = d; best = i; } }
    return best; };
  function add(sim, type, town, moor) { const S = sim.sea, n = sim.world.n, b = { id: S.next++, type, town: town.id, kd: town.kingdom, people: town.people, x: moor % n + 0.5, y: ((moor / n) | 0) + 0.5, dir: 3, st: ST.DOCK, t: 0, path: null, pi: 0, moor, load: 0, crew: null, site: -1 }; S.boats.push(b); return b; }
  // move a boat along its path; returns true at the end
  function sail(sim, b, sp) { const n = sim.world.n, p = b.path; if (!p || b.pi >= p.length) return true; const i = p[b.pi], tx = i % n + 0.5, ty = ((i / n) | 0) + 0.5, dx = tx - b.x, dy = ty - b.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d <= sp) { b.x = tx; b.y = ty; b.pi++; return b.pi >= p.length; } b.x += dx / d * sp; b.y += dy / d * sp; b.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); return false; }
  // ---- fishing: each finished port keeps one boat per sailor (two at most); a trip brings back 14 food (more for a sea people)
  Sea.townTick = function (sim, town) { const S = sim.sea, st = town.stock, WOOD = AL.RES.wood; let mine = 0; for (const b of S.boats) if (b.town === town.id && b.type === FISHB) mine++; town.boats = mine;
    const pb = T.findType(sim, town, AL.BT.port); if (pb < 0) return; const want = Math.min(2 + (town.stage >= 4 ? 1 : 0), 1 + (town.pop > 60 ? 1 : 0) + (town.pop > 140 ? 1 : 0));
    if (mine < want && st[WOOD] >= 30 && sim.tick - (town.boatAt || 0) > 600) { const moor = Sea.mooring(sim, pb); town.boatAt = sim.tick; if (moor < 0) return; st[WOOD] -= 20; add(sim, FISHB, town, moor); town.boats = mine + 1; sim.stats.boats = (sim.stats.boats || 0) + 1; sim.emit('launch', moor % sim.world.n + 0.5, ((moor / sim.world.n) | 0) + 0.5, 0); } };
  function fishTick(sim, b, town) { const W = sim.world, n = W.n, rng = sim.rng;
    if (b.st === ST.DOCK) { if (++b.t < 60) return; const sailors = town.have ? town.have[AL.JOB.sailor] || 0 : 0, idx = sim.sea.boats.filter(o => o.town === town.id && o.type === FISHB).indexOf(b); if (idx >= Math.max(1, sailors)) { b.t = 0; return; } // a boat without a sailor stays moored (the first one is worked by the fishers)
      const far = 7 + rng.int(10), end = Sea.search(sim, b.moor, 26, (i, d) => d >= far && rng.chance(0.08)); if (end < 0) { b.t = 0; return; } b.path = Sea.pathTo(sim, end); b.pi = 1; b.st = ST.OUT; b.t = 0; return; }
    if (b.st === ST.OUT) { if (sail(sim, b, 0.11)) { b.st = ST.FISH; b.t = 0; } return; }
    if (b.st === ST.FISH) { b.t++; if (b.t % 40 === 20) sim.emit('splash', b.x + rng.range(-0.8, 0.8), b.y + rng.range(-0.5, 0.8)); if (b.t > 160) { b.load = Math.round(14 * (AL.KINDS[b.people].fishMul || 1) * (W.ground[(b.y | 0) * n + (b.x | 0)] === AL.G.deep ? 1.25 : 1)); b.path.reverse(); b.pi = 1; b.st = ST.BACK; } return; }
    if (b.st === ST.BACK) { if (sail(sim, b, 0.11)) { town.stock[AL.RES.food] += b.load; sim.stats.boatFish = (sim.stats.boatFish || 0) + b.load; sim.stats.boatTrips = (sim.stats.boatTrips || 0) + 1; b.load = 0; b.st = ST.DOCK; b.t = 0; b.path = null; } } }
  // ---- colonisation by sea: a landing on another land, close to a good site that nobody owns
  Sea.findColony = function (sim, town) { const W = sim.world, n = W.n, pb = T.findType(sim, town, AL.BT.port); if (pb < 0) return null; const moor = Sea.mooring(sim, pb); if (moor < 0) return null; const reg = W.region[town.cy * n + town.cx]; let site = -1, tries = 0;
    const end = Sea.search(sim, moor, 150, (i, d) => { if (d < 12) return false; for (const j of [i - 1, i + 1, i - n, i + n]) { const r = W.region[j]; if (!r || r === reg || W.owner[j] || (W.regionSize[r] || 0) < 150 || (W.flags[j] & 2)) continue; if (++tries % 5) continue; // one coast tile in five is looked at closely
        const x0 = j % n, y0 = (j / n) | 0; let best = -1, bq = 0.5; for (let k = 0; k < 10; k++) { const x = x0 + sim.rng.int(13) - 6, y = y0 + sim.rng.int(13) - 6; if (!W.inb(x, y) || x < 10 || y < 10 || x > n - 10 || y > n - 10) continue; const t = y * n + x; if (W.region[t] !== r || W.owner[t]) continue; let far = true; for (const o of sim.towns) if (o.alive && Math.abs(o.cx - x) + Math.abs(o.cy - y) < 26) far = false; if (!far) continue; const q = U.siteQuality(sim, x, y); if (q > bq) { bq = q; best = t; } }
        if (best >= 0) { site = best; Sea._land = j; return true; } } return false; });
    if (end < 0) return null; return { moor, path: Sea.pathTo(sim, end), land: Sea._land, site }; };
  // the chosen settlers go aboard at once (they are carried, hidden, until the landing)
  Sea.embark = function (sim, town, crew, trip) { const E = sim.E, b = add(sim, SHIP, town, trip.moor); b.path = trip.path; b.pi = 1; b.st = ST.CARRY; b.crew = crew.slice(); b.site = trip.site; b.land = trip.land;
    for (const i of crew) { U.stop(E, i); E.act[i] = ACT.BOARD; E.tE[i] = b.id; E.x[i] = b.x; E.y[i] = b.y; E.anim[i] = AL.ANIM.inside; }
    sim.stats.ships = (sim.stats.ships || 0) + 1; sim.emit('launch', b.x, b.y, 1); return b; };
  function shipTick(sim, b) { const E = sim.E, W = sim.world, n = W.n;
    if (b.st === ST.CARRY) { const done = sail(sim, b, 0.15); for (const i of b.crew) if (E.alive[i] && E.act[i] === ACT.BOARD && E.tE[i] === b.id) { E.x[i] = b.x; E.y[i] = b.y; E.hunger[i] = Math.min(E.hunger[i], 40); }
      if (done) { const lx = b.land % n, ly = (b.land / n) | 0; let k = 0; for (const i of b.crew) { if (!E.alive[i] || E.act[i] !== ACT.BOARD || E.tE[i] !== b.id) continue; E.x[i] = lx + 0.5 + ((k % 3) - 1) * 0.3; E.y[i] = ly + 0.5 + (((k / 3) | 0) % 2) * 0.3; E.act[i] = ACT.NONE; E.anim[i] = AL.ANIM.idle; E.tE[i] = -1; E.tx[i] = b.site % n; E.ty[i] = (b.site / n) | 0; E.stuck[i] = 0; k++; }
        if (k) sim.sea.claims.push({ x: b.site % n, y: (b.site / n) | 0, at: sim.tick, from: b.town });
        sim.stats.landings = (sim.stats.landings || 0) + 1; sim.stats.landed = (sim.stats.landed || 0) + k; sim.emit('landing', lx + 0.5, ly + 0.5); if (AL.Realm && sim.chron) { const tw = sim.towns[b.town]; AL.Realm.log(sim, 'colony', ['log.landing', tw ? tw.name : '?'], lx, ly, b.kd); } b.st = ST.LAND; b.t = 0; b.crew = null; } return; }
    if (b.st === ST.LAND) { if (++b.t > 200) { b.path.reverse(); b.pi = 1; b.st = ST.BACK; } return; }
    if (b.st === ST.BACK) { if (sail(sim, b, 0.15)) b.dead = 1; } }
  AL.Sim.modules.push({ name: 'sea',
    init(sim) { sim.sea = { boats: [], next: 1, claims: [] }; },
    // a town founded near the place a ship's settlers were bound for is a colony by sea
    onTownFounded(sim, town) { const S = sim.sea; if (!S || !S.claims) return; for (let k = S.claims.length - 1; k >= 0; k--) { const c = S.claims[k]; if (sim.tick - c.at > 6000) { S.claims.splice(k, 1); continue; } if (Math.abs(c.x - town.cx) + Math.abs(c.y - town.cy) <= 14) { S.claims.splice(k, 1); town.bySea = 1; sim.stats.seaColonies = (sim.stats.seaColonies || 0) + 1; return; } } },
    tick(sim) { const S = sim.sea; if (!S) return; const towns = sim.towns;
      if (sim.tick % 40 === 11) for (let k = 0; k < towns.length; k++) if (towns[k].alive && towns[k].count && towns[k].count[AL.BT.port]) Sea.townTick(sim, towns[k]);
      let dead = 0; for (let k = 0; k < S.boats.length; k++) { const b = S.boats[k], town = towns[b.town];
        if (b.type === FISHB && b.town >= 0) { if (!town || !town.alive || T.findType(sim, town, AL.BT.port) < 0) { b.dead = 1; } else fishTick(sim, b, town); } else shipTick(sim, b);
        if (!b.dead && !AL.gWater[sim.world.ground[(b.y | 0) * sim.world.n + (b.x | 0)]]) { // the sea under the boat is gone (terrain changed): passengers wade ashore where they are, the boat is lost
          if (b.crew) { const E = sim.E; for (const i of b.crew) if (E.alive[i] && E.act[i] === ACT.BOARD && E.tE[i] === b.id) { E.act[i] = ACT.NONE; E.tE[i] = -1; E.anim[i] = AL.ANIM.idle; } } b.dead = 1; sim.stats.wrecks = (sim.stats.wrecks || 0) + 1; }
        if (b.dead) dead++; }
      if (dead) S.boats = S.boats.filter(b => !b.dead); },
    // { t: 'boat', type, x, y }: a boat without a home port that sails away from the tile given (used to look at the sprites in the game)
    command(sim, m) { if (m.t !== 'boat' || !sim.sea) return; const W = sim.world, n = W.n, moor = (m.y | 0) * n + (m.x | 0); if (!W.inb(m.x | 0, m.y | 0) || !AL.gWater[W.ground[moor]]) return; const far = m.far || 40, end = Sea.search(sim, moor, far, (i, d) => d >= far); if (end < 0) return; const b = add(sim, m.type ? SHIP : FISHB, { id: -1, kingdom: m.kingdom == null ? -1 : m.kingdom, people: 0 }, moor); b.path = Sea.pathTo(sim, end); b.pi = 1; b.st = ST.BACK; },
    snapshot(sim) { const S = sim.sea; if (!S || (!S.boats.length && !S.sent)) return null; const n = S.boats.length, m = { t: 'boats', n, x: new Float32Array(n), y: new Float32Array(n), type: new Uint8Array(n), dir: new Uint8Array(n), kd: new Int16Array(n), people: new Uint8Array(n), st: new Uint8Array(n), id: new Int32Array(n) };
      for (let k = 0; k < n; k++) { const b = S.boats[k]; m.x[k] = b.x; m.y[k] = b.y; m.type[k] = b.type; m.dir[k] = b.dir; m.kd[k] = b.kd; m.people[k] = b.people; m.st[k] = b.st; m.id[k] = b.id; } S.sent = n; return m; } });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
