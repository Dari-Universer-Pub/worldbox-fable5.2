# RESUME — Aeonloom handoff file

**Read this first.** Updated at every commit.

## Current step: 5 / 14 — First complete people (humans): units, jobs, needs, village, buildings, economy, life cycle

### Finished and verified
- **Step 1 (done).** Documents written (CLAUDE, BIBLE, DECISIONS, STYLE, ARCHITECTURE, TOOLS, IDEAS, PLAYTEST, PROVENANCE, REPORT stub). Test browser checked (Playwright 1.63 Chromium 153 headless, WebGL2 via SwiftShader). Rendering bench run (numbers in DECISIONS D1 → WebGL2). Asset pipeline bench run and looked at (`shots/step1-bench-pipelines.png`, `shots/step1-bench-people-a.png`) → decisions D5/D6 (people 24×24; A for living beings and buildings, C for terrain/flora, B for UI).
- Palette: 96 colours / 16 ramps, validator passes (`shots/palette.png` looked at).
- Baker core exists: `tools/lib/sdf.js`, `tools/lib/img.js`, rigs `humanoid.js`, `quadruped.js`.

- **Step 2 (done).** Tools written and self-tested: sheet viewer (`tools/sheet.js`, modes ×4/×8, silhouette, diff, frames — outputs looked at), sprite measures (`tools/measure-sprite.js`), baker passes (despeckle, temporal stabilise: walk flicker 20.9% → 7.6%, isolated 13.5% → 7.7% on the test atlas), pixel font (`shots/font.png` looked at), synth + sequencer (`src/client/audio.js`) with offline measurement (`tools/measure-audio.js` runs, detects out-of-window sounds), schema checker, provenance checker (passes).

- **Step 3 (done).** Art direction quantified in STYLE.md (ink outlines, ground-luminance rule). Bakers: `tools/bake-terrain.js` (18 grounds 32×32 seamless, water/lava 4 frames, 47 transition shapes ×4 variants), `tools/bake-flora.js` (10 trees ×3 variants ×4 sway frames, rocks, ores, crops, flowers…), `tools/bake-people.js` (parallel, cached; humans and orcs sample looks). Reference sheet looked at; contrast ≥ 4:1 on all 12 grounds (script).

- **Step 4 (done).** World generation (continents, climate, rivers, 18 grounds, volcanoes, flora, peaks) in the worker; WebGL2 renderer (indexed terrain shader, 47-case transitions, smooth relief, foam, far-view LOD, y-sorted instanced sprites, shadows, light + composite passes); camera (wheel, keys, drag, touch pinch), integer scaling, brush tools. Robot `tests/step4.js` passes with real mouse/keyboard events (pan, zoom, paint water, raise, forest, line lava). Screens looked at: `shots/step4-b.png`, `step4-brushes.png`, `step4-far.png`. Perf (software GL, synchronous): 9.9 ms @z0.25, 17.1 ms @z1, 9.2 ms @z3; load 237 ms; worldgen 75–160 ms (256²).

### Remaining (in order)
5 first people → 6 fauna/flora/monsters → 7 kingdoms/war → 8 powers/disasters/eras/weather → 9 second people/culture/religion/history → 10 UI → 11 audio → 12 data skeleton → 13 title/loading/delivery → 14 final verification, playtests, independent review, report.

### Blocked
- Nothing.

### Precise next action
- Step 5: entity store (SoA) + snapshots + client Scene (interpolated unit sprites), utility AI, jobs, towns, building kit baker (`tools/bake-buildings.js`, SDF kit, 12 types × 3 stages for humans), economy, life cycle. Then two-validation sheets for the human looks + hand patches.
- Build: `node tools/bake-terrain.js && node tools/bake-flora.js && node tools/bake-people.js && node tools/bake-ui.js && node tools/build.js`; tests: `node tests/step4.js`.
