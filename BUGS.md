# BUGS.md — bugs trouvés au premier test complet, causes, réparations

Le détail d'analyse (causes lues dans le code, correctifs proposés) est conservé plus bas, tel qu'il a été écrit avant les réparations. Les numéros de ligne de cette partie sont ceux de l'ancien commit `94558fe`.

## Résultat des réparations (dépôt `worldbox_sonnet5.5`, branche `main`)

| # | Bug | État | Mesure après réparation |
|---|---|---|---|
| 1 | Incendies : 57–71 % des terres brûlées | **réparé** | 3 graines × 100 ans : 125 à 1 362 tuiles brûlées au total (avant : 25 000 à 28 000) ; un feu isolé en forêt dense brûle au plus 0,24 % de la forêt (`tests/repair-run.js`) ; forêts à 126–194 % de leur niveau de départ |
| 2 | Sol brûlé permanent, motif bruité | **réparé** | 400 tuiles marquées → 4 après 4 000 ticks ; rendu en plaques plus larges et plus douces (capture regardée) |
| 3 | Saumons 600–900, faune à 2–6 | **réparé** | plafond par espèce selon la surface du biome ; saumons 90–230 ; plus grande part d'une espèce 28 % ; aucune espèce éteinte (`eco-run`, `repair-run`) |
| 4 | Aigles incontrôlables | **réparé** | un aigle et un saumon contrôlés rejoignent le point ordonné (12 tuiles en 400 ticks) |
| 5 | Villages bloqués aux maisons de base | **réparé** | seuils de population 6/14/28/60/110, style des bâtiments : bois dès le village, pierre dès le stade « ville » ; 3 graines sur 3 atteignent le stade 3 avec 22 à 66 bâtiments de pierre ; capture d'une cité humaine à l'an 53 regardée |
| 6 | Villes de 1–5 habitants éternelles | **réparé** | colonies fondées autour d'un couple fertile ; ville de ≤ 6 habitants sans couple fertile dissoute après 5 ans (ses habitants rejoignent la ville la plus proche) ; chantier sans bâtisseur débloqué ; plus aucune ville de ≤ 3 habitants de plus de 10 ans sur 7 graines |
| 7 | Religions tardives | **réparé** | première religion naturelle entre l'an 3 et l'an 13 sur 3 graines (avant : an 37 à 50 ou jamais) |
| 8 | Guerres bizarres | **réparé en partie** | pas de guerre sans contact (aucune à 120 tuiles avant l'an 15 ; à 80 tuiles elles commencent entre l'an 5 et l'an 21 au lieu de l'an 3) ; le souverain ne charge plus au combat. **Reste** : les orques écrasent toujours les humains (humains éteints 2 fois sur 10 à 24–44 tuiles, avant 3 sur 10), les guerres reviennent tous les ~10 ans à courte distance, les armées restent de 2–15 soldats |
| 9 | Scintillement et pixels isolés | **réparé en partie** | mesure corrigée (scintillement d'ombrage seulement, voisinage à 8 pour les pixels isolés) ; stabilisation renforcée ; échecs de scintillement humain 75 → 42, orque 90 → 31 (animations d'action) ; pixels isolés humain 2,11 %, orque 4,21 % ; **reste** : pas de retouches pixel à la main sur les poses clés |
| 11 | Village bloqué à ~24 habitants et sans niveau 3 à l'an 58 (signalé en jouant) | **réparé** | 3 causes : (a) les orques ne construisaient jamais de marché (la valeur « commerce » de leur culture tombait sous le seuil, et la ville a besoin d'un marché pour passer au stade 3) ; (b) le stade ne comptait que la population (maintenant population + bâtiments finis, seuils 6/14/24/50/100) ; (c) une ville envoyait des colons dès 26 habitants toutes les 1,5 année, donc la ville principale restait à ~24 (maintenant : 40 habitants, ville pleine à 85 %, une colonie tous les 3 ans au plus, nombre de villes lié à la population). Mesure : stade 3 vers l'an 10, stade 4 entre l'an 10 et 25, stade 5 entre l'an 25 et 58 ; ville principale 90–130 habitants à l'an 58 |
| 10 | Pic de 89 ms sur un tick | non reproduit | bruit machine probable |

