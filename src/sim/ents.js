// AL.Ents — entity store (struct of arrays, fixed capacity), spatial hash, trait modifiers.
(function (AL) {
  'use strict';
  const CAP = 8192, PATH = 40;
  function Ents() {
    const f32 = () => new Float32Array(CAP), i32 = () => new Int32Array(CAP).fill(-1), u8 = () => new Uint8Array(CAP), i16 = () => new Int16Array(CAP).fill(-1), u16 = () => new Uint16Array(CAP), u32 = () => new Uint32Array(CAP);
    this.cap = CAP; this.hi = 0; this.count = 0; this.free = []; 
    this.alive = u8(); this.gen = u16(); this.kind = u8(); this.x = f32(); this.y = f32(); this.hp = f32(); this.hpMax = f32();
    this.hunger = f32(); this.energy = f32(); this.social = f32(); this.faith = f32(); this.mood = f32();
    this.born = i32(); this.life = i32(); this.sex = u8(); this.act = u8(); this.phase = u8(); this.timer = i32(); this.tx = i16(); this.ty = i16(); this.tE = i32(); this.tB = i32();
    this.job = u8(); this.town = i16(); this.kingdom = i16(); this.home = i32(); this.work = i32(); this.traits0 = u32(); this.traits1 = u32();
    this.mother = i32(); this.father = i32(); this.spouse = i32(); this.religion = i16(); this.culture = i16(); this.carry = u8(); this.carryN = u8(); this.friend = i32(); this.rival = i32(); this.lover = i32(); this.bondT = u32();
    this.anim = u8(); this.dir = u8(); this.flags = u16(); this.look = u8(); this.army = i16(); this.kills = u16(); this.seed = u32(); this.cool = u16(); this.stuck = u8(); this.preg = i32(); this.clan = i16();
    // stats derived from kind + traits
    this.spd = f32(); this.atk = f32(); this.workMul = f32(); this.courage = f32();
    // paths
    this.pathLen = u8(); this.pathPos = u8(); this.path = new Int32Array(CAP * PATH); this.flow = i32(); this.PATH = PATH;
    // spatial hash (cells of 8x8 tiles), rebuilt every tick
    this.cellOf = new Int32Array(CAP); this.cellStart = null; this.cellItems = new Int32Array(CAP); this.near = new Int32Array(512);
  }
  // flags bits
  Ents.F = { DEAD: 1, CHILD: 2, ELDER: 4, SICK: 8, INFECTED: 16, BURNING: 32, CONTROLLED: 64, SETTLER: 128, FLEEING: 256, PREGNANT: 512, RULER: 1024, NOTABLE: 2048, MOBILIZED: 4096, SWIMMING: 8192, FLYING: 16384, ASLEEP: 32768 };
  const P = Ents.prototype;
  P.spawn = function (sim, kind, x, y, opt) {
    const E = this, i = E.free.length ? E.free.pop() : (E.hi < CAP ? E.hi++ : -1); if (i < 0) return -1; opt = opt || {}; const K = AL.KINDS[kind], rng = sim.rng;
    E.alive[i] = 1; E.gen[i]++; E.kind[i] = kind; E.x[i] = x; E.y[i] = y; E.seed[i] = rng.u32();
    E.hunger[i] = 20 + rng.f() * 20; E.energy[i] = 70 + rng.f() * 30; E.social[i] = 60; E.faith[i] = 50; E.mood[i] = 60;
    E.sex[i] = rng.int(2); E.act[i] = 0; E.phase[i] = 0; E.timer[i] = 0; E.tx[i] = -1; E.ty[i] = -1; E.tE[i] = -1; E.tB[i] = -1;
    E.job[i] = 0; E.town[i] = opt.town == null ? -1 : opt.town; E.kingdom[i] = opt.kingdom == null ? -1 : opt.kingdom; E.home[i] = -1; E.work[i] = -1; E.traits0[i] = 0; E.traits1[i] = 0; if (E.buffT) E.buffT[i] = 0;
    E.mother[i] = opt.mother == null ? -1 : opt.mother; E.father[i] = opt.father == null ? -1 : opt.father; E.spouse[i] = -1; E.friend[i] = -1; E.rival[i] = -1; E.lover[i] = -1; E.bondT[i] = 0; E.religion[i] = opt.religion == null ? -1 : opt.religion; E.culture[i] = opt.culture == null ? -1 : opt.culture;
    E.carry[i] = 0; E.carryN[i] = 0; E.anim[i] = 0; E.dir[i] = 0; E.flags[i] = 0; E.look[i] = 0; E.army[i] = -1; E.kills[i] = 0; E.cool[i] = 0; E.stuck[i] = 0; E.preg[i] = -1; E.clan[i] = opt.clan == null ? -1 : opt.clan; E.pathLen[i] = 0; E.pathPos[i] = 0; E.flow[i] = -1;
    const years = K.lifespan || 20, life = years * AL.YEAR * (0.85 + rng.f() * 0.3); E.life[i] = life | 0;
    const ageFrac = opt.age == null ? (K.cls === 0 ? 0.25 + rng.f() * 0.3 : 0.2 + rng.f() * 0.5) : opt.age; E.born[i] = (sim.tick - ageFrac * life) | 0;
    if (opt.traits) { E.traits0[i] = opt.traits[0]; E.traits1[i] = opt.traits[1]; } else if (K.cls === 0) { const n = 1 + rng.int(3); for (let k = 0; k < n; k++) E.addTrait(i, rng.int(48), true); }
    E.recalc(i); E.hp[i] = E.hpMax[i]; E.count++; return i;
  };
  P.kill = function (sim, i, cause) { const E = this; if (!E.alive[i] || (E.flags[i] & 1)) return; E.flags[i] |= 1; E.anim[i] = AL.ANIM.death; E.act[i] = 255; E.timer[i] = 90; E.pathLen[i] = 0; E.flow[i] = -1; for (const m of AL.Sim.modules) if (m.onDeath) m.onDeath(sim, i, cause); };
  P.remove = function (i) { const E = this; if (!E.alive[i]) return; E.alive[i] = 0; E.count--; E.free.push(i); };
  P.hasTrait = function (i, t) { return t < 32 ? (this.traits0[i] >>> t) & 1 : (this.traits1[i] >>> (t - 32)) & 1; };
  P.addTrait = function (i, t, soft) { const T = AL.TRAITS[t]; if (!T) return; if (T.opposite) { const o = AL.TRAIT[T.opposite]; if (this.hasTrait(i, o)) { if (soft) return; this.delTrait(i, o); } } if (t < 32) this.traits0[i] |= (1 << t) >>> 0; else this.traits1[i] |= (1 << (t - 32)) >>> 0; if (!soft) this.recalc(i); };
  P.delTrait = function (i, t) { if (t < 32) this.traits0[i] &= ~(1 << t); else this.traits1[i] &= ~(1 << (t - 32)); };
  // product of a multiplicative modifier over the unit's traits
  P.mod = function (i, key) { let v = 1; const a = this.traits0[i], b = this.traits1[i]; if (!a && !b) return 1; for (let t = 0; t < 60; t++) { if (!(t < 32 ? (a >>> t) & 1 : (b >>> (t - 32)) & 1)) continue; const m = AL.TRAITS[t].mods[key]; if (m != null) v *= m; } return v; };
  P.modAdd = function (i, key) { let v = 0; const a = this.traits0[i], b = this.traits1[i]; for (let t = 0; t < 60; t++) { if (!(t < 32 ? (a >>> t) & 1 : (b >>> (t - 32)) & 1)) continue; const m = AL.TRAITS[t].mods[key]; if (m != null) v += m; } return v; };
  P.recalc = function (i) { const K = AL.KINDS[this.kind[i]], E = this; const old = E.hpMax[i]; E.hpMax[i] = (K.hp || 50) * E.mod(i, 'hp'); if (old > 0) E.hp[i] = Math.min(E.hpMax[i], E.hp[i] * E.hpMax[i] / old);
    E.spd[i] = 0.22 * (K.speed || 1) * E.mod(i, 'speed'); E.atk[i] = (K.attack || 8 * (K.strength || 1)) * E.mod(i, 'attack'); E.workMul[i] = E.mod(i, 'work'); E.courage[i] = (K.courage == null ? 0.5 : K.courage) + E.modAdd(i, 'courage+'); };
  P.age = function (sim, i) { return (sim.tick - this.born[i]) / AL.YEAR; };
  // spatial hash
  P.rebuildHash = function (n) { const E = this, cw = (n + 7) >> 3, nc = cw * cw; if (!E.cellStart || E.cellStart.length !== nc + 1) { E.cellStart = new Int32Array(nc + 1); E.cw = cw; } const cs = E.cellStart; cs.fill(0);
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; const c = ((E.y[i] | 0) >> 3) * cw + ((E.x[i] | 0) >> 3); E.cellOf[i] = c; cs[c + 1]++; }
    for (let c = 0; c < nc; c++) cs[c + 1] += cs[c];
    const fill = E._fill || (E._fill = new Int32Array(nc)); if (fill.length !== nc) E._fill = new Int32Array(nc); const fl = E._fill; fl.set(cs.subarray(0, nc));
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; E.cellItems[fl[E.cellOf[i]]++] = i; } };
  // fills E.near with entities within r tiles of (x,y); returns count (max 512)
  P.query = function (x, y, r) { const E = this, cw = E.cw, c0x = Math.max(0, ((x - r) | 0) >> 3), c1x = Math.min(cw - 1, ((x + r) | 0) >> 3), c0y = Math.max(0, ((y - r) | 0) >> 3), c1y = Math.min(cw - 1, ((y + r) | 0) >> 3), r2 = r * r, out = E.near; let n = 0;
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) { const c = cy * cw + cx; for (let k = E.cellStart[c]; k < E.cellStart[c + 1]; k++) { const j = E.cellItems[k], dx = E.x[j] - x, dy = E.y[j] - y; if (dx * dx + dy * dy <= r2 && n < 512) out[n++] = j; } } return n; };
  AL.Ents = Ents;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
