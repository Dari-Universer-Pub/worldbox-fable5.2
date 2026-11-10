# RESUME — Aeonloom handoff file

**Read this first.** Updated at every commit.

## Current step: 3 / 14 — Quantified art direction, reference sheet

### Finished and verified
- **Step 1 (done).** Documents written (CLAUDE, BIBLE, DECISIONS, STYLE, ARCHITECTURE, TOOLS, IDEAS, PLAYTEST, PROVENANCE, REPORT stub). Test browser checked (Playwright 1.63 Chromium 153 headless, WebGL2 via SwiftShader). Rendering bench run (numbers in DECISIONS D1 → WebGL2). Asset pipeline bench run and looked at (`shots/step1-bench-pipelines.png`, `shots/step1-bench-people-a.png`) → decisions D5/D6 (people 24×24; A for living beings and buildings, C for terrain/flora, B for UI).
- Palette: 96 colours / 16 ramps, validator passes (`shots/palette.png` looked at).
- Baker core exists: `tools/lib/sdf.js`, `tools/lib/img.js`, rigs `humanoid.js`, `quadruped.js`.

- **Step 2 (done).** Tools written and self-tested: sheet viewer (`tools/sheet.js`, modes ×4/×8, silhouette, diff, frames — outputs looked at), sprite measures (`tools/measure-sprite.js`), baker passes (despeckle, temporal stabilise: walk flicker 20.9% → 7.6%, isolated 13.5% → 7.7% on the test atlas), pixel font (`shots/font.png` looked at), synth + sequencer (`src/client/audio.js`) with offline measurement (`tools/measure-audio.js` runs, detects out-of-window sounds), schema checker, provenance checker (passes).

### Remaining (in order)
3 art direction reference sheet → 4 world → 5 first people → 6 fauna/flora/monsters → 7 kingdoms/war → 8 powers/disasters/eras/weather → 9 second people/culture/religion/history → 10 UI → 11 audio → 12 data skeleton → 13 title/loading/delivery → 14 final verification, playtests, independent review, report.

### Blocked
- Nothing.

### Precise next action
- Step 3: refine the humanoid rig (hair, arms, tool visibility), write ground-texture generator and tree generator as real bakers, produce `shots/reference-sheet.png` (human, orc, deer, tree, house, 8 ground swatches) and measure it (contrast rule: grounds lum ≥ 0.21, ink outlines lum ≤ 0.012).
