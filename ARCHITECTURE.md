# ARCHITECTURE — Dustcrown

```
main thread                                   worker (simulation)
┌──────────────────────────────┐   commands   ┌───────────────────────────────┐
│ input → UI (canvas 2D)       │ ───────────► │ World (tiles, typed arrays)   │
│ camera, powers, windows      │              │ Entities (SoA, cap 8192)      │
│ Renderer (WebGL2, 640×360)   │ ◄─────────── │ Towns, kingdoms, religions…   │
│ Audio (Web Audio synth)      │  snapshots   │ fixed step 10 Hz × speed      │
└──────────────────────────────┘  + events    └───────────────────────────────┘
```

## Data
- `src/data/*.json`: all content. Embedded in the bundle as `AL.DATA`. Validated by `tools/validate-data.js`.
- World tiles (worker): `ground: Uint8Array`, `height: Uint8Array`, `feature: Uint8Array` (flora/rock id), `fgrow: Uint8Array`, `fire: Uint8Array`, `owner: Uint16Array` (town id), `road: Uint8Array`, `flags: Uint8Array`, `region: Uint16Array`.
- Entities (worker), struct of arrays indexed by entity id: `x, y, vx, vy` (Float32, tile units), `kind` (species), `hp, hunger, energy, mood, faith, age` , `state, action, target, tx, ty, timer`, `job, town, kingdom, home, work`, `traits0, traits1` (bit sets), `mother, father, spouse`, `religion, culture`, `carry, carryN`, `anim, dir, flags`, `gen` (generation counter for safe handles). Free list; no object per entity. Names and biographies live in sparse maps touched only on events.
- Buildings: SoA (type, town, x, y, hp, progress, stage, state, stock…). Towns, kingdoms, cultures, languages, religions, wars, alliances: small arrays of plain objects (tens, not thousands; touched at low frequency).

## Loop (worker)
`setInterval` drives `advance(realDt)`: accumulates `speed × TICK_HZ × dt` ticks, runs at most a time budget per slice (8 ms) and reports the effective speed. One tick:
1. time/calendar/season/age, weather cells;
2. tile systems in slices (1/64 of the map per tick: flora growth, fire spread, water flow, lava cooling, road decay);
3. entities: movement integration for all; AI decision for the group `id % 8 == tick % 8`; needs decay;
4. buildings in slices (production, construction, burning);
5. towns (every 20 ticks, staggered): job assignment, building plans, trade;
6. kingdoms/diplomacy/war (every 150 ticks, staggered), religions and cultures (every 300), chronicle;
7. events queue → main thread.
Spatial hash: uniform grid of 8×8-tile cells rebuilt each tick with counting sort into typed arrays (no allocation) for neighbour queries (combat, contagion, social, predators).
Levels of detail: AI decisions are batched (1/8 of the units per tick); tile systems are sliced; when a tick exceeds its budget at high speed the decision batch widens to 1/16. Rendering LOD: at zoom < 0.5 trees/units switch to 1–3 px marks baked in the terrain shader; sprites outside the view are never submitted.

## AI
Utility-based. For each unit, candidate actions (eat, sleep, work-by-job, haul, build, socialise, pray, flee, fight, wander, migrate, court, heal) are scored 0–1 from needs, job, traits and local danger; the best wins with hysteresis. Action executors are small state machines (go to → do → finish). The scores of the last decision are kept for the sheet's debug line.
Towns: a planner computes wanted jobs and buildings from stock, population, culture values and stage. Kingdoms: yearly diplomacy from relations, culture values, ruler traits.

## Pathfinding
Regions (flood-fill labels), bounded A* for individual trips, cached flow fields for shared destinations (see DECISIONS D9). Path requests are budgeted per tick (max 40 A* per tick; others wait a tick).

## Snapshots worker → main
Each tick (or at most 30 times/s): one transferable `Float32Array` packing for every living entity `[id, x, y, kind, anim, dir, frame, team, flags, hp]`, a list of changed building records, dirty tile rectangles with their arrays, events (sounds, effects, log lines), HUD numbers. The main thread keeps the two latest snapshots and interpolates positions.
Queries (entity sheet, lists, graphs, history) are request/response messages. Commands (powers, speed, save) go main → worker. Everything the player does passes through commands, so the simulation stays deterministic for a given command log.

## Rendering (main thread, WebGL2)
All textures are indexed (R8) and resolved through a 256×1 palette texture; team ramps are remapped per instance.
1. **Terrain pass** — one full-screen quad. Data textures (map-sized): `A = (ground, toneShift, feature-LOD, flags)`, `B = (overlay1 mat, overlay1 blob index, overlay2 mat, overlay2 blob index)`, `C = owner/layer id`. The shader fetches the 32×32 seamless ground texture (4 animation frames for water/lava), blends up to two 47-case transition masks, applies relief tone shift, shore foam, map-layer tint and borders.
2. **Shadow pass** — flattened silhouettes of sprites.
3. **Sprite pass** — instanced quads (units, flora, buildings, effects) sorted by y; indexed atlas + per-instance team ramp, tone shift (hit flash), wind sway.
4. **Light pass** — ambient colour of day/night/age/weather + additive point lights into a half-resolution buffer, multiplied over the scene; emissive pixels bypass darkness.
5. **Post** — weather overlays, vignette, screen shake, fade. Then integer upscale to the screen.
UI is a second canvas (Canvas 2D) at an integer UI scale, drawn with the game's pixel font and icon atlas, only redrawn when dirty.

## Audio
`AL.Audio`: synth engine on Web Audio (oscillators, noise, filters, envelopes, FM, delay, convolution-free reverb from feedback delays, Karplus-Strong strings, flute, bell, percussion, pads), sound patches in data, sequencer with scores in data, adaptive layered mixer. Rendering through `OfflineAudioContext` in the measurement tool.

## Performance budget
Frame 16.6 ms: terrain < 2 ms GPU, ≤ 6,000 sprite instances, UI redraw only when dirty. Worker tick ≤ 2 ms at 1,500 units. No allocation per tick or per frame in hot paths.

## Saves
Worker serialises to one ArrayBuffer (header JSON + raw typed arrays). IndexedDB slots, autosave every 5 min, export/import file.
