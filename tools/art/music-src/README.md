# Sources de la musique du jeu (chantier C.11) — en cours, rien n'est intégré

La musique de Dustcrown doit être **générée par une IA** : l'API musique d'ElevenLabs (modèle `music_v2_5`), avec la clé de Julien (offre Starter payante). C'est une exception à la règle 3 du projet, décidée par Julien (`DECISIONS.md`, D-C11). Les effets sonores restent synthétisés par le code. La clé n'est écrite nulle part : l'en-tête `xi-api-key: proxy-injected` est remplacé par le proxy de la session.

**État : le jeu joue toujours l'ancienne musique synthétisée.** Julien écoute d'abord, valide, et seulement ensuite on intègre.

## Premier essai : rejeté par Julien (14 novembre 2026)
Huit pistes avaient été générées par plan de composition (`chunks`), séparées en couches et intégrées au jeu. Julien les a trouvées affreuses : **on entend une voix dire « sixty BPM, four four »**. Cause : dans un plan de composition, le champ `text` d'un chunk contient les **paroles** (plus, au besoin, un nom de section entre crochets et des indications entre accolades), pas une description. Les descriptions y avaient été écrites, la voix les a dites ou chantées. La piste « vocals » de la séparation, prise pour la flûte, était cette voix.
Les sons de cet essai ont été retirés du dépôt. Restent, pour mémoire, dans `req-v1-rejected/` : les requêtes envoyées et les scripts d'alors. Ce qui reste vrai et utile de cet essai :
- coûts : génération 12,5 crédits par seconde, séparation en six pistes (`six_stems_v1`) 25 crédits par seconde, téléversement d'une référence 288 crédits pour 23 s ;
- les tempos demandés sont respectés à moins de 1 % ;
- la séparation redonne le mélange (somme des pistes à 32 dB sous le mélange, retard fixe de 25 ms) ; générer chaque couche à part ne marche pas (tempo et départ différents) ;
- `conditioning_ref` se met **dans chaque chunk**, sous la forme `{ "song_id": …, "range": … }` ; mis à la racine de la requête (comme au premier essai) il est très probablement ignoré ;
- le modèle ajoute presque toujours une mesure de conclusion à la fin, même si on demande le contraire ;
- il existe un `generation_mode` (`track`, `loop`, `ambience`) utilisable avec `prompt` : `loop` est à essayer pour les boucles.

## Second essai : extraits à écouter (14 novembre 2026)
`make-req2.js` écrit `req2/<piste>.json` : mode `prompt` (une description, pas de paroles possibles) avec `force_instrumental: true`, que l'API documente comme la garantie d'un morceau sans voix ; 34 s par piste. `gen2.sh <piste>` envoie la requête et écrit `raw2/<piste>.mp3`. Une seule requête à la fois. Chaque extrait a été généré une fois, sans tri. Copies à écouter : `shots/musique-v2/`.
Mesuré (`node tools/music-measure.js`) : calm 84,04 battements par minute pour 84, night 60,08 pour 60, war 131,68 pour 132, menu 72,02 pour 72, disaster 120,18 pour 120, dunes 96,14 pour 96, tide 80,12 pour 80, frost 56,96 pour 54 (piste clairsemée, mesure peu sûre). **Non vérifié : l'absence de voix** (l'agent ne peut pas écouter ; il s'appuie sur la garantie de l'API).
Ce mode n'accepte ni graine ni référence sonore : la parenté entre les pistes ne tient qu'au texte commun des descriptions.

## Crédits
Solde au début du chantier : 27 754. Premier essai : 19 270 dépensés. Second essai : 3 400 (8 × 34 s). **Solde : 5 084**, au ras du seuil d'arrêt de 5 000 fixé par Julien : plus aucune requête sans nouveaux crédits. Journal : `credits.txt`.

## Après la validation de Julien
Générer les pistes validées en longueur de boucle (essayer `generation_mode: "loop"`), les séparer en couches si le budget le permet, remettre un bloc `audio` par piste dans `src/data/music.json`, puis `node tools/music-build.js` (coupe sur les mesures, boucle, même loudness, MP3, mesures) et `node tools/build.js`. Le lecteur est déjà dans `src/client/audio.js` (inactif tant qu'aucune piste n'a de bloc `audio`). `manifest.json` liste les fichiers audio du projet avec leur empreinte ; `tools/check-provenance.js` n'accepte que ceux-là.

## Troisième étape : les extraits validés, prolongés (14 novembre 2026) — à écouter, rien d'intégré
Julien a écouté les 8 extraits du second essai : **tous validés, plus aucune voix**. Sa remarque : sur `calm` (jusqu'à l'entrée de la flûte vers 13 s) et surtout `night`, le début tourne longtemps sur un seul instrument. Il a fourni une **seconde clé** (40 000 crédits ; la première reste à 5 084).
Pour garder exactement ce qu'il a aimé, chaque extrait validé est **prolongé** au lieu d'être refait : `up.sh <piste>` téléverse `raw2/<piste>.mp3` (identifiant dans `req3/<piste>.song.json`), `make-req3.js` écrit `req3/<piste>.json` (`req3/night.json`, le premier essai, a été écrit à la main sur le même modèle), `gen3.sh <piste>` écrit `raw3/<piste>.mp3`. Le plan a deux chunks : le passage plein de l'extrait validé, repris tel quel (un chunk `{ song_id, range }`, coupé sur ses mesures, sans le début lent ni la fin), puis un chunk généré, conditionné sur ce même passage (`conditioning_ref` de 30 s au plus, sinon refus), avec `text: "[Instrumental]"` (un nom de section seulement : tout autre texte serait chanté).
Passage repris de chaque extrait : calm 11,4–28,6 s ; night 16–24 s ; war 0–29,2 s ; menu 6,7–30 s ; disaster 0–32 s ; frost 4,4–26,7 s ; dunes 0–30 s ; tide 0–30 s.
Mesuré : sur `night`, l'enveloppe sonore des 7,5 premières secondes de la prolongation suit celle du passage validé (corrélation 0,92 ; 0,13 pour un passage pris ailleurs) : le début est bien le passage validé, repassé par le modèle (la forme d'onde n'est pas identique à l'échantillon près). Durées et tempos : calm 77,1 s à 84,04 ; night 64,0 s à 60,08 ; war 87,5 s à 131,68 ; menu 83,4 s à 72,02 ; disaster 87,9 s à 120,18 ; frost 84,5 s à 55,58 (mesure peu sûre) ; dunes 89,9 s à 96,14 ; tide 89,9 s à 79,82. Niveau stable d'un bout à l'autre pour les huit (plus de long début creux sur `night`).
**Non vérifié : l'absence de voix dans la partie générée, et la qualité à l'oreille.** Copies à écouter : `shots/musique-v3/`.
Crédits de la seconde clé : téléversement 425 par extrait, prolongation 12,5 par seconde ; dépensé 8 397, **reste 31 603**. Une requête a échoué sans frais (`disaster`, erreur 502 passagère) et une a été refusée sans frais (référence de plus de 30 s).
Suite prévue après la validation de Julien : séparation en couches (environ 17 000 crédits pour les huit), boucles coupées sur les mesures, puis intégration.
