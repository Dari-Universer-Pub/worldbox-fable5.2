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

## Après l'étape 12 (contenu provisoire)
- Les 49 créatures provisoires n'ont que 3 ou 4 animations (repos, marche/vol/nage, attaque pour les monstres, mort) : il manque course, repas, coup reçu, sommeil, et le geste d'avertissement propre à chaque monstre. Aucune retouche à la main. Les plus faibles à 16 px : lynx, castor, hérisson, grenouille (lisibles surtout par la couleur) ; la hyène et la chèvre restent génériques.
- Les monstres provisoires partagent le comportement générique des monstres (pas de nid ni de trésor pour le dragon, pas de capacités spéciales pour le colosse, le léviathan nage comme un poisson).
- Les 4 peuples provisoires : mêmes règles que les humains avec leurs chiffres ; pas de bâtiment ni de métier propre ; types d'un même peuple = une coque + des accessoires (lisibilité des types plus faible que chez les humains).
- Stades de bâtiments 4 et 5 : déclarés dans `stages.json` (`look` 3 et 4) mais dessinés avec les sprites du stade 3 (`sprite` 2). À dessiner : il faudra d'abord rogner les images des atlas (la page de sprites 4096×8192 est presque pleine).
- Page de sprites 4096×8192 : les appareils limités à des textures de 4096 px ne peuvent plus lancer le jeu. Rogner les cadres vides à la construction ramènerait la page sous 4096×4096.
- 56 pouvoirs provisoires = variantes (rayon, durée, dispersion, invocations) des 44 pouvoirs soignés, avec l'icône du pouvoir d'origine ; à remplacer par de vrais pouvoirs avec icône, effet et son propres.
- 44 sons et 5 pistes provisoires jamais écoutés ; les pistes de climat et de catastrophe ne jouent qu'avec l'option « Contenu provisoire ».
- Icônes de ressources manquantes (cuivre, fer, or, aéthérite, outils, armes, armures) : signalé par `tools/validate-data.js`.

## Après l'étape 13 (titre, chargement, renommage en Dustcrown)
- Le jeu s'appelle maintenant Dustcrown, mais l'univers écrit dans `BIBLE.md` (le Tisserand, la Trame, le fil) date de l'ancien nom : à réécrire si Julien veut un univers accordé au nouveau nom (poussière, couronne). Les noms d'ères et la piste « Loom of Morning » viennent aussi de l'ancien thème.
- Les sauvegardes du navigateur gardent leurs anciens identifiants internes (`aeonloom.options`, base `aeonloom`, en-tête de fichier `AEON`) pour ne pas perdre les mondes déjà enregistrés ; l'export s'appelle maintenant `.dust` et l'import accepte `.dust` et `.aeon`.
- Écran-titre : pas d'animation propre du logo (léger flottement seulement), pas de crédits, pas de bouton plein écran ; le bouton « Continuer » n'apparaît que s'il existe une sauvegarde automatique (non vérifié par le robot).
- Écran de chargement : la barre avance par étapes (images, code, monde), pas en continu ; non testé sur une connexion lente ni sur téléphone.
- Icône d'application : une seule image carrée « any maskable » ; pas d'icône monochrome ni de captures pour l'installation.
