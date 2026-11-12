// AL.Save — the whole simulation as one ArrayBuffer and back. Generic: walks every own property of the simulation (typed
// arrays go to a binary section with zero runs packed, the rest to JSON) and restores it into a freshly built simulation,
// in place, so that systems keep their references. Layout: 'AEON' u32 version, u32 json bytes, json, u32 raw bytes, packed binary.
(function (AL) {
  'use strict';
  const S = AL.Save = { VERSION: 1, dups: [] }, SKIP = { events: 1, tileMods: 1, path: 1, acc: 1, effSpeed: 1 };
  const isView = v => ArrayBuffer.isView(v);
  function enc(v, chunks, seen, path) {
    if (v == null) return null; const t = typeof v;
    if (t === 'number') return Number.isFinite(v) ? v : { $n: String(v) }; if (t === 'string' || t === 'boolean') return v; if (t === 'function') return undefined;
    if (isView(v)) { chunks.push(v); return { $t: v.constructor.name, i: chunks.length - 1, n: v.length }; }
    if (v instanceof Map || v instanceof Set) return undefined;
    if (seen.has(v)) S.dups.push(path); else seen.add(v);
    if (Array.isArray(v)) { const a = new Array(v.length); for (let i = 0; i < v.length; i++) { const e = enc(v[i], chunks, seen, path); a[i] = e === undefined ? null : e; } return a; }
    const o = {}; for (const k in v) { if (!Object.prototype.hasOwnProperty.call(v, k) || k[0] === '_') continue; const e = enc(v[k], chunks, seen, path + '.' + k); if (e !== undefined) o[k] = e; } return o; }
  // zero-run packing: [u32 literal length][bytes][u32 zero length] repeated
  function pack(raw) { const out = new Uint8Array(raw.length + (raw.length >> 6) + 64), dv = new DataView(out.buffer); let o = 0, i = 0; const n = raw.length;
    while (i < n) { let j = i; while (j < n) { if (raw[j] === 0) { let z = j; while (z < n && raw[z] === 0) z++; if (z - j >= 12 || z === n) break; j = z; } else j++; } dv.setUint32(o, j - i, true); o += 4; out.set(raw.subarray(i, j), o); o += j - i; let z = j; while (z < n && raw[z] === 0) z++; dv.setUint32(o, z - j, true); o += 4; i = z; }
    return out.subarray(0, o); }
  function unpack(src, len) { const out = new Uint8Array(len), dv = new DataView(src.buffer, src.byteOffset, src.byteLength); let o = 0, i = 0; while (i < src.length) { const l = dv.getUint32(i, true); i += 4; out.set(src.subarray(i, i + l), o); o += l; i += l; const z = dv.getUint32(i, true); i += 4; o += z; } return out; }
  const utf8 = { enc: s => { if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s); return Uint8Array.from(Buffer.from(s, 'utf8')); }, dec: b => { if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(b); return Buffer.from(b).toString('utf8'); } };
  S.write = function (sim) { S.dups.length = 0; if (sim.path && sim.path.fields) sim.path.fields.clear(); // flow fields are a cache: dropped on both sides so that play continues identically
    const chunks = [], seen = new WeakSet(), root = {}; for (const k in sim) { if (SKIP[k] || !Object.prototype.hasOwnProperty.call(sim, k)) continue; const e = enc(sim[k], chunks, seen, k); if (e !== undefined) root[k] = e; }
    const offs = []; let tot = 0; for (const c of chunks) { offs.push(tot); tot += (c.byteLength + 7) & ~7; }
    const raw = new Uint8Array(tot); chunks.forEach((c, i) => raw.set(new Uint8Array(c.buffer, c.byteOffset, c.byteLength), offs[i]));
    const js = utf8.enc(JSON.stringify({ v: S.VERSION, offs, sim: root })), pk = pack(raw), out = new Uint8Array(16 + js.length + pk.length), dv = new DataView(out.buffer);
    out[0] = 65; out[1] = 69; out[2] = 79; out[3] = 78; dv.setUint32(4, S.VERSION, true); dv.setUint32(8, js.length, true); out.set(js, 12); dv.setUint32(12 + js.length, tot, true); out.set(pk, 16 + js.length); return out.buffer; };
  const CT = { Float32Array, Float64Array, Int32Array, Uint32Array, Int16Array, Uint16Array, Int8Array, Uint8Array, Uint8ClampedArray };
  function view(d, raw, offs) { const C = CT[d.$t], o = offs[d.i]; return new C(raw.buffer.slice(raw.byteOffset + o, raw.byteOffset + o + d.n * C.BYTES_PER_ELEMENT)); }
  function dec(d, raw, offs) { if (d == null || typeof d !== 'object') return d; if (d.$n) return Number(d.$n); if (d.$t) return view(d, raw, offs); if (Array.isArray(d)) return d.map(e => dec(e, raw, offs)); const o = {}; for (const k in d) o[k] = dec(d[k], raw, offs); return o; }
  function restore(target, d, raw, offs) { for (const k in d) { const v = d[k], cur = target[k];
      if (v && typeof v === 'object' && v.$t) { const a = view(v, raw, offs); if (cur && isView(cur) && cur.constructor === a.constructor && cur.length === a.length) cur.set(a); else target[k] = a; }
      else if (v && typeof v === 'object' && !Array.isArray(v) && !v.$n && cur && typeof cur === 'object' && !Array.isArray(cur) && !isView(cur) && cur.constructor !== Object) restore(cur, v, raw, offs);
      else target[k] = dec(v, raw, offs); } }
  S.read = function (buf) { const u = new Uint8Array(buf), dv = new DataView(u.buffer, u.byteOffset, u.byteLength); if (u[0] !== 65 || u[1] !== 69 || u[2] !== 79 || u[3] !== 78) throw new Error('not an Dustcrown save');
    const jl = dv.getUint32(8, true), meta = JSON.parse(utf8.dec(u.subarray(12, 12 + jl))), tot = dv.getUint32(12 + jl, true), raw = unpack(u.subarray(16 + jl), tot), d = meta.sim;
    const sim = new AL.Sim(dec(d.cfg, raw, meta.offs)); restore(sim, d, raw, meta.offs); sim.events = []; sim.acc = 0; sim.world.dirty = { x0: 0, y0: 0, x1: sim.world.n - 1, y1: sim.world.n - 1 };
    for (const m of AL.Sim.modules) if (m.afterLoad) m.afterLoad(sim); if (sim.B) sim.B.dirty = true; sim.ownerDirty = true; return sim; };
  // a short signature of the state (tests: saved == reloaded)
  S.signature = function (sim) { let h = 2166136261 >>> 0; const mix = a => { const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < b.length; i += 1) { h ^= b[i]; h = Math.imul(h, 16777619) >>> 0; } };
    const W = sim.world, E = sim.E; for (const k of ['ground', 'height', 'feature', 'fgrow', 'fire', 'owner', 'road', 'flags']) mix(W[k]); for (const k of ['alive', 'kind', 'x', 'y', 'hp', 'hunger', 'job', 'town', 'religion', 'culture', 'traits0', 'traits1', 'flags']) mix(E[k].subarray(0, E.hi)); mix(sim.rng.s);
    return h + ':' + sim.tick + ':' + E.count + ':' + sim.towns.map(t => (t.alive ? t.pop : 'x') + '/' + Math.round(t.stock[0] * 100)).join(',') + ':' + (sim.kingdoms || []).length + ':' + (sim.chron || []).length; };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
