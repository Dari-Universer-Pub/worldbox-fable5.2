# Ancienne icône du menu « Créatures » (dossier temporaire)

Dossier temporaire, à supprimer une fois la décision prise par Julien.

- `shots/ancienne-icone-creatures/ancienne-x16.png` : l'ancienne icône (empreinte de patte), agrandie ×16.
- `shots/ancienne-icone-creatures/actuelle-x16.png` : l'icône actuelle (tête de renard), posée au chantier C.4 (commit 8eebe8d).

Ces deux images servent seulement à regarder. La vraie source est dans `tools/art/icons.js` (clé `cat_creatures`), jamais dans un PNG.

## Source de l'ancienne icône

Elle est toujours dans `tools/art/icons.js`, ligne 15 :

```js
I.cat_creatures = [E(8, 10, 3, 2.5, 'e2'), C(4, 6, 1.5, 'e2'), C(7, 4, 1.5, 'e2'), C(10, 4, 1.5, 'e2'), C(12.5, 6.5, 1.5, 'e2')];
```

Elle est écrasée plus bas dans le même fichier (vers la ligne 169) par la nouvelle définition, qui commence par :

```js
I.cat_creatures = [P([2, 1, 6, 5, 10, 5, 14, 1, 14, 8, 8, 14, 2, 8], 'e3'), ...
```

## Pour remettre l'ancienne icône (seulement si Julien le demande)

1. Dans `tools/art/icons.js`, supprimer la seconde ligne `I.cat_creatures = [P([2, 1, 6, 5, ...` (vers la ligne 169). La ligne 15 redevient alors la définition utilisée. Ne toucher à aucune autre icône.
2. `node tools/bake-all.js` puis `node tools/build.js`.
3. Regarder le résultat : `node tools/sheet.js icons --match "^ic/cat_creatures$" --scale 16 --out shots/cat-creatures.png` et l'ouvrir ; il doit être identique à `shots/ancienne-icone-creatures/ancienne-x16.png`.
4. Ouvrir le jeu une fois (`node tests/shot.js shots/barre.png "" 1500`) et regarder l'onglet Créatures dans la barre d'outils.
5. Supprimer ce dossier et `shots/ancienne-icone-creatures/`, noter le changement dans `RESUME.md`, un commit, pousser sur `claude/ecstatic-lovelace-b5e456`.
