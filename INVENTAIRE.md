# INVENTAIRE — ce qui existe dans Aeonloom et ce qui manque

Établi à partir des fichiers de `src/data` et d'une recherche dans `src/sim`. « Défini » = présent dans les données ; « actif » = utilisé par le code de la simulation. Ce qui n'a pas été vérifié est marqué comme tel.

## Contenu (données)

| Élément | Présent | Visé par le plan | Remarque |
|---|---|---|---|
| Peuples | 6 définis, **2 actifs** (humains, orques) | 6 | elfes, nains, myrrins, okaris : provisoires, cachés dans la barre d'outils (option « provisoires ») |
| Animaux | 8 | 40 | lapin, cerf, mouton, sanglier, loup, ours, aigle, saumon |
| Monstres | 3 | 20 | zombie, squelette, démon (ni dragon, ni géant, ni colosse) |
| Pouvoirs | 44 | 100 | |
| Métiers | 21 | 20 | **3 ne servent à rien** : marin, ingénieur, guérisseur |
| Bâtiments | 17 types × 3 stades | 15 types × 5 stades | stades 4 et 5 manquants |
| Ères | 10 | 10 | complet |
| Dogmes | 12 | 12 | complet |
| Traits | 60 | 60 | complet |
| Flore | 31 | 25 | complet |
| Sols / biomes | 18 | 14 | complet |
| Ressources | 10 | 4 minerais dont 1 rare | cuivre, fer, or, aéthérite : complet |
| Sons / musiques | 77 / 3 pistes | 120 / 8 | |

## Mécaniques actives et vérifiées par le robot (`BALANCE.md`)

- Cycle de vie : naissances, mariages, vieillesse, héritage, mutations.
- Économie : récolte, stocks, famines, commerce, routes qui se forment.
- Bâtiments : chantiers visibles, ruines, effondrement.
- Royaumes : capitale, succession, dynasties, alliances, traités, mariages royaux, vassalité, rébellions et indépendance.
- Guerre : mobilisation (levée de 30 à 55 % des adultes), sièges avec dégâts aux bâtiments, paix par lassitude de guerre.
- Culture, langues, religions (prophètes, schismes), chronique, histoire.
- Nature : monde sauvage stable, feu, météo (pluie, orage, neige, brouillard), catastrophes, jour et nuit.

## Ce qui manque ou n'est pas actif (recherche dans le code, rien trouvé)

- **Mer :** pas de bateaux ni de colonisation par la mer (une île reste fermée ; départ sur une île de 1 200 tuiles : plafond d'environ 140 habitants).
- **Ponts :** aucun.
- **Saisons :** aucune.
- **Cavalerie et machines de siège :** introuvables dans le code (les sièges se font à la main).
- **Fusion de royaumes :** non trouvée. Rébellions et indépendance existent, pas de fusion ni de guerre civile à proprement parler.
- **Pillage et réfugiés :** absents.
- **Moral :** seulement un trait, pas de vraie fuite sur le champ de bataille (non vérifié en détail).
- **Dragon avec nid et trésor, colosse contrôlable :** absents.
- **Métiers inutilisés :** marin, ingénieur, guérisseur (définis, jamais affectés par le code).

## Non vérifié

- qualité des sprites des 4 peuples provisoires ;
- amitiés et rivalités entre individus (le code gère les couples ; pas de vraie amitié vue) ;
- effet réel d'un hôpital sans métier de guérisseur ;
- ressenti de jeu, son, performances sur un vrai PC, tactile (voir `BALANCE.md`).

## Étapes du plan restantes

12 (finir : 40 espèces, pouvoirs provisoires jusqu'à 100, sons, validation des données), 13 (titre, chargement, icônes), 14 (vérification finale, deux longues parties, revue indépendante, rapport).
