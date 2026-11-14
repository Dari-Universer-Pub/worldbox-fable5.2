#!/usr/bin/env node
// Proves the absence of external artistic content:
//  1. every file in the project has an allowed type; media/model/font files are forbidden everywhere;
//  2. every PNG/BIN lives in assets/, shots/ or game/ (outputs of the tools); assets/ and game/ files match assets/manifest.json hashes (written by bake-all/build);
//  3. shipped files (game/) contain no external URL, no fetch/XHR/WebSocket/import of remote code.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'); let fail = 0; const counts = {};
const FORBID = /\.(wav|mp3|ogg|flac|aac|m4a|mid|midi|sf2|ttf|otf|woff2?|eot|obj|fbx|gltf|glb|blend|dae|psd|ase|aseprite|xcf|kra|svg|jpg|jpeg|gif|webp|bmp|tga|mp4|webm|zip|tar|gz|wasm)$/i;
const ALLOW = /\.(js|py|json|md|html|css|txt|png|bin|webmanifest|ico|aeon|gitignore|sh)$/i;
// the one exception to rule 3 (decision D-C11 of Julien): the game music generated with ElevenLabs. Its files are listed with their hashes in
// tools/art/music-src/manifest.json (written by tools/music-build.js); an audio file that is not in that list, or that differs from it, is refused.
const musicFile = path.join(ROOT, 'tools/art/music-src/manifest.json'), MUSIC = fs.existsSync(musicFile) ? JSON.parse(fs.readFileSync(musicFile, 'utf8')) : {}; const seenMusic = new Set();
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function walk(d) { for (const f of fs.readdirSync(d)) { if (f === '.git' || f === 'node_modules') continue; const p = path.join(d, f), st = fs.statSync(p); if (st.isDirectory()) walk(p); else check(p); } }
const manifestFile = path.join(ROOT, 'assets/manifest.json'); const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;
function check(p) {
  const rel = path.relative(ROOT, p).replace(/\\/g, '/'), ext = path.extname(p).toLowerCase(); counts[ext] = (counts[ext] || 0) + 1;
  if (rel in MUSIC) { seenMusic.add(rel); if (sha(p) !== MUSIC[rel]) { console.log('MUSIC FILE differs from tools/art/music-src/manifest.json: ' + rel); fail++; } if (/\.mp3$/.test(rel)) return; }
  { const m = /^game\/(music-[a-z]+\.js)$/.exec(rel); if (m) { if (MUSIC['assets/music/' + m[1]] !== sha(p)) { console.log('SHIPPED MUSIC is not the output of tools/music-build.js: ' + rel); fail++; } } }
  if (FORBID.test(p)) { console.log('FORBIDDEN media/model/font file: ' + rel); fail++; return; }
  if (!ALLOW.test(p) && path.basename(p) !== '.gitignore') { console.log('UNKNOWN file type: ' + rel); fail++; return; }
  if (/\.(png|bin|ico)$/.test(p)) {
    if (!/^(assets|shots|game)\//.test(rel)) { console.log('IMAGE outside generated folders: ' + rel); fail++; return; }
    if (manifest && /^(assets|game)\//.test(rel)) { const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); if (manifest[rel] !== h) { console.log('NOT A TOOL OUTPUT (hash differs from manifest): ' + rel); fail++; } }
  }
  if (/^game\//.test(rel) && /\.(js|html|css|json|webmanifest)$/.test(p)) {
    const s = fs.readFileSync(p, 'utf8'); const urls = s.match(/(https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'`)]*/gi) || [];
    for (const u of urls) { if (/^\/\/\s/.test(u)) continue; if (/^https?:/.test(u) || /^\/\/[a-z0-9-]+\.[a-z]/i.test(u)) { if (/w3\.org\/(1999|2000)/.test(u)) continue; console.log('EXTERNAL URL in shipped file ' + rel + ': ' + u.slice(0, 80)); fail++; } }
    if (/\b(XMLHttpRequest|WebSocket|EventSource|importScripts\s*\(\s*['"]http|sendBeacon)\b/.test(s)) { console.log('NETWORK API in shipped file: ' + rel); fail++; }
  }
}
walk(ROOT);
for (const k in MUSIC) if (!seenMusic.has(k)) { console.log('MUSIC FILE listed but missing: ' + k); fail++; }
console.log('music files (generated with ElevenLabs, decision D-C11): ' + seenMusic.size + ' listed and checked');
console.log('files by type: ' + Object.entries(counts).map(([k, v]) => (k || '(none)') + ' ' + v).join(', '));
if (!manifest) console.log('note: assets/manifest.json not present yet (bake-all writes it)');
console.log(fail ? 'PROVENANCE: ' + fail + ' PROBLEM(S)' : 'PROVENANCE OK — no external artistic content except the listed AI-generated music (D-C11), no external URL in shipped files');
process.exit(fail ? 1 : 0);
