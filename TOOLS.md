# TOOLS — internal tools of Dustcrown (all written in this project)

| tool | purpose | run | output |
|---|---|---|---|
| `tools/lib/img.js` | indexed-image class, PNG encoder/decoder (own code, Node zlib for DEFLATE) | library | — |
| `tools/lib/sdf.js` | **sprite baker** (pipeline A): implicit-surface ray marcher, fixed camera (35°) and light, ramp quantisation, selective outline, inner contours, pixel decals, material patterns, clip function | library | — |
| `tools/lib/mats.js` | materials from palette ramps (normal, team, emissive) | library | — |
| `tools/art/rigs/humanoid.js` | humanoid skeleton, proportions, accessories, 12 animations | library | — |
| `tools/art/rigs/quadruped.js` | quadruped skeleton and animations | library | — |
| `tools/make-palette.js` | palette source → `tools/art/palette.json` | `node tools/make-palette.js` | palette.json |
| `tools/validate-palette.js` | palette validator (count, ramps, hue rotation ≥ 15°, luminance order, pure black/white, off-palette pixels in PNGs) | `node tools/validate-palette.js [png…]` | report, exit code |
| `tools/bench/render-bench.html` | rendering bench Canvas 2D / WebGL2 | open in browser, `runBench()` | numbers (DECISIONS D1) |
| `tools/bench/pipeline-bench.js`, `people-a.js` | asset pipeline bench sheets | `node tools/bench/pipeline-bench.js` | `shots/bench-*.png` |

| `tools/lib/atlas.js` | atlas of named indexed frames (pack, save `.png/.bin/.json`, load) | library | `assets/<name>.*` |
| `tools/lib/measure.js` | measurements: isolated pixels, flicker (shift-compensated), outline stats, saturation, WCAG contrast, readable-mass contrast | library | — |
| `tools/lib/font.js`, `tools/lib/text.js`, `tools/art/font.js` | the pixel font "Loomscript": glyph source (5×7 caps), accent composer, EPX-enlarged large size, text drawing for sheets | library | — |
| `tools/sheet.js` | **sheet viewer**: enlarged sheets ×4/×8, `--silhouette` black-on-white, `--diff` frame-to-frame flicker map, `--frames` export of successive frames, `--bg` grounds, `--labels` | `node tools/sheet.js <atlas> --match walk --scale 8 --diff` | `shots/sheet-*.png`, `shots/frames/` |
| `tools/measure-sprite.js` | isolated pixels, flicker per animation with thresholds (fails the run), uniform-outline detector, saturation, `--contrast` vs 8 grounds | `node tools/measure-sprite.js <atlas> --contrast` | report, exit code |
| `src/client/audio.js` | **synthesizer and sequencer** (ships in the game): oscillators, 3 noise colours, filters with envelopes, ADSR, FM, vibrato, tremolo, pan, generated-IR reverb, Karplus-Strong strings, instruments, pattern sequencer with sections and layers, adaptive mixer, ambience beds | in game | — |
| `tools/measure-audio.js` | renders every sound variant and track with OfflineAudioContext in headless Chromium; peak, loudness, clipping, clicks, duration, spectral centroid; category level check (6 dB) | `node tools/measure-audio.js --music` | report, exit code |
| `tools/lib/schema.js` | mini schema checker used by `tools/validate-data.js` | library | — |
| `tools/check-provenance.js` | walks the project: forbidden media/model/font types, images only in generated folders and matching the bake manifest, no external URL or network API in `game/` | `node tools/check-provenance.js` | report, exit code |

Self-test of the viewer and measures: `shots/tooltest-diff.png`, `shots/tooltest-sil.png` (looked at).
Added in later steps: bakers per category, `bake-all.js`, `build.js`, `validate-data.js`, screenshot measures.

