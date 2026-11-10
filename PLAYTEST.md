# PLAYTEST — journal

## Step 4 — first look at the world (headless Chromium, 1280×720)
- Saw: continents with mountain ranges, peaks, rivers, a volcano with lava, savanna/forest/plains. Far view (zoom 0.25) reads like a painted map.
- Ugly, fixed: relief shading drew dark squares per tile → bilinear blend with 2 px jitter in the shader; rivers were pure white foam lines → rivers flagged, no foam, 2 tiles wide downstream; mountains were a grey floor → peak sprites (3 variants + snow caps); biome borders were straight latitude lines → climate noise ×3.
- Still to do: no inhabitants yet, no UI.
