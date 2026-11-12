# CHANTIER — finir Dustcrown (feuille de route après l'étape 13)

Décision de Julien : **l'étape 14 est mise de côté.** À la place, dans cet ordre : **A. monter le contenu provisoire au niveau visé**, **B. ajouter les systèmes absents**, **C. les finitions**. Ce fichier est la liste de suivi : on coche une ligne seulement quand c'est vérifié (planche regardée, test, mesure), on écrit « non vérifié » sinon. `RESUME.md` dit toujours où on en est et quelle est l'action suivante.

Règles qui restent valables (voir `CLAUDE.md`) : aucun asset validé sans planche regardée (couleur et silhouette) ; tout sort de `tools/art/` et se régénère avec `node tools/bake-all.js` ; textes par `AL.t` en anglais et en français ; pas de changement de règle de simulation sans `node tools/balance-bot.js battery` ; un commit par tâche terminée, `RESUME.md` et ce fichier à jour dans le même commit ; `node tests/run-all.js` une fois par tâche qui touche au jeu.

État : `[ ]` à faire · `[~]` en cours · `[x]` fait et vérifié.

## 0. Préalable technique
- [ ] **0.1 Rogner les images à la construction** (`tools/build.js`) : la page de sprites 4096×8192 est presque pleine et bloque sur les appareils limités à 4096 px. Chaque image est réduite à son contenu, le pivot est corrigé. But : page ≤ 4096×4096 avec le contenu actuel, et de la place pour A.2 et A.3. Vérifier : tous les robots, une capture avant/après identique.
- [ ] **0.2 Relancer la suite complète** `node tests/run-all.js` (elle n'a pas été relancée après les deux corrections de fin d'étape 13).

## A. Contenu provisoire → niveau visé
- [ ] **A.1 Icônes de ressources** : cuivre, fer, or, aéthérite, outils, armes, armures (7), dessinées une à une ; planche regardée ; `validate-data` sans note.
- [ ] **A.2 Créatures : animations complètes.** Les 49 espèces provisoires ont repos, marche/vol/nage, mort (+ attaque pour les monstres). Ajouter : course, repas, attaque avec geste d'avertissement, coup reçu, sommeil (comme les 8 espèces soignées). Planches d'animation regardées par famille.
- [ ] **A.3 Créatures faibles à refaire** : lynx, castor, hérisson, grenouille, hyène, chèvre (silhouette reconnaissable), léviathan (trop mince), puis revue des 49 une par une ; retirer `provisional` espèce par espèce quand elle est validée.
- [ ] **A.4 Animaux dans le monde** : densités et biomes des 32 animaux pour qu'ils vivent seuls (aujourd'hui densité 0) ; l'écosystème doit rester stable (cibles « wild » du robot + batterie complète).
- [ ] **A.5 Monstres : comportements propres.** Dragon (nid, trésor, souffle de feu), colosse (contrôlable, piétinement, lancer de rocher), léviathan (attaque les côtes et les bateaux quand ils existeront), géant, golem, tréant, esprit (nuit), liche (relève les morts), harpie, basilic, néantin, diablotin, chien des enfers : au moins un trait de comportement mesurable chacun + test headless.
- [ ] **A.6 Stades de bâtiments 4 et 5** pour les 6 peuples (aujourd'hui dessinés avec le stade 3) : vraies architectures, chantiers et ruines ; planches regardées ; `stages.json` sans `provisional`.
- [ ] **A.7 Pouvoirs : 56 variantes → vrais pouvoirs.** Pour chacun : icône propre, effet visuel, son, effet mesuré (`tests/powers-run.js` étendu). Remplacer les simples variantes de rayon par des pouvoirs distincts quand elles font doublon.
- [ ] **A.8 Les 4 peuples : identité de jeu.** Un bâtiment et un métier ou un comportement propre à chacun (elfes : forêt ; nains : mine et forge ; myrrins : marais, peur du feu ; okaris : pêche et mer), scénarios de duel dans le robot (contre humains et orques), cibles justifiées ; retirer `provisional`.
- [ ] **A.9 Bâtiments des 4 peuples** : une coque propre par métier pour les types principaux (aujourd'hui une coque + accessoires), comme chez les humains.
- [ ] **A.10 Sons et musiques provisoires** : revoir les 44 sons et les 5 pistes (écriture plus longue, variantes) ; brancher les pistes de climat et de catastrophe sans l'option ; **à juger à l'oreille par Julien** (impossible ici).
- [ ] **A.11 Option « Contenu provisoire »** : la retirer quand plus rien n'est provisoire ; d'ici là regarder la barre d'outils avec l'option activée.

## B. Systèmes absents
- [ ] **B.1 Ponts** : sur les rivières étroites, construits par les villes quand une route bute sur l'eau ; pathfinding mis à jour ; sprite ; test.
- [ ] **B.2 Mer** : port actif, bateaux de pêche, navires de transport ; colonisation d'une autre terre par la mer ; sprites de bateaux ; test « île » du robot (une île ne doit plus plafonner à 140 habitants).
- [ ] **B.3 Métiers inutilisés** : marin (B.2), ingénieur (ponts, machines de siège), guérisseur (hôpital, soins après bataille).
- [ ] **B.4 Guerre complète** : cavalerie (avec les chevaux), machines de siège (bélier, catapulte), héros et champions, moral et fuite, blessures et soins, pillage, réfugiés, capture et annexion vérifiées par test ; armes selon l'ère.
- [ ] **B.5 Lecture de la guerre** : couche « guerres » avec fronts et armées en marche.
- [ ] **B.6 Diplomatie** : fusion de royaumes, guerre civile, chef d'alliance ; mariage royal, rébellion et capture observés dans un test (aujourd'hui codés, jamais vus).
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