| `tools/bake-terrain.js`, `tools/bake-flora.js` | pipeline C generators: 32×32 seamless grounds, 47-case transition masks, trees, small flora, rocks, peaks | `node tools/bake-terrain.js` | `assets/terrain.*`, `tmask.*`, `flora.*` |
| `tools/bake-people.js` + `tools/art/peoples.js` | every people × look × animation × direction from the humanoid rig (4 worker threads, cache in `tools/.cache`); decals for eyes (front and profile) and tusks; last anti-flicker pass `settle()` on the finished frames (chantier C.1); patches from `tools/art/patches/people.json` (exact keys or `*` patterns, entries `[x, y, colour, expected colour]`; readable source `tools/art/patches/people-src.js`) | `node tools/bake-people.js [human orc]` | `assets/people_<people>.*` |
| `tools/bake-buildings.js` + `tools/art/buildings.js` | SDF construction kit (boxes, cylinders, prisms, pyramids, cones, material patterns: thatch, shingles, tiles, planks, stone…), 16 types × 3 stages; per sprite: finished, 2 construction frames (clip plane + scaffolding), ruin (jagged clip, rubble, soot); site markers; automatic 48→64 cell when a sprite does not fit; smoke/light anchors in the frame data | `node tools/bake-buildings.js` | `assets/buildings.*` |
| `tools/bake-ui.js` | font atlases and far-view marks | `node tools/bake-ui.js` | `assets/font*.*`, `marks.*` |
| `tools/bake-all.js` | runs every baker then the build | `node tools/bake-all.js` | `assets/`, `game/` |
| `tools/build.js` | concatenates sources per `tools/build-manifest.json`, embeds data and atlases, writes `game/` and `tests/sim-bundle.js` | `node tools/build.js` | `game/` |
| `tools/people-sheet.js`, `tools/reference-sheet.js` | overview sheets (all looks; `--sil` silhouettes) | `node tools/people-sheet.js human,orc out.png` | `shots/*.png` |
| `tests/town-run.js` | headless town survival run with stocks, jobs wanted/held and buildings printed every 1,000 ticks | `node tests/town-run.js 30000 <seed> 12 [--quiet]` | TOWN OK / FAIL |
| `tests/step4.js`, `tests/step5.js`, `tests/shot.js`, `tests/run-all.js` | browser robots (real mouse/keyboard), screenshot helper, everything at once | `node tests/run-all.js` | `shots/step*.png` |
| `tools/bake-cavalry.js` + `tools/art/cavalry.js` | cavalry (chantier B.4): the rider of each people (humanoid rig, seated, lance and kite shield) merged with a war horse (quadruped rig, caparison in the kingdom colour): idle, walk, attack, hit, death → atlas `cavalry` (32×32, keys `<people>/rider/<anim>/<dir>/<i>`). `node tools/bake-cavalry.js [people…]` |
| `tools/bake-machines.js` + `tools/art/machines.js` | siege machines (chantier B.4): covered battering ram and catapult, 4 directions, move (4 frames), attack (6), wreck (1) → atlas `machines` (48×48, keys `machine/<ram|catapult>/<anim>/<dir>/<i>`). `node tools/bake-machines.js` |
| `tools/art/rigs/humanoid-war.js` | war accessories and poses registered into the humanoid rig (healer, engineer, hero, champion, refugee, warrior, halberdier). The people bake cache is per look: only looks whose definition changed are re-baked |
| `tools/bake-boats.js` + `tools/art/boats.js` | boats (chantier B.2) modelled as implicit surfaces: fishing boat (32×32 cell) and transport ship (48×48), 4 directions × 4 frames of swell, team-colour band on the sail → atlas `boats` (`assets/boats.*`, keys `boat/<fishboat|ship>/<dir>/<0..3>`). `node tools/bake-boats.js` |
| `tools/bake-creatures.js` + `tools/art/creatures.js` | animals from the quadruped rig (three-quarter views for up/down) and the small bird and fish rigs: 8 species × idle/walk/run/eat/attack/hit/death/sleep | `node tools/bake-creatures.js` | `assets/creatures.*` |
| `tests/eco-run.js` | headless ecosystem run: species census every 5,000 ticks, extinction/explosion check, flora counts, zombie outbreak against a village | `node tests/eco-run.js 20000 7` | ECO OK / FAIL |
| `tests/war-run.js` | headless kingdoms run (humans and orcs 44 tiles apart): prints the chronicle; fails if there is no war, no battle, no end of war, no succession, or more than 12 wars | `node tests/war-run.js 40000 <seed> [--quiet]` | WAR OK / FAIL |

