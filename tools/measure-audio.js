#!/usr/bin/env node
// Audio measurement: renders every sound patch (each variant) and every music track through OfflineAudioContext
// in headless Chromium, then measures level, peak, clipping, clicks, duration and spectral centroid.
//   node tools/measure-audio.js [--music] [--json out.json] [--only name]
// Checks: peak < 0.99 (no clipping); start/end sample < 0.02 (no click); within a category no sound more than 6 dB above the category median;
//         duration and centroid inside the "expect" window of the patch.
'use strict';
const fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'); const args = process.argv.slice(2); const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
(async () => {
  const sounds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/sounds.json'), 'utf8')), music = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/music.json'), 'utf8'));
  const b = await chromium.launch(), p = await b.newPage(); await p.goto('about:blank');
  await p.addScriptTag({ content: 'self.AL={DATA:{sounds:' + JSON.stringify(sounds) + ',music:' + JSON.stringify(music) + '}};' });
  await p.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'src/client/audio.js'), 'utf8') });
  const analyse = `function analyse(buf, sr){ const L=buf.getChannelData(0), R=buf.numberOfChannels>1?buf.getChannelData(1):L, n=L.length; let peak=0, first=-1, last=-1; const th=0.003;
    for(let i=0;i<n;i++){ const v=Math.max(Math.abs(L[i]),Math.abs(R[i])); if(v>peak)peak=v; if(v>th){ if(first<0)first=i; last=i; } }
    if(first<0) return {silent:true}; let sum=0, clip=0, jump=0; for(let i=first;i<=last;i++){ const v=(L[i]+R[i])*0.5; sum+=v*v; if(Math.abs(L[i])>=0.999)clip++; if(i>first){ const d=Math.abs(L[i]-L[i-1]); if(d>jump)jump=d; } }
    const rms=Math.sqrt(sum/(last-first+1)); let win=Math.floor(sr*0.2), best=0, acc=0; for(let i=first;i<=last;i++){ const v=(L[i]+R[i])*0.5; acc+=v*v; if(i-first>=win){ const o=(L[i-win]+R[i-win])*0.5; acc-=o*o; } if(acc>best)best=acc; }
    const loud=Math.sqrt(best/Math.min(win,last-first+1));
    // spectral centroid: 4096-pt FFT frames (Hann), averaged
    const N=4096, re=new Float32Array(N), im=new Float32Array(N); let cs=0, ms=0; for(let s=first; s<last; s+=N){ for(let i=0;i<N;i++){ const v=s+i<n?(L[s+i]+R[s+i])*0.5:0; re[i]=v*(0.5-0.5*Math.cos(2*Math.PI*i/N)); im[i]=0; }
      for(let i=1,j=0;i<N;i++){ let bit=N>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ const t=re[i]; re[i]=re[j]; re[j]=t; } }
      for(let len=2;len<=N;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang); for(let i=0;i<N;i+=len){ let cr=1, ci=0; for(let k=0;k<len/2;k++){ const ur=re[i+k], ui=im[i+k], vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci, vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr; re[i+k]=ur+vr; im[i+k]=ui+vi; re[i+k+len/2]=ur-vr; im[i+k+len/2]=ui-vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } }
      for(let k=1;k<N/2;k++){ const m=re[k]*re[k]+im[k]*im[k]; cs+=m*k*sr/N; ms+=m; } }
    return { peak:+peak.toFixed(4), rmsDb:+(20*Math.log10(rms+1e-9)).toFixed(1), loudDb:+(20*Math.log10(loud+1e-9)).toFixed(1), dur:+((last-first)/sr).toFixed(3), clip, startAmp:+Math.abs(L[Math.max(0,first-1)]).toFixed(4), endAmp:+Math.max(Math.abs(L[n-1]),Math.abs(L[Math.min(n-1,last+1)])).toFixed(4), maxJump:+jump.toFixed(3), centroid:Math.round(ms?cs/ms:0) }; }`;
  await p.addScriptTag({ content: analyse });
  const res = await p.evaluate(async ({ only, doMusic }) => {
    const out = { sounds: {}, music: {} }, sr = 44100;
    for (const name in AL.DATA.sounds) { if (name[0] === '_' || (only && name !== only)) continue; const S = AL.DATA.sounds[name], nv = (S.variants || [1]).length; out.sounds[name] = [];
      for (let v = 0; v < nv; v++) { const off = new OfflineAudioContext(2, sr * 6, sr); AL.Audio.init(off); AL.Audio.playExact(name, v, 0.05); const buf = await off.startRendering(); out.sounds[name].push(analyse(buf, sr)); } }
    if (doMusic) for (const id in AL.DATA.music.tracks) { if (only && id !== only) continue; const T = AL.DATA.music.tracks[id]; delete T._c; const dur = Math.min(AL.Audio.Music.duration(id) || 1, 90), off = new OfflineAudioContext(2, Math.ceil(sr * (dur + 3)), sr); AL.Audio.init(off); AL.Audio.offline = true; AL.Audio.Music.cur = null;
      const layers = {}; for (const tr of T.tracks) layers[tr.layer || 'base'] = 1; AL.Audio.Music.layers = layers; AL.Audio.Music.play(id, 0.01); AL.Audio.Music.pump(dur); const buf = await off.startRendering(); const a = analyse(buf, sr); a.length = +dur.toFixed(1); a.layers = Object.keys(layers); a.notes = T.tracks.reduce((s, tr) => s + Object.values(tr.parts).join(' ').split(/\s+/).filter(x => x && x[0] !== '-').length, 0); out.music[id] = a; }
    return out;
  }, { only, doMusic: args.includes('--music') });
  await b.close();
  let fail = 0; const cats = {};
  for (const name in res.sounds) { const S = sounds[name]; res.sounds[name].forEach((m, v) => { const tag = name + (res.sounds[name].length > 1 ? '#' + v : ''); const probs = [];
      if (m.silent) probs.push('SILENT'); else { if (m.peak >= 0.99 || m.clip) probs.push('clipping'); if (m.startAmp > 0.02) probs.push('click at start ' + m.startAmp); if (m.endAmp > 0.02) probs.push('click at end ' + m.endAmp);
        if (S.expect) { if (S.expect.dur && (m.dur < S.expect.dur[0] || m.dur > S.expect.dur[1])) probs.push('duration ' + m.dur + ' outside ' + S.expect.dur); if (S.expect.centroid && (m.centroid < S.expect.centroid[0] || m.centroid > S.expect.centroid[1])) probs.push('centroid ' + m.centroid + ' outside ' + S.expect.centroid); } else probs.push('no expect window');
        (cats[S.cat || 'misc'] = cats[S.cat || 'misc'] || []).push({ tag, loud: m.loudDb }); }
      m.problems = probs; if (probs.length) fail++;
      if (!args.includes('--quiet') || probs.length) console.log((probs.length ? 'FAIL ' : 'ok   ') + tag.padEnd(22) + (m.silent ? '' : ` peak ${m.peak} loud ${m.loudDb} dB dur ${m.dur}s centroid ${m.centroid} Hz`) + (probs.length ? '  << ' + probs.join('; ') : '')); }); }
  for (const c in cats) { const l = cats[c].map(x => x.loud).sort((a, b) => a - b), med = l[l.length >> 1]; for (const x of cats[c]) if (x.loud > med + 6) { console.log(`FAIL level: ${x.tag} is ${(x.loud - med).toFixed(1)} dB above the median of category ${c}`); fail++; } console.log(`category ${c.padEnd(10)} n=${l.length} median ${med} dB range ${l[0]}..${l[l.length - 1]}`); }
  for (const id in res.music) { const m = res.music[id], probs = []; if (m.silent) probs.push('SILENT'); else { if (m.peak >= 0.99 || m.clip) probs.push('clipping'); } if (probs.length) fail++; console.log((probs.length ? 'FAIL ' : 'ok   ') + 'music ' + id.padEnd(14) + ` length ${m.length}s notes ${m.notes} layers [${m.layers}] peak ${m.peak} rms ${m.rmsDb} dB centroid ${m.centroid} Hz ${probs.join(';')}`); }
  if (args.includes('--json')) fs.writeFileSync(args[args.indexOf('--json') + 1], JSON.stringify(res, null, 1));
  console.log(fail ? 'AUDIO: ' + fail + ' FAILURE(S)' : 'AUDIO OK (' + Object.keys(res.sounds).length + ' sounds' + (args.includes('--music') ? ', ' + Object.keys(res.music).length + ' tracks' : '') + ')');
  process.exit(fail ? 1 : 0);
})();
