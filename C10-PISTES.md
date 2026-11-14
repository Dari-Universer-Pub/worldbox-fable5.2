# C.10 — Arbres transparents : les pistes sur la table

Document de discussion avec Julien. **Décision prise : piste 1 (fenêtre en vrai fondu), sans tronc gardé opaque. Elle est codée ; voir `RESUME.md`.** Le reste du document garde la trace des pistes écartées.
La version actuelle (trame 2×2, commit 8e955f9) ne convainc pas : Julien veut « qu'on voie vraiment bien derrière ».
Contrainte fixe : **le dessin des arbres ne change pas**, seul le rendu change.

## Ce que montrent les captures actuelles (`shots/c10-z2-*.png`, `shots/c10-z3-*.png`)

La trame fait un grillage posé sur l'objet. Les couleurs de l'arbre et de ce qui est derrière se mélangent :
on repère qu'il y a quelque chose, mais on ne reconnaît ni le colon ni l'ours. Devant les bâtiments, on voit un damier sur le toit.

## Ce qui existe déjà et sert à toutes les pistes

- Le masque des objets cachés : un rond par être vivant et par bâtiment, avec sa profondeur (`G.occ`, `progM`, `fboOcc` dans `src/client/gl.js`, appelé depuis `src/client/scene.js`).
- Le drapeau 128 des arbres adultes (`src/client/main.js`).
- Le test « cet arbre est-il devant l'objet ? » (`vDepth > m.r + .006`).
- L'interrupteur `AL.Gfx.veilOff` et l'extinction en vue éloignée (rien sous le zoom 1, plein effet à partir de 1,5).

## Le point technique commun aux pistes 1 et 2

Aujourd'hui, le canal alpha de l'image de la scène ne porte pas l'opacité : il porte la **lumière émise** (feux, fenêtres la nuit, lave).
Les sprites sont donc dessinés sans mélange : un pixel d'arbre est là ou n'y est pas. C'est pour cela que la première version est une trame.
Pour un vrai « à moitié transparent », il faut ranger la lumière émise dans une seconde image, libérer l'alpha pour l'opacité,
et activer le mélange dans la passe des sprites (ils sont déjà triés du fond vers l'avant). Cela touche quatre shaders
(terrain, sprites, ombres, assemblage final) et demande de revérifier la nuit.

## Les pistes

### 1. Fenêtre en vrai fondu
- **À l'écran** : autour de chaque être caché, le feuillage devient presque invisible (10 à 15 % d'arbre) dans un rond un peu plus grand que l'être, bord fondu sur 4 à 5 px. Devant un bâtiment caché, arbres à environ 30 %. Apparition et disparition en un quart de seconde. On voit l'unité, son animation et ce qui l'entoure.
- **Coût** : le plus gros. Le changement de rendu décrit ci-dessus.
- **Risque** : feux, fenêtres la nuit, lave et effets à revérifier. Un village en forêt donne une grande zone de feuillage fantôme (ronds qui se rejoignent).

### 2. Arbre entier fantôme
- **À l'écran** : tout arbre qui cache quelque chose passe **en entier** à environ 30 % d'opacité, tronc compris. Les arbres qui ne cachent rien restent pleins.
- **Coût** : le même changement de rendu que la piste 1, plus une décision par arbre (et non par pixel) et un fondu dans le temps par arbre.
- **Risque** : près d'un village, presque tous les arbres cachent quelque chose, donc toute la forêt alentour devient translucide. Les arbres s'allument et s'éteignent au passage des unités : sans fondu dans le temps, ça clignote.

### 3. Découpe à la forme exacte
- **À l'écran** : l'arbre est percé pile à la silhouette de l'unité, avec 1 px de marge. L'unité apparaît à 100 %, dans ses vraies couleurs, animée.
- **Coût** : moyen. Le masque est dessiné avec les sprites eux-mêmes au lieu de ronds. Le cœur du rendu ne bouge pas (pas de vraie transparence nécessaire).
- **Risque** : l'unité a l'air d'être devant l'arbre, on perd la profondeur. Pour un bâtiment, l'arbre devant disparaît à sa forme, ce qui fait bizarre. On ne voit pas le sol autour de l'unité.

### 4. Silhouette colorée par-dessus
- **À l'écran** : arbres intacts ; l'unité cachée est redessinée par-dessus en forme unie à la couleur de son royaume.
- **Coût** : faible.
- **Risque** : on sait où et à qui, pas quoi. Ne répond pas vraiment à « voir vraiment bien ».

### 5. Trame plus ouverte
- **À l'écran** : comme aujourd'hui, mais 3 pixels d'arbre sur 4 retirés dans le rond.
- **Coût** : presque rien (un seuil à changer).
- **Risque** : reste un grillage ; tombe mal au zoom 1,5 (pixels d'écran inégaux). Déconseillée.

### 6. Touche « cacher les arbres » (complément)
- **À l'écran** : une touche du clavier ; tous les arbres deviennent des souches, ou fondent autour du curseur.
- **Coût** : faible.
- **Risque** : c'est un geste du joueur, pas un effet automatique. Complète une autre piste, ne la remplace pas.

### Option commune aux pistes 1 à 3 : tronc gardé opaque
Le bas du tronc reste plein, seul le feuillage s'efface : on voit encore où l'arbre est planté.
Risque : le tronc peut couper les pieds d'une unité (il est mince).

## Recommandation de l'agent

**Piste 1, avec le tronc gardé opaque.** C'est la seule où l'on voit à la fois l'unité, son animation et ce qui l'entoure, sans effet de grille.
Les réglages (taille du rond, 10 ou 15 %, durée du fondu) se retouchent ensuite facilement.
Repli sans risque pour la lumière : piste 3, pour les êtres seulement.
La piste 6 peut s'ajouter plus tard, quelle que soit l'autre.

## Après le choix de Julien

Coder, `node tools/build.js`, captures avant/après aux zooms 1, 1,5, 2 et 3 regardées, vérification de nuit (fenêtres, feux, lave)
si le rendu de la lumière a changé, mesure du temps d'image, notes « Vu / Non vérifié / À tester par Sonnet » dans `RESUME.md`,
C.10 recochée dans `CHANTIER.md`, un commit, poussé sur `claude/ecstatic-lovelace-b5e456`.
