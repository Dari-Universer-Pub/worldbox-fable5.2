# RESUME — Aeonloom handoff file

**Read this first** (then CLAUDE.md for the rules and conventions). Updated at every commit.

## Current step: 8 / 14 — God powers, disasters, effects, eras, weather, day and night — NOT STARTED

### Finished and verified (steps 1–5, each committed)
- **Steps 1–4.** Documents, tools, art direction, world + renderer (see git log and DECISIONS/STYLE/TOOLS). Robot `node tests/step4.js` = STEP4 OK.
- **Step 5.** First people (humans; orcs share the rig and are baked, their buildings come at step 9).
  - Simulation: `src/sim/{ents,path,towns,units}.js`. Starvation fixed and measured: `node tests/town-run.js 30000 <seed> 12` = TOWN OK on seeds 1,2,3,4,5,7 (12 → 29–41 inhabitants, 0–1 starved), 0.03–0.07 ms/tick.
  - Worker → client: `ents`, `blds`, `owner` (≤ 2/s, when `sim.ownerDirty`) messages; queries `towns`, `stats`. Per-tile systems go through `module.tile(sim,i,x,y,g)` (crops ripen, berries regrow).
  - Client: `src/client/scene.js` (interpolated units, frames from the people atlases, buildings with sites/ruins, kingdoms layer on key L, day/night ambience, lit windows at night, default key actions), spawn tool `spawn:<kind>` in `tools.js`.
  - Art: `tools/bake-buildings.js` + `tools/art/buildings.js` (16 types × 3 stages × finished/2 construction/ruin = 209 sprites, looked at: `shots/buildings-human.png`, `shots/buildings-silhouette.png`). People debts fixed (sword, shield, helmet, profile face and eye): sheets `shots/people-base-human.png` (base model), `shots/people-overview.png` (equipped), `shots/people-silhouette.png` — all three looked at.
  - Robot `node tests/step5.js` = STEP5 OK (real click with the spawn tool, real keys for speed/layer/pause, wheel zoom; 20,000 ticks at x50 without starvation). Screens looked at: `shots/step5-village.png`, `step5-zoom2.png`, `step5-later.png`.

- **Step 6.** `src/sim/creatures.js`: 8 animals (rabbit, deer, sheep, boar, wolf, bear, eagle, salmon — data `animals.json`), 3 monsters on the humanoid rig (zombie with contagion, skeleton, demon — `monsters.json`), utility behaviours (graze, herd, flee, chase, warning + attack, sleep, breed with local caps, age), `AL.Fight.hit`, people react to danger (`C.threat`: fight or flee) and hunt game; flora `tile()` hook (saplings grow, forests spread and regrow from stumps, meadows regrow). Measured: `node tests/eco-run.js 20000 7` = ECO OK (no extinction, no explosion, 0.2 ms/tick with ~900 animals); `node tests/step6.js` = STEP6 OK. Sheets looked at: `shots/creatures.png` (partly, via the scratch sheet), `shots/monsters.png`; screens looked at: `shots/step6-animals.png`, `shots/step6-monsters.png`.

- **Step 7.** `src/sim/realm.js`: kingdoms (capital, ruler, colour ramp per people), clans and succession, colonisation by settlers, yearly diplomacy (relations, alliances, treaties, royal marriages, vassals and tribute, betrayal, rebellion/independence), `AL.War` (mobilisation, march, fights between people, sieges with building damage, capture/annexation code), `AL.Trade` (merchant trips swapping surpluses), worn paths become roads, chronicle + queries `kingdoms`, `chronicle`, `clans`, command `incite`. Measured: `node tests/war-run.js 40000 <seed>` = WAR OK on seeds 2, 3, 5, 7 (2–3 wars each, all ended, 0–4 starved); `node tests/step7.js` = STEP7 OK; screens looked at: `shots/step7-kingdoms.png`, `shots/step7-war.png`.

### Not verified / known debts
- Step 7: town capture/annexation, royal marriage, rebellion and trade effects never occurred or were not checked in a test (code written, NOT verified). Armies are 2–6 soldiers.
- Step 6: `shots/step6-hunt.png`, `step6-after.png`, `shots/creatures-silhouette.png` were written but not looked at. Rabbit sprite is poor. Only one seed was run for the ecosystem.
- **No hand patches on key poses yet** (`tools/art/patches/people.json` does not exist); `tools/measure-sprite.js people_human` still fails its flicker threshold on 299 animations and counts 7.2% isolated pixels. This is an open art debt, not done.
- `shots/step5-layer.png` (kingdoms layer) was produced by the robot and checked by script only, not looked at.
- Frame rate in this environment is 16 fps (software GL, SwiftShader); CPU side of a frame is 0.4 ms. Real-GPU numbers are not measured.
- Tree stumps never regrow (step 6). Small flora: mushrooms are mushy. Audio: `chop` patch fails its centroid window (step 11).
- `tools/validate-data.js` does not exist yet (step 12); buildings.json/jobs.json are only checked by use.

### Remaining (in order)
8 powers/disasters/effects/eras/weather/day-night (`AL.Fx`) → 9 second people (orcs), culture, languages, religions (`AL.Faith`), history → 10 full UI (`AL.UI`, canvas 2D overlay with the baked font), saves (`AL.Save`), options → 11 sound and music → 12 data skeleton + provisional assets → 13 title/loading/icons/delivery → 14 final verification, two long playtests, independent sub-agent review, REPORT.md.

### Blocked
- Nothing.

### Commands
```
node tools/bake-all.js           # every baker + build (people: ~4 min uncached)
node tools/build.js              # writes game/ and tests/sim-bundle.js
node tests/run-all.js            # town-run + step4 + step5 robots + provenance
node tests/shot.js shots/x.png "<js>" <wait-ms>   # screenshot of the running game
node tools/sheet.js <atlas> --match <regex> --scale 4 [--silhouette] [--cols N] --out file.png
```

### Precise next action
Step 8: `src/data/powers.json` (30 powers) + `src/sim/powers.js` (command `power`: bless, curse, plague, lightning, fire spreading by ground flammability and wind via the `tile()` hook and `W.fire`, meteor, earthquake, tornado, flood, rain, bombs, resurrection, incite war/peace…), eras (`eras.json`, multipliers `sim.growMul/cropMul/fertMul`), weather cells; client `src/client/fx.js` (`AL.Fx.event/draw/smoke/brushFeedback` hooks already called: particles and frame effects baked by a new `tools/bake-fx.js`, screen shake, flashes, rain/snow overlays). Robot `tests/step8.js` using `Game.tool = {id:'power:<name>'}` with real clicks, screenshots looked at, commit "Step 8".
