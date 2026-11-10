# RESUME — Aeonloom handoff file

**Read this first** (then CLAUDE.md for the rules and conventions). Updated at every commit.

## Current step: 5 / 14 — First complete people (humans) — IN PROGRESS, NOT VERIFIED

### Finished and verified (steps 1–4, each committed)
- **Step 1.** Documents (CLAUDE, BIBLE, DECISIONS, STYLE, ARCHITECTURE, TOOLS, IDEAS, PLAYTEST, PROVENANCE, REPORT stub). Browser check (Playwright 1.63 / Chromium 153 headless, WebGL2 = SwiftShader software GL). Rendering bench → own WebGL2 renderer (DECISIONS D1). Asset pipeline bench looked at → D5/D6: people 24×24; pipeline A (SDF rig) for living beings and buildings, C for terrain/flora, B for font/icons/UI.
- **Step 2.** Tools: `tools/sheet.js` (viewer ×4/×8, silhouette, diff, frames), `tools/measure-sprite.js`, `tools/measure-audio.js`, `tools/validate-palette.js`, `tools/check-provenance.js`, `tools/lib/*` (img/PNG, sdf baker with despeckle + temporal stabilise, atlas, measure, font, text, mats, schema), synth + sequencer `src/client/audio.js`.
- **Step 3.** Art direction in STYLE.md (96 colours / 16 ramps, ink outlines, ground luminance ≥ 0.20 rule). Bakers: `bake-terrain.js`, `bake-flora.js`, `bake-people.js`, `bake-ui.js` (font). Reference sheet `shots/reference-sheet.png`; contrast ≥ 4:1 measured on 12 grounds.
- **Step 4.** World generation in the worker, WebGL2 indexed renderer (transitions, relief, foam, far-view LOD, y-sorted sprites, shadows, light/composite passes), camera, brushes. Robot `node tests/step4.js` = STEP4 OK. Screens `shots/step4-*.png`.

### Step 5 — what exists (written, only smoke-tested)
- Data: `src/data/{resources,peoples,jobs,buildings,stages,traits}.json` (60 traits, 21 jobs, 17 buildings, 6 stages).
- Sim modules (registered in `tools/build-manifest.json`): `src/sim/ents.js` (SoA entity store, spatial hash, traits), `src/sim/path.js` (bounded A* + cached flow fields), `src/sim/towns.js` (buildings SoA, towns, site planner, job assignment, stages), `src/sim/units.js` (movement, utility AI, work tasks, haul, eat, sleep, social, nomads founding towns, life cycle, births, `spawn` command, `ents`/`blds` snapshots).
- Headless smoke test (Node, `tests/sim-bundle.js`): 12 humans found a town and build 8 buildings in 3,000 ticks, 0.021 ms/tick — **then all 12 starve by tick 6,000 (food 0). This is a real bug, not fixed.**

### Known bugs / debts (do these first)
1. **Starvation bug**: town food reaches 0. Check in order: (a) `T.assign` — `want[gatherer]`/`farmer`/`hunter` counts with 12 adults, and whether farms get finished (`T.complete` claims fields); (b) `U.startWork` task `gather`/`farm` actually returning carry and `U.startHaul` depositing; (c) hunger rate 0.2/tick vs yields (target: one farmer feeds ~15). Use the Node loop in the smoke test (see command below) and print `town.have`, `town.want`, stock.
2. `sim.ownerDirty` is set by towns but the host (`src/sim/sim.js` loop) does not yet send the `owner` layer to the client; add an `{t:'owner'}` message (≤ 2/s) and client handling → kingdom layer.
3. Client has **no Scene yet**: `src/client/main.js` calls `AL.Scene.update/draw` if present. To write: `src/client/scene.js` (receive `ents` and `blds` messages via `Game.on`, interpolate positions, pick frames `people_<people>/<look>/<anim>/<dir>/<i>` from `AL.Assets.anim`, team ramp from kingdom/people, draw buildings), then add it to the manifest before `boot.js`.
4. **Buildings baker missing**: write `tools/bake-buildings.js` (SDF kit with material patterns — prototype is `houseA()` in `tools/bench/pipeline-bench.js`): 12+ types × 3 stages for humans (orcs at step 9), construction frames via `opt.clip`, ruins, emissive windows (indices 144–149); add atlas name to `atlases` in the manifest.
5. People art debts: soldier sword/shield readability, side-view face mostly hidden by hair, then the two-validation sheets (base model, then equipped looks, + silhouette) and hand patches in `tools/art/patches/people.json` on key poses. Full bake = `node tools/bake-people.js` (all looks; ~1–2 min, cached in `tools/.cache`).
6. Small flora: mushrooms are mushy. Audio: `chop` patch fails its centroid window (fix at step 11).
7. Docs to refresh when step 5 ends: TOOLS.md (bake-terrain/flora/people/ui, build, reference-sheet, people-sheet, tests/shot.js), PROVENANCE.md, PLAYTEST.md.

### Remaining (in order)
5 first people (finish) → 6 fauna/flora/ecosystem/monsters (`AL.Creatures` hooks already referenced in units.js) → 7 kingdoms/diplomacy/war/clans (`AL.War`, `AL.Trade` hooks) → 8 powers/disasters/effects/eras/weather/day-night (`AL.Fx`) → 9 second people (orcs), culture, languages, religions (`AL.Faith`), history → 10 full UI (`AL.UI`, canvas 2D overlay with the baked font), saves (`AL.Save`), options → 11 sound and music → 12 data skeleton + provisional assets → 13 title/loading/icons/delivery → 14 final verification, two long playtests, independent sub-agent review, REPORT.md.

### Blocked
- Nothing.

### Commands
```
node tools/make-palette.js && node tools/bake-terrain.js && node tools/bake-flora.js && node tools/bake-people.js && node tools/bake-ui.js
node tools/build.js              # writes game/ and tests/sim-bundle.js
node tests/step4.js              # robot (real mouse/keyboard)
node tests/shot.js shots/x.png   # screenshot of the running game
# headless sim loop: const AL=require('./tests/sim-bundle.js'); const sim=new AL.Sim({size:'medium',seed:7}); sim.command({t:'spawn',kind:'human',x,y,count:12}); sim.step();
```

### Precise next action
Fix bug 1 with the Node loop until a 12-human town survives and grows for 30,000 ticks, then do items 2–4 so villagers and buildings are visible in the browser, look at a screenshot, and only then commit "Step 5".
