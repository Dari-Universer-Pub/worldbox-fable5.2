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

Tools added in later steps are appended here (sheet viewer, measurement scripts, synthesizer/sequencer, data validator, build, provenance check).
