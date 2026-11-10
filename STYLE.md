# STYLE — quantified art direction of Aeonloom

## Palette (source: `tools/make-palette.js` → `tools/art/palette.json`, sheet `shots/palette.png`)
- **96 colours = 16 ramps × 6 tones** (tone 0 darkest … 5 lightest). No pure black, no pure white (darkest luminance 30/255, lightest 246/255).
- Hue shift on every ramp: shadows turn toward blue-violet, lights toward warm yellow. Validator `tools/validate-palette.js` enforces ≥ 15° of hue travel per ramp (measured: 34° minimum on *sand*, 195° maximum on *stone*), monotonic luminance and a minimum distance of 6 RGB units between any two colours.

| # | ramp | role | hue travel |
|---|---|---|---|
| 0 | grass | plains, leaves in light | −102° |
| 1 | forest | forest floor, tree canopies, pines | −96° |
| 2 | jungle | jungle, vivid growth, orc kingdom | −110° |
| 3 | sand | beaches, desert, straw, plaster, bone | 34° |
| 4 | earth | soil, wood, hair, leather | 66° |
| 5 | stone | rock, mountains, steel, UI frames | −195° |
| 6 | water | oceans, rivers | −66° |
| 7 | ice | snow, ice, clouds, foam | −166° |
| 8 | skin | human skin, clay | 51° |
| 9 | red | roofs, blood, danger, human kingdom | 59° |
| 10 | fire | fire, gold, lava, lit windows (emissive) | 48° |
| 11 | magic | divine powers, myrrin | 56° |
| 12 | swamp | swamp, tundra moss, zombies | −145° |
| 13 | teal | healing, elves, shallow tropical water | −72° |
| 14 | royal | banners, okari, night accents | −64° |
| 15 | pink | flowers, flesh, coral | 70° |

- Terrain uses the natural ramps (grass, forest, sand, earth, stone, water, ice, swamp), saturation ≤ 66%. Saturation above 70% is reserved for fire, magic, jungle accents, kingdoms and dangers.
- Biome identity: plains = grass ramp; forest = forest ramp; jungle = jungle ramp; desert = sand 3–5; savanna = sand 2–3 + swamp 4; swamp = swamp ramp + water 1; hills = grass 1–2 + stone; mountains = stone; snow = ice 4–5; ice = ice 2–3; tundra = stone 3 + swamp 4; volcanic = stone 0–1 + earth 0 + fire.
- Screenshot rules (script `tools/measure-shot.js`): dominant colour < 40% of pixels, water family < 60%.

## Indexed pixels
Every asset pixel is a palette index. Reserved indices: 128–133 **team ramp** (replaced at draw time by the kingdom's ramp), 144–149 **emissive** (fire ramp, always glowing), 150–155 **windows** (lit like the emissive ramp at night, dark glass from the water ramp by day), 255 transparent.

## Light
- One light for the whole game: from the **top-left of the screen**, elevation ≈ 50° (baker constant `LIGHT`, used by the SDF baker and by every 2D generator).
- Cast shadows fall to the bottom-right; ground shadows are drawn in game as flattened silhouettes (shadow colour = stone 0 at 35% alpha).
- Shading by **ramps, 3–4 tones per material** selected by a fixed shading index (N·L thresholds −0.05 / 0.38 / 0.80 for 4 tones; 0.05 / 0.62 for 3 tones). Never nearest-colour quantisation.

## Outline (selective) and the contrast rule
- 1 px outside the silhouette, **coloured ink**: tone 0 of the dark "ink" ramp of the material's colour family (`tools/lib/mats.js` INK table: greens → forest 0, wood/skin/sand → earth 0, stone/steel → stone 0, ice/water → water 0, reds/fire → red 0…). Never a uniform black line: a sprite always mixes several inks (measured: 0 "uniform-outline" frames).
- Top edges (facing the light) use ink tone 1; all other edges ink tone 0. Every ink tone 0 has a relative luminance ≤ 0.012.
- Inner contour: where a nearer part overlaps a farther one (depth gap ≥ 1.5 px), the far pixel under/right of it is darkened by one tone.
- Terrain tiles, water, grass tufts, flowers and crops have no outline.
- **Contrast rule (measured, `tools/reference-sheet.js`)**: every walkable ground texture keeps a mean relative luminance ≥ 0.20 (measured 0.200 volcanic … 0.874 snow); with inks ≤ 0.012 this guarantees a WCAG contrast ≥ 4:1 between a unit's ink mass (≥ 12% of its pixels) and any ground. Measured worst case 4.16:1 (volcanic), best 15.4:1 (snow). Dark moods come from tree canopies and lighting, not from dark floors.

## Masses and pixels
- 3–4 tones per material in large clean masses. Isolated pixels (a pixel with no 4-neighbour of the same colour) are counted by `tools/measure-sprite.js`; allowed only for eyes, highlights, rivets, windows.
- Dithering only as ordered 2×2 patterns in terrain transitions and big effects; never on units.

## Camera of the 3D bakes
Orthographic, looking down **35°** below the horizontal (vertical scale 0.82, depth scale 0.57). Units are baked in 4 yaws (down, left, up, right); buildings in one (front).

## Sizes (one per entity class — identical in every document)
| class | cell | typical body |
|---|---|---|
| people unit | **24×24** | 11 wide × 17 tall |
| humanoid monster | **24×24** | |
| small animal | **16×16** | rabbit 7×6 |
| large animal | **24×24** | deer 17×16 |
| great animal | **32×32** | bear 22×18 |
| large monster | **48×48** | dragon |
| colossus | **64×64** | |
| building | **48×48** | house 30×27, footprint 3×2 tiles (the sprite may overhang its footprint by one tile) |
| great building | **64×64** | hall, temple, tall towers; footprint up to 4×3 tiles |
| tree | **24×32** | |
| small flora / decor | **16×16** | |
| icon | **16×16** | |
| effect frame | **16×16**, **32×32** or **64×64** | |
| tile | **8×8** (ground textures are 32×32 seamless = 16 tile variants) | |

Scale: an adult is 17 px tall, a house door 10 px, a house 32 px, an oak 30 px. A unit is two tiles tall.

## Readability rules
- Silhouette test (sheet in black on white): peoples, animals, monsters, buildings and trees must be told apart.
- Contrast: for each ground type, the best contrast between the ground's mean colour and (a) the unit's outline or (b) its largest light mass must be ≥ 4:1 (WCAG ratio), measured by `tools/measure-contrast.js`.
- Kingdom colour shows on the clothing mass (≥ 15% of the unit's pixels) and on roofs' banners.

## Rejection criteria (global sheet)
An asset is rejected or patched when: its outline is black or missing; it contains an off-palette colour; its light comes from another side; its saturation is above its family's cap; its scale breaks the table above; it has unjustified isolated pixels; its silhouette is confused with another class.

## Reference sheet
`shots/reference-sheet.png` (looked at): 12 grounds with their tree, small flora and both peoples at true relative scale. `shots/terrain-textures.png`, `shots/flora.png`, `shots/people-overview.png` are the per-category sheets.
