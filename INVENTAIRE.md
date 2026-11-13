# INVENTAIRE — ce qui existe dans Dustcrown et ce qui manque

Établi à partir des fichiers de `src/data` et d'une recherche dans `src/sim`. « Défini » = présent dans les données ; « actif » = utilisé par le code de la simulation. Ce qui n'a pas été vérifié est marqué comme tel.

## Contenu (données)

| Élément | Présent | Visé par le plan | Remarque |
|---|---|---|---|
| Peuples | 6, tous jouables et non provisoires (humains, orques, elfes, nains, myrrins, okaris) | 6 | depuis A.8 chacun des 4 derniers a son bâtiment, son métier et son comportement propres ; duels contre humains et orques non équilibrés (Sonnet) |
| Animaux | 40 (8 soignés + 32 provisoires) | 40 | les provisoires n'apparaissent jamais seuls (densité 0), seulement posés par le joueur |
| Monstres | 20 (3 soignés + 17 provisoires) | 20 | dont dragon, géant, golem, esprit, néantin, léviathan, colosse 64×64 ; comportement générique |
| Pouvoirs | 100 (tous de vrais pouvoirs depuis A.7) | 100 | chacun a son icône, son effet, son son et son geste propre ; équilibrage non réglé |
| Métiers | 25 (dont 4 propres à un peuple : gardien, puisatier, sporier, plongeur) | 20 | tous affectés : le marin mène les barques (B.2), l'ingénieur pose les ponts et répare, le guérisseur soigne (B.3) |
| Bâtiments | 18 types × 5 stades dessinés × 6 peuples (dont l'enclos, chantier B.9) + 4 bâtiments propres (bosquet, puits, champignonnière, maison des marées) | 15 types × 5 stades | fait (chantiers A.6 et A.8) |
| Ères | 10 | 10 | complet |
| Dogmes | 12 | 12 | complet |
| Traits | 60 | 60 | complet |
| Flore | 31 | 25 | complet |
| Sols / biomes | 18 | 14 | complet |
| Ressources | 10 | 4 minerais dont 1 rare | cuivre, fer, or, aéthérite : complet (7 icônes de ressources non dessinées) |
| Sons / musiques | 163 sons (plus aucun provisoire ; les 44 derniers ont trois prises chacun) / 8 pistes (48 à 89 s, 5 à 8 parties) | 120 / 8 | mesurés (`measure-audio --music` OK), **jamais écoutés : à juger à l'oreille par Julien** |

Ces comptes sont vérifiés par `node tools/validate-data.js` (tableau « vision / données / provisoire »).

## Mécaniques actives et vérifiées par le robot (`BALANCE.md`)

- Cycle de vie : naissances, mariages, vieillesse, héritage, mutations.
- Économie : récolte, stocks, famines, commerce, routes qui se forment.
- Bâtiments : chantiers visibles, ruines, effondrement.
- Royaumes : capitale, succession, dynasties, alliances, traités, mariages royaux, vassalité, rébellions et indépendance.
- Guerre : mobilisation (levée de 30 à 55 % des adultes), sièges avec dégâts aux bâtiments, paix par lassitude de guerre ; depuis B.4 : cavalerie (chevaux apprivoisés), armes selon le stade, héros et champions, moral et fuite, blessures et soins, béliers et catapultes, pillage, réfugiés (`src/sim/war.js`). Calque « Guerres » (B.5) : fronts, armées en marche, sièges, villes prises.
- Culture, langues, religions (prophètes, schismes), chronique, histoire. Depuis B.9 : élevage (enclos, bêtes apprivoisées à cloche, lait et laine, abattage) et migrations saisonnières (cerf, élan, bison, éléphant, cheval, mouette, corbeau) — `src/sim/herds.js`.
- Nature : monde sauvage stable, feu, météo (pluie, orage, neige, brouillard), catastrophes, jour et nuit.

## Ce qui manque ou n'est pas actif (recherche dans le code, rien trouvé)

- **Mer :** fait (B.2) : barques de pêche au large, navires de colons vers une autre terre (une île de départ atteint 2 310 habitants en 100 ans). Manquent : commerce par mer, combat naval, chantier naval distinct du port.
- **Ponts :** fait (B.1) : les villes jettent des ponts de planches sur les eaux peu profondes ; pas de garde-corps ni de piles.
- **Saisons :** aucune.
- **Cavalerie et machines de siège :** faites en B.4 (atlas `cavalry` 32×32, atlas `machines` 48×48, `src/sim/war.js`) ; équilibrage à faire par Sonnet.
- **Fusion de royaumes, guerre civile, chef d'alliance :** faits en B.6 (`src/sim/diplo.js`) ; rébellion d'une ville seule et mariage de deux souverains toujours jamais vus.
- **Pillage et réfugiés :** absents.
- **Moral :** seulement un trait, pas de vraie fuite sur le champ de bataille (non vérifié en détail).
- **Dragon avec nid et trésor, capacités du colosse :** absents (le dragon et le colosse existent comme monstres provisoires au comportement générique ; le pouvoir « contrôle » marche sur eux comme sur toute créature, non vérifié en jeu).
- **Métiers inutilisés :** aucun (B.3). L'ingénieur et le guérisseur n'ont pas encore leurs propres sprites (B.4).

## Non vérifié

- les 4 peuples provisoires dans une vraie partie longue, et leurs guerres (le robot ne les joue que seuls) ;
- amitiés et rivalités entre individus (le code gère les couples ; pas de vraie amitié vue) ;
- effet réel d'un hôpital sans métier de guérisseur ;
- ressenti de jeu, son, performances sur un vrai PC, tactile (voir `BALANCE.md`).

## Étapes du plan restantes

12 faite (squelette de données et contenu provisoire), 13 (titre, chargement, icônes), 14 (vérification finale, deux longues parties, revue indépendante, rapport : réservée à un autre agent).
