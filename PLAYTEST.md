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

## Step 6 — wildlife and monsters (robot `tests/step6.js`, headless eco run)
- Saw: deer, sheep, boars, rabbits, wolves, bears, eagles in the air, salmon in shallow water; wolves chase and kill, hunters bring meat home, forests creep back from stumps. Zombies, skeletons and a demon dropped on a village at night: soldiers and brave villagers fight, the others run to the hall; the bitten rise as zombies.
- Broken, fixed: one tick cost 2 ms because any walker whose A* hit its expansion limit retried it every tick (now a flow field is followed to its end, pursuit steers directly) → 0.2 ms/tick with ~900 animals; wolves and bears went extinct (prey outran them, they starved) → faster pursuit, slower predator hunger, small-game fallback.
- Still ugly: the rabbit is a blob; quadrupeds seen from the front/back are stiff; zombies are dark on forest floor at night; a herd dropped by the god overlaps into one clump.

## Step 7 — kingdoms and war (robot `tests/step7.js`, headless `tests/war-run.js` on seeds 2, 3, 5, 7)
- Saw: each band founds a kingdom with a named ruler and house; red human and green orc banners; settlers leave to found colonies; wars are declared (border dispute, old hatred, the god's will), armies march on the nearest enemy town, fight, besiege buildings; peace by treaty or exhaustion, vassalage, broken alliances, betrayal, independence, successions and dynasty changes in the chronicle.
- Broken, fixed: merchants and marching soldiers starved on the road (they now eat rations from their town's stock); a band of 16 starved in its first year when war started at once (founding stock scales with the founders, foraging on fertile ground, no war in a kingdom's first 3 years); the same two kingdoms declared war every 4 years (8-year treaties, each past war lowers the odds); a one-line comment had swallowed the end of the peace function.
- Still weak: armies are small (2–6 soldiers), battles are skirmishes; no captured town was observed in these runs (the code path exists, not verified); the kingdoms layer tints the ground brownish instead of reading as a clean colour; meadows had overgrown with flowers (regrowth rate lowered ×6 afterwards, not re-screenshotted).

## Step 8 — powers, disasters, weather (robot `tests/step8.js`, headless `tests/powers-run.js`)
- Seen: fire dragged over a forest spreads and smokes; rain clouds sit above a rain zone; a storm darkens the whole screen; lightning forks and leaves a small fire; the big bomb leaves a crater with a shock ring; the nuke shows a mushroom, a ring of fires and then a fallout zone; a tornado crosses the camp; at night fires light the ground around them.
- Ugly, fixed: rain clouds were dark boulders (reused soot puff) → new `nimbus` sprite; scorched ground was per-pixel speckle → clean 4 px / 2 px masses; every effect sprite cast a ground shadow → flag 32 honoured in the shadow pass; storm rain was almost invisible → 3× more streaks.
- Broken, fixed: eagles went extinct after the random stream changed → migration from the map edge + wider mate search for solitary species; step 5 robot tracked unit 0 (now an animal) → tracks the dropped people.
- Still weak: rain streaks faint on bright grass; scorched pattern harsh on snow; no sound for most powers yet; no toolbar (tools are selected by the robot through `Game.tool`).

## Step 9 — two peoples, cultures, faiths (robot `tests/step9.js`, headless `tests/culture-run.js`)
- Seen: an orc village of moss-roofed longhouses with crossed horns around a skull altar, next to human thatch; names sound different (Grestead / Krokzgorkgash; Vejal, Vondha / Nadruk, Narmozg).
- Ugly, fixed: orc stage-1 roofs were flat green slabs hiding the walls → taller log walls, lower roofs, ridge beam, 3 roof materials by trade; moss far too saturated → darker ramp tones.
- Broken, fixed: a village starved with 180 stone in stock and no farm (posts for miner/soldier/priest kept while nobody gathered; one burnt construction site blocked building forever) → see RESUME step 9; four "heroes" after 9 years because hunting kills counted → heroes need 5 kills as soldiers.
- Still weak: orc trades are told by props only; chronicle is English only.

## Step 10 — interface (robot `tests/step10.js`)
- Seen: the bar, toolbar and windows share one dark-blue pixel style; the unit sheet shows a portrait, bars, family and culture; the new-world window redraws its preview when a setting changes; French accents render (Âge de la Première Lueur).
- Broken, fixed: town sheet never appeared (query argument `id` collided with the reply id); a fast click on the minimap was ignored; the middle dot was missing from the font (showed "?"); column titles overlapped in the kingdoms list; the options labels ran under their buttons in French.
- Still weak: tooltip of a side button stays over the window it opened; animals crushed the population graph (removed from that tab).

## Step 11 — sound (robot `tests/step11.js`, `tools/measure-audio.js`) — NOT LISTENED TO
- Measured only: the engine stays silent until the first click; a tornado switches the music to the war track within 2.5 s and night brings the night track; over one short session 13 different sounds were triggered (clicks, thunder, bomb, healing, earth, tornado, animal calls, hits).
- Fixed from measurements: impacts (hit, hammer, chop, shield) were dull thuds (centroid 140–290 Hz) → more noise, less sine body; wave, fire and acid were hiss (centroid 6.5–11 kHz) → band-limited; 43 levels were out of their category range → calibrated.
- To be judged by ear by Julien: everything.

## Test complet puis réparations (dépôt Sonnet)
- Test : 3 parties simulées de 166 ans avec pouvoirs au hasard, 3 parties de 100 ans sans pouvoir, 124,6 min de jeu à ×50 dans le navigateur (vrais clics). Aucune erreur, mémoire stable, aucune requête externe. Défauts trouvés et réparés : voir `BUGS.md`.
- Après réparation (même protocole) : 120 min de jeu à ×50, 2 royaumes vivants, 10 villes aux stades 0 à 3, 4 religions, 689 tuiles brûlées ; les captures de l'an 53 montrent une cité humaine en pierre et une forêt intacte.

## Balance pass (robot d'équilibrage, dépôt Sonnet)
- 46 parties simulées (6 scénarios, 8 graines) jugées contre des cibles écrites (`BALANCE.md`). Première passe : 55 cibles sur 79 ; après réglages : 83 sur 83.
- Médianes : ville de stade 3 à l'an 10, stade 4 à l'an 24, stade 5 à l'an 52 ; 797 habitants et 9 villes à l'an 100 ; première religion à l'an 5 ; 1,09 entrée de chronique par an ; duels : les deux peuples vivants dans 15 parties sur 16, première guerre vers l'an 26 ; monde sauvage de 200 ans sans extinction.
- **Non jugé par le robot** : sensation du rythme, intérêt des entrées de chronique, lisibilité d'une grande ville, son. Pas de nouvelle partie jouée dans le navigateur après ces réglages : à faire.

## Population plus nombreuse (robot, deuxième passe)
- Batterie de 46 parties : 85/85 cibles ; suite de tests 17/17. Habitants médians : 85 (an 10), 234 (an 30), 763 (an 60), 1 373 (an 100). Stades 3/4/5 aux années 16/22/34. Plus grande armée 210. Humains/orques 2,74.
- Pas de nouvelle partie jouée dans le navigateur depuis ces réglages : à faire (rendu d'une ville de 500 personnes, fluidité à ×10 et ×50).
- Navigateur (7 min à ×50, sans GPU) : chargement 0,6 s, aucune erreur ni requête externe, rendu 2–3 ms/image ; vitesse réelle ×50 → ×20–26 au-delà d'environ 800 habitants (la simulation ne suit plus à ×50, l'affichage reste fluide). Capture de l'an 50 regardée : ville humaine dense face aux huttes orques, lisible.

## Petits départs (signalé par Julien)
- 3 humains + 3 orques posés côte à côte : 6 habitants à l'an 20 dans sa partie. Rejoué dans le navigateur (graphique : orques bien comptés ; humains en déclin sans naissance) puis en simulation sur 8 graines. Après correction : 24–43 habitants à l'an 20. Batterie 91/91, suite 17/17.
- Pas de nouvelle partie longue dans le navigateur depuis le changement du pathfinding : à faire.