## tools/bake-fx.js (+ tools/art/fx.js)
Effects baker. `node tools/bake-fx.js` renders every procedural effect of `tools/art/fx.js` (115 types, 550 frames since A.7; first set: fire, smoke, explosions, mushroom cloud, lightning, tornado, rings, sprays, state icons, rain cloud, weather particles) into the atlas `assets/fx.*` with frames named `fx/<name>/<i>`. Look at them with `node tools/sheet.js fx --match <regex> --scale 4 --out shots/x.png`. Included in `node tools/bake-all.js`.

## tests/powers-run.js, tests/step8.js
`node tests/powers-run.js`: headless, 34 cases, each power must change a measured quantity; checks determinism. `node tests/step8.js`: browser robot using real clicks/drags/keys for the powers, writes `shots/step8-*.png`.

## tests/culture-run.js, tests/step9.js
`node tests/culture-run.js [ticks] [seed] [--quiet]`: headless run of two peoples; checks cultures, languages, religion founding, dogma modifiers, schism, drift, notables, calendar, determinism. `node tests/step9.js`: browser robot (real clicks), writes `shots/step9-*.png`.

## tools/bake-ui.js (fonts, marks, icons)
`node tools/bake-ui.js` bakes the two pixel fonts (`font`, `fontb`), the far-view unit mark, the carried loads (`tools/art/loads.js`: one pixel grid per resource, frames `load/<resource>`), the war-map markers (`tools/art/marks.js`: pixel grids for army, front, siege, town taken, march line; frames `mark/<name>`) and the icon atlas (`icons`, frames `ic/<name>`, 123 icons from `tools/art/icons.js`: shape lists on a 16x16 grid + automatic coloured outline). Sheet: `node tools/sheet.js icons --scale 4 --cols 14 --out shots/icons.png`.

## tests/save-run.js, tests/step10.js
`node tests/save-run.js [ticks] [seed]`: save → reload → compare signatures and bytes → play both 3000 ticks → compare. `node tests/step10.js`: interface robot (real clicks on the rectangles published in `AL.UI.btn`), writes `shots/step10-*.png`.

## tools/art/sounds.py, tools/level-audio.js, tools/measure-audio.js
`python3 tools/art/sounds.py` writes `src/data/sounds.json` from the patch source (layers of oscillators, noise, plucked strings, filters, envelopes, FM, tremolo, reverb sends; intent windows). `node tools/level-audio.js` measures and writes the `vol` factors so that each sound sits within 3 dB of its category median (kept by the next run of sounds.py). `node tools/measure-audio.js [--quiet] [--music] [--json f]` renders every variant and track offline in headless Chromium and checks clipping, clicks, levels, duration and spectral centroid.

## tests/step11.js
Browser robot for sound: first-gesture start, sounds triggered by real actions (counted in `AL.Mixer.counts`), adaptive track changes, ambience, volume option.

