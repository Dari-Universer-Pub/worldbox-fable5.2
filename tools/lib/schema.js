// Minimal schema checker for src/data (own code). Types: 'string','number','int','bool', {enum:[..]}, {array:T,min,max}, {map:T}, {object:{k:T}, optional:[..], open:true}, {ref:'file'} (key of another data file), {any:true}, {oneOf:[T..]}
'use strict';
function check(v, T, path, errs, data) {
  if (T === 'string') { if (typeof v !== 'string' || !v.length) errs.push(path + ': expected non-empty string'); }
  else if (T === 'number') { if (typeof v !== 'number' || !isFinite(v)) errs.push(path + ': expected number'); }
  else if (T === 'int') { if (!Number.isInteger(v)) errs.push(path + ': expected integer'); }
  else if (T === 'bool') { if (typeof v !== 'boolean') errs.push(path + ': expected boolean'); }
  else if (T.any) { }
  else if (T.num) { if (typeof v !== 'number' || v < T.num[0] || v > T.num[1]) errs.push(path + ': expected number in ' + T.num); }
  else if (T.enum) { if (!T.enum.includes(v)) errs.push(path + ': "' + v + '" not in ' + T.enum.join('|')); }
  else if (T.ref) { const tgt = data[T.ref]; if (!tgt || !(v in tgt)) errs.push(path + ': "' + v + '" is not a key of ' + T.ref); }
  else if (T.oneOf) { const ok = T.oneOf.some(t => { const e = []; check(v, t, path, e, data); return !e.length; }); if (!ok) errs.push(path + ': matches none of the alternatives'); }
  else if (T.array) { if (!Array.isArray(v)) return errs.push(path + ': expected array'); if (T.min != null && v.length < T.min) errs.push(path + ': needs at least ' + T.min + ' items'); if (T.len != null && v.length !== T.len) errs.push(path + ': needs exactly ' + T.len + ' items'); v.forEach((x, i) => check(x, T.array, path + '[' + i + ']', errs, data)); }
  else if (T.map) { if (!v || typeof v !== 'object' || Array.isArray(v)) return errs.push(path + ': expected map'); for (const k in v) { if (k[0] === '_') continue; check(v[k], T.map, path + '.' + k, errs, data); } if (T.min != null && Object.keys(v).length < T.min) errs.push(path + ': needs at least ' + T.min + ' entries (has ' + Object.keys(v).length + ')'); }
  else if (T.object) { if (!v || typeof v !== 'object' || Array.isArray(v)) return errs.push(path + ': expected object'); const opt = T.optional || [];
    for (const k in T.object) { if (!(k in v)) { if (!opt.includes(k)) errs.push(path + ': missing "' + k + '"'); continue; } check(v[k], T.object[k], path + '.' + k, errs, data); }
    if (!T.open) for (const k in v) if (!(k in T.object)) errs.push(path + ': unknown key "' + k + '"'); }
  else errs.push(path + ': bad schema');
}
module.exports = { check };
