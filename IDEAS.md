# IDEAS — remaining gaps and ideas (kept honest, updated at each step)

- Normal-mapped sprite lighting (the SDF baker can export normals) — not planned for the first pass; lights currently tint sprites uniformly.
- Rendering library comparison (PixiJS-class) could not be benchmarked offline.
- People sprites: `tools/measure-sprite.js people_human` still reports 7.2% isolated pixels and flicker failures on moving animations (pray, death, attack); no hand patch file (`tools/art/patches/people.json`) has been written yet — key poses are still the raw bake.
- Buildings: windows stay lit on construction frames; no chimney smoke until the effects module; walls/gates are baked but the town planner does not build them yet.
- Villagers do not show what they carry.
- Fauna: rabbit sprite unreadable at 16×16; eagle and salmon are minimal rigs; no migration by season, no livestock pens (herders hunt sheep like game); animals do not flee fire yet. Dragon and the colossus are not made (step 12 placeholders).
- Monsters reuse the humanoid rig with a single look; the warning gesture is the wind-up of the attack animation (2 frames), not a dedicated animation.
