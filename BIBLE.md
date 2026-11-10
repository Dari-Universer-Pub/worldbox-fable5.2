# BIBLE — AEONLOOM

## 1. Name, pitch, tone
**Aeonloom** — *you are the Weaver; the world is your cloth.*
A top-down pixel-art god sandbox. The player has no mana, no score, no goal other than curiosity: shape the land, seed life, watch peoples build, pray, trade, betray and fight, and step in whenever the urge comes.
Tone: a warm, slightly melancholy fable. The world is called **the Weft**; every age leaves a thread in it. Nothing is grimdark; violence is readable but discreet; humour comes from the little lives (a king dying of a rabbit bite belongs in the chronicle).

## 2. The peoples (6 in the final vision; ★ = complete in the first pass)
| id | Name | Silhouette | Temper | Architecture | Default kingdom ramp |
|---|---|---|---|---|---|
| human ★ | **Humans** | balanced, round head, straight back | adaptable, fast developers, fertile | timber frame, plaster, red tile roofs; stone later | red |
| orc ★ | **Orcs** | broad shoulders, hunched, low head, tusks | strong, warlike, short-lived, hardy | hide tents, bone and dark wood, spiked palisades, round forts | jungle (green) |
| elf | **Elves** | tall, slim, long ears, long hair | slow, long-lived, scholarly, forest-bound | living wood, leaf canopies, spires | teal |
| dwarf | **Dwarves** | short, very wide, big beard, helmet | miners, smiths, stubborn, slow breeders | carved stone, low halls, copper roofs | fire (gold) |
| myrrin | **Myrrin** (original) | mushroom-capped bog folk, tiny legs | peaceful, fertile, love swamps, hate fire | grown caps and stalks, glowing gills | magic (violet) |
| okari | **Okari** (original) | tall crane folk, long neck, beak, cloak | sailors, traders, coast-loving, fragile | stilt huts, reed roofs, sails and poles | royal (blue) |

People traits in data: `devSpeed, strength, fertility, lifespan, maturity, speed, courage, likesBiomes, hatesBiomes, diet, buildSet`.

## 3. World history frame (the ages)
The Weaver's ages change climate, creatures and tempers. Ten ages in the final vision (★ = active effects in first pass):
1. **Age of the First Thread** ★ — neutral dawn. 
2. **Age of Gilded Sheaves** ★ — golden age: +30% crop growth, +20% fertility, relations drift up.
3. **Age of Iron Oaths** ★ — war age: ambition ×2, war weariness halved.
4. **Age of Long Frost** ★ — ice age: temperature −2 bands, snow spreads, crops −50%.
5. **Age of Cinders** ★ — ash: volcano activity ×4, fires spread ×2, dim red light.
6. **Age of Veiled Stars** ★ — darkness: nights twice as dark, monsters rise from graves.
7. **Age of Frayed Skies** — chaos: storms, madness, mutations ×5.
8. **Age of Deep Tides** — sea level +1, rain ×3.
9. **Age of Verdance** — forests spread ×3, animals ×2.
10. **Age of Quiet Looms** — peace and decline: births −30%, wars rare, scholars ×2.
An age lasts 40–90 years; the next one is drawn by weight, or forced by a god power.

## 4. Time and scale (identical in every document)
- Simulation step: 10 ticks per game second at ×1 (`TICK_HZ = 10`).
- **Day = 300 ticks** (30 s at ×1). **Year = 4 days = 1200 ticks** (one day per season: spring, summer, autumn, winter).
- Speeds: pause, ×0.5, ×1, ×2, ×5, ×10, ×50.
- Tile = 8×8 px. Maps: small 128², medium 256², large 384², giant 512² tiles.
- Sprite cells: people unit 24×24; humanoid monster 24×24; small animal 16×16; large animal 24×24; great animal 32×32; large monster 48×48; colossus 64×64; building 48×48; great building 64×64; tree 24×32; small flora/decor 16×16; icon 16×16; effect frame 16×16, 32×32 or 64×64.

