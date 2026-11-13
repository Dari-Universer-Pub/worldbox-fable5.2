# CHANTIER — finir Dustcrown (feuille de route après l'étape 13)

Décision de Julien : **l'étape 14 est mise de côté.** À la place, dans cet ordre : **A. monter le contenu provisoire au niveau visé**, **B. ajouter les systèmes absents**, **C. les finitions**. Ce fichier est la liste de suivi : on coche une ligne seulement quand c'est vérifié (planche regardée, test, mesure), on écrit « non vérifié » sinon. `RESUME.md` dit toujours où on en est et quelle est l'action suivante.

Règles qui restent valables (voir `CLAUDE.md`) : aucun asset validé sans planche regardée (couleur et silhouette) ; tout sort de `tools/art/` et se régénère avec `node tools/bake-all.js` ; textes par `AL.t` en anglais et en français ; un commit par tâche terminée, `RESUME.md` et ce fichier à jour dans le même commit.

**Répartition des rôles (décidée par Julien).** L'agent qui travaille sur ce chantier **crée** : mécaniques, systèmes, sprites, pouvoirs, sons, données ; il regarde ses planches et ses captures. Il **ne lance pas** les tests lourds : `node tests/run-all.js`, la batterie `node tools/balance-bot.js battery`, les robots Playwright ; il ne règle pas les chiffres d'équilibrage ni la stabilité sur la durée : c'est Sonnet qui le fait à la fin. **En revanche, pour chaque tâche qui touche à la simulation (A.4, A.5, A.9, B.1, B.2, B.3, B.4, B.6, B.7, B.9), il fait une preuve de fonctionnement peu coûteuse** : `node tools/build.js` et `node tools/validate-data.js`, puis **une seule courte partie simulée sous Node** (une centaine d'années, une graine, un scénario du robot d'équilibrage lancé en `run`, jamais la batterie) où il vérifie que la mécanique **se déclenche au moins une fois** (un pont construit, un bateau parti, une île colonisée, une armée avec cavalerie, une ville capturée, un dragon qui pond, etc.) en lisant un compteur ou la chronique. Si elle ne se déclenche pas, il la corrige tout de suite (c'est lui qui connaît son code). Il ouvre aussi le jeu une fois pour voir à l'œil ce qu'il vient d'ajouter. Pour chaque tâche, il écrit dans `RESUME.md` : « Vu : … » (ce qu'il a observé), « Non vérifié : … » et « À tester par Sonnet : … ». Il ne coche une case que si la mécanique a été vue se produire ; sinon il écrit `[~]` et dit pourquoi. Les autres exigences de test citées dans les tâches ci-dessous (cibles du robot, scénarios de duel, tests Playwright) sont à la charge de Sonnet.

État : `[ ]` à faire · `[~]` en cours · `[x]` fait et vérifié.

## 0. Préalable technique
- [x] **0.1 Rogner les images à la construction** (`tools/build.js`) : la page de sprites 4096×8192 est presque pleine et bloque sur les appareils limités à 4096 px. Chaque image est réduite à son contenu, le pivot est corrigé. But : page ≤ 4096×4096 avec le contenu actuel, et de la place pour A.2 et A.3. Vérifier : une capture avant/après identique (les robots seront lancés par Sonnet).
- [ ] **0.2 Relancer la suite complète** : **à la charge de Sonnet** (elle n'a pas été relancée après les deux corrections de fin d'étape 13).

