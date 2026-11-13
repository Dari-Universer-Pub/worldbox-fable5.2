// AL.Towns — buildings (struct of arrays), towns (stock, territory, planner, job assignment, development stages).
(function (AL) {
  'use strict';
  const BCAP = 2048;
  function Blds() { const u8 = () => new Uint8Array(BCAP), i16 = () => new Int16Array(BCAP), f32 = () => new Float32Array(BCAP);
    this.cap = BCAP; this.hi = 0; this.free = []; this.alive = u8(); this.type = u8(); this.town = i16(); this.x = i16(); this.y = i16(); this.w = u8(); this.h = u8(); this.hp = f32(); this.hpMax = f32(); this.prog = f32(); this.state = u8(); // 0 site, 1 done, 3 ruin
    this.stage = u8(); this.fire = u8(); this.timer = new Int32Array(BCAP); this.occ = u8(); this.workers = u8(); this.aux = []; this.dirty = true; this.gen = new Uint16Array(BCAP); }
  AL.Blds = Blds;
  const T = AL.Towns = {};
  // ---------------------------------------------------------------- buildings
  T.doorX = (B, b) => B.x[b] + (B.w[b] >> 1); T.doorY = (B, b) => B.y[b] + B.h[b];
  T.canPlace = function (sim, town, bt, x, y) { const W = sim.world, n = W.n, w = bt.fp[0], h = bt.fp[1], own = town.id + 1; if (x < 2 || y < 2 || x + w >= n - 2 || y + h >= n - 3) return false;
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const t = (y + j) * n + x + i, g = W.ground[t]; if (AL.gCost[g] <= 0 || (W.flags[t] & (2 | 8))) return false; if (i >= 0 && j >= 0 && i < w && j < h) { if (W.owner[t] && W.owner[t] !== own) return false; if (g === AL.G.swamp && !bt.shore) return false; } }
    if (bt.shore) { let water = false; for (let j = -3; j <= h + 2 && !water; j++) for (let i = -3; i <= w + 2; i++) { const X = x + i, Y = y + j; if (W.inb(X, Y) && AL.gWater[W.ground[Y * n + X]]) { water = true; break; } } if (!water) return false; }
    return true; };
  T.place = function (sim, town, btName, x, y, done) { const B = sim.B, W = sim.world, n = W.n, bt = AL.DATA.buildings[btName], b = B.free.length ? B.free.pop() : (B.hi < BCAP ? B.hi++ : -1); if (b < 0) return -1;
    B.alive[b] = 1; B.gen[b]++; B.type[b] = bt.id; B.town[b] = town ? town.id : -1; B.x[b] = x; B.y[b] = y; B.w[b] = bt.fp[0]; B.h[b] = bt.fp[1]; B.hpMax[b] = bt.hp; B.hp[b] = done ? bt.hp : bt.hp * 0.3; B.prog[b] = done ? 100 : 0; B.state[b] = done ? 1 : 0; B.stage[b] = town ? T.style(town.stage) : 0; B.fire[b] = 0; B.timer[b] = 0; B.occ[b] = 0; B.workers[b] = 0; B.aux[b] = null; B.dirty = true;
    for (let j = 0; j < bt.fp[1]; j++) for (let i = 0; i < bt.fp[0]; i++) { const t = (y + j) * n + x + i; W.flags[t] |= 2; sim.bmap[t] = b + 1; if (W.feature[t]) W.feature[t] = 0; W.road[t] = 0; if (town) W.owner[t] = town.id + 1; W.mark(x + i, y + j); }
    W.regionsDirty = true; if (town) { town.blds.push(b); town.count[bt.id] = (town.count[bt.id] || 0) + 1; }
    // push units out of the footprint
    const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.x[i] >= x && E.x[i] < x + bt.fp[0] && E.y[i] >= y && E.y[i] < y + bt.fp[1]) { E.x[i] = x + (bt.fp[0] >> 1) + 0.5; E.y[i] = y + bt.fp[1] + 0.5; E.pathLen[i] = 0; }
    if (done) T.complete(sim, b); return b; };
  T.complete = function (sim, b) { const B = sim.B, W = sim.world, n = W.n, bt = AL.BTYPES[B.type[b]], town = sim.towns[B.town[b]]; B.state[b] = 1; B.prog[b] = 100; B.hp[b] = B.hpMax[b]; B.dirty = true;
    if (bt.fields && town) { // claim fertile tiles around the farm as fields
      const f = [], cx = B.x[b] + 1, cy = B.y[b] + 1; for (let r = 2; r <= 5 && f.length < 14; r++) for (let dy = -r; dy <= r && f.length < 14; dy++) for (let dx = -r; dx <= r && f.length < 14; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const X = cx + dx, Y = cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X, g = W.ground[t]; if ((W.flags[t] & (2 | 8)) || AL.gFert[g] < 0.4 || AL.gCost[g] <= 0 || (W.owner[t] && W.owner[t] !== town.id + 1)) continue; if (X === T.doorX(B, b) && Y === T.doorY(B, b)) continue;
          W.setGround(t, AL.G.soil); W.flags[t] |= 8; W.feature[t] = AL.F.wheat; W.fgrow[t] = sim.rng.int(60); W.owner[t] = town.id + 1; W.mark(X, Y); f.push(t); }
      B.aux[b] = f; }
    if (town) { town.popCap += bt.cap || 0; sim.emit('built', B.x[b] + B.w[b] / 2, B.y[b] + B.h[b], bt.id, town.id); } };
  T.destroy = function (sim, b, ruin) { const B = sim.B, W = sim.world, n = W.n; if (!B.alive[b]) return; const bt = AL.BTYPES[B.type[b]], town = sim.towns[B.town[b]];
    if (B.state[b] === 1 && town) town.popCap -= bt.cap || 0; if (B.state[b] === 0 && town) town.sites = Math.max(0, town.sites - 1); if (B.aux[b]) for (const t of B.aux[b]) { W.flags[t] &= ~8; if (W.feature[t] === AL.F.wheat) W.feature[t] = 0; W.mark(t % n, (t / n) | 0); }
    if (town) { const k = town.blds.indexOf(b); if (k >= 0) town.blds.splice(k, 1); town.count[bt.id]--; }
    if (ruin && B.state[b] !== 3) { B.state[b] = 3; B.timer[b] = 3000; B.town[b] = -1; B.dirty = true; sim.emit('collapse', B.x[b] + B.w[b] / 2, B.y[b] + B.h[b], bt.id); return; }
    for (let j = 0; j < B.h[b]; j++) for (let i = 0; i < B.w[b]; i++) { const t = (B.y[b] + j) * n + B.x[b] + i; W.flags[t] &= ~2; sim.bmap[t] = 0; W.mark(B.x[b] + i, B.y[b] + j); }
    B.alive[b] = 0; B.free.push(b); B.dirty = true; W.regionsDirty = true; const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i]) { if (E.home[i] === b) E.home[i] = -1; if (E.work[i] === b) E.work[i] = -1; if (E.tB[i] === b) { E.tB[i] = -1; if (E.act[i] !== 255) E.act[i] = 0; } } };
  T.damage = function (sim, b, dmg, by) { const B = sim.B; if (!B.alive[b] || B.state[b] === 3) return; B.hp[b] -= dmg; B.dirty = true; if (B.hp[b] <= 0) { const town = sim.towns[B.town[b]], isHall = B.type[b] === AL.BT.hall; T.destroy(sim, b, true); if (isHall && town && town.alive && T.onHallLost) T.onHallLost(sim, town, by); } };
  // ---------------------------------------------------------------- towns
  T.found = function (sim, people, x, y, kingdom, founder) { const W = sim.world, id = sim.towns.length, K = AL.KINDS[people];
    const town = { id, alive: true, people, kingdom: kingdom == null ? -1 : kingdom, cx: x, cy: y, pop: 0, adults: 0, popCap: 0, stock: new Float32Array(AL.NRES), stage: 0, founded: sim.tick, knowledge: 0, blds: [], count: {}, want: new Uint8Array(32), have: new Uint8Array(32), radius: 7, culture: -1, religion: -1, loyalty: 80, name: '', seed: sim.rng.u32(), trees: [], rocks: [], scanAt: -999, hall: -1, sites: 0, famine: 0, soldiers: 0, lastGrow: sim.tick, history: [] };
    sim.towns.push(town); town.stock[AL.RES.wood] = 30; town.stock[AL.RES.food] = 70; town.stock[AL.RES.stone] = 4;
    // the hall (a tent at first) is placed at once
    let hx = x - 2, hy = y - 2, ok = false; for (let r = 0; r < 6 && !ok; r++) for (let dy = -r; dy <= r && !ok; dy++) for (let dx = -r; dx <= r && !ok; dx++) if (T.canPlace(sim, town, AL.DATA.buildings.hall, x - 2 + dx, y - 2 + dy)) { hx = x - 2 + dx; hy = y - 2 + dy; ok = true; }
    if (!ok) { sim.towns.pop(); return null; } town.cx = hx + 2; town.cy = hy + 3; town.hall = T.place(sim, town, 'hall', hx, hy, true); T.claim(sim, town);
    for (const m of AL.Sim.modules) if (m.onTownFounded) m.onTownFounded(sim, town, founder);
    sim.emit('town', town.cx, town.cy, town.id); return town; };
  T.claim = function (sim, town) { const W = sim.world, n = W.n, r = town.radius, own = town.id + 1; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r) continue; const X = town.cx + dx, Y = town.cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X; if (!W.owner[t] && !AL.gWater[W.ground[t]] ) { W.owner[t] = own; sim.ownerDirty = true; } } };
  T.unclaim = function (sim, town) { const W = sim.world, own = town.id + 1, o = W.owner; for (let t = 0; t < o.length; t++) if (o[t] === own) o[t] = 0; sim.ownerDirty = true; };
  // a small town (6 or fewer) with no fertile couple will never grow back: after 5 years its people move to the nearest town of their people
  // (same kingdom first) and the town is closed. Returns true when the town was dissolved.
  T.dissolveIfDying = function (sim, town) { const E = sim.E; if (town.pop > 6 || sim.tick - town.founded < 5 * AL.YEAR) return false; const ppl = [];
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] !== town.id || (E.flags[i] & AL.Ents.F.DEAD)) continue; ppl.push(i); }
    // a fertile couple means a man and a woman of age who are not parent and child or siblings (children count as future partners of the other sex)
    const fert = i => !(E.flags[i] & (AL.Ents.F.CHILD | AL.Ents.F.ELDER)) && (sim.tick - E.born[i]) < E.life[i] * 0.6, kin = (a, b) => E.mother[a] === b || E.mother[b] === a || E.father[a] === b || E.father[b] === a || (E.mother[a] >= 0 && E.mother[a] === E.mother[b]) || (E.father[a] >= 0 && E.father[a] === E.father[b]);
    let m = 0, f = 0; for (const a of ppl) for (const b of ppl) { if (a === b || E.sex[a] !== 0 || E.sex[b] !== 1 || kin(a, b)) continue; const ca = E.flags[a] & AL.Ents.F.CHILD, cb = E.flags[b] & AL.Ents.F.CHILD; if ((fert(a) || ca) && (fert(b) || cb) && !(ca && cb)) { m = 1; f = 1; } }
    if (m > 0 && f > 0) return false; let best = null, bd = 1e9; for (const o of sim.towns) { if (!o.alive || o === town || o.people !== town.people || o.pop >= o.popCap + 8) continue; const d = Math.hypot(o.cx - town.cx, o.cy - town.cy) * (o.kingdom === town.kingdom ? 1 : 2.5); if (d < bd && d < 260) { bd = d; best = o; } }
    if (!best) return false; for (const i of ppl) { const h = E.home[i]; if (h >= 0 && sim.B.occ[h] > 0) sim.B.occ[h]--; const w = E.work[i]; if (w >= 0 && sim.B.workers[w] > 0) sim.B.workers[w]--; town.pop = Math.max(0, town.pop - 1); AL.Units.joinTown(sim, i, best); AL.Units.stop(E, i); E.act[i] = AL.Units.ACT.NONE; }
    if (AL.Realm && sim.chron) AL.Realm.log(sim, 'merge', ['log.merge', town.name, best.name], town.cx, town.cy, town.kingdom); T.remove(sim, town, 'merged'); return true; };
  // look of a town's buildings: hides and thatch up to the hamlet, timber and shingles for a village, stone and tiles from the town stage
  T.style = st => AL.DATA.stages[st] ? AL.DATA.stages[st].sprite : 0; // building look (0..4) of a town stage, from stages.json
  T.remove = function (sim, town, cause) { if (!town.alive) return; town.alive = false; for (const b of town.blds.slice()) T.destroy(sim, b, true); T.unclaim(sim, town); const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.town[i] === town.id) { E.town[i] = -1; E.home[i] = -1; E.work[i] = -1; E.job[i] = 0; }
    for (const m of AL.Sim.modules) if (m.onTownRemoved) m.onTownRemoved(sim, town, cause); sim.emit('townlost', town.cx, town.cy, town.id); };
  // nearest finished storage building door for a town (hall, warehouse, sawmill, mine, port)
  T.nearestStore = function (sim, town, x, y, kindKey) { const B = sim.B; let best = -1, bd = 1e9; for (const b of town.blds) { if (B.state[b] !== 1) continue; const bt = AL.BTYPES[B.type[b]]; if (!(kindKey ? bt[kindKey] : bt.store)) continue; const d = Math.abs(T.doorX(B, b) - x) + Math.abs(T.doorY(B, b) - y); if (d < bd) { bd = d; best = b; } } return best; };
  T.findType = function (sim, town, typeId, x, y) { const B = sim.B; let best = -1, bd = 1e9; for (const b of town.blds) { if (B.state[b] !== 1 || B.type[b] !== typeId) continue; const d = x == null ? 0 : Math.abs(B.x[b] - x) + Math.abs(B.y[b] - y); if (d < bd) { bd = d; best = b; } } return best; };
  // scan the surroundings for work targets (trees, rocks, berries), refreshed now and then
  T.scan = function (sim, town) { const W = sim.world, n = W.n, r = Math.min(26, town.radius + 8); town.trees.length = 0; town.rocks.length = 0; town.berries = town.berries || []; town.berries.length = 0; town.shore = town.shore || []; town.shore.length = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = town.cx + dx, Y = town.cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X, f = W.feature[t], k = AL.fKind[f]; if (W.owner[t] && W.owner[t] !== town.id + 1) continue;
      if (k === 1 && W.fgrow[t] > 110 && !W.fire[t]) town.trees.push(t); else if (k === 4 && AL.gCost[W.ground[t]] > 0) town.rocks.push(t); else if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) town.berries.push(t);
      else if (!f && AL.gCost[W.ground[t]] > 0 && !(W.flags[t] & 2) && ((X + Y) & 1) === 0) { if ((X + 1 < n && AL.gWater[W.ground[t + 1]] === 1) || (X > 0 && AL.gWater[W.ground[t - 1]] === 1) || (Y + 1 < n && AL.gWater[W.ground[t + n]] === 1) || (Y > 0 && AL.gWater[W.ground[t - n]] === 1)) town.shore.push(t); } }
    town.scanAt = sim.tick; };
  // ---------------------------------------------------------------- planner (every 40 ticks per town)
  const ORDER = ['house', 'farm', 'pen', 'sporebed', 'tidehouse', 'grove', 'delve', 'warehouse', 'sawmill', 'mine', 'port', 'market', 'temple', 'barracks', 'forge', 'library', 'tavern', 'watchtower', 'hospital'];
  T.wantCount = function (town, bt) { const base = bt.max[0], per = bt.max[1]; return base + (per ? Math.floor(town.pop / per) : 0); };
  T.plan = function (sim, town) { const D = AL.DATA.buildings, B = sim.B, st = town.stock; const hungry = st[AL.RES.food] / Math.max(1, town.pop) < 5, lim = Math.min(7, 1 + Math.floor(town.adults / 10)); if (town.sites >= lim + (hungry ? 1 : 0)) return; const farmOnly = town.sites >= lim; // a hungry town may open a farm site on top of its other works
    let pick = null; const cv = town.cultureValues || AL.KINDS[town.people].culture;
    const nxt = AL.DATA.stages[town.stage + 1], ordered = nxt && nxt.need ? nxt.need.filter(nm => (town.count[D[nm].id] || 0) < 1).concat(ORDER) : ORDER;
    const Kp = AL.KINDS[town.people]; for (const name of ordered) { const bt = D[name]; if ((Kp.early && Kp.early[name] != null ? Kp.early[name] : bt.stage) > town.stage || bt.provisional || (bt.people && bt.people !== Kp.name)) continue; if (farmOnly && name !== 'farm') continue; let want = T.wantCount(town, bt);
      if (name === 'house') { want = Math.max(1, Math.ceil((town.pop * 1.35 + 6 - 4) / bt.cap)); if (town.popCap > town.pop * 1.3 + 5) continue; }
      if (name === 'farm') { const perCap = st[AL.RES.food] / Math.max(1, town.pop); want = Math.max(want, perCap < 3 ? (town.count[bt.id] || 0) + 1 : 0); want = Math.max(want, Math.ceil((town.pop - 6) / 10)); { const ft = st[AL.RES.food] / Math.max(1, town.pop) < 6; want = Math.min(want, (ft ? 2 : 1) + Math.floor(town.pop / (ft ? 4 : 7))); } if (AL.KINDS[town.people].diet === 'meat' && perCap >= 6) want = Math.ceil(want * 0.66); }
      if (bt.shore && (!town.shore || town.shore.length < 3)) continue;
      const wanted = (AL.DATA.stages[town.stage + 1] && AL.DATA.stages[town.stage + 1].need || []).indexOf(name) >= 0; // a building the next stage needs is never skipped for cultural reasons (a market that is never built would stop the town for ever)
      if (!wanted) { if (name === 'barracks' && cv.war < 0.25 && town.stage < 4 && !town.threat) continue; if (name === 'library' && cv.lore < 0.2) continue; if (name === 'market' && cv.trade < 0.15) continue; }
      if (name === 'watchtower') want = Math.min(4, Math.floor(want * (0.4 + cv.war)));
      if ((town.count[bt.id] || 0) >= want) continue; let afford = true; for (const r in bt.cost) if (st[AL.RES[r]] < bt.cost[r]) afford = false; if (!afford) { if (name === 'house' || name === 'farm') return; continue; } if (name === 'sporebed') { const perCap = st[AL.RES.food] / Math.max(1, town.pop); if (perCap > 14 && (town.count[bt.id] || 0) >= 1) continue; } pick = name; break; }
    if (!pick) return; const bt = D[pick], rng = sim.rng, W = sim.world;
    // site search: random samples in rings of growing radius, keep the best-scored
    let best = null, bs = -1e9; const maxR = Math.min(44, 6 + Math.sqrt(town.pop) * 2.4 + town.blds.length * 0.5), tries = town.blds.length > 30 ? 160 : 70;
    for (let k = 0; k < tries; k++) { const a = rng.f() * 6.283, r = 3 + rng.f() * maxR * (0.4 + 0.6 * (k / tries)), x = Math.round(town.cx + Math.cos(a) * r - bt.fp[0] / 2), y = Math.round(town.cy + Math.sin(a) * r * 0.85 - bt.fp[1] / 2); if (!T.canPlace(sim, town, bt, x, y)) continue;
      const dreg = W.region[(y + bt.fp[1]) * W.n + x + (bt.fp[0] >> 1)]; if (dreg !== W.region[town.cy * W.n + town.cx]) continue;
      let s = -r * (bt.fields ? 0.4 : 1) + rng.f() * 2; if (bt.fields) { let fert = 0; for (let dy = -3; dy <= 4; dy++) for (let dx = -3; dx <= 5; dx++) { const X = x + dx, Y = y + dy; if (W.inb(X, Y)) { const t = Y * W.n + X; if (!(W.flags[t] & 10) && AL.gFert[W.ground[t]] >= 0.4) fert++; } } if (fert < 20) continue; s += fert * 0.3 + (r < 5 ? -6 : 0); }
      if (pick === 'mine') { let rock = 0; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const X = x + dx, Y = y + dy; if (W.inb(X, Y)) { const g = W.ground[Y * W.n + X]; if (g === AL.G.mountain || g === AL.G.hills) rock++; } } s += rock * 0.25; }
      if (pick === 'watchtower') s += r * 1.6;
      if (s > bs) { bs = s; best = [x, y]; } }
    if (!best) return; for (const r in bt.cost) st[AL.RES[r]] -= bt.cost[r]; T.place(sim, town, pick, best[0], best[1], false); town.sites++; };
  // ---------------------------------------------------------------- jobs (every 20 ticks per town)
  // ---- bridges (chantier B.1): where a narrow water cuts the town from land it wants (another shore, or a long way round), the
  // town lays a deck of planks, one tile at a time, straight across (pathfinding only joins tiles side by side). 3 wood a plank.
  // lay the next plank of the town's bridge (3 wood); the last one opens the crossing. Returns true when a plank was laid.
  T.bridgeLay = function (sim, town) { const W = sim.world, n = W.n, G = AL.G, st = town.stock, WOOD = AL.RES.wood, S = sim.stats, pj = town.bridge; if (!pj || st[WOOD] < 3) return false; const i = pj.tiles[pj.at]; let laid = false; pj.last = sim.tick;
    if (AL.gWater[W.ground[i]]) { st[WOOD] -= 3; W.feature[i] = 0; W.road[i] = 220; W.setGround(i, G.bridge); S.bridgeTiles = (S.bridgeTiles || 0) + 1; sim.emit('bridge', i % n + 0.5, ((i / n) | 0) + 0.5); laid = true; }
    if (++pj.at >= pj.tiles.length) { town.bridge = null; town.bridges = (town.bridges || 0) + 1; S.bridges = (S.bridges || 0) + 1; W.regionsDirty = true; if (AL.Realm && sim.chron) AL.Realm.log(sim, 'bridge', ['log.bridge', town.name], pj.tiles[0] % n, (pj.tiles[0] / n) | 0, town.kingdom); } return laid; };
  T.bridge = function (sim, town) { const W = sim.world, n = W.n, G = AL.G, st = town.stock, WOOD = AL.RES.wood, S = sim.stats, pj = town.bridge;
    if (pj) { if (!(town.have[AL.JOB.engineer] > 0) || sim.tick - (pj.last || 0) > 4000) T.bridgeLay(sim, town); return; } // the engineer lays the planks (units.js); without one for a long time the townsfolk do it slowly
    if (town.stage < 1 || town.pop < 14 || st[WOOD] < 40 || (town.bridges || 0) >= 5 || sim.tick - (town.bridgeAt || 0) < 900) return; town.bridgeAt = sim.tick;
    const rng = sim.rng, c = town.cy * n + town.cx, reg = W.region[c], f = sim.path.field(c).d, R = Math.min(30, town.radius + 10);
    for (let k = 0; k < 24; k++) { const sx = town.cx + rng.int(R * 2 + 1) - R, sy = town.cy + rng.int(R * 2 + 1) - R; if (!W.inb(sx, sy) || W.region[sy * n + sx] !== reg || !reg) continue; const d = rng.int(4), dx = d === 0 ? 1 : d === 1 ? -1 : 0, dy = d === 2 ? 1 : d === 3 ? -1 : 0;
      let x = sx, y = sy, run = 0, first = -1, ok = false; for (let s = 0; s < 12; s++) { x += dx; y += dy; if (!W.inb(x, y)) break; const i = y * n + x, g = W.ground[i]; if (g === G.shallow && !(W.flags[i] & 2)) { if (run === 0) first = i; if (++run > 6) break; } else if (run) { ok = AL.gCost[g] > 0 && g !== G.bridge && !(W.flags[i] & 2); break; } else if (AL.gCost[g] <= 0 || (W.flags[i] & 2)) break; }
      if (!ok || run < 1) continue; const far = y * n + x, rf = W.region[far], near = first - dx - dy * n, len = run + 1;
      // worth it: the far bank is another land of some size, or the way round is at least 40 tiles and six times the crossing
      const other = rf !== reg && rf > 0 && (W.regionSize[rf] || 0) >= 80, round = rf === reg && f[far] !== 65535 && f[far] - f[near] > Math.max(320, len * 48); if (!other && !round) continue;
      const tiles = []; for (let q = 0; q < run; q++) tiles.push(first + q * (dx + dy * n)); town.bridge = { tiles, at: 0, near, last: sim.tick }; S.bridgePlans = (S.bridgePlans || 0) + 1; return; } };
  T.assign = function (sim, town) { const E = sim.E, J = AL.JOB, want = town.want, have = town.have, st = town.stock, pop = town.adults, cnt = town.count, BT = AL.BT, cv = town.cultureValues || AL.KINDS[town.people].culture; want.fill(0); have.fill(0);
    const done = id => { let c = 0; for (const b of town.blds) if (sim.B.type[b] === id && sim.B.state[b] === 1) c++; return c; };
    const foodPer = st[AL.RES.food] / Math.max(1, town.pop), farms = done(BT.farm), meat = AL.KINDS[town.people].diet === 'meat';
    // the chronicle remembers famines (once per 3 years per town) and their end
    if (foodPer < 2.5 && town.pop >= 12 && sim.tick - (town.famineLog || -99999) > 3600) { town.famineLog = sim.tick; town.famine = 1; if (AL.Realm && sim.chron) AL.Realm.log(sim, 'famine', ['log.famine', town.name, town.pop], town.cx, town.cy, town.kingdom); }
    else if (town.famine && foodPer > 8) { town.famine = 0; if (AL.Realm && sim.chron) AL.Realm.log(sim, 'famine', ['log.famineend', town.name], town.cx, town.cy, town.kingdom); }
    // ---- food first: production follows need. secure >= 9 food per head, tight < 6, crisis < 3 (about 1 year of stock left)
    const tight = foodPer < 6, crisis = foodPer < 3;
    want[J.builder] = town.sites ? Math.max(1, Math.min(4, Math.ceil(pop / 8))) : 0;
    want[J.farmer] = Math.min(farms * 3, Math.ceil(pop * (crisis ? 0.55 : tight ? 0.4 : foodPer > 14 ? 0.12 : 0.25)));
    // granaries are finite: what exceeds the storage spoils slowly
    const cap = 40 + town.pop * 12 + (cnt[BT.warehouse] || 0) * 150; if (st[AL.RES.food] > cap) st[AL.RES.food] -= (st[AL.RES.food] - cap) * 0.02;
    want[J.hunter] = Math.ceil(pop * (meat ? 0.22 : crisis ? 0.15 : tight ? 0.1 : 0.06)) + (farms ? 0 : 1);
    want[J.gatherer] = farms ? (crisis ? Math.ceil(pop * 0.3) : tight ? Math.ceil(pop * 0.15) : 0) : Math.ceil(pop * 0.35);
    want[J.sailor] = done(BT.port) && !crisis ? Math.min(town.boats || 0, Math.ceil(pop * 0.06)) : 0;
    want[J.fisher] = done(BT.port) ? Math.min(Math.max(4, Math.ceil(pop * (crisis ? 0.2 : 0.06))), Math.ceil(pop * (crisis ? 0.25 : 0.1))) : 0;
    want[J.lumberjack] = st[AL.RES.wood] < 30 + town.pop ? Math.max(1, Math.ceil(pop * 0.2)) : (st[AL.RES.wood] < 120 ? Math.ceil(pop * 0.08) : 0);
    want[J.miner] = town.stage >= 1 ? (st[AL.RES.stone] < 30 + town.pop * 0.5 ? Math.max(1, Math.ceil(pop * 0.12)) : (done(BT.mine) ? 1 : 0)) : 0;
    want[J.blacksmith] = done(BT.forge) ? Math.min(2, 1 + (pop > 60 ? 1 : 0)) : 0; want[J.merchant] = done(BT.market) ? 1 + (cv.trade > 0.6 && pop > 50 ? 1 : 0) : 0; want[J.priest] = done(BT.temple) ? 1 + (pop > 80 ? 1 : 0) : 0;
    { const nG = done(BT.grove), nD = done(BT.delve), nS = done(BT.sporebed), nT = done(BT.tidehouse); if (nG && !crisis) want[J.warden] = tight ? 1 : Math.min(nG * 2, Math.max(1, Math.ceil(pop * 0.08))); if (nD) want[J.delver] = Math.min(nD * 3, Math.max(1, Math.ceil(pop * 0.15)));
      if (nS) want[J.sporer] = Math.min(nS * 3, Math.max(1, Math.ceil(pop * (crisis ? 0.5 : tight ? 0.35 : foodPer > 14 ? 0.1 : 0.22)))); if (nT) want[J.diver] = Math.min(nT * 3, Math.max(1, Math.ceil(pop * (crisis ? 0.4 : tight ? 0.3 : foodPer > 14 ? 0.08 : 0.18)))); }
    want[J.healer] = done(BT.hospital) ? 1 + (pop > 120 ? 1 : 0) : 0; want[J.engineer] = town.bridge || (town.atWar && town.stage >= 3 && done(BT.barracks)) ? 1 : (town.stage >= 3 && pop > 50 && !crisis ? 1 : 0); // chantier B.3
    want[J.scholar] = done(BT.library) ? 1 + (cv.lore > 0.6 ? 1 : 0) : 0; want[J.bard] = done(BT.tavern) ? 1 : 0; want[J.herder] = done(BT.pen) ? (tight ? 1 : Math.min(done(BT.pen) * 2, Math.max(1, Math.ceil(pop * 0.05)))) : 0; // chantier B.9
    // monsters near the town (zombies, skeletons, demons) call the militia out, war or no war
    { let mc = 0; const nq = E.query(town.cx, town.cy, 22); for (let k = 0; k < nq; k++) { const j = E.near[k]; if (!(E.flags[j] & 1) && E.kind[j] >= AL.NPEOPLE && AL.KINDS[E.kind[j]].cls === 2) mc++; } town.monsters = mc; town.threat = !!town.atWar || mc > 0; }
    let mil = Math.min(Math.ceil(pop * 0.4), (done(BT.barracks) ? Math.ceil(pop * (0.06 + cv.war * 0.14 + (town.atWar ? 0.15 : 0))) : (town.threat ? Math.ceil(pop * 0.1) : 0)) + (town.monsters ? Math.ceil(pop * 0.12 + town.monsters * 0.5) : 0)); { const levy = town.atWar && !tight ? Math.ceil(town.adults * (0.3 + cv.war * 0.25)) : 0; if (levy > mil) mil = Math.min(levy, Math.ceil(town.adults * 0.6)); } want[J.soldier] = Math.ceil(mil * 0.6); want[J.archer] = Math.floor(mil * 0.3); want[J.knight] = town.stage >= 4 ? Math.floor(mil * 0.1) : 0;
    // when there are more posts than adults, the posts that do not feed or build are closed first (a builder with no bread builds nothing)
    { let tot = 0; for (let j = 1; j < 32; j++) tot += want[j]; const TRIM = T._trim || (T._trim = [J.bard, J.scholar, J.priest, J.merchant, J.blacksmith, J.herder, J.knight, J.archer, J.soldier, J.miner, J.lumberjack]); const avail = pop - 1;
      for (let pass = 0; pass < 3 && tot > avail; pass++) for (let k = 0; k < TRIM.length && tot > avail; k++) { const j = TRIM[k]; if (j == null || want[j] <= 0) continue; if ((j === J.soldier || j === J.archer || j === J.knight) && (town.atWar || town.threat) && pass < 2) continue; if (j === J.lumberjack && st[AL.RES.wood] < 20 && pass < 2) continue; want[j]--; tot--; }
      // ---- surplus hands: a town with more adults than posts puts them to work on what it can use (round robin up to a share of the adults), instead of leaving a third of them idle
      let surplus = avail - tot; if (surplus > 1 && !tight) { const mk = (j, frac, on) => ({ j, max: Math.ceil(pop * frac), on }), pool = [
          mk(J.lumberjack, 0.2, st[AL.RES.wood] < 900), mk(J.miner, 0.16, town.stage >= 1 && st[AL.RES.stone] < 1200), mk(J.builder, 0.2, town.sites > 0), mk(J.farmer, 0.3, farms > 0 && foodPer < 24), mk(J.gatherer, 0.1, foodPer < 16), mk(J.hunter, 0.08, foodPer < 16),
          mk(J.scholar, 0.1, done(BT.library) > 0), mk(J.merchant, 0.08, done(BT.market) > 0), mk(J.blacksmith, 0.07, done(BT.forge) > 0), mk(J.priest, 0.06, done(BT.temple) > 0), mk(J.bard, 0.04, done(BT.tavern) > 0),
          mk(J.soldier, 0.1, done(BT.barracks) > 0 && (cv.war > 0.35 || town.atWar)), mk(J.fisher, 0.1, done(BT.port) > 0 && foodPer < 16)];
        for (let guard = 0; guard < 80 && surplus > 0; guard++) { let moved = false; for (const e of pool) { if (surplus <= 0) break; if (!e.on || want[e.j] >= e.max || (e.j === J.farmer && want[e.j] >= farms * 3)) continue; want[e.j]++; surplus--; moved = true; } if (!moved) break; } } }
    let free = 0, ruler = -1; const idle = T._idle || (T._idle = []); idle.length = 0; town.pop = 0; town.adults = 0; town.soldiers = 0;
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] !== town.id || (E.flags[i] & 1)) continue; town.pop++; if (E.flags[i] & 2) continue; town.adults++; const j = E.job[i]; if (j === J.ruler) { ruler = i; continue; } if (AL.JOBS[j].military) town.soldiers++;
      if (j === 0) idle.push(i); else if (have[j] >= want[j] && !(E.flags[i] & 4096) && !(AL.JOBS[j].military && town.atWar)) { E.job[i] = 0; E.work[i] = -1; T.setLook(E, i); idle.push(i); } else have[j]++; }
    // fill the most under-staffed jobs first
    for (let guard = 0; guard < 64 && idle.length; guard++) { let bj = -1, br = 1; for (let j = 1; j < AL.JOBS.length; j++) { if (want[j] <= have[j]) continue; const r = have[j] / want[j]; if (r < br) { br = r; bj = j; } } if (bj < 0) break; const i = idle.pop(); if (E.flags[i] & 4 && AL.JOBS[bj].military) { continue; } E.job[i] = bj; E.work[i] = -1; have[bj]++; T.setLook(E, i); if (E.act[i] !== 255 && E.act[i] !== 3) E.act[i] = 0; }
    // a building site nobody builds (every adult already holds a food job) would stay open for ever: with food in store, one hunter or gatherer becomes the builder
    if (town.sites && want[J.builder] > 0 && have[J.builder] === 0 && st[AL.RES.food] > town.pop * 3) { for (const jb of [J.hunter, J.gatherer, J.lumberjack, J.herder, J.fisher]) { let done = false; for (let i = 0; i < E.hi && !done; i++) if (E.alive[i] && E.town[i] === town.id && E.job[i] === jb && !(E.flags[i] & (1 | 2 | 4 | 4096))) { E.job[i] = J.builder; E.work[i] = -1; have[J.builder]++; have[jb]--; T.setLook(E, i); if (E.act[i] !== 255 && E.act[i] !== 3) E.act[i] = 0; done = true; } if (done) break; } }
    town.idle = idle.length; };
  T.setLook = function (E, i) { const f = E.flags[i]; E.look[i] = (f & 2) ? AL.LOOK.child : (f & 4) && !(f & 1024) ? AL.LOOK.elder : AL.LOOK[AL.JOBS[E.job[i]].look] || 0; };
  // how developed a town is: its people plus its finished buildings (a built-up village of 24 is further along than 24 huts)
  T.devScore = function (sim, town) { const B = sim.B; let b = 0; for (const id of town.blds) if (B.state[id] === 1 && B.type[id] !== AL.BT.wall && B.type[id] !== AL.BT.gate && B.type[id] !== AL.BT.hall) b++; return town.pop + b; };
  T.updateStage = function (sim, town) { const S = AL.DATA.stages; let st = town.stage; while (st < S.length - 1) { const nx = S[st + 1]; if (T.devScore(sim, town) < nx.pop * (1 / (AL.KINDS[town.people].devSpeed || 1))) break; let ok = true; for (const nb of nx.need || []) if (!T.hasDone(sim, town, AL.BT[nb])) ok = false; if (!ok) break; st++; }
    if (st !== town.stage) { if (st >= 2 && AL.Realm && sim.chron) AL.Realm.log(sim, 'progress', ['log.progress' + st, town.name, town.pop], town.cx, town.cy, town.kingdom); town.stage = st; const B = sim.B; for (const b of town.blds) B.stage[b] = T.style(st); B.dirty = true; sim.emit('stage', town.cx, town.cy, town.id, st); for (const m of AL.Sim.modules) if (m.onTownStage) m.onTownStage(sim, town); }
    const r = Math.min(34, Math.round(7 + Math.sqrt(town.pop) * 1.9)); if (r > town.radius) { town.radius = r; T.claim(sim, town); } };
  T.hasDone = function (sim, town, typeId) { for (const b of town.blds) if (sim.B.type[b] === typeId && sim.B.state[b] === 1) return true; return false; };
  // ---------------------------------------------------------------- module
  AL.Sim.modules.push({
    name: 'towns',
    // crops ripen on their own in about a year (tending speeds them up); berries and mushrooms regrow
    tile(sim, i, x, y, g) { const W = sim.world, f = W.feature[i], rd = W.road[i];
      if (rd) { if (g === AL.G.road) { if (rd < 30) { W.setGround(i, W.owner[i] || sim.rng.chance(0.5) ? AL.G.grass : AL.G.soil); W.road[i] = 0; } else W.road[i] = rd - 2; } else { if (rd > 150 && !(W.flags[i] & 10) && AL.gCost[g] > 0 && g !== AL.G.sand && g !== AL.G.snow && g !== AL.G.mountain) { W.setGround(i, AL.G.road); if (f && AL.fKind[f] !== 1) W.feature[i] = 0; } else W.road[i] = rd > 3 ? rd - 3 : 0; } }
      if (!f) return; if (f === AL.F.wheat) { const v = W.fgrow[i]; if (v < 250) { const nv = Math.min(250, v + Math.max(1, (7 * (sim.cropMul || 1) * (sim.rainBonus || 1) * (AL.Faith && W.owner[i] ? AL.Faith.m(sim, sim.towns[W.owner[i] - 1].religion, 'crop') : 1)) | 0)); W.fgrow[i] = nv; if ((nv >> 6) !== (v >> 6) || nv === 250) W.mark(x, y); } }
      else if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[i] < 255) { const v = W.fgrow[i], nv = Math.min(255, v + 4); W.fgrow[i] = nv; if (v <= 200 && nv > 200) W.mark(x, y); } },
    init(sim) { sim.B = new Blds(); sim.towns = []; sim.bmap = new Int16Array(sim.world.n * sim.world.n); sim.ownerDirty = true; },
    tick(sim) { const towns = sim.towns, B = sim.B;
      // people without a town (survivors of a ruined town, wanderers) are taken in by the nearest town of their people that has room
      if (sim.tick % 600 === 300) { const E = sim.E, F = AL.Ents.F; for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] >= 0 || E.kind[i] >= AL.NPEOPLE || (E.flags[i] & (F.DEAD | F.SETTLER | F.CHILD)) || E.act[i] === 255) continue; let best = null, bd = 120; for (const o of towns) { if (!o.alive || o.people !== E.kind[i] || o.pop >= o.popCap + 4) continue; const d = Math.hypot(o.cx - E.x[i], o.cy - E.y[i]); if (d < bd) { bd = d; best = o; } } if (best) { AL.Units.joinTown(sim, i, best); AL.Units.stop(E, i); E.act[i] = AL.Units.ACT.NONE; } } }
      for (let k = 0; k < towns.length; k++) { const town = towns[k]; if (!town.alive) continue; const ph = (sim.tick + k * 7) % 40;
        if (ph === 0) { if (sim.tick - town.scanAt > 300) T.scan(sim, town); T.assign(sim, town); T.updateStage(sim, town); if (town.pop === 0 && sim.tick - town.founded > 200) { T.remove(sim, town, 'abandoned'); continue; } if (sim.tick - (town.tinyAt || 0) > 1200) { town.tinyAt = sim.tick; if (T.dissolveIfDying(sim, town)) continue; } }
        else if (ph === 20) { T.assign(sim, town); T.plan(sim, town); T.bridge(sim, town); } }
      // buildings: ruins fade, fires are handled by the disasters module
      if (sim.tick % 16 === 0) for (let b = 0; b < B.hi; b++) { if (!B.alive[b]) continue; if (B.state[b] === 3) { B.timer[b] -= 16; if (B.timer[b] <= 0) T.destroy(sim, b, false); } } },
    query(sim, m) { if (m.q === 'towns') return sim.towns.filter(t => t.alive).map(t => ({ id: t.id, name: t.name, people: t.people, kingdom: t.kingdom, cx: t.cx, cy: t.cy, pop: t.pop, adults: t.adults, popCap: t.popCap, stage: t.stage, stock: Array.from(t.stock), blds: t.blds.length, done: t.blds.filter(b => sim.B.state[b] === 1).length, founded: t.founded }));
      if (m.q === 'stats') return Object.assign({ tick: sim.tick, units: sim.E.count, towns: sim.towns.filter(t => t.alive).length }, sim.stats); },
    snapshot(sim) { const B = sim.B; let out = null; if (B.dirty) { B.dirty = false; const n = B.hi; out = { t: 'blds', n, alive: B.alive.slice(0, n), type: B.type.slice(0, n), town: B.town.slice(0, n), x: B.x.slice(0, n), y: B.y.slice(0, n), prog: Uint8Array.from(B.prog.subarray(0, n)), state: B.state.slice(0, n), stage: B.stage.slice(0, n), hp: Uint8Array.from(B.hp.subarray(0, n), (v, i) => Math.max(0, Math.min(255, 255 * v / (B.hpMax[i] || 1)))), fire: B.fire.slice(0, n), tk: sim.towns.map(t => t.kingdom), tp: sim.towns.map(t => t.people) }; }
      return out; },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
