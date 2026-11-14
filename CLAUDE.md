# CLAUDE.md — DUSTCROWN

Read `RESUME.md` first at the start of every session, then `CHANTIER.md` (the roadmap after step 13). `INVENTAIRE.md` lists exactly what content exists and what is missing; `BALANCE.md` explains the balance robot and its targets; `BUGS.md` lists the bugs found while playing and how they were repaired. It says the current step (out of 14), what is verified, and the precise next action.

> **SCOPE (decided by Julien after step 13, overrides everything below).** Step 14 is set aside. The work now follows **`CHANTIER.md`**, in order: 0 technical prerequisite, A provisional content raised to the target level, B missing systems, C finish, then D (Julien's feedback after playing, D.1 first). Read `RESUME.md` then `CHANTIER.md`. One commit per finished task, both files updated in the same commit; a line is ticked only when verified. No sub-agents; **heavy tests are NOT run by this agent** (decided by Julien): no `node tests/run-all.js`, no balance battery, no Playwright robots, no balance tuning — Sonnet runs and fixes those at the end. **Light proof of work is required** for every task that touches the simulation: `node tools/build.js`, `validate-data.js`, `bake-all.js`, then ONE short simulated game under Node (about 100 years, one seed, one balance-bot scenario in `run` mode, never the battery) showing that the new mechanic fires at least once (counter or chronicle), fixed at once if not; open the game once to see it. Write in `RESUME.md`: « Vu : … », « Non vérifié : … », « À tester par Sonnet : … ». Tick a task only if the mechanic was seen firing; otherwise mark it `[~]`. See `CHANTIER.md` (role split).

- Game name: **Dustcrown** (original; a pixel-art god simulation, top-down, web).
- Part A below: code conventions. Part B: the rules of the founding prompt, copied in full.

---

## PART A — CODE CONVENTIONS

### Layout
```
src/data/*.json     all content (validated by tools/validate-data.js)
src/shared/*.js     code shared by the simulation and the client (RNG, constants, data access)
src/sim/*.js        simulation (runs in a Web Worker, also runs under Node for tests)
src/client/*.js     rendering (WebGL2), UI (canvas), audio (Web Audio), input
tools/              internal tools (asset bakers, validators, viewers, measurements, build)
tools/art/          asset SOURCES (rigs, voxel kits, pixel grids, generators, patches, scores)
assets/             GENERATED images (PNG, for looking) and atlas binaries — never edited by hand
game/               GENERATED deliverable: static folder, open game/index.html
tests/              Playwright robots (real keyboard/mouse events) and Node tests
shots/              screenshots and sheets that were looked at (evidence)
```

### Language and modules
- Plain JavaScript (ES2020), **classic scripts** — no ES modules, no bundler dependency: the game must run from `file://`.
- Every file wraps itself as `(function (AL) { ... })(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));` and hangs its exports on the `AL` namespace. `tools/build.js` concatenates files in the order listed in `tools/build-manifest.json`.
- The simulation bundle is wrapped in a function whose source text is turned into a Blob Worker (works on `file://` and any static host, no header needed). If Worker creation fails the same bundle runs on the main thread.
- No runtime dependency. No CDN. No network once loaded.

### Simulation rules
- Fixed step: `TICK_HZ = 10` simulation ticks per game second at ×1. Rendering interpolates.
- Determinism: all randomness goes through `AL.Rng` (seeded xoshiro128**). Never `Math.random()` or `Date.now()` in `src/sim`.
- Hot data is column-oriented typed arrays (`Float32Array`, `Int32Array`, `Uint8Array`…) with fixed capacity; no allocation in per-tick loops (no closures, no array literals, no object literals in loops over entities or tiles).
- Content is data: a new people/animal/building/power must be addable by editing `src/data` + its asset source.

### Rendering rules
- Internal resolution 640×360, integer scale to the screen, nearest filtering only.
- Tile = 8×8 px. Sprite cells (one size per entity class, identical in every document):
  - people unit **24×24**; humanoid monster **24×24**; small animal **16×16**; large animal **24×24**; great animal **32×32**; large monster **48×48**; colossus **64×64**; small boat **32×32**; ship **48×48**; mounted unit **32×32**; siege machine **48×48**
  - building **48×48**; great building **64×64**; tree **24×32**; small flora/decor **16×16**; icon **16×16**; effect frame **16×16**, **32×32** or **64×64**
- Every pixel of every asset is an index into the 96-color palette (`tools/art/palette.json`). Atlases are indexed (1 byte per pixel): 0–95 palette, 128–133 team ramp tones, 144–149 emissive tones, 150–155 window tones (lit at night), 255 transparent.
- A single light direction for all assets: from the **top-left** (screen space), elevation 50°.
- Camera for all 3D bakes: orthographic, looking down 35° below the horizontal.

### Art rules
- No asset is validated before its enlarged sheet (×4/×8 PNG written by `tools/sheet.js`) has been opened and looked at.
- Sources live in `tools/art/`; `node tools/bake-all.js` regenerates every file in `assets/` byte-for-byte.
- Touch-ups are pixel patches (`tools/art/patches/*.json`) applied after baking. Never edit a PNG.
- Placeholder = real readable sprite, flagged `"provisional": true` in data.

### Process
- One commit per step of the 14-step plan; `RESUME.md` updated in the same commit.
- "Done" means verified (screenshot looked at, measurement, script, real test). Otherwise write "not verified".
- Tests drive the browser with real keyboard and mouse events (Playwright `page.mouse` / `page.keyboard`).
- Text for players goes through `AL.t(key)` with entries in `src/data/i18n.json` (English and French).
- Keys: physical `event.code` values, all in `src/data/keys.json`, remappable in game.

### Commands
```
node tools/bake-all.js          regenerate every asset
node tools/build.js             build game/ (static deliverable)
node tools/validate-data.js     schema-validate src/data
node tools/validate-palette.js  palette ramps / hue rotation / colors outside the palette
node tools/check-provenance.js  prove there is no external artistic content
node tests/run-all.js           all robots and node tests
```

---

## PART B — THE FOUNDING PROMPT (copied in full)

# SINGLE PROMPT — Living world simulator in pixel art (web god game, top-down view)

## PART 1 — MISSION AND AMBITION

You are an autonomous AI agent. In an empty folder, you build a pixel-art god simulation game, seen from above, that plays directly in a web browser (desktop first, touch is a bonus). The player shapes a world (land, seas, mountains, forests, deserts, ice), makes peoples and animals appear in it, then watches them live: they build villages, found kingdoms, trade, pray, invent languages, form alliances, betray each other, and wage war. At any moment the player can step in as a god: bless, curse, trigger disasters, unleash monsters, or simply watch.

The genre is that of sandbox god games (WorldBox is the best-known example). You take inspiration from the genre and its gameplay ideas, but you copy neither its name, nor its sprites, nor its characters, nor its icons, nor its interface. Universe, names, designs: original, of your own invention. Start by proposing an original name for the game.

Major constraint: NO SOFTWARE AND NO DOWNLOADED CONTENT. You make all the game's content yourself, with code you write in the project: all images and animations, all sounds and music, the typeface. You do not install or download any software (no pixel art editor, no 3D software, no game engine editor), you download no content (no image, sprite, 3D model, tileset, sound, music, font or asset pack), and you use no AI that generates images or sounds. On the other hand, you may use every code tool you need (web libraries and engines, testing tools, scripts), as long as they bring you no ready-made artistic content. This constraint does not lower the target: the professional level remains the goal, and building the right asset-making tools yourself is part of the work.

Target: professional level, right now. This is NOT a rough prototype to improve later. Reference for QUALITY (finish, animation, lighting on sprites, readability, action feedback, "juice"): Dead Cells for pixel art and animation, and a very good god game or management game for the depth of the simulation. You take nothing from their content (characters, scenery, names, objects, compositions). If you do not fully reach the professional level, you deliver the highest level reached and honestly note the remaining gap in IDEAS.md and REPORT.md; but you never lower the target yourself.

Way of working: autonomous, the whole pass in one go, without asking for validation between steps. You ask me a question only if a decision is truly impossible to make alone.

## PART 2 — NON-NEGOTIABLE RULES

1. Empty folder. You reuse nothing from another project. Run `git init` right away, then make one commit at the end of each step, with a clear message, and update RESUME.md in the same commit.

2. NO LIMIT ON ITERATIONS. Faced with a blocking problem (bug, crash, performance too low, ugly or unreadable rendering, internal tool that does not work, asset pipeline that fails), you do absolutely everything to solve it and you do nothing else until it is solved. No workaround, no "I'll note it and move on". You try another approach, you measure, you start again, as many times as it takes. Only exception: a truly impossible blockage. In that case you stop on that precise point, explain it in REPORT.md, and continue with the rest without faking anything. For the remaining gap with the professional level (finish), you also push as far as possible, never settling for "rough first"; whatever remains after you have given everything goes in IDEAS.md.

> **Note on rule 3 (decision D-C11 of Julien, chantier C.11).** One exception: the game MUSIC is generated with the ElevenLabs music API (sources in `tools/art/music-src/`, listed by hash, see `PROVENANCE.md`). Nothing else may come from an AI or from outside: images, animations, font and sound effects stay made by the project's code.

3. No software and no downloaded content. You install and download no software, and nothing visible or audible comes from outside: no image, sprite, 3D model, tileset, texture, sound, music, font or asset pack; no AI that generates images or sounds. You do not copy from memory the sprites, characters or compositions of existing games. All artistic content is original and made by you, through code and data in the project. The tools you write to make it (the tools/ folder) are part of the project and are kept. Code tools are allowed: web libraries and engines, testing tools, the browser (even headless), scripts, everything you need, as long as they bring no ready-made artistic content (no sample packs, textures or sounds supplied with them). Each library used is justified in DECISIONS.md, listed in PROVENANCE.md (name, version, free license), and its copy lives in the project: the game uses no CDN and no network once loaded.

4. Only say "done" if it is verified (screenshot looked at, measurement, script, real test). Otherwise write "not verified".

5. Actually play the game, in a real browser: at least two long simulation games (at least 30 minutes of game time each, accelerated speed allowed), and keep a PLAYTEST.md journal (what you saw, what is ugly, what is broken, what you fixed).

6. Tests use real keyboard and mouse events sent to the browser, not just direct function calls.

7. Final review by an independent sub-agent that did not do the work: it opens the screenshots, launches the game in the browser, compares it to the target and lists the defects. You fix every defect it finds.

8. A placeholder is a real, readable sprite in the style, marked PROVISIONAL in the data. Never a colored rectangle or square.

9. Honest REPORT.md at the end: done / not verified / limits / remaining gaps toward the professional level.

10. Keep PROVENANCE.md up to date as you go: the list of every internal tool, every generator and every code library used (name, version, license), and the statement that the game contains no external artistic content, so that the AI-usage declaration required by distribution platforms is possible.

## PART 3 — DOCUMENTS TO PRODUCE FIRST (before the game code)

- CLAUDE.md: the rules of this prompt, copied in full, and the code conventions.
- BIBLE.md: the universe (name, tone, peoples, world history, eras), all the systems, the quantified final vision.
- DECISIONS.md: every important choice with its quantified alternatives (rendering method, libraries used, resolution, tile size, asset pipeline per category, pathfinding, etc.) and the sheets or measurements that justify it.
- STYLE.md: the quantified art direction (palette ramps, lighting, outlines, sprite sizes, scale of units relative to buildings).
- ARCHITECTURE.md: architecture of the simulation and of the rendering (data, loop, AI, background computation, performance).
- TOOLS.md: every internal tool (what it is for, how to run it, what it produces).
- IDEAS.md: remaining gaps and ideas.
- PLAYTEST.md, PROVENANCE.md, REPORT.md.
- RESUME.md: the handoff file, created at the very start and updated at every commit: the current step (out of the 14), what is finished and verified, what remains to do, what is blocked, and the precise next action. If you lose the thread, if your session is cut off, or if another agent takes over, work restarts from this file: read it first at the start of every session.

A single sprite size per entity class, written identically in all documents (an agent once wrote 16×24 in one document and 24×24 in another).

## PART 4 — THE GAME: ALL THE SYSTEMS

### 4.1 The world
- Tile map seen from above. Sizes chosen by the player: small, medium, large, giant (medium is at least 256×256 tiles).
- Procedural generation with a seed: deep and shallow oceans, beaches, plains, forests, jungles, deserts, savannas, swamps, hills, mountains, snow, ice, tundra, volcanoes and lava; rivers running down from mountains, lakes, islands, continents; natural transitions between biomes, without harsh staircase borders. At least 14 biomes in the final version, 8 complete biomes in this first pass.
- Configurable generation (size, share of water, number of continents, climate), with a preview before creation; empty world possible.
- Terrain can be modified live with brushes (round, square, line; sizes from 1 to 20 tiles and more): raise, lower, paint any ground, plant forests, draw rivers, dig, grow grass, fill with lava. Changes have consequences (flooded village, burned forest, a passage opened to another land).
- Saves in the browser: several slots, autosave, export and import of a world as a file. A reloaded world must be identical to the saved state (automated test).

### 4.2 The god's powers
- Toolbar by category, with no mana or resource: world creation, peoples, creatures, nature and disasters, destruction, divine powers, tools (select, follow, erase, map layers).
- Time speed: pause, ×0.5, ×1, ×2, ×5, ×10, ×50, stable at every speed.
- At least 100 powers in the final version, 30 polished in this first pass. Every power has an icon, an effect animation, a sound and a measurable effect.
- Natural disasters: rain, acid rain, storm and lightning, tornado, earthquake, volcanic eruption, meteorite, flood and tidal wave, drought, cold snap and glaciation, heat wave, fire that spreads according to ground and wind.
- Destruction: explosives of various strengths, nuclear bomb (mushroom cloud, fallout), acid, targeted lightning, erasing.
- Divine powers: blessing (healing, strength, fertility), curse, poison, plague, rage, madness, inspiration (give a trait to a unit), resurrection, death, teleportation, miracle (appearance of a prophet, of a weapon), war incitement (push a kingdom to declare war) and peace incitement.
- Direct control of a unit or of a giant creature: movement, attack, special abilities.

### 4.3 Peoples and their civilizations
- At least 6 playable peoples in the final version (humans, elves, dwarves, orcs, plus 2 original peoples of your invention), 2 complete and contrasting peoples in this first pass. Each people has its own traits (development speed, strength, fertility, longevity, tastes), a unique silhouette, a distinct kingdom color, its own way of building.
- Needs and behaviors: food, rest, housing, safety, social life, faith. Utility-based AI or behavior tree, readable and debuggable.
- Jobs (at least 20 in the end): lumberjack, miner, farmer, herder, hunter, fisher, builder, blacksmith, merchant, soldier, archer, priest, scholar, ruler, etc. The job is visible on the sprite (tool or equipment).
- Life cycle: birth, childhood, adulthood, old age, natural death; couples, families, children; inheritance of traits and genes (at least 40 traits in the end, with rare mutations); personalities; friendships, rivalries, love affairs.
- Resources and economy: wood, stone, food (crops, livestock, hunting, fishing), ores (at least 4, one of them rare), tools, weapons, armor; storage, production, consumption, shortages and famines; trade between towns and between kingdoms; roads that form where people walk; bridges over rivers.
- Progression: at least 6 stages of development (from nomad to advanced civilization) that change the look of buildings, tools and weapons.
- Buildings (at least 15 types in the end, in several stages per people): house, farm, sawmill, mine, forge, warehouse, market, temple, barracks, watchtower, wall and gate, port and shipyard, tavern, library, hospital, castle, palace. Visible construction sites, buildings that burn, collapse and leave ruins.
- Sea: boats, colonization of distant lands by sea.

### 4.4 Kingdoms, politics, culture, religion
- Villages become towns then kingdoms: capital, ruler (king or queen), succession, colored borders that evolve, expansion, colonization, stability and discontent.
- Diplomacy: numeric relations between kingdoms, alliances (with an alliance leader), non-aggression and trade treaties, betrayals, royal marriages, vassalage, wars and peace, rebellions, civil wars, independence, mergers.
- Clans: families of rulers who pass power down and have their rivalries.
- Cultures: each culture has values (warlike, mercantile, agrarian, scholarly…) that genuinely change the kingdom's behavior.
- Languages: names of people, places and kingdoms generated according to each culture's language, coherent, slowly evolving.
- Religions: founded by a unit (prophet), with beliefs (at least 12 dogmas in the end, each with an effect), temples, conversion, schisms, religious conflicts.
- History: dated chronicle of all important events, a browsable "history book", notable characters with titles (heroes, kings, prophets), a calendar with years and eras.

### 4.5 War
- Causes: resources, borders, religion, vengeance, a ruler's ambition, the god's incitement.
- Course: declaration, mobilization, armies with ranks (soldiers, archers, cavalry, siege machines, heroes and champions), battles that are readable on screen, sieges (walls, gates, towers, battering rams, catapults), damage to buildings, looting, capture of towns, refugees, morale and flight, wounds and healing, weapons according to the era, fire and poison.
- End of war: peace treaty, surrender, annexation, total destruction.
- The player reads the war on the map ("war zones" layer, fronts, armies on the march).

### 4.6 Fauna, flora, ecosystem, monsters
- Real, recognizable animals (herbivores, predators, birds, aquatic animals, small animals): at least 40 species in the end, 8 polished in this first pass. Food chains, reproduction, migration, hunting by civilizations, livestock.
- Flora: at least 25 types (trees by biome, grasses, flowers, mushrooms, crops) that grow, reproduce, burn and regrow. Diseases and mutations possible.
- Monsters (at least 20 in the end, 3 polished in this first pass): zombies with contagion (up to the apocalypse), skeletons, demons, dragons with a nest and a treasure, giants, golems, spirits, aliens of your invention, and an original colossal creature the player can control. Each has its own behavior, a warning gesture before attacking, a death animation.

### 4.7 Eras, weather, time
- World eras (at least 10 in the end, with original names) that change biomes, creatures and behaviors: for example ice age, age of ashes, age of darkness, golden age, age of chaos. Each era has a measurable effect and a visual and sonic atmosphere.
- Day and night cycle with dynamic lighting, weather (rain, snow, storm, fog, wind), seasons if they add to the gameplay.

### 4.8 Interface, camera, information
- Smooth zoom and panning (wheel, drag, keyboard, two-finger gesture on a touch screen), unit following, cinema mode.
- Clicking any entity opens its sheet: name, age, traits, family, kingdom, culture, language, religion, inventory, history.
- List and statistics windows: kingdoms, clans, alliances, religions, cultures, languages, notable characters; graphs of population, resources, power.
- Map layers: kingdoms, wars, alliances, religions, cultures, resources, population density; minimap.
- Live event log and history book.
- Options: resolution, fullscreen (through the browser), volume, language (French and English), keys remappable in game (physical key codes, compatible with AZERTY and QWERTY), interface size.
- Complete controls from day one: every action of the game reachable by keyboard and mouse, all keys in a configuration file.

## PART 5 — THE PIXEL ART DESIGN: THE MOST IMPORTANT POINT OF THE PROJECT

### 5.1 Visual ambition
The pixel art of this game must be EXCEPTIONAL. This is what will make the difference between yet another sandbox and a game people want to show off. Acceptance test: any screenshot, at any zoom, in any biome, by day or by night, must be able to pass for a screenshot from the store page of a very high-level commercial game. A world seen from afar must be magnificent like a living painting; seen up close, every unit, every tree, every roof must be polished, expressive and animated. Nothing may look generic, flat, repetitive, formula-generated or recolored. Beauty takes priority over quantity: better fewer sumptuous elements than many mediocre ones. If the result is not at that level, it is a blocking problem: you do not move on, you solve it.

You have no drawing software and no artistic file at your disposal: all the beauty comes from the quality of your making tools, your palette, your proportions and your eye. Art made by code without method gives flat, noisy, generic shapes; you avoid that trap by systematically looking at your enlarged sheets, correcting pixel by pixel in data, and never validating an asset you have not looked at.

### 5.2 Art direction (to be written in STYLE.md, with numbers)
- A palette of 64 to 96 colors organized in ramps of 5 to 7 tones per material, with hue shift (shadows toward blue-violet, highlights toward warm yellow; checked by script: the hue varies by at least 15° along each ramp). No pure black and no pure white.
- Each biome has a color identity recognizable from afar, not just variations of one hue. Measured on every screenshot: dominant color under 40%, water family under 60%.
- Vivid, saturated colors reserved for what must catch the eye (fire, magic, kingdoms, dangers); the terrain has a natural, slightly desaturated palette.
- Selective outline (thickness and color depending on material and light), never a uniform black line.
- Large clean masses of color of 3 to 4 tones per material; no isolated pixel without a reason to exist (highlight, rivet, window). Test: squint, the shapes stay readable. Count of isolated pixels measured before and after each touch-up.
- A single light direction across the whole game.
- Immediate readability: at first glance you tell one people from another, an animal from a monster, a building from a tree. Test: black-and-white sheet, all silhouettes must be distinguishable.

### 5.3 What to produce (at the targeted level)
- Terrain: tiles for each ground type with at least 3 variants per type, automatic joins between materials (47 cases for the main materials), soft transitions between biomes, cliffs and relief shadows, animated shores (waves, foam), water with reflections and movement, glowing lava.
- Vegetation and scenery: trees per biome with several variants, swaying in the wind, moving grass, flowers, rocks, ruins, bones, crops that grow in stages.
- Peoples: for each people, a unique and endearing silhouette with real volume (shoulders, back, equipment) and not a block; four directions (up, down, left, right); job variants visible through equipment; children, adults, elders; animations: walk (8 frames), idle (6), work (6 per job type), attack (6), hit (3), death (8), prayer, sleep, joy. The frames of a cycle must really differ (arms, legs, torso), not copies. Anticipation, impact, recovery, squash and stretch, secondary motion.
- Animals and monsters: a unique silhouette per species, movement specific to the species (walk, leap, undulation, flight, swim), warning gesture before the attack, death animation; never a recolor of the same silhouette; varied sizes.
- Buildings: each people has its architecture, evolving through the stages; construction in visible steps (scaffolding), chimney smoke, windows lit at night, flames and collapse when they burn or are destroyed, ruins.
- Effects (at least 25 types, drawn and animated): fire, smoke, explosions, nuclear mushroom cloud, lightning, rain, snow, fog, tornado, earthquake, shockwave, magic, healing, poison, discreet and adapted blood, combat sparks, dust, splashes. Screen shake, hit-stop, soft glows, light vignette; haze in the background only.
- Lighting: dynamic 2D lighting on the sprites (normal maps when useful), day and night, torches, fires and lava that light up their surroundings, simple cast shadows.
- Interface in coherent pixel art: icons drawn one by one (at least 100, each with its own silhouette readable in grayscale at real size), a pixel font drawn by you (French accents included, at least two sizes), windows animated on opening, visual and sound feedback on every action, logo, game icon and web app icons.
- Screens: title, world creation, options, loading, all polished.

### 5.4 How to make the assets: you freely choose the pipeline, category by category
For each asset category, you choose the pipeline that gives the most beautiful and most coherent result, or you mix several if a final unification pass makes them indistinguishable. All the pipelines are made by you: you write your own making tools (a code library may help you, never ready-made artistic content). Four pipelines exist:
- A. MODEL in 3D with your own rendering engine or a 3D rendering library if it helps you (CPU or WebGL, in tools/), then bake to pixel art. Models made of voxels, parametric meshes or implicit surfaces (smoothed organic shapes), skeleton and animation written by you. Rendering in orthographic view with fixed settings for the whole game, quantization by palette ramps, selective outline. This pipeline gives volumes that stay coherent from one frame to the next and lets you render the four directions without redrawing.
- B. PAINT IN DATA: sprites are written directly as pixel grids indexed on the palette, as an artist would place pixels one by one, with an internal tool that displays them enlarged (×8) so that you look at them, correct them and start again. Animation by keyframes and by articulated parts.
- C. GENERATE WITH ARTIST'S RULES: noise, erosion, cells, growth rules for trees and plants, ordered dithering for gradients, material rules (stone, wood, grass, water, lava). Everything goes through the palette ramps. Suited to terrain, vegetation, rocks, textures, clouds.
- D. TOUCH UP WITH PATCHES: after any generation or baking, a cleanup pass that fixes precise pixels, saved as data patches applied on top, so that everything stays reproducible.
Advice per category (a recommendation, not an obligation): animated peoples, animals and monsters = pipeline A with a D pass on the key poses; terrain, vegetation, rocks, water = pipeline C with a D pass; buildings, objects, interface, effects = pipeline B or A with a D pass.

### 5.5 Independence rule and internal tools (non-negotiable)
- No image, no model, no font and no sound comes from outside. Everything visible or audible comes from a source kept in the repository (model, pixel grid, generator with its seed, touch-up patches, score): rerunning the tool regenerates exactly the same file. No "magic" image without a source.
- Assets may be generated by code, provided they are regularly looked at and corrected following the method below. An asset never looked at enlarged is not validated.
- First build, in tools/, at least: a palette validator (colors outside the palette, ramps, hue rotation), a sheet viewer (×4 and ×8 enlargement, black-and-white silhouette mode, frame-to-frame difference for flicker, export of animations as successive frames), a sprite baker, a sound synthesizer and sequencer, measurement scripts. These tools are described in TOOLS.md.
- To look at a sheet, you really open it as an image (browser screenshot or image file written by your tools): reading file names is not enough.

### 5.6 Method for animated living beings (lessons already paid for)
1. Forbidden: a body assembled from cubes, cylinders and spheres without care. An agent did it: unreadable puppet, no visible arms or legs, 8 nearly identical frames, and the quantization crushed everything into 2 hues. A living being demands organic shapes (implicit surfaces, sculpted voxels, smoothed meshes), thought-out anatomy and proportions, separate articulated limbs, an expressive silhouette.
2. One single skeleton and one base model per morphology (humanoid, quadruped, bird, fish, reptile…), then all the variants (peoples, jobs, ranks, ages, related species) through proportions, separate accessories placed on the bones, colors and effects. This single base gives much better coherence from one frame to the next.
3. TWO validations on a sheet: the base model alone, then the modified version with accessories and equipment (black-and-white silhouette, proportions, accessories well placed, readability at game scale). A failed modification gives a failed asset.
4. Pixelization by RAMPS of 3 to 4 tones per material (fixed shading index), never by "nearest neighbor" to the global palette (that crushes everything into 2 hues and destroys the details).
5. Readable pose: silhouette recognizable in black and white, pose suited to the action.
6. Anti-flicker: a pixel that does not move keeps the same color from one frame to the next. Automated test that counts, for each animation, the pixels that change color without changing position, with a threshold that makes the test fail; before and after numbers in the report. A passing test does not prove it is beautiful: also look at the sheet and the successive frames.
7. Hand cleanup pass (pixel patches) on the key poses of each people and each main creature: outlines, highlights, color junctions, stray pixels. This is what separates a generated render from a professional sprite. In REPORT.md, for each asset, the corrections made (before and after on a sheet).
8. An object that is too poor once pixelized is repainted in data while keeping its silhouette.
9. When a render is ugly, do not conclude the method is impossible: open your own rendering code, your palette, your proportions, and fix the cause.

### 5.7 Test bench and unification (mandatory)
- Before producing anything in bulk: make the same subjects (a people, an animal, a tile with variants, a tree, a building) with at least two pipelines, put them side by side on a sheet enlarged ×4, LOOK at the sheet, choose the pipeline per category according to what you see (coherence, beauty, cost), and record the decision in DECISIONS.md with the sheet.
- Final unification pass on every asset, whatever its pipeline: same quantization to the palette, same outline treatment, same light direction.
- Before placing assets in the game: a global sheet of all the chosen assets side by side, really looked at. Written rejection criterion: outline, saturation, scale or style different from the rest = rejected or touched up.
- Measurements by script: colors outside the palette, black outline, saturation, size in pixels, contrast of terrain and units (at least 4 to 1 against each background), dominant color, hue rotation of the ramps, frame-to-frame flicker, isolated pixels.

## PART 6 — SOUND AND MUSIC

- All the sound is synthesized by YOUR code with the browser's audio APIs: no external sound file. Build an internal synthesis engine: oscillators, noise, filters, envelopes, modulation, delays and reverb, instrument modeling (plucked strings, flutes, bells, percussion, pads), then a music sequencer.
- Music: composed by you, with real writing (scales and modes, chord progressions, melodies with motifs and variations, counter-melodies, rhythms, structure in sections), not a string of beeps. At least 8 tracks in the end (menu, calm by day, night, war, disaster, per major climate family), mixed adaptively in layers: the music changes according to what happens on screen, with fades.
- Ambiences per biome (wind, waves, forest, desert, ice…), sound effects for construction, combat, disasters, animals, crowds, interface: at least 60 distinct sounds in this first pass, 120 in the end. Never the same noise repeated identically in a burst (variants and slight pitch variations).
- Measurements by script: even levels (no sound more than 6 dB louder than the others of its category), no clicks or clipping, spectrum and duration consistent with the intended sound.
- If you cannot listen, say so in REPORT.md: what you measured, and what remains to be judged by ear by Julien.

## PART 7 — TECHNIQUE, WEB AND PERFORMANCE

- Platform: recent web browser (latest versions of Chrome, Edge, Firefox, Safari). JavaScript (or TypeScript if you justify it); rendering with the browser APIs (Canvas 2D and/or WebGL2), directly or through a library if justified; sound with the browser's audio APIs; heavy simulation computation in background tasks (Web Workers). The game must not depend on any special server setting or header: it works hosted as-is on a plain static file host.
- Engine: you write your own or you rely on a library, your choice. Choose by quantified test bench, comparing at least two approaches (for example Canvas 2D, WebGL2 with batched rendering, and a rendering library) on the same test (a 256×256 tile map, 1,500 moving units); the decision goes in DECISIONS.md with the measurements.
- Performance targets on an average PC (4 cores, recent integrated graphics) in a recent browser: medium map with 1,500 living units at 60 frames per second or more; large map with 4,000 units at 30 frames per second or more thanks to levels of detail (simplified AI off screen, batched updates). No stutter longer than 50 ms measured in normal play (no allocations in the hot loop, typed arrays, column-oriented data). Real measurement, numbers in REPORT.md. If the targets are not reached, it is a blocking problem.
- Loading: first playable display in under 5 seconds on an average PC with an ordinary connection; total weight of the game measured and noted in REPORT.md (target under 40 MB). Assets are either baked into atlases by your tools, or generated at load with a cache in the browser; quantified decision in DECISIONS.md.
- Display: internal resolution that divides 1920×1080 exactly (candidates: 480×270, 640×360, 960×540), integer scaling with crisp rendering (no blur), scaling table (720p, 1080p, 1440p, 4K), tile size that divides both axes, measured apparent size of a unit; quantified decision in DECISIONS.md. Window resizing, high-density screens, fullscreen through the browser, "fill" mode, resolution choice in the options. Automatic pause when the tab is hidden.
- Fixed-step simulation, time speed independent of display, reproducible with the seed, no crash over several hours of accelerated play (automated endurance test).
- Efficient pathfinding (hierarchical grids or flow fields), spatial partitioning for neighborhoods, sharing of expensive computations.
- Saves: browser storage for the slots and autosave, export and import through a file.
- Data: all the content (peoples, buildings, jobs, animals, monsters, powers, eras, beliefs, traits, resources, recipes) lives in data files (JSON or equivalent) validated by a schema script. Adding content later must come down to adding data and their assets.
- Delivery: a complete static folder, playable by opening index.html (without a server if possible, for example with classic scripts or a single-file assembly) and hostable as-is; a very short launch page (README). You note in REPORT.md the browsers actually tested and those that are not.

## PART 8 — GAP TOWARD THE PROFESSIONAL LEVEL: PRIORITIZED REQUIREMENTS

Each requirement is proven by a screenshot looked at, a measurement or an automated test. Remaining gaps go in IDEAS.md.

Priority 1 (what blocks the game or its readability):
- No external artistic content and no network at runtime: verified by a script that walks the whole project and by the browser's network log (no request to the outside).
- Stable simulation: no crash in 2 hours of accelerated play, faithful save and load.
- Performance: 1,500 living units at 60 frames per second on a medium map, 4,000 at 30 frames per second on a large map, loading under 5 seconds, really measured in a browser.
- Readability: units, buildings, terrain and effects distinguishable at every zoom; contrast of units against the terrain of at least 4 to 1.
- Complete game loop that works end to end: world, people, village, kingdom, war, disaster.
- Controls, pause, speed, save, options.

Priority 2 (coherence):
- Palette, outlines, lighting and scales identical everywhere, measured.
- Stable animations, without flicker, with the requested frame counts.
- Coherent interface, distinct icons, readable text.
- Mixed, adaptive, varied music and sounds.
- Believable architecture, behaviors and world events (no people starving for no reason, no absurd looping wars).

Priority 3 (finish):
- Effects, shakes, hit-stops, glows, light post-processing.
- Transitions, title and loading screens, interface animations.
- Menus, options, accessibility (interface size, contrast, full key remapping), touch.
- Web app icons, launch documentation.

## PART 9 — PRO SLICE, DATA SKELETON, FINAL VISION

- Pro slice in this first pass, at the targeted level in beauty, animation, sound and feel: 2 complete peoples, 8 biomes, 8 animals, 3 monsters, 12 building types in 3 stages for each people, 30 powers, 20 effect types, 3 composed music tracks, the whole game loop.
- Complete skeleton in data: everything else of the final vision already exists in data files validated by script, with readable placeholder assets marked PROVISIONAL.
- Quantified final vision, to size the architecture: 6 peoples, 14 biomes, 40 animal species, 20 monsters, 100 powers, 10 eras, 60 traits, 12 dogmas, 15 building types in 5 stages, 20 jobs, 25 flora types, 120 sounds, 8 music tracks.
- All the systems of the game (world and terrain, god powers, peoples, economy, kingdoms, diplomacy, culture, languages, religions, history, war, fauna, flora, monsters, eras, weather, interface) are present at least in a minimal version that really works, from this first pass.

## PART 10 — ORDER OF WORK

Do not move to the next step until the previous one is verified (screenshot, measurement or test). One Git commit per step.
1. Documents, check of the test browser, rendering test bench (for example Canvas 2D against WebGL2) and asset pipeline test bench, quantified decisions.
2. Internal tools: palette validator, sheet viewer, sprite baker, synthesizer and sequencer, measurement scripts.
3. Quantified art direction: palette ramps, lighting, outlines, sizes, reference sheet.
4. World: generation, terrain, biomes, brushes, camera, basic performance.
5. A first complete people: animated units, jobs, needs, village, buildings, economy, life cycle.
6. Fauna, flora, ecosystem, monsters.
7. Kingdoms, diplomacy, war, clans.
8. God powers, disasters, effects, eras, weather, day and night.
9. Second people, culture, languages, religions, history.
10. Complete interface, sheets, lists, graphs, map layers, saves, options.
11. Sound and music, adaptive mixing.
12. Data skeleton for the rest of the final vision, with readable placeholder assets.
13. Title and loading screens, icons, delivery of the static folder.
14. Final verification. **RESERVED FOR A LATER AGENT: DO NOT DO IT NOW (see the scope block at the top).** **PARTLY DONE (state of the repository, see RESUME.md, BUGS.md, BALANCE.md, INVENTAIRE.md).** ALREADY DONE and kept done: every test robot at 100 % (`node tests/run-all.js` = 18/18 OK, real mouse and keyboard in the browser); a balance robot that plays 54 simulated games of 40 to 200 years and judges them against 91 written targets (`node tools/balance-bot.js battery`, 91/91 met); the bugs found by playing and by the robots repaired (`BUGS.md`); browser playtests at ×50 (2 h of game time, no error, no external request); language switch checked on screenshots; successive frames and silhouettes of the people sheets looked at. STILL TO DO, at the very end, AFTER the content steps 12 and 13 are finished: (a) screenshots at several zooms, in several biomes, by day and by night, of the final content; (b) the measurements of all priority 1, 2 and 3 requirements re-run on the final content (palette, flicker, contrast, isolated pixels, sound levels, weight, loading time) and real-hardware performance (the numbers so far come from software rendering, no GPU); (c) two real long games in a real browser, at least 30 minutes of game time each, journal in PLAYTEST.md; (d) the independent review by a sub-agent that did not do the work, then every defect it finds fixed; (e) the honest final REPORT.md (done / not verified / limits / remaining gaps) and the list of what Julien must judge himself (game feel, beauty, the music by ear).

## PART 11 — DELIVERABLES

- The web game launched and really tested in a browser, as a static folder, with its launch page.
- All the documents listed at the start, up to date.
- RESUME.md up to date: the exact state of the project and the next action to take.
- PLAYTEST.md: the games played, honest.
- REPORT.md: done, not verified, limits, performance and weight numbers, browsers tested, remaining gaps toward the professional level.
- Up-to-date screenshots and successive frames of the animations, comparison sheets of the pipelines and of the assets.
- Complete PROVENANCE.md and a check script that proves the absence of any external artistic content (only the listed code libraries are present).
- All asset sources (models, pixel grids, generators, patches, scores) and the tools/ folder with TOOLS.md, so that rerunning the tools regenerates the assets.
- A list of what Julien must judge himself (game feel, beauty, listening to the music), because a human test is worth more than any verification by script.
