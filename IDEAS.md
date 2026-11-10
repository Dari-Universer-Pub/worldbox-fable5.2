# IDEAS — remaining gaps and ideas (kept honest, updated at each step)

- Normal-mapped sprite lighting (the SDF baker can export normals) — not planned for the first pass; lights currently tint sprites uniformly.
- Rendering library comparison (PixiJS-class) could not be benchmarked offline.
- People sprites: `tools/measure-sprite.js people_human` still reports 7.2% isolated pixels and flicker failures on moving animations (pray, death, attack); no hand patch file (`tools/art/patches/people.json`) has been written yet — key poses are still the raw bake.
- Buildings: windows stay lit on construction frames; no chimney smoke until the effects module; walls/gates are baked but the town planner does not build them yet.
- Villagers do not show what they carry.
- Fauna: rabbit sprite unreadable at 16×16; eagle and salmon are minimal rigs; no migration by season, no livestock pens (herders hunt sheep like game); animals do not flee fire yet. Dragon and the colossus are not made (step 12 placeholders).
- Monsters reuse the humanoid rig with a single look; the warning gesture is the wind-up of the attack animation (2 frames), not a dedicated animation.
- War: no cavalry, siege engines, heroes, morale or refugees; town capture and annexation are implemented (`T.onHallLost`) but were never observed in a test run; no "war zones" layer yet. Diplomacy has no mergers and no alliance leader. Clans exist (succession, dynasty changes) but have no rivalries of their own.
- Economy: no bridges; roads appear where people walk (ground `road`) but were not looked at up close.

## After step 8
- Effects: splash, blood, acid and crack are small and thin; rain streaks should be longer and have ground splashes; scorched ground should use a drawn tile set with 47-case joins instead of shader cells; clouds should cast soft shadows.
- Hit-stop only freezes animation time on the client (the simulation keeps running).
- Flood is a temporary ring of shallow water, not a real water simulation; tidal wave from the sea is not directional.
- Direct control has no on-screen hint; special abilities per creature are minimal.
