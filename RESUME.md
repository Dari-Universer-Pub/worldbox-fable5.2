# RESUME — Aeonloom handoff file

**Read this first.** Updated at every commit.

## Current step: 2 / 14 — Internal tools

### Finished and verified
- **Step 1 (done).** Documents written (CLAUDE, BIBLE, DECISIONS, STYLE, ARCHITECTURE, TOOLS, IDEAS, PLAYTEST, PROVENANCE, REPORT stub). Test browser checked (Playwright 1.63 Chromium 153 headless, WebGL2 via SwiftShader). Rendering bench run (numbers in DECISIONS D1 → WebGL2). Asset pipeline bench run and looked at (`shots/step1-bench-pipelines.png`, `shots/step1-bench-people-a.png`) → decisions D5/D6 (people 24×24; A for living beings and buildings, C for terrain/flora, B for UI).
- Palette: 96 colours / 16 ramps, validator passes (`shots/palette.png` looked at).
- Baker core exists: `tools/lib/sdf.js`, `tools/lib/img.js`, rigs `humanoid.js`, `quadruped.js`.

### Remaining (in order)
2 tools (sheet viewer, measurement scripts, synth + sequencer, data validator, provenance check, build) → 3 art direction reference sheet → 4 world → 5 first people → 6 fauna/flora/monsters → 7 kingdoms/war → 8 powers/disasters/eras/weather → 9 second people/culture/religion/history → 10 UI → 11 audio → 12 data skeleton → 13 title/loading/delivery → 14 final verification, playtests, independent review, report.

### Blocked
- Nothing.

### Precise next action
- Write `tools/sheet.js` (×4/×8 viewer, silhouette, frame diff, frame export), `tools/measure-sprite.js` (isolated pixels, flicker, off-palette, outline), pixel font source, then the audio synth core + offline measurement.
