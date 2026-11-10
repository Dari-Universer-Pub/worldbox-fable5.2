# TOOLS — internal tools of Aeonloom (all written in this project)

| tool | purpose | run | output |
|---|---|---|---|
| `tools/lib/img.js` | indexed-image class, PNG encoder/decoder (own code, Node zlib for DEFLATE) | library | — |
| `tools/lib/sdf.js` | **sprite baker** (pipeline A): implicit-surface ray marcher, fixed camera (35°) and light, ramp quantisation, selective outline, inner contours, pixel decals, material patterns, clip function | library | — |
| `tools/lib/mats.js` | materials from palette ramps (normal, team, emissive) | library | — |
| `tools/art/rigs/humanoid.js` | humanoid skeleton, proportions, accessories, 12 animations | library | — |
| `tools/art/rigs/quadruped.js` | quadruped skeleton and animations | library | — |
| `tools/make-palette.js` | palette source → `tools/art/palette.json` | `node tools/make-palette.js` | palette.json |
| `tools/validate-palette.js` | palette validator (count, ramps, hue rotation ≥ 15°, luminance order, pure black/white, off-palette pixels in PNGs) | `node tools/validate-palette.js [png…]` | report, exit code |
| `tools/bench/render-bench.html` | rendering bench Canvas 2D / WebGL2 | open in browser, `runBench()` | numbers (DECISIONS D1) |
| `tools/bench/pipeline-bench.js`, `people-a.js` | asset pipeline bench sheets | `node tools/bench/pipeline-bench.js` | `shots/bench-*.png` |

| `tools/lib/atlas.js` | atlas of named indexed frames (pack, save `.png/.bin/.json`, load) | library | `assets/<name>.*` |
| `tools/lib/measure.js` | measurements: isolated pixels, flicker (shift-compensated), outline stats, saturation, WCAG contrast, readable-mass contrast | library | — |
| `tools/lib/font.js`, `tools/lib/text.js`, `tools/art/font.js` | the pixel font "Loomscript": glyph source (5×7 caps), accent composer, EPX-enlarged large size, text drawing for sheets | library | — |
| `tools/sheet.js` | **sheet viewer**: enlarged sheets ×4/×8, `--silhouette` black-on-white, `--diff` frame-to-frame flicker map, `--frames` export of successive frames, `--bg` grounds, `--labels` | `node tools/sheet.js <atlas> --match walk --scale 8 --diff` | `shots/sheet-*.png`, `shots/frames/` |
| `tools/measure-sprite.js` | isolated pixels, flicker per animation with thresholds (fails the run), uniform-outline detector, saturation, `--contrast` vs 8 grounds | `node tools/measure-sprite.js <atlas> --contrast` | report, exit code |
| `src/client/audio.js` | **synthesizer and sequencer** (ships in the game): oscillators, 3 noise colours, filters with envelopes, ADSR, FM, vibrato, tremolo, pan, generated-IR reverb, Karplus-Strong strings, instruments, pattern sequencer with sections and layers, adaptive mixer, ambience beds | in game | — |
| `tools/measure-audio.js` | renders every sound variant and track with OfflineAudioContext in headless Chromium; peak, loudness, clipping, clicks, duration, spectral centroid; category level check (6 dB) | `node tools/measure-audio.js --music` | report, exit code |
| `tools/lib/schema.js` | mini schema checker used by `tools/validate-data.js` | library | — |
| `tools/check-provenance.js` | walks the project: forbidden media/model/font types, images only in generated folders and matching the bake manifest, no external URL or network API in `game/` | `node tools/check-provenance.js` | report, exit code |

Self-test of the viewer and measures: `shots/tooltest-diff.png`, `shots/tooltest-sil.png` (looked at).
Added in later steps: bakers per category, `bake-all.js`, `build.js`, `validate-data.js`, screenshot measures.