Note sur l'étude des guerres : le cas « les deux peuples meurent sans guerre » vu dans l'étude venait d'un site de départ sur de la neige choisi par mon script, pas d'un défaut du jeu.

## Tests ajoutés

`node tests/repair-run.js` : contrôle d'un aigle et d'un saumon, confinement d'un feu, effacement du sol brûlé, plafonds par espèce, progression des villes (3 graines × 100 ans), absence de villes mortes, religions naturelles, absence de guerre sans contact.

---

# Analyse initiale (avant réparations)

État du code analysé : branche `claude/sweet-ptolemy-b7zlpm`, commit `94558fe`. Analyse en lecture seule : rien n'a été modifié dans le dépôt, aucun commit.

Méthode : 3 parties simulées de 166 ans avec pouvoirs aléatoires, 3 parties de 100 ans sans pouvoir, une session navigateur de 124,6 min de jeu à ×50, puis lecture du code à l'endroit où chaque symptôme apparaît. Les causes marquées **CONFIRMÉE** ont été vérifiées sur une partie réelle ou sur le code exact ; **PROBABLE** veut dire cohérent avec les mesures mais non prouvé.

Numéros de ligne = ceux du commit `94558fe`.

---

## Tableau de priorité

| # | Bug | Gravité | Cause | Effort |
|---|---|---|---|---|
| 1 | Incendies qui brûlent 57–71 % des terres | haute | CONFIRMÉE (maths de propagation) | faible |
| 2 | Sol « brûlé » jamais effacé + motif bruité | haute | CONFIRMÉE (aucun code ne l'efface) | faible |
| 3 | Saumons 600–900, faune terrestre à 2–6 | haute | CONFIRMÉE (plafond global partagé) | faible |
| 4 | Aigles incontrôlables (signalé par toi) | moyenne | CONFIRMÉE (branche de contrôle) | très faible |
| 5 | Villages bloqués aux maisons de base (signalé par toi) | haute | CONFIRMÉE (seuils de population) | moyen |
| 6 | Villages de 1–5 habitants éternels | haute | CONFIRMÉE (colonies de vieux, pas de couple) | moyen |
| 7 | Religions très tardives | moyenne | CONFIRMÉE (conditions du prophète) | faible |
| 8 | Guerres bizarres (signalé par toi) | haute | PROBABLE | à étudier |
| 9 | Scintillement / pixels isolés des personnages | moyenne | CONFIRMÉE en partie (métrique + stabilisation) | moyen |
| 10 | Pic de 89 ms sur un tick | faible | NON REPRODUIT | — |

---

## 1. Les incendies dévorent la carte

**Symptôme.** Graine 7 : forêts à 104 % → 24 % en 13 ans ; 71 % des terres marquées brûlées. Graine 3 : 57 %. Graine 5 : presque rien (125 tuiles). Une capture de nuit montre une forêt verte à l'année 52 et rasée à l'année 63 (Âge des Braises).

**Cause (CONFIRMÉE).** `src/sim/powers.js`, `fireTick` (l.23–31) et `Pw.ignite` (l.21–22). Une tuile en feu :
- dure `150 + rand(80)` unités pour un arbre, et perd **4 unités par tick de feu** (l.25 : `f -= damp ? 22 : 4`) → 37 à 57 ticks de feu ;
- tente de se propager **une fois par tick avec 50 % de chances** (l.28 : `rng.chance(damp ? 0.05 : 0.5)`), vers un voisin choisi au hasard (biaisé par le vent), qui s'allume avec la probabilité `Pw.flam` = 0,9 pour un arbre.

Nombre moyen de tuiles contaminées par une tuile en feu ≈ 37–57 × 0,5 × (part de voisins inflammables) × 0,9 ≈ **plus de 10** dans une forêt dense. Le seuil de stabilité est 1. Le feu est donc fortement sur-critique : toute forêt connexe brûle d'un bloc. Même l'herbe (flam 0,4 × 0,45 = 0,18) reste sur-critique (≈1,3). La pluie amortit (`damp`) seulement pendant l'averse ; un feu allumé en fin d'orage continue ensuite sans frein.

Amplificateurs : `fireMul` ×1,5 dans les ères chaudes (Braises), `1,6` dans les zones de sécheresse (l.28), foudre « sauvage » toutes les 45 ticks pendant un orage (l.66), avec ignition certaine (`Pw.ignite(sim, i, !wild)` l.72, qui allume dès que `flam > 0`).

**Réparation.**
1. Rendre le feu **sous-critique par défaut** : viser un nombre moyen de contaminations ≈ 1,0–1,4 en forêt sèche, < 1 ailleurs.
   - Durée de vie d'une tuile : `60 + rand(40)` au lieu de `150 + rand(80)` (l.22), ou perte de 8 par tick au lieu de 4 (l.25).
   - Probabilité de tentative par tick : 0,2 au lieu de 0,5 (l.28).
   - Plafonner la propagation par tuile : au plus 2–3 voisins allumés pendant toute sa vie (compteur dans un octet à part, ou arrêter après N succès).
2. Foudre sauvage : ne mettre le feu qu'avec une probabilité (p ≈ 0,15–0,3, plus forte si `sim.era.temp > 0` ou si la tuile est sèche), jamais pendant la pluie.
3. Coupe-feu naturels : une rivière, une route (`W.road`), un champ, ou une tuile déjà brûlée sans végétation bloquent la propagation (le test existe pour « brûlé sans végétation » l.28 ; ajouter route et eau voisine).
4. Éteindre vite quand l'orage se termine : prolonger `damp` pendant ~100 ticks après la pluie.

**Vérification.** Réutiliser `endure.js` / `nat.js` (graines 7, 3, 5, 120 000 ticks) : objectif « jamais plus de 25 % des terres brûlées en 100 ans, forêt ≥ 60 % de son niveau de départ ». Ajouter un test dans `tests/powers-run.js` : un seul feu allumé dans une forêt de 400 tuiles ne doit pas en brûler plus de ~40 %.

---

## 2. Le sol brûlé ne s'efface jamais et paraît bruité

**Symptôme.** Les arbres repoussent (jusqu'à 60–97 %), mais le compteur de tuiles « brûlées » ne baisse jamais (21 025 → 21 907 entre les années 25 et 100). À l'écran : un damier sombre très bruité sur toutes les anciennes zones (visible sur les captures de nuit et de pouvoirs).

**Cause (CONFIRMÉE).** Le bit 4 de `W.flags` est mis à 1 dans `fireTick` (l.26) et dans `Pw.explode` (l.42–43). Aucune ligne du code ne le remet à 0 (recherche de `&= ~4` : rien ; `World.setGround` l.110 ne le touche pas). Le shader `src/client/gl.js` l.45 dessine ce bit en cellules sombres de 2 et 4 pixels, avec une probabilité fixe : motif haché et permanent. Ce rendu date d'un correctif récent (cellules plus grosses), mais il reste visuellement dur.

**Réparation.**
1. **Faire disparaître la cicatrice.** Dans le hook `tile()` de `powers.js` (l.143, appelé toutes les 32 ticks pour chaque tuile), effacer le bit 4 si la tuile ne brûle pas : probabilité ≈ 1/40 par passage (durée moyenne ≈ 1 280 ticks, soit ~1 an de jeu), plus rapide s'il pleut ou s'il y a de la pousse (`W.feature[i]` non nul). `W.mark(x, y)` pour redessiner.
2. **Adoucir le rendu** (`gl.js` l.45) : remplacer le damier par une teinte douce (mélange vers un brun sombre, dégradé sur 2 niveaux d'après l'âge de la cicatrice) au lieu de pixels sombres isolés. Si l'âge est utile, stocker 2 bits d'ancienneté dans `flags` (bits libres à vérifier) ou garder un tableau `scorch` d'`Uint8` (0 = rien, 255 = fraîche) décrémenté par le hook.

**Vérification.** `nat.js` : le nombre de tuiles marquées doit redescendre vers < 5 % des terres dans les ~10 ans suivant un incendie. Nouvelle capture de nuit à comparer.

---

## 3. Les saumons envahissent tout, la faune terrestre s'effondre

**Symptôme.** Saumons : 600–900 à partir de l'année 50, soit **environ la moitié de toutes les créatures**. Cerfs, lapins, sangliers : 2–6 individus.

**Cause (CONFIRMÉE).** `src/sim/creatures.js`, `C.life` (l.93–95) et `init` (l.99). Il n'y a qu'un plafond **global** `sim.animalCap = n²/70` (≈ 936 sur 256²) partagé par toutes les espèces. La naissance exige `sim.nAnimals < sim.animalCap` (l.94). Le saumon (fertilité 1,6, durée de vie 6, aucun prédateur dans le code ; la faim ne semble pas le limiter, je ne l'ai pas isolée) se reproduit le plus vite, remplit le plafond, et plus rien d'autre ne peut naître. La limite locale (`same < herd*2 + 3`, 13 individus dans 12 tuiles) ne borne que la densité, pas le total : sur une grande étendue de hauts-fonds, le total n'a pas de limite propre.

**Réparation.**
1. **Plafond par espèce.** À l'`init`, calculer `K.cap = animalCap × K.density / Σ densités × 1,5` (ou le nombre de tuiles du biome × `K.density`/coefficient). Dans `C.life`, remplacer le test global par `sim.kindCount[kind] < K.cap && sim.nAnimals < sim.animalCap`. `kindCount` existe déjà.
2. Donner une pression naturelle au saumon : l'aigle et l'ours pêchent (ajouter `salmon` aux proies de `C.think` / `ok` l.70), et les pêcheurs humains prélèvent déjà.
3. Surveiller la proportion : le test `eco-run.js` doit échouer si une espèce dépasse 40 % du total.

**Vérification.** `endure.js` : aucune espèce > 25 % du total d'animaux, aucune espèce sous 3 individus après la migration existante.

---

## 4. Les aigles ne bougent pas quand on les contrôle

**Symptôme (signalé par toi).** Un aigle contrôlé reste immobile.

**Cause (CONFIRMÉE).** `src/sim/creatures.js` l.105 (branche `F.CONTROLLED`) :
```
if (E.flags[i] & F.CONTROLLED) { if (U.moving(E, i)) U.move(sim, i); else if (E.act[i] === CA.ATTACK) C.act(sim, i, K); else E.anim[i] = AL.ANIM.idle; continue; }
```
Pour un volant ou un nageur, la commande `order` (`powers.js`, handler `order`) ne calcule pas de chemin : elle met seulement `E.tx/ty`, `E.act = 1` (WANDER) et `E.phase = 0`. Or `U.moving` ne regarde que `pathLen` et `flow`, donc il renvoie faux, et la branche tombe sur « idle ». Le déplacement direct des volants (`glide`, l.108) n'est appelé que dans la boucle libre, que `continue` court-circuite. Le test `tests/powers-run.js` l.54 ne contrôle que le premier être vivant venu (une personne), jamais un volant : il passait malgré tout.

**Réparation.** Dans la branche contrôlée, avant `else E.anim... idle`, ajouter le cas des volants/nageurs :
```
else if ((K.fly || K.swim) && E.act[i] === CA.WANDER && E.phase[i] === 0) { E.anim[i] = K.fly ? AL.ANIM.fly : AL.ANIM.swim; if (glide(sim, i, K)) { E.phase[i] = 1; E.act[i] = CA.IDLE; } }
```
(en gardant le cas `K.swim` limité à l'eau, comme `go` l.59). Ajouter un test `control` sur un aigle et un saumon.

**Vérification.** Test : contrôler un aigle, ordonner un point à 20 tuiles, vérifier qu'il s'en approche à moins de 1,5 tuile en 200 ticks.

---

## 5. Les villages restent aux maisons de base

**Symptôme (signalé par toi).** Les bâtiments ne passent pas aux stades suivants.

**Cause (CONFIRMÉE).** Deux verrous empilés.
1. L'aspect d'un bâtiment est `Math.min(2, town.stage >> 1)` (`towns.js` l.17 et l.109) : le style « bois » n'apparaît qu'au stade de ville 2, le style « pierre » qu'au stade 4.
2. Le stade de ville dépend d'un **seuil de population** (`stages.json` : 6, 16, 36, 80, 150) divisé par `devSpeed` du peuple (`towns.js` l.108 : `nx.pop × 1/devSpeed`). Pour les orques (devSpeed 0,75) : 8, 21, 48, 107, 200. Or, dans mes parties, la plupart des villes ont 1–40 habitants (voir bug 6) et les incendies/guerres les ramènent en arrière ; le stade 4 (pierre) exige ≥ 80 (≥ 107 orques) plus forge, bibliothèque et caserne.

Résultat observé : une ou deux villes atteignent le stade 2 (style bois), très peu le 3, presque aucune le 4.

**Réparation.**
1. **Découpler le style de la population.** Faire dépendre `B.stage` de la connaissance et des bâtiments construits (par exemple `town.knowledge` + ères mondiales), pas seulement de la taille. Idée simple : style bois dès le stade de ville 1 ; style pierre dès le stade 3.
2. **Abaisser les seuils** de `stages.json` (ex. 6 / 12 / 24 / 45 / 90) ou les rendre dépendants de la surface cultivable, sans changer le reste.
3. **Permettre le progrès par royaume** : si la capitale est au stade N, les villes du même royaume passent au stade ≥ N − 1.
4. Corriger aussi le bug 6, qui garde beaucoup de villes minuscules.

**Vérification.** `town-run.js` : après 40 000 ticks, la plus grande ville doit être au stade ≥ 2 et utiliser le style bois ; à 100 ans, au moins une ville au style pierre sur 2 graines sur 3. Capture de comparaison d'un village avant et après.

---

## 6. Villages de 1 à 5 habitants, éternels

**Symptôme.** Dans une partie de 90 000 ticks, 8 villes sur 11 ont 1–2 habitants depuis plus de 20 ans, avec de la nourriture en réserve (65–86) et de la place (capacité 9).

**Cause (CONFIRMÉE).** Relevé sur 4 de ces villes : leurs habitants sont les derniers colons d'origine, âgés de 37 à 42 ans (vieillards pour des orques à 50 ans), **sans conjoint** ou en paire de même sexe (F+F), presque tous marqués vieux (`ELDER`), dont l'un est totalement seul. Sans couple fertile, `units.js` l.153 (naissance) ne se déclenche jamais, et rien d'autre n'alimente ces villes :
- `R.colonize` (`realm.js` l.62–65) envoie jusqu'à 6 colons **choisis au hasard** (50 % chacun) parmi les adultes non militaires, sans garantir un couple d'âge fertile, et sans stock de départ pour la nouvelle ville ;
- `towns.js` l.123 n'abandonne une ville que si `pop === 0` : une ville avec deux vieillards survit indéfiniment ;
- les gens « sans ville » (9 dans mon relevé) n'ont pas de règle pour rejoindre une ville existante ;
- cas annexe (ville « Ghaanakdaarr ») : un chantier de maison reste ouvert (`sites 1`), le travail « bâtisseur » est demandé (`want 1`) mais jamais pourvu, car l'assignation ne prend que les inactifs (`T.assign`, `towns.js` l.~99) : deux adultes occupés comme chasseur/cueilleur ne sont jamais réaffectés.

**Réparation.**
1. `R.colonize` : choisir les colons pour avoir **au moins un couple fertile** (2 sexes, âge ≥ maturité et < 60 % de la durée de vie) ; sinon ne pas partir. Donner un stock de départ prélevé sur la ville d'origine (par exemple 20 bois, 30 nourriture).
2. Abandon ou fusion : si une ville a `pop ≤ 3`, aucun couple fertile et plus de 5 ans d'existence, dissoudre et envoyer les survivants vers la ville la plus proche du même royaume (message dans la chronique).
3. Immigration : les gens sans ville rejoignent la ville la plus proche du même peuple qui a de la place.
4. `T.assign` : pouvoir **prendre un travailleur déjà employé** quand un poste vide a un ratio 0 (bâtisseur d'un chantier ouvert depuis > 1 000 ticks).

**Vérification.** `town-run.js` / `nat.js` : à 100 ans, aucune ville de ≤ 3 habitants plus vieille que 10 ans. Test headless dédié : colonie de 6 adultes sans couple, la ville doit être dissoute ou recevoir des colons.

---

## 7. Les religions arrivent très tard

**Symptôme.** Première religion naturelle entre l'an 37 et l'an 50 ; aucune en 62 ans dans la session navigateur.

**Cause (CONFIRMÉE).** `src/sim/culture.js` l.68 : un prophète naturel n'apparaît que si `t.pop >= 12 && (temple ou pop >= 30)`, avec 6 % (sans temple) ou 30 % (avec temple) de chances par an. Le temple exige le stade de ville 2 (`buildings.json` : `temple stage 2`), donc pop ≥ 16 (21 orques) + ferme + entrepôt, plus 25 bois et 30 pierre. Les villes de ≥ 30 habitants arrivent tard et sont rares (bug 6).

**Réparation.** Abaisser et lisser les conditions : par exemple `pop >= 8`, probabilité annuelle `0,05 + 0,2 × culture.faith` sans temple, ×2 avec temple ; une religion par culture au plus tant qu'aucune n'existe.

**Vérification.** `culture-run.js` : première religion avant l'an 25 sur 3 graines.

---

## 8. Guerres « bizarres »

**Symptôme (signalé par toi).** Je n'ai pas de cause prouvée. Observations dans mes parties :
- avec humains et orques posés à 24 tuiles, les humains disparaissent en moins de 60 ans ;
- plusieurs reines couronnées puis tuées « par violence » en quelques années ;
- le nombre de royaumes retombe à **1** dans 2 graines sur 3 (graine 11 : 1 royaume dès l'an 50) ;
- armées de 2 à 6 soldats (dette connue).

**Causes PROBABLES (code lu, effet non mesuré).**
- `realm.js` l.43 : la relation cible entre royaumes de peuples différents est de base `−28` contre `+12` pour le même peuple, donc la guerre est quasi certaine entre humains et orques quelle que soit leur situation.
- Le souverain n'est exempt d'aucun combat (`F.RULER` n'est pas protégé dans `War.hostile` ni dans les combats) : il est tué dès que sa ville est attaquée, ce qui provoque des successions en chaîne.
- Il n'y a pas d'évaluation de force avant de déclarer la guerre à courte distance, ni de trêve minimale entre deux guerres (la paix pose seulement un traité de 9 600 ticks).

**Pistes de réparation (à valider par mesure).**
1. Étudier d'abord : lancer 10 graines avec humains/orques à 24, 44 et 80 tuiles et compter victoires, durées, morts de souverains, royaumes restants. Seulement ensuite modifier.
2. Souverain : le garder en retrait (ordre de repli, garde du corps, ou le rendre difficile à toucher) pendant un siège.
3. Évaluer la force relative avant de déclarer ; plafonner la fréquence des guerres (trêve plus longue après une défaite).
4. Pour éviter qu'un royaume avale tout : malus de stabilité à partir de N villes, rébellions plus fréquentes (déjà codées).

---

## 9. Scintillement et pixels isolés des personnages

**Symptôme.** 299 animations dépassent le seuil de scintillement (pire : 56 %), 7,16 % de pixels isolés sur les personnages humains. Les pires cas sont `pray` et `death` (20–56 %).

**Causes.**
- **La mesure est trop sévère pour les grands mouvements (CONFIRMÉE sur les chiffres).** `tools/measure-sprite.js` compte les changements de couleur par position ; dans `pray` et `death` les membres bougent vraiment, donc beaucoup de pixels changent légitimement. Ce n'est pas du scintillement.
- **La stabilisation ne couvre qu'une partie (CONFIRMÉE).** `tools/lib/sdf.js` `stabilize` ne touche que les pixels de même matériau à la même position après compensation du décalage global du corps ; un bras qui se déplace n'est pas traité. Les retouches à la main prévues par la méthode (`tools/art/patches/people.json`) n'existent pas : le dossier `tools/art/patches` est absent.
- Pixels isolés : `despeckle` fait 2 passes en 4-voisins seulement (l. 181–187), et ne traite pas les reflets/bords légitimes d'un pixel.

**Réparation.**
1. Changer la métrique : ne compter que les pixels **opaques dans les deux images et de même matériau** (vrai scintillement d'ombrage), ou fixer des seuils par type d'animation (idle/walk strict, pray/death tolérants).
2. Étendre `stabilize` : hystérésis du ton avec un petit décalage de recherche (±1 px) pour suivre un membre ; ou rendre les tons à partir de normales stables entre images.
3. Passer `despeckle` à 3 passes avec voisinage 8 sur les matériaux de vêtement, puis faire les retouches manuelles des poses clés (fichier `tools/art/patches/people.json`, format déjà prévu par `bake-people.js`).
4. Vérifier avec les planches ×4 / ×8 (`tools/sheet.js`) avant et après, comme l'exige `CLAUDE.md`.

---

## 10. Pic de 89 ms sur un tick

**Constat.** Un seul tick à 89 ms (graine 11, tick 21 234) pendant les parties parallèles. **Non reproduit** : relancé seul avec chronométrage par module, le plus long tick fait 10 ms. Cause la plus probable : bruit machine (3 processus en parallèle, ramasse-miettes). Rien à corriger sur cette seule observation ; à remesurer sur la machine de test.

---

## Ordre de travail conseillé

1. Bugs 4, 2 et 3 (quelques lignes chacun, résultats visibles tout de suite).
2. Bug 1 (feu), à régler avec `nat.js` en boucle.
3. Bugs 6 puis 5 (colonies et stades), qui se renforcent.
4. Bug 7 (religions), puis étude du bug 8 (guerres).
5. Bug 9 (art) à intégrer à la passe de finition de l'étape 14.

Chaque correctif devrait avoir son test headless avant de passer au suivant ; la suite `node tests/run-all.js` doit rester verte.

## Limites de cette analyse

- Pas de vrai PC ni de téléphone : aucune mesure de performance réelle (rendu logiciel, 10–20 images/s).
- Le son n'a pas été écouté.
- Pas de revue indépendante : l'analyse a été faite par le même assistant qui a écrit le code.
- Les bugs 8 et 9 sont en partie des hypothèses ; les autres ont une cause lue dans le code et confirmée par une mesure ou une relecture.

## Passe d'équilibrage (robot `tools/balance-bot.js`)
Au-delà des bugs isolés, le jeu a été joué par un robot et jugé contre des cibles écrites. Résultat : voir `BALANCE.md` (55/79 cibles au départ, 83/83 à la fin ; décisions et choix gardés volontairement y sont expliqués). Limites connues : rapport humains/orques médian 0,30 (orques toujours plus nombreux), armées petites, famine encore possible.

## Signalés en jouant (deuxième série)
| # | Symptôme | Statut | Cause et réparation |
|---|---|---|---|
| 12 | La plupart des textes restent en anglais même avec « Français » | **réparé** | Seuls les 38 messages du journal d'événements et du livre d'histoire étaient écrits en anglais dans la simulation. Ils portent maintenant une clé de traduction et leurs arguments (`AL.fmt`, `AL.logText`, 64 clés EN/FR dans `i18n.json`) ; l'anglais produit reste identique, la phrase française est composée à l'affichage, donc elle change quand on change de langue (même pour les anciens événements). Autres défauts trouvés : `sim.emit` ne transmettait que 4 valeurs (la clé était perdue), les dogmes d'une religion fondée s'affichaient vides (« (, , ) »), un tiret long absent de la police s'affichait « ? ». Test : `tests/i18n-run.js`. Les anciennes sauvegardes gardent leurs phrases anglaises. |
| 13 | Les aigles semblent ne pas bouger quand on les contrôle | **partiellement vérifié** | Avec de vrais clics, l'aigle obéit (il traverse la carte). Mais **aucune unité sélectionnée ou contrôlée n'avait de marqueur à l'écran** (la position était calculée puis jamais dessinée, et jamais notée pour les animaux) : un oiseau de 16 pixels qui vole sans repère donne l'impression de ne pas répondre. Ajouts : crochets autour de la unité sélectionnée (violets si contrôlée), croix à l'endroit du dernier ordre, rayon de sélection élargi. Non reproduit : un blocage réel d'un aigle ; si le problème persiste, dire dans quelles conditions (en pause ? aigle sauvage en vol ?). |
| 14 | Les êtres marchent « en moonwalk » : le corps va vers la droite, la tête regarde à gauche | **réparé** | Les images baked étiquetées `left` regardent vers la **droite** à l'écran, et `right` vers la gauche : le baker les nomme d'après le signe de la rotation (yaw) du moteur de rendu, pas d'après le côté visible. Vérifié sur planches agrandies pour les humains, les orques, les quadrupèdes (cerf, mouton, sanglier, ours, loup) et les oiseaux (aigle). Réparé à l'affichage (`DIRN` et les images à deux directions mort/sommeil dans `src/client/scene.js`) plutôt que dans le baker : changer le yaw toucherait les yeux, l'équipement et les retouches de chaque sprite. Vérifié dans le navigateur : humain, cerf, loup et aigle contrôlés, envoyés à droite puis à gauche, regardent du côté où ils vont. Attention : si les bakers changent un jour de convention, il faudra annuler l'inversion dans `scene.js`. |
