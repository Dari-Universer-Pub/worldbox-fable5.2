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

## After step 9
- Orc buildings: give each trade its own shell (not only props); hand patches on skulls and horns.
- Languages: grammar for kingdom names (compound forms), bynames for rulers ("the Bold"), script glyphs per culture.
- Religions: holy sites as pilgrimage targets, religious buildings per faith, more than one prophet title; dogma effects on build speed, trade and courage are not hooked.
- Chronicle through i18n keys with arguments instead of English sentences.

## After step 10
- Interface: selection marker and path preview on the map, drag to move windows, search in lists, pinned sheets, relation matrix between kingdoms, family tree view, tutorial hints for first-time players.
- War layer with fronts and army arrows; religion/culture legends inside the layer; minimap modes.
- Weak icons to redraw: creatures (paw), peace (dove), import/export, culture (vase), flood.
- Touch: long-press tooltips, bigger hit areas at interface size x2.

## After step 11
- Sound must be listened to and re-voiced by ear; the war track needs a real brass/choir timbre; per-climate tracks (ice, desert, jungle), a disaster track, a title theme, stingers for ages and victories.
- Reverb sends per bus, ducking of music under large explosions, footsteps per ground, voices per people (pitch/formants from the language data).

## Après les réparations (dépôt Sonnet)
- Équilibrage humains/orques (les orques gagnent presque toujours), armées plus grandes, vraies batailles lisibles.
- Retouches pixel à la main des poses clés (scintillement des animations d'action, pixels isolés des orques).
- Feu : les incendies naturels sont maintenant rares (surtout la foudre sèche des ères chaudes) ; régler la fréquence si on veut plus de feux de forêt.
- Forêts : elles dépassent maintenant 150 % de leur niveau de départ ; prévoir une densité maximale ou des maladies/abattage.