## tools/measure-sprite.js (métrique corrigée)
Le scintillement compté est le scintillement d'ombrage (même matériau, autre ton) ; limites strictes pour idle/sleep/walk (3 %), larges pour les animations d'action (10 %). Les pixels isolés se comptent au voisinage à 8 (un pas diagonal de contour n'est pas isolé). `tools/lib/sdf.js` `stabilize` : 3 passes, écart de ton ≤ 2.

## tests/repair-run.js
Tests de non-régression des réparations de `BUGS.md`.

## tools/balance-bot.js (robot d'équilibrage)
Joue le jeu sans navigateur (simulation seule, déterministe) et le juge contre des cibles écrites. `battery [--quick] [--only a,b] [--seeds 1,2] [--out f.json]` : 46 parties en processus parallèles (solo-human, solo-orc, duel44, duel80, wild, chaos). `run <scénario> <graine> <années>` : une partie, JSON. `judge <f.json>` : juge une batterie sauvegardée. Il vérifie aussi la cohérence des livres (population des villes, stocks, NaN, souverains morts). Cibles et raisonnement : `BALANCE.md`. Il ne juge ni le rendu, ni le son, ni la sensation.

## tests/i18n-run.js
Partie simulée de 45 ans (deux peuples) : chaque entrée du journal porte une clé, son anglais est identique à l'ancien texte, son français est différent et complet (pas de `{n}` ni de parenthèses vides), toutes les clés existent en EN et FR.

## Étiquettes gauche / droite des sprites
Dans les atlas, `left` et `right` sont nommés d'après le signe du yaw du baker : l'image `left` regarde vers la droite de l'écran. `src/client/scene.js` croise donc les étiquettes (`DIRN = ['down','right','up','left']`). Pour le vérifier : `node tools/sheet.js people_human --match 'human/villager/walk/(left|right)/0$' --scale 8 --labels`.

## Étape 12 — contenu provisoire
- `tools/art/creatures.js` : en plus des 8 espèces soignées, 49 espèces provisoires (32 animaux, 17 monstres) sur les mêmes squelettes. Chaque espèce a ses proportions et ses propres pièces (`spec.extra` : trompe, cornes, bois, ailes, carapace, rayures, crête…, aide `PT`), un squelette `serpent` (léviathan) et le squelette humanoïde pour 8 monstres cuits à leur taille (16 à 48 px). `node tools/bake-creatures.js` écrit `assets/creatures.*` (soignées, inchangées) et `assets/creatures2.*` (provisoires). Planches : `shots/creatures2-small|large|monsters(-sil).png`.
- `tools/art/peoples.js` + `tools/art/rigs/humanoid.js` : elfes, nains, myrrins, okaris avec leurs 18 aspects (accessoires `beak`, `mushcap`, bandeau `circlet`, cou `neck`, oreilles `earUp`). `node tools/bake-people.js [peuple…] [--looks a,b]`. Planches : `shots/people-elf|dwarf|myrrin|okari(-sil).png`.
- `tools/art/buildings2.js` : architecture des 4 peuples (une coque par peuple en 3 stades + un objet-signature, 17 types communs), enregistrée par `tools/art/buildings.js`. Planches : `shots/buildings-elf|dwarf|myrrin|okari(-sil).png`, `shots/buildings-prov-states.png` (chantiers et ruines).
- `tools/art/sounds.py` : bloc `prov(...)` = les 44 sons de la vision finale, revus en A.10 (trois prises par son avec `vary`, couches en plus dans `EXTRA`). `tools/art/music-scores.py` : source des 5 pistes `menu`, `disaster`, `frost`, `dunes`, `tide` (accords par section, mélodie écrite note à note, accompagnement dérivé des accords) ; `python3 tools/art/music-scores.py` réécrit ces 5 entrées de `src/data/music.json`, puis `node tools/measure-audio.js --music`.
- `tools/validate-data.js [--quiet]` : un schéma par fichier de `src/data`, références croisées (images de chaque aspect et animation, sprites de bâtiments par peuple, icônes, effets, sons, instruments, notes des partitions, clés i18n en anglais ET en français avec les mêmes `{arguments}`), tableau des comptes face à la vision finale. Dans `tests/run-all.js`.
- `tests/prov-run.js` : fait apparaître les 53 espèces et peuples provisoires, utilise les 56 pouvoirs provisoires, vérifie qu'aucun animal provisoire n'apparaît tout seul en 20 ans, et le déterminisme. Dans `tests/run-all.js`.
- `tools/balance-bot.js` : scénarios `solo-elf`, `solo-dwarf`, `solo-myrrin`, `solo-okari` (4 graines chacun dans la batterie) avec leurs cibles de rythme (`PACE`).
- Page de sprites : 4096 × jusqu'à 8192 px (`src/client/assets.js`, atlas les plus hauts d'abord) ; le jeu refuse de démarrer avec un message clair si la carte graphique ne tient pas cette texture.

