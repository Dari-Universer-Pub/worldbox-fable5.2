# PLAYTEST — journal

## Step 4 — first look at the world (headless Chromium, 1280×720)
- Saw: continents with mountain ranges, peaks, rivers, a volcano with lava, savanna/forest/plains. Far view (zoom 0.25) reads like a painted map.
- Ugly, fixed: relief shading drew dark squares per tile → bilinear blend with 2 px jitter in the shader; rivers were pure white foam lines → rivers flagged, no foam, 2 tiles wide downstream; mountains were a grey floor → peak sprites (3 variants + snow caps); biome borders were straight latitude lines → climate noise ×3.
- Still to do: no inhabitants yet, no UI.

## Step 5 — first village (headless Chromium, robot `tests/step5.js`, x50)
- Saw: 12 humans dropped on grass found a hamlet around a hide tent, build round huts, farms with wheat, then at stage "village" timber houses, a chapel, market stalls, a mine, a port. 26 inhabitants after 20,000 ticks, nobody starved. At night the simulation sends them home.
- Broken, fixed: the whole village starved (they went to eat only at hunger 63 and slept through the night hungry; crops never grew on their own; villagers never socialised so no couples and no births). Now hunger outranks sleep and work, fields ripen in about a year, evenings are for meeting at the centre, births stop when children exceed 70% of adults.
- Ugly, fixed: roofs swallowed the facades (kit now stretches walls and lowers roofs), buildings were 24 px wide (scale ×1.3), soldiers' swords and shields were invisible, profiles had no face.
- Still ugly: tree stumps pile up around the village (regrowth comes with flora in step 6); stage-0 huts are small next to the villagers; sleeping/working units simply vanish into buildings; no smoke yet.
