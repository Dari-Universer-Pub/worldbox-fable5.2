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
