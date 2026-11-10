// AL.Gfx — WebGL2 renderer. Everything is palette-indexed (R8 textures resolved through a palette texture).
// Passes: terrain (one quad) -> shadows -> sprites (instanced, y-sorted) -> lights (additive) -> composite (lighting, vignette, fade).
(function (AL) {
  'use strict';
  const G = AL.Gfx = { W: 640, H: 360, maxSprites: 24000, layerOn: 0, shake: 0, fade: 0 };
  let gl, progT, progS, progL, progC, vaoQ, vaoS, vaoL, instBuf, lightBuf, texA, texB, texC, texTer, texMask, texPal, texPage, texLayerPal, fboScene, fboLight, texScene, texLight;
  const FL = 12; // floats per sprite instance
  const inst = new Float32Array(G.maxSprites * FL), keys = new Float64Array(G.maxSprites), sorted = new Float32Array(G.maxSprites * FL);
  let nSpr = 0, nLights = 0; const lights = new Float32Array(2048 * 6);
  const VS_Q = `#version 300 es
in vec2 a; out vec2 uv; void main(){ uv=a*.5+.5; gl_Position=vec4(a,0.,1.); }`;
  const FS_T = `#version 300 es
precision highp float; precision highp int; precision highp usampler2D;
in vec2 uv; out vec4 o;
uniform sampler2D uA,uB,uC,uTer,uMask,uPal,uLPal; uniform vec2 uCam,uRes; uniform float uZoom,uMapN,uTime; uniform int uFrame,uLayer; uniform int uFlat[32]; uniform int uRank[32];
int tex8(sampler2D s, ivec2 p){ return int(texelFetch(s,p,0).r*255.+.5); }
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
int toneShift(int idx,int d){ int r=idx/6, t=idx-r*6; t=clamp(t+d,0,5); return r*6+t; }
void main(){
  vec2 px=vec2(uv.x,1.-uv.y)*uRes; vec2 w=uCam+px/uZoom; vec2 tcf=floor(w/8.);
  if(tcf.x<0.||tcf.y<0.||tcf.x>=uMapN||tcf.y>=uMapN){ float d=max(max(-w.x,w.x-uMapN*8.),max(-w.y,w.y-uMapN*8.)); o=vec4(mix(vec3(.086,.082,.20),vec3(.06,.055,.11),clamp(d/160.,0.,1.)),0.); return; }
  ivec2 tc=ivec2(tcf); vec4 A=texelFetch(uA,tc,0), B=texelFetch(uB,tc,0);
  int g=int(A.r*255.+.5), sh=int(A.g*255.+.5)-128, lod=int(A.b*255.+.5), fl=int(A.a*255.+.5);
  ivec2 ip=ivec2(floor(w)); ivec2 sub=ip&7; ivec2 tp=ip&31;
  int var=int(h21(tcf)*3.999);
  int m1=int(B.g*255.+.5), m2=int(B.a*255.+.5), o1=int(B.r*255.+.5), o2=int(B.b*255.+.5);
  int k1 = m1>0 ? tex8(uMask, ivec2(m1*8+sub.x, var*8+sub.y)) : 0;
  int k2 = m2>0 ? tex8(uMask, ivec2(m2*8+sub.x, ((var+1)&3)*8+sub.y)) : 0;
  int mat=g, rim=0, outer=0;
  if(k2==1||k2==2){ mat=o2; rim=(k2==2)?1:0; }
  else if(k1==1||k1==2){ mat=o1; rim=(k1==2)?1:0; if(k2==3) outer=3; else if(k2==4) outer=4; }
  else { if(k1==3||k2==3) outer=3; else if(k1==4||k2==4) outer=4; }
  int idx; bool water = mat<=1; bool lava = mat==2;
  if(uZoom<0.74){ idx=uFlat[mat]; if(!water && h21(tcf+3.7)<0.3) idx=toneShift(idx,-1); if(water){ float wv=h21(tcf+floor(uTime*1.5)*.37); if(wv>.955) idx=toneShift(idx,1);} if(lava && h21(tcf+floor(uTime*3.)*.21)>.7) idx=toneShift(idx,2); }
  else idx=tex8(uTer, ivec2(((water||lava)?uFrame:0)*32+tp.x, mat*32+tp.y));
  if(!water && !lava && uZoom>=0.74){ vec2 f=(w-4.)/8.; vec2 b=floor(f); vec2 fr=f-b; ivec2 b0=ivec2(b); ivec2 mx=ivec2(int(uMapN)-1);
    float s00=texelFetch(uA,clamp(b0,ivec2(0),mx),0).g, s10=texelFetch(uA,clamp(b0+ivec2(1,0),ivec2(0),mx),0).g, s01=texelFetch(uA,clamp(b0+ivec2(0,1),ivec2(0),mx),0).g, s11=texelFetch(uA,clamp(b0+ivec2(1,1),ivec2(0),mx),0).g;
    float sv=mix(mix(s00,s10,fr.x),mix(s01,s11,fr.x),fr.y)*255.-128.; sv+=(h21(floor(w/2.)*.731)-.5)*.7; sh=int(floor(sv+.5)); }
  if(!water && !lava){ int d=sh; if(rim==1 && mat>=3) d-=1; if(outer==3 && mat>=3) d-=1; if(d!=0) idx=toneShift(idx,d); }
  if(water){
    // shore foam: animated band on water pixels touching land (outer rim of an overlay)
    if((fl&1)!=0){ if(outer>0) idx=toneShift(idx,1); } else if(outer>0){ float ph=fract(uTime*.35+h21(tcf)*.9+float(sub.x+sub.y)*.045); if(ph<.55) idx = (ph<.3)? 47 : 46; else idx=toneShift(idx,1); }
    // depth shading: deep water darker far from shores is in the texture; glints
  }
  if((fl&4)!=0 && !water && !lava){ if(h21(vec2(ip)*.37)<.55) idx = (h21(vec2(ip)+2.3)<.5)? 31 : 30; } // scorched ground: dark stone flecks
  // far-view canopy marks for trees
  if(lod>0 && uZoom<0.74){ vec2 c=vec2(sub)-vec2(3.5,3.0); if(dot(c,c)<9.5){ idx=lod-1; if(c.x+c.y<-1.5) idx=toneShift(idx,1); else if(c.x+c.y>2.5) idx=toneShift(idx,-1);} }
  vec3 col=texelFetch(uPal,ivec2(idx,0),0).rgb; float em = lava ? 1. : 0.;
  if(uLayer>0){ int id=int(texelFetch(uC,tc,0).r*255.+.5); if(id>0){ vec4 lc=texelFetch(uLPal,ivec2(id,0),0); col=mix(col,lc.rgb,lc.a*.42);
      bool edge=false; ivec2 mx=ivec2(int(uMapN)-1);
      if(sub.x==0 && int(texelFetch(uC,max(tc-ivec2(1,0),ivec2(0)),0).r*255.+.5)!=id) edge=true; if(sub.x==7 && int(texelFetch(uC,min(tc+ivec2(1,0),mx),0).r*255.+.5)!=id) edge=true;
      if(sub.y==0 && int(texelFetch(uC,max(tc-ivec2(0,1),ivec2(0)),0).r*255.+.5)!=id) edge=true; if(sub.y==7 && int(texelFetch(uC,min(tc+ivec2(0,1),mx),0).r*255.+.5)!=id) edge=true;
      if(edge){ col=mix(col,lc.rgb,.9); em=max(em,.35);} } }
  o=vec4(col,em);
}`;
  const VS_S = `#version 300 es
precision highp float;
layout(location=0) in vec2 a; layout(location=1) in vec4 iPos; layout(location=2) in vec4 iUV; layout(location=3) in vec4 iP;
uniform vec2 uCam,uRes; uniform float uZoom; uniform int uShadow; uniform vec2 uSun;
out vec2 vUV; flat out vec4 vP; flat out float vAlpha;
void main(){
  vec2 size=iUV.zw; vec2 c=a; float flip=mod(iP.y,2.); float sc=iPos.w>0.?iPos.w:1.;
  vec2 world=iPos.xy+c*size*sc;
  if(uShadow==1){ float piv=iPos.z; float hgt=piv-world.y; world.y=piv-hgt*uSun.y; world.x+=hgt*uSun.x; }
  vec2 p=(floor((iPos.xy-uCam)*uZoom+.001)+(world-iPos.xy)*uZoom)/uRes*2.-1.;
  vUV=iUV.xy+vec2(flip>0.5?(1.-c.x):c.x,c.y)*size; vP=iP; vAlpha=iP.w;
  gl_Position=vec4(p.x,-p.y,0.,1.);
}`;
  const FS_S = `#version 300 es
precision highp float; precision highp int;
in vec2 vUV; flat in vec4 vP; flat in float vAlpha; out vec4 o;
uniform sampler2D uPage,uPal; uniform int uShadow; uniform int uEm; uniform int uGlass;
void main(){
  int idx=int(texelFetch(uPage,ivec2(vUV),0).r*255.+.5); if(idx==255) discard;
  if(uShadow==1){ o=vec4(.075,.065,.12,.34); return; }
  int flags=int(vP.y+.5); float em=0.;
  if(idx>=150){ if((flags/64)%2==1){ idx=uGlass*6+(idx-150)-2; } else { idx=uEm*6+(idx-150); em=1.; } }
  else if(idx>=144){ idx=uEm*6+(idx-144); em=1.; } else if(idx>=128){ idx=int(vP.x+.5)*6+(idx-128); }
  int tone=int(vP.z+.5)-8; if(tone!=0){ int r=idx/6, t=idx-r*6; idx=r*6+clamp(t+tone,0,5); }
  vec3 col=texelFetch(uPal,ivec2(idx,0),0).rgb;
  if((flags/2)%2==1){ col=mix(col,vec3(.99,.96,.59),.75); em=1.; }       // white-hot flash
  if((flags/4)%2==1){ col=mix(col,vec3(.42,.5,.32),.5); }                 // sickly tint (poison/zombie infection)
  if((flags/8)%2==1){ em=1.; }                                           // fully emissive (effects)
  if((flags/16)%2==1){ col=mix(col,vec3(.18,.33,.52),.55); }             // under water
  if(vAlpha<.99){ if(vAlpha<.05) discard; float d=fract(dot(floor(gl_FragCoord.xy),vec2(.5,.25))); if(d>=vAlpha) discard; } // ordered dissolve
  o=vec4(col,em);
}`;
  const VS_L = `#version 300 es
precision highp float; layout(location=0) in vec2 a; layout(location=1) in vec4 iL; layout(location=2) in vec2 iC;
uniform vec2 uCam,uRes; uniform float uZoom; out vec2 vq; flat out vec3 vc;
vec3 lc(float k){ return k<.5?vec3(1.,.74,.4): k<1.5?vec3(1.,.5,.22): k<2.5?vec3(.55,.75,1.): k<3.5?vec3(.75,.5,1.): k<4.5?vec3(.5,1.,.7): vec3(1.,.95,.85); }
void main(){ vec2 world=iL.xy+(a*2.-1.)*iL.z; vec2 p=((world-uCam)*uZoom)/uRes*2.-1.; vq=a*2.-1.; vc=lc(iC.x)*iL.w; gl_Position=vec4(p.x,-p.y,0.,1.); }`;
  const FS_L = `#version 300 es
precision highp float; in vec2 vq; flat in vec3 vc; out vec4 o;
void main(){ float d=length(vq); if(d>1.) discard; float f=1.-d; f=f*f*(3.-2.*f); f=floor(f*6.+.5)/6.; o=vec4(vc*f,1.); }`;
  const FS_C = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D uScene,uLight; uniform vec2 uRes,uShake; uniform vec4 uTint; uniform float uFade,uVig,uFlash; uniform vec3 uFadeCol;
void main(){ vec2 q=uv+uShake/uRes; vec4 s=texture(uScene,q); vec3 l=texture(uLight,q).rgb; vec3 lit=min(l,vec3(1.35));
  vec3 col=s.rgb*mix(lit,max(lit,vec3(1.)),s.a); col+=s.rgb*s.a*.12;
  col=mix(col,uTint.rgb,uTint.a);
  vec2 v=uv-.5; float vg=1.-dot(v,v)*uVig; col*=clamp(vg,0.,1.);
  col=mix(col,vec3(1.,.97,.85),uFlash); col=mix(col,uFadeCol,uFade); o=vec4(col,1.); }`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) + '\n' + s.split('\n').slice(0, 5).join('\n')); return o; }
  function prog(v, f) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); p.u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i), nm = info.name.replace('[0]', ''); p.u[nm] = gl.getUniformLocation(p, info.name); } return p; }
  function tex(w, h, fmt, data, filter) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (fmt === 'r8') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, data || null); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data || null);
    const f = filter || gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  function fbo(t) { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; }
  G.init = function (canvas) {
    gl = G.gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 is required');
    G.canvas = canvas; const As = AL.Assets;
    progT = prog(VS_Q, FS_T); progS = prog(VS_S, FS_S); progL = prog(VS_L, FS_L); progC = prog(VS_Q, FS_C);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindAttribLocation(progT, 0, 'a');
    const ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    vaoS = gl.createVertexArray(); gl.bindVertexArray(vaoS); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    instBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, instBuf); gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(1 + i); gl.vertexAttribPointer(1 + i, 4, gl.FLOAT, false, FL * 4, i * 16); gl.vertexAttribDivisor(1 + i, 1); }
    vaoL = gl.createVertexArray(); gl.bindVertexArray(vaoL); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    lightBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, lightBuf); gl.bufferData(gl.ARRAY_BUFFER, lights.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0); gl.vertexAttribDivisor(1, 1); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16); gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
    texPal = tex(256, 1, 'rgba', As.palBytes); texPage = tex(As.PAGE, As.pageH, 'r8', As.page);
    const T = As.raw.terrain, Mk = As.raw.tmask; texTer = tex(T.w, T.h, 'r8', T.d); texMask = tex(Mk.w, Mk.h, 'r8', Mk.d);
    texLayerPal = tex(256, 1, 'rgba', new Uint8Array(1024));
    G.flat = new Int32Array(32); G.rank = new Int32Array(32); AL.GROUND.forEach((g, i) => { G.flat[i] = As.ix(g.flat[0], g.flat[1]); G.rank[i] = g.rank; });
    G.resize(640, 360);
  };
  G.resize = function (w, h) { G.W = w; G.H = h; G.canvas.width = w; G.canvas.height = h; if (texScene) { gl.deleteTexture(texScene); gl.deleteTexture(texLight); gl.deleteFramebuffer(fboScene); gl.deleteFramebuffer(fboLight); }
    texScene = tex(w, h, 'rgba', null); fboScene = fbo(texScene); texLight = tex(w, h, 'rgba', null, gl.LINEAR); fboLight = fbo(texLight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); };
  // ---- world tile textures
  G.setWorld = function (n) { G.n = n; for (const t of [texA, texB, texC]) if (t) gl.deleteTexture(t); G.dA = new Uint8Array(n * n * 4); G.dB = new Uint8Array(n * n * 4); G.dC = new Uint8Array(n * n);
    texA = tex(n, n, 'rgba', G.dA); texB = tex(n, n, 'rgba', G.dB); texC = tex(n, n, 'r8', G.dC); };
  // recompute derived tile data (tone shift, far-view marks, transition overlays) for a rectangle (+1 border) and upload
  G.updateTiles = function (M, x0, y0, w, h) {
    const n = G.n, gr = M.ground, hg = M.height, ft = M.feature, fl = M.flags, dA = G.dA, dB = G.dB, rank = G.rank, As = AL.Assets;
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); const x1 = Math.min(n - 1, x0 + w + 2), y1 = Math.min(n - 1, y0 + h + 2);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * n + x, g = gr[i], r = rank[g], o = i * 4;
      const xm = x > 0 ? x - 1 : x, xp = x < n - 1 ? x + 1 : x, ym = y > 0 ? y - 1 : y, yp = y < n - 1 ? y + 1 : y;
      // relief: light from the top-left; slopes facing it are one tone lighter, slopes away one or two tones darker
      let sh = 0; if (r >= 3) { const d = (hg[ym * n + xm] - hg[yp * n + xp]) + (hg[ym * n + x] - hg[yp * n + x]) * 0.5; const k = g === 14 || g === 16 ? 5 : 9; sh = d < -k * 3 ? 1 : d < -k ? 1 : d > k * 3 ? -2 : d > k ? -1 : 0; }
      const f = ft[i], F = f ? AL.FLORA[f] : null; let lod = 0; if (F && F.lod && M.fgrow[i] > 70) lod = As.ix(F.lod[0], F.lod[1]) + 1;
      dA[o] = g; dA[o + 1] = 128 + sh; dA[o + 2] = lod; dA[o + 3] = fl[i];
      // overlays: the two highest-ranked neighbour grounds above this tile's rank
      const nb0 = gr[ym * n + x], nb1 = gr[y * n + xp], nb2 = gr[yp * n + x], nb3 = gr[y * n + xm], nb4 = gr[ym * n + xp], nb5 = gr[yp * n + xp], nb6 = gr[yp * n + xm], nb7 = gr[ym * n + xm];
      let a = -1, b = -1, ra = r, rb = r;
      const cons = (q) => { const rq = rank[q]; if (rq <= r || q === a || q === b) return; if (rq > ra) { b = a; rb = ra; a = q; ra = rq; } else if (rq > rb || b < 0) { if (b < 0 || rq > rb) { b = q; rb = rq; } } };
      cons(nb0); cons(nb1); cons(nb2); cons(nb3); cons(nb4); cons(nb5); cons(nb6); cons(nb7);
      // slot 2 = highest (drawn on top), slot 1 = second
      const code = (rm) => (rank[nb0] >= rm ? 1 : 0) | (rank[nb1] >= rm ? 2 : 0) | (rank[nb2] >= rm ? 4 : 0) | (rank[nb3] >= rm ? 8 : 0) | (rank[nb4] >= rm ? 16 : 0) | (rank[nb5] >= rm ? 32 : 0) | (rank[nb6] >= rm ? 64 : 0) | (rank[nb7] >= rm ? 128 : 0);
      if (a < 0) { dB[o] = dB[o + 1] = dB[o + 2] = dB[o + 3] = 0; }
      else if (b < 0) { dB[o] = 0; dB[o + 1] = 0; dB[o + 2] = a; dB[o + 3] = code(ra); }
      else { dB[o] = b; dB[o + 1] = code(rb); dB[o + 2] = a; dB[o + 3] = code(ra); } }
    const rw = x1 - x0 + 1, rh = y1 - y0 + 1; gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (rw * rh > n * n / 3) { gl.bindTexture(gl.TEXTURE_2D, texA); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, n, n, gl.RGBA, gl.UNSIGNED_BYTE, dA); gl.bindTexture(gl.TEXTURE_2D, texB); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, n, n, gl.RGBA, gl.UNSIGNED_BYTE, dB); }
    else { gl.pixelStorei(gl.UNPACK_ROW_LENGTH, n); gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x0); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y0);
      gl.bindTexture(gl.TEXTURE_2D, texA); gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, rw, rh, gl.RGBA, gl.UNSIGNED_BYTE, dA); gl.bindTexture(gl.TEXTURE_2D, texB); gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, rw, rh, gl.RGBA, gl.UNSIGNED_BYTE, dB);
      gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0); gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0); }
  };
  G.setLayer = function (ids, palRGBA) { G.dC.set(ids); gl.bindTexture(gl.TEXTURE_2D, texC); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, G.n, G.n, gl.RED, gl.UNSIGNED_BYTE, G.dC); if (palRGBA) { gl.bindTexture(gl.TEXTURE_2D, texLayerPal); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, palRGBA); } };
  // ---- frame submission
  G.begin = function () { nSpr = 0; nLights = 0; };
  // f = frame [x,y,w,h,px,py]; (wx,wy) world position of the pivot; opts packed: team ramp, flags (1 flip,2 flash,4 sick,8 emissive,16 underwater,32 no shadow), tone shift, alpha, scale, z-bias
  G.spr = function (f, wx, wy, team, flags, tone, alpha, scale, zb) {
    if (nSpr >= G.maxSprites) return; const o = nSpr * FL, sc = scale || 1, fl = flags | 0;
    inst[o] = Math.round(wx - ((fl & 1) ? (f[2] - 1 - f[4]) : f[4]) * sc); inst[o + 1] = Math.round(wy - f[5] * sc); inst[o + 2] = Math.round(wy); inst[o + 3] = sc;
    inst[o + 4] = f[0]; inst[o + 5] = f[1]; inst[o + 6] = f[2]; inst[o + 7] = f[3]; inst[o + 8] = team || 0; inst[o + 9] = fl; inst[o + 10] = 8 + (tone || 0); inst[o + 11] = alpha == null ? 1 : alpha;
    keys[nSpr] = Math.floor(wy + (zb || 0) + 4096) * 32768 + nSpr; nSpr++;
  };
  G.light = function (wx, wy, radius, intensity, kind) { if (nLights >= 2048) return; const o = nLights * 6; lights[o] = wx; lights[o + 1] = wy; lights[o + 2] = radius; lights[o + 3] = intensity; lights[o + 4] = kind || 0; lights[o + 5] = 0; nLights++; };
  G.count = function () { return nSpr; };
  // ---- draw. env: {ambient:[r,g,b], tint:[r,g,b,a], sun:[sx,sy], time, frame, vig, fade, flash}
  G.draw = function (cam, env) {
    const W = G.W, H = G.H; gl.viewport(0, 0, W, H); gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene); gl.disable(gl.BLEND);
    let p = progT; gl.useProgram(p); gl.bindVertexArray(vaoQ);
    const bind = (unit, t, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unit); };
    bind(0, texA, p.u.uA); bind(1, texB, p.u.uB); bind(2, texC, p.u.uC); bind(3, texTer, p.u.uTer); bind(4, texMask, p.u.uMask); bind(5, texPal, p.u.uPal); bind(6, texLayerPal, p.u.uLPal);
    gl.uniform2f(p.u.uCam, cam.x, cam.y); gl.uniform2f(p.u.uRes, W, H); gl.uniform1f(p.u.uZoom, cam.z); gl.uniform1f(p.u.uMapN, G.n); gl.uniform1f(p.u.uTime, env.time); gl.uniform1i(p.u.uFrame, env.frame & 3); gl.uniform1i(p.u.uLayer, G.layerOn); gl.uniform1iv(p.u.uFlat, G.flat);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // sort sprites by y
    if (nSpr) { const ks = keys.subarray(0, nSpr); ks.sort(); for (let i = 0; i < nSpr; i++) { const s = (ks[i] % 32768) * FL, d = i * FL; for (let k = 0; k < FL; k++) sorted[d + k] = inst[s + k]; }
      p = progS; gl.useProgram(p); gl.bindVertexArray(vaoS); gl.bindBuffer(gl.ARRAY_BUFFER, instBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, sorted, 0, nSpr * FL);
      bind(0, texPage, p.u.uPage); bind(1, texPal, p.u.uPal); gl.uniform2f(p.u.uCam, cam.x, cam.y); gl.uniform2f(p.u.uRes, W, H); gl.uniform1f(p.u.uZoom, cam.z); gl.uniform1i(p.u.uEm, AL.Assets.palette.emissiveRamp); gl.uniform1i(p.u.uGlass, AL.Assets.palette.ramps.water);
      if (env.sun && cam.z >= 0.74) { gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE); gl.uniform1i(p.u.uShadow, 1); gl.uniform2f(p.u.uSun, env.sun[0], env.sun[1]); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nSpr); gl.disable(gl.BLEND); }
      gl.uniform1i(p.u.uShadow, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nSpr); }
    // lights
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboLight); const am = env.ambient; gl.clearColor(am[0], am[1], am[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    if (nLights) { p = progL; gl.useProgram(p); gl.bindVertexArray(vaoL); gl.bindBuffer(gl.ARRAY_BUFFER, lightBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, lights, 0, nLights * 6); gl.uniform2f(p.u.uCam, cam.x, cam.y); gl.uniform2f(p.u.uRes, W, H); gl.uniform1f(p.u.uZoom, cam.z);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nLights); gl.disable(gl.BLEND); }
    // composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); p = progC; gl.useProgram(p); gl.bindVertexArray(vaoQ); bind(0, texScene, p.u.uScene); bind(1, texLight, p.u.uLight);
    gl.uniform2f(p.u.uRes, W, H); gl.uniform2f(p.u.uShake, env.shakeX || 0, env.shakeY || 0); const t = env.tint || [0, 0, 0, 0]; gl.uniform4f(p.u.uTint, t[0], t[1], t[2], t[3]); gl.uniform1f(p.u.uFade, env.fade || 0); gl.uniform3f(p.u.uFadeCol, 0.114, 0.102, 0.141); gl.uniform1f(p.u.uVig, env.vig == null ? 0.55 : env.vig); gl.uniform1f(p.u.uFlash, env.flash || 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  G.finish = function () { const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return px[0]; };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
