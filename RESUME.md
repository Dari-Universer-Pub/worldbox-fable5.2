# RESUME — Aeonloom handoff file

**Read this first.** Updated at every commit.

## Current step: 4 / 14 — World: generation, terrain, biomes, brushes, camera, performance

### Finished and verified
- **Step 1 (done).** Documents written (CLAUDE, BIBLE, DECISIONS, STYLE, ARCHITECTURE, TOOLS, IDEAS, PLAYTEST, PROVENANCE, REPORT stub). Test browser checked (Playwright 1.63 Chromium 153 headless, WebGL2 via SwiftShader). Rendering bench run (numbers in DECISIONS D1 → WebGL2). Asset pipeline bench run and looked at (`shots/step1-bench-pipelines.png`, `shots/step1-bench-people-a.png`) → decisions D5/D6 (people 24×24; A for living beings and buildings, C for terrain/flora, B for UI).
- Palette: 96 colours / 16 ramps, validator passes (`shots/palette.png` looked at).
- Baker core exists: `tools/lib/sdf.js`, `tools/lib/img.js`, rigs `humanoid.js`, `quadruped.js`.

- **Step 2 (done).** Tools written and self-tested: sheet viewer (`tools/sheet.js`, modes ×4/×8, silhouette, diff, frames — outputs looked at), sprite measures (`tools/measure-sprite.js`), baker passes (despeckle, temporal stabilise: walk flicker 20.9% → 7.6%, isolated 13.5% → 7.7% on the test atlas), pixel font (`shots/font.png` looked at), synth + sequencer (`src/client/audio.js`) with offline measurement (`tools/measure-audio.js` runs, detects out-of-window sounds), schema checker, provenance checker (passes).

- **Step 3 (done).** Art direction quantified in STYLE.md (ink outlines, ground-luminance rule). Bakers: `tools/bake-terrain.js` (18 grounds 32×32 seamless, water/lava 4 frames, 47 transition shapes ×4 variants), `tools/bake-flora.js` (10 trees ×3 variants ×4 sway frames, rocks, ores, crops, flowers…), `tools/bake-people.js` (parallel, cached; humans and orcs sample looks). Reference sheet looked at; contrast ≥ 4:1 on all 12 grounds (script).

### Remaining (in order)
4 world → 5 first people → 6 fauna/flora/monsters → 7 kingdoms/war → 8 powers/disasters/eras/weather → 9 second people/culture/religion/history → 10 UI → 11 audio → 12 data skeleton → 13 title/loading/delivery → 14 final verification, playtests, independent review, report.

### Blocked
- Nothing.

### Precise next action
- Step 4: write `src/shared` (rng, consts), `src/sim/worldgen.js`, worker loop, `tools/build.js`, WebGL2 renderer (terrain shader with indexed palette + transitions), camera, brushes; first playable `game/index.html`; screenshot + perf measure.
- Known art debts to settle at step 5 (two-validation sheets): soldier sword/shield readability, side-view face, small mushrooms; then hand patches on key poses.
