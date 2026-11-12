# INVENTAIRE — ce qui existe dans Aeonloom et ce qui manque

Établi à partir des fichiers de `src/data` et d'une recherche dans `src/sim`. « Défini » = présent dans les données ; « actif » = utilisé par le code de la simulation. Ce qui n'a pas été vérifié est marqué comme tel.

## Contenu (données)

| Élément | Présent | Visé par le plan | Remarque |
|---|---|---|---|
| Peuples | 6 définis, **2 soignés** (humains, orques) + **4 provisoires jouables** (elfes, nains, myrrins, okaris) | 6 | les 4 provisoires ont leurs 18 aspects et leur architecture en 3 stades ; cachés tant que l'option « Contenu provisoire » est coupée |
| Animaux | 40 (8 soignés + 32 provisoires) | 40 | les provisoires n'apparaissent jamais seuls (densité 0), seulement posés par le joueur |
| Monstres | 20 (3 soignés + 17 provisoires) | 20 | dont dragon, géant, golem, esprit, néantin, léviathan, colosse 64×64 ; comportement générique |
| Pouvoirs | 100 (44 soignés + 56 provisoires) | 100 | les provisoires sont des variantes (rayon, durée, dispersion, invocations) |
| Métiers | 21 | 20 | **3 ne servent à rien** : marin, ingénieur, guérisseur |
| Bâtiments | 17 types × 3 stades dessinés × 6 peuples | 15 types × 5 stades | stades 4 et 5 déclarés dans `stages.json` mais dessinés avec les sprites du stade 3 |
| Ères | 10 | 10 | complet |
| Dogmes | 12 | 12 | complet |
| Traits | 60 | 60 | complet |
| Flore | 31 | 25 | complet |
| Sols / biomes | 18 | 14 | complet |
| Ressources | 10 | 4 minerais dont 1 rare | cuivre, fer, or, aéthérite : complet (7 icônes de ressources non dessinées) |
| Sons / musiques | 120 (76 + 44 provisoires) / 8 pistes (3 + 5 provisoires) | 120 / 8 | jamais écoutés |

Ces comptes sont vérifiés par `node tools/validate-data.js` (tableau « vision / données / provisoire »).

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
- **Dragon avec nid et trésor, capacités du colosse :** absents (le dragon et le colosse existent comme monstres provisoires au comportement générique ; le pouvoir « contrôle » marche sur eux comme sur toute créature, non vérifié en jeu).
- **Métiers inutilisés :** marin, ingénieur, guérisseur (définis, jamais affectés par le code).

## Non vérifié

- les 4 peuples provisoires dans une vraie partie longue, et leurs guerres (le robot ne les joue que seuls) ;
- amitiés et rivalités entre individus (le code gère les couples ; pas de vraie amitié vue) ;
- effet réel d'un hôpital sans métier de guérisseur ;
- ressenti de jeu, son, performances sur un vrai PC, tactile (voir `BALANCE.md`).

## Étapes du plan restantes

12 faite (squelette de données et contenu provisoire), 13 (titre, chargement, icônes), 14 (vérification finale, deux longues parties, revue indépendante, rapport : réservée à un autre agent).