| `tools/bake-terrain.js`, `tools/bake-flora.js` | pipeline C generators: 32×32 seamless grounds, 47-case transition masks, trees, small flora, rocks, peaks | `node tools/bake-terrain.js` | `assets/terrain.*`, `tmask.*`, `flora.*` |
| `tools/bake-people.js` + `tools/art/peoples.js` | every people × look × animation × direction from the humanoid rig (4 worker threads, cache in `tools/.cache`); decals for eyes (front and profile) and tusks; patches from `tools/art/patches/people.json` | `node tools/bake-people.js [human orc]` | `assets/people_<people>.*` |
| `tools/bake-buildings.js` + `tools/art/buildings.js` | SDF construction kit (boxes, cylinders, prisms, pyramids, cones, material patterns: thatch, shingles, tiles, planks, stone…), 16 types × 3 stages; per sprite: finished, 2 construction frames (clip plane + scaffolding), ruin (jagged clip, rubble, soot); site markers; automatic 48→64 cell when a sprite does not fit; smoke/light anchors in the frame data | `node tools/bake-buildings.js` | `assets/buildings.*` |
| `tools/bake-ui.js` | font atlases and far-view marks | `node tools/bake-ui.js` | `assets/font*.*`, `marks.*` |
| `tools/bake-all.js` | runs every baker then the build | `node tools/bake-all.js` | `assets/`, `game/` |
| `tools/build.js` | concatenates sources per `tools/build-manifest.json`, embeds data and atlases, writes `game/` and `tests/sim-bundle.js` | `node tools/build.js` | `game/` |
| `tools/people-sheet.js`, `tools/reference-sheet.js` | overview sheets (all looks; `--sil` silhouettes) | `node tools/people-sheet.js human,orc out.png` | `shots/*.png` |
| `tests/town-run.js` | headless town survival run with stocks, jobs wanted/held and buildings printed every 1,000 ticks | `node tests/town-run.js 30000 <seed> 12 [--quiet]` | TOWN OK / FAIL |
| `tests/step4.js`, `tests/step5.js`, `tests/shot.js`, `tests/run-all.js` | browser robots (real mouse/keyboard), screenshot helper, everything at once | `node tests/run-all.js` | `shots/step*.png` |
| `tools/bake-creatures.js` + `tools/art/creatures.js` | animals from the quadruped rig (three-quarter views for up/down) and the small bird and fish rigs: 8 species × idle/walk/run/eat/attack/hit/death/sleep | `node tools/bake-creatures.js` | `assets/creatures.*` |
| `tests/eco-run.js` | headless ecosystem run: species census every 5,000 ticks, extinction/explosion check, flora counts, zombie outbreak against a village | `node tests/eco-run.js 20000 7` | ECO OK / FAIL |
| `tests/war-run.js` | headless kingdoms run (humans and orcs 44 tiles apart): prints the chronicle; fails if there is no war, no battle, no end of war, no succession, or more than 12 wars | `node tests/war-run.js 40000 <seed> [--quiet]` | WAR OK / FAIL |

## tools/bake-fx.js (+ tools/art/fx.js)
Effects baker. `node tools/bake-fx.js` renders every procedural effect of `tools/art/fx.js` (54 types, 242 frames: fire, smoke, explosions, mushroom cloud, lightning, tornado, rings, sprays, state icons, rain cloud, weather particles) into the atlas `assets/fx.*` with frames named `fx/<name>/<i>`. Look at them with `node tools/sheet.js fx --match <regex> --scale 4 --out shots/x.png`. Included in `node tools/bake-all.js`.

## tests/powers-run.js, tests/step8.js
`node tests/powers-run.js`: headless, 34 cases, each power must change a measured quantity; checks determinism. `node tests/step8.js`: browser robot using real clicks/drags/keys for the powers, writes `shots/step8-*.png`.

## tests/culture-run.js, tests/step9.js
`node tests/culture-run.js [ticks] [seed] [--quiet]`: headless run of two peoples; checks cultures, languages, religion founding, dogma modifiers, schism, drift, notables, calendar, determinism. `node tests/step9.js`: browser robot (real clicks), writes `shots/step9-*.png`.