## 5. Systems (all present from the first pass, at least minimal)
### 5.1 World and terrain
Per tile: ground type, height (0–255), feature (flora/rock/ruin + growth), fire, wetness, road wear, owner town, flags. 18 ground types cover 14 biomes: deep ocean, shallow ocean, beach, plains, forest, jungle, desert, savanna, swamp, hills, mountains, snow, ice, tundra, volcanic (+ lava, river, farmland, road as ground overlays). Generation from a seed: continents (domain-warped noise, n centres), temperature (latitude + height), moisture (noise + distance to water), rivers by steepest descent from mountains with lake filling, biome by Whittaker-style table, 1-tile islands removed, coasts smoothed. Options: size, water share, continents, climate (cold/temperate/hot/chaotic), empty world.
Brushes: round, square, line; sizes 1–24. Tools: raise, lower, paint ground, plant forest, river, dig, grass, lava, erase.
Consequences: water floods lower neighbours (flow simulation on shallow water), lava burns, removing a mountain opens a path (pathfinding regions recomputed), flooding drowns buildings.
### 5.2 God powers (100 final, 30 polished first pass)
Categories: World, Peoples, Creatures, Nature & Disasters, Destruction, Divine, Tools. No mana. Each power: icon, effect animation, sound, measurable effect (listed in `src/data/powers.json`, field `measure`).
### 5.3 Peoples
Needs: food, rest, shelter, safety, social, faith (0–100 each). Utility AI: every candidate action gets a score from needs, job, traits, danger; the best is executed; the choice and scores are visible in the unit sheet (debug line).
Jobs (20 final): lumberjack, miner, farmer, herder, hunter, fisher, builder, blacksmith, merchant, soldier, archer, priest, scholar, ruler, healer, sailor, knight, engineer, bard, gatherer.
Life: birth → child (until maturity) → adult → elder → death; couples, children inherit people + mixed traits with 3% mutation; 60 traits final (40+ active first pass); friendships/rivalries as small relation lists.
Economy: wood, stone, food, copper, iron, gold, aetherite (rare), tools, weapons, armor. Town stock; production buildings; consumption; famine when food < 0; caravans between towns; roads from wear; bridges on narrow water.
Development stages (6): Nomads → Hamlet → Village → Town → City → Realm of Wonders; they gate buildings and change building look (3 visual stages first pass, 5 final), tools and weapons.
Buildings (15+ final, 12 first pass ×3 stages ×2 peoples): house, farm, sawmill, mine, forge, warehouse, market, temple, barracks, watchtower, wall+gate, port, tavern, library, hospital, castle/palace (town hall).
Sea: fishing boats, transport ships for settlers and armies.
### 5.4 Kingdoms, politics, culture, religion
Town → kingdom (capital + towns), ruler with clan, succession by heir of the clan else election by renown; borders = owned tiles, coloured. Stability and loyalty per town; rebellion → new kingdom or civil war.
Diplomacy: relation −100..100 per pair; states: war, peace, non-aggression pact, trade treaty, alliance (leader = strongest), vassalage, royal marriage; betrayal possible when ambition > honour.
Cultures: values vector {war, trade, land, lore, faith, sea} 0–1 that weights the kingdom AI (budget of soldiers, caravans, farms, libraries, temples, ports). Cultures drift and split with distance.
Languages: per culture a phonology (consonant/vowel sets, syllable shapes, endings) that generates person, town, kingdom names; sound-shift mutations every few decades.
Religions: founded by a prophet; 2–3 dogmas out of 12 (each a rule modifier); temples spread faith; schisms; holy wars.
History: every important event is a dated chronicle entry; notable characters keep a biography; ages in the calendar.
### 5.5 War
Causes: border friction, resources, religion, vengeance, ambition, god incitement. Declaration → mobilisation (soldiers gather at barracks, army entity with ranks: soldiers, archers, cavalry, siege rams/catapults, hero) → march (flow field) → battle (morale, flight, wounds) → siege (walls/gates/towers have HP, rams and catapults) → loot/capture/raze → peace (treaty, surrender, annexation) by war score and weariness.
### 5.6 Fauna, flora, monsters
Animals (40 final, 8 polished): rabbit, deer, sheep, boar, wolf, bear, gull, fish ★ + 32 in data. Food chain (grass → herbivore → predator), breeding, herd/pack, migration by season, hunted by peoples, sheep as livestock.
Flora (25 final): trees per biome (oak, pine, birch, palm, jungle giant, acacia, willow, snow pine, dead tree, cactus), bushes, grasses, flowers, mushrooms, reeds, crops (wheat, roots). Growth stages, seeding, fire, regrowth.
Monsters (20 final, 3 polished): zombie ★ (contagion), dragon ★ (nest + hoard), **the Tarn-Colossus** ★ (original, a walking hill of moss and stone the player can control) + skeleton, demon, giant, golem, spirit, Voidling (alien)… in data.
### 5.7 Ages, weather, day/night
Ages above. Weather cells: clear, rain, snow, storm, fog, wind. Seasons modulate crops, temperature and migration. Day/night lighting with torches, fires, lava and windows as light sources.
### 5.8 Interface
Top bar (date, age, population, speed), bottom toolbar by category, minimap, sheets for every entity, list windows, graphs, map layers, event log, history book, options (resolution, fullscreen, volume, FR/EN, key remap, UI size), saves (slots, autosave, export/import).

## 6. Quantified final vision (sizes the architecture)
6 peoples · 14 biomes · 40 animal species · 20 monsters · 100 powers · 10 ages · 60 traits · 12 dogmas · 15 building types × 5 stages · 20 jobs · 25 flora types · 120 sounds · 8 music tracks.
Capacity: 8,192 entities, 2,048 buildings, 256 towns, 64 kingdoms, 32 religions, 32 cultures, maps up to 512×512.
First-pass pro slice: 2 peoples (humans, orcs) · 8+ biomes · 8 animals · 3 monsters · 12 building types × 3 stages × 2 peoples · 30 polished powers · 20 effect types · 3 music tracks · full game loop.