## Étape 13 — titre, chargement, icônes, livraison (jeu renommé Dustcrown)
- `tools/art/logo.js` : le mot DUSTCROWN (capitales 9×13 dessinées dans ce fichier, tons or, contour, ombre, couronne posée sur le O, traînée de poussière) et l'icône du jeu 32×32 (un monde rond coiffé de la couronne). `logo()`, `icon()`, `appIcon(taille)`.
- `tools/bake-ui.js` écrit aussi l'atlas `logo` (`logo/word`, `logo/icon`). Planche regardée : `shots/logo.png`.
- `tools/build.js` écrit dans `game/` : `dustcrown.js`, `assets.js`, `index.html`, `logo.png`, `icon-64.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest`, et les messages de chargement dessinés avec la police du jeu (`load-en-0..2.png`, `load-fr-0..2.png`).
- `src/client/index.html` : écran de chargement (logo, barre, message) ; les deux scripts sont chargés l'un après l'autre pour que la page s'affiche avant le code du jeu. `src/client/app.js` (`AL.App`) : écran-titre posé sur un monde vivant ; `?play` dans l'adresse saute le titre (utilisé par les robots).
- `tests/step13.js` : robot (vraie souris, vrai clavier) du chargement, du titre, des fenêtres ouvertes depuis le titre, de l'entrée en jeu, de `?play`, des fichiers d'icônes et du manifeste, des requêtes hors du dossier. Captures : `shots/step13-*.png`.

## tools/building-sheet.js
`node tools/building-sheet.js <out.png> <peuple> [stades, ex. 2,3,4] [échelle] [sil|col] [types, ex. grove,delve]` : rend les 17 bâtiments d'un peuple directement depuis les sources, une ligne par stade, sans cuire l'atlas ; `sil` = silhouettes ; avertit si un bâtiment dépasse la case de 64 px.

## tools/creature-sheet.js
`node tools/creature-sheet.js <out.png> <noms|all|second> [échelle] [par ligne]` : rend des espèces directement depuis `tools/art/creatures.js` sans cuire l'atlas (profil, trois-quarts, image en mouvement, et la même chose en silhouette) ; signale les sprites qui touchent le bord de leur case. `tools/bake-creatures.js` cuit maintenant sur 4 fils (environ 2 min 30).

## Scénario `bestiary` du robot (preuve des comportements de monstres)
`node tools/balance-bot.js run bestiary <graine> <années>` : un village humain, puis un monstre différent posé près de la ville tous les 3 ans à partir de l'an 12 ; les compteurs `m_*` sont dans `stats` du JSON de sortie.

## tools/power-proof.js et tools/art/fx-powers.js (chantier A.7)
`node tools/power-proof.js [graine] [id,id,…]` : preuve légère des 56 pouvoirs de `src/sim/powers2.js`. Fait grandir une ville sous Node, sauvegarde, puis pour chaque pouvoir recharge la sauvegarde, lance le pouvoir sur la ville et lit un compteur (`sim.stats`), les zones, les phénomènes et la chronique ; écrit `ok`/`FAIL` par pouvoir et « ALL 56 POWERS FIRED » à la fin. Ce n'est pas un test d'équilibrage.
`tools/art/fx-powers.js` : source des 57 effets dessinés des pouvoirs (chargée par `tools/art/fx.js`, cuite par `node tools/bake-fx.js` : 115 types, 550 images). Planches : `node tools/sheet.js fx --match "<regex>" --scale 4 --labels [--silhouette] --out shots/x.png`. Les 43 sons des pouvoirs sont dans `tools/art/sounds.py` (bloc « chantier A.7 »).