## A. Contenu provisoire → niveau visé
- [x] **A.1 Icônes de ressources** : cuivre, fer, or, aéthérite, outils, armes, armures (7), dessinées une à une ; planche regardée ; `validate-data` sans note.
- [x] **A.2 Créatures : animations complètes.** Les 49 espèces provisoires ont repos, marche/vol/nage, mort (+ attaque pour les monstres). Ajouter : course, repas, attaque avec geste d'avertissement, coup reçu, sommeil (comme les 8 espèces soignées). Planches d'animation regardées par famille.
- [x] **A.3 Créatures faibles à refaire** : lynx, castor, hérisson, grenouille, hyène, chèvre (silhouette reconnaissable), léviathan (trop mince), puis revue des 49 une par une ; retirer `provisional` espèce par espèce quand elle est validée.
- [x] **A.4 Animaux dans le monde** : densités et biomes des 32 animaux pour qu'ils vivent seuls (aujourd'hui densité 0) ; l'écosystème doit rester stable (vérifié ensuite par Sonnet avec les cibles « wild » et la batterie).
- [x] **A.5 Monstres : comportements propres.** Dragon (nid, trésor, souffle de feu), colosse (contrôlable, piétinement, lancer de rocher), léviathan (attaque les côtes et les bateaux quand ils existeront), géant, golem, tréant, esprit (nuit), liche (relève les morts), harpie, basilic, néantin, diablotin, chien des enfers : au moins un trait de comportement mesurable chacun (le test headless sera écrit par Sonnet).
- [x] **A.6 Stades de bâtiments 4 et 5** pour les 6 peuples (aujourd'hui dessinés avec le stade 3) : vraies architectures, chantiers et ruines ; planches regardées ; `stages.json` sans `provisional`.
- [x] **A.7 Pouvoirs : 56 variantes → vrais pouvoirs.** *(fait : 56 gestes distincts dans `src/sim/powers2.js`, 56 icônes, 57 effets, 43 sons ; `node tools/power-proof.js 7` = « ALL 56 POWERS FIRED » ; détail dans `RESUME.md`)* Pour chacun : icône propre, effet visuel, son, effet réel sur le monde (le test dans `tests/powers-run.js` sera étendu par Sonnet). Remplacer les simples variantes de rayon par des pouvoirs distincts quand elles font doublon.
- [x] **A.8 Les 4 peuples : identité de jeu.** Un bâtiment et un métier ou un comportement propre à chacun (elfes : forêt ; nains : mine et forge ; myrrins : marais, peur du feu ; okaris : pêche et mer), retirer `provisional` ; les scénarios de duel dans le robot (contre humains et orques) et leurs cibles seront faits par Sonnet.
- [x] **A.9 Bâtiments des 4 peuples** : une coque propre par métier pour les types principaux (aujourd'hui une coque + accessoires), comme chez les humains.
- [ ] **A.10 Sons et musiques provisoires** : revoir les 44 sons et les 5 pistes (écriture plus longue, variantes) ; brancher les pistes de climat et de catastrophe sans l'option ; **à juger à l'oreille par Julien** (impossible ici).
- [ ] **A.11 Option « Contenu provisoire »** : la retirer quand plus rien n'est provisoire ; d'ici là regarder la barre d'outils avec l'option activée.

## B. Systèmes absents
- [ ] **B.1 Ponts** : sur les rivières étroites, construits par les villes quand une route bute sur l'eau ; pathfinding mis à jour ; sprite.
- [ ] **B.2 Mer** : port actif, bateaux de pêche, navires de transport ; colonisation d'une autre terre par la mer ; sprites de bateaux ; objectif : une île ne doit plus plafonner à 140 habitants (test « île » du robot fait par Sonnet).
- [ ] **B.3 Métiers inutilisés** : marin (B.2), ingénieur (ponts, machines de siège), guérisseur (hôpital, soins après bataille).
- [ ] **B.4 Guerre complète** : cavalerie (avec les chevaux), machines de siège (bélier, catapulte), héros et champions, moral et fuite, blessures et soins, pillage, réfugiés, capture et annexion (vérifiées ensuite par Sonnet) ; armes selon l'ère. **Assets de guerre : chaque unité et machine (cavalier, bélier, catapulte, héros, champion, réfugié, guérisseur) a ses propres sprites (déplacement, attaque, coup reçu, mort), ses effets visuels (blessure, fuite, pillage, impact) et ses sons ; planches regardées, rien de réutilisé tel quel.**
- [ ] **B.5 Lecture de la guerre** : couche « guerres » avec fronts et armées en marche ; icônes et marqueurs dessinés un à un (armée, front, siège, ville capturée), lisibles à tous les zooms.
- [ ] **B.6 Diplomatie** : fusion de royaumes, guerre civile, chef d'alliance ; mariage royal, rébellion et capture (aujourd'hui codés, jamais vus : Sonnet les fera observer par des tests).
- [ ] **B.7 Individus** : amitiés, rivalités, amours visibles dans la fiche ; ce que porte un villageois visible sur le sprite.
- [ ] **B.8 Saisons** : seulement si elles apportent au jeu (récoltes, migrations, neige) ; décision écrite dans `DECISIONS.md`.
- [ ] **B.9 Élevage et migrations** : enclos, bétail gardé (mouton, vache, chèvre, cheval, chameau, yak), migrations saisonnières.

## C. Finitions
- [ ] **C.1 Retouches à la main des poses clés** des 6 peuples (`tools/art/patches/people.json`) ; scintillement et pixels isolés sous les seuils de `tools/measure-sprite.js`.
- [ ] **C.2 Bâtiments orques** : une coque par métier.
- [ ] **C.3 Effets** : pluie, éclaboussures, sang, acide, fissures plus lisibles ; sol brûlé dessiné (47 cas) ; ombres de nuages.
- [ ] **C.4 Interface** : icônes faibles à redessiner (créatures, paix, import/export, culture, inondation) ; indication en contrôle direct ; aide de première partie.
- [ ] **C.5 Écran-titre et chargement** : animation du logo, crédits, barre continue.
- [ ] **C.6 Univers** : réécrire `BIBLE.md` pour le nom Dustcrown (si Julien le veut), noms d'ères et de pistes.
- [ ] **C.7 Tactile et téléphone** : gestes, déblocage du son sur iPhone, taille d'interface ×2.
- [ ] **C.8 Captures jamais regardées** des étapes 5 à 10 : les regarder et corriger ce qu'elles montrent.
- [ ] **C.9 Petits défauts notés** : souches qui ne repoussent pas, champignons flous, lapin peu lisible, son `chop` hors fenêtre.

## Ce que seul Julien peut juger (à chaque palier)
Le son et la musique à l'oreille ; le rythme à ×1, ×5, ×10 ; la beauté des nouveaux sprites en jeu ; la fluidité sur son PC et son téléphone.

## Journal
- (date du commit) création de ce fichier après l'étape 13.
- Répartition des rôles ajoutée : l'agent de contenu crée, regarde ses planches et fait une preuve de fonctionnement légère (une courte partie sous Node) par tâche de simulation ; les tests lourds, l'équilibrage et la correction des bugs qu'ils trouvent sont faits par Sonnet à la fin.
- 0.1 fait : images rognées et dédoublonnées à la construction (preuve pixel par pixel dans `tools/build.js`), page de sprites 3 097 px de haut. A.1 fait : 7 icônes de ressources, stocks des villes affichés avec les icônes. A.2 fait : jeux d'animations complets pour les 49 espèces (5 684 images), cuisson en parallèle.
- A.3 fait : lynx (passé en 24 px), castor, hérisson, grenouille, hyène (dos en pente), chèvre, léviathan, requin (queue en croissant), écureuil refaits ; oiseaux posés debout ; revue des 49 sur 4 planches. Le drapeau `provisional` des animaux sera retiré en A.4 (quand ils vivront seuls) et celui des monstres en A.5 (comportements).
- A.4 fait : les 32 animaux ont une densité et vivent seuls (tirage pondéré par la densité dans `C.populate`, plafond d'animaux n²/56) ; un siècle sauvage : 40 espèces vivantes à l'an 50, 39 à l'an 100.
- A.5 fait : `src/sim/monsters.js` (17 comportements, compteurs `sim.stats.m_*`), nid du dragon dessiné, 4 effets nouveaux, scénario `bestiary` du robot ; tous les compteurs vus au moins une fois (détail dans `RESUME.md`).
- A.6 fait : stades 4 et 5 dessinés pour les 6 peuples (finis, chantiers, ruines), `stages.json` sans `provisional`, ville humaine vue au stade 5 en jeu et dans une partie sous Node (stade 4 an 22, stade 5 an 29).
