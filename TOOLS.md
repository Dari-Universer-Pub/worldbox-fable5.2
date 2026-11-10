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
