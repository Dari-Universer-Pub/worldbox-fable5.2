# Sources de la musique du jeu (chantier C.11)

La musique de Dustcrown est **générée par une IA** : l'API musique d'ElevenLabs (modèle `music_v2_5`), avec la clé de Julien (offre Starter payante), le 14 novembre 2026. C'est une exception à la règle 3 du projet, décidée par Julien (voir `DECISIONS.md`, D-C11, et `PROVENANCE.md`). Les effets sonores, eux, restent synthétisés par le code.

Ces fichiers ne se régénèrent pas à l'identique (une nouvelle requête donne une autre musique) : **ce sont des sources**. Ne pas les supprimer.

## Ce qu'il y a ici
- `make-req.js` : écrit les plans de composition `req/<piste>.json` des 7 pistes qui suivent `calm` (tempo, tonalité, graine, instruments, texte de chaque partie). `req/calm.json`, `req/probe.json` et `req/calm-layerA-lute.json` ont été écrits à la main.
- `gen.sh <piste>` : envoie `req/<piste>.json` à `POST /v1/music`, écrit `raw/<piste>.mp3` et note les crédits dans `credits.txt`. `stems.sh <piste>` : envoie `raw/<piste>.mp3` à `POST /v1/music/stem-separation` (`six_stems_v1`) et écrit `raw/<piste>-stems/*.mp3`. `bal.sh` : affiche le solde. Une seule requête à la fois. La clé n'est écrite nulle part : l'en-tête `xi-api-key: proxy-injected` est remplacé par le proxy de la session.
- `raw/` : les sorties brutes (MP3 44,1 kHz 128 kbit/s). `raw/calm-ref.mp3` est l'extrait de `calm` (de 46,6 s à 69,7 s) téléversé par `POST /v1/music/upload` ; l'identifiant reçu (`raw/calm-ref.upload.json`) sert de `conditioning_ref` aux 7 autres pistes, pour qu'elles gardent la même salle et les mêmes instruments.
- `manifest.json` : la liste de tous les fichiers de musique du projet avec leur empreinte, écrite par `tools/music-build.js` ; `tools/check-provenance.js` n'accepte que ceux-là.
- `credits.txt` : le compteur de crédits.

## Comment les pistes ont été choisies
Chaque piste a été générée **une seule fois** (aucun tri entre plusieurs essais : le budget de crédits ne le permettait pas) puis mesurée avec `node tools/music-measure.js <fichier> <tempo>` : tempo réel, premier temps, niveau par mesure. Les boucles ont été placées d'après ces mesures (début sur une mesure où le niveau est le même qu'à la fin, fin avant la mesure de conclusion que le modèle ajoute presque toujours malgré la consigne). Personne ne les a encore écoutées : **c'est à Julien de les juger à l'oreille**.

Identifiants des morceaux chez ElevenLabs : calm wPDesvjX5J0HDGQKPbyl ; night Kc72uaRUwsOYlW56I6TX ; war Bb3JouhWiGWLB4PuHMEh ; menu IXLx2TgLGL1sMwNLhVnL ; disaster FZAwPOLj0CcWiqiG5V7R ; frost ybnAInHu2fSpvPv6vwhu ; dunes gwLt0BePycQarCmeCafN ; tide b3cBGYtIcDlw5h8JFTSG.

Tonalités demandées, pour que les fondus ne frottent pas : `calm` ré majeur ; `night`, `war`, `disaster`, `frost` si mineur (relatif de ré majeur) ; `tide` sol majeur ; `dunes` mode phrygien dominant sur ré ; `menu` mi mineur. La tonalité réellement jouée n'a pas été mesurée.

## Les deux voies comparées pour les couches (sur `calm`)
- **Voie A, chaque couche générée séparément** (même plan, même graine, même référence) : essai avec le luth seul, `raw/calm-layerA-lute.mp3`. Mesure : 84,04 battements par minute contre 83,36 pour le mélange, premier temps à 0,044 s contre 0,549 s, et le morceau se conclut tout seul à la 7ᵉ mesure. Les couches ne se superposent donc pas. **Écartée.** Elle aurait aussi coûté six fois plus de crédits.
- **Voie B, mélange complet puis séparation** (`six_stems_v1`) : la somme des pistes séparées redonne le mélange à 32 dB sous son niveau, avec un retard fixe de 25 ms (celui du MP3) que `tools/music-build.js` mesure et retire. **Retenue.** Limite : la séparation ne connaît que six familles (voix, batterie, basse, guitare, piano, autres). Dans cette musique, le luth sort en « guitare », la flûte ou le cor en « voix », les cordes et les cloches en « autres », les tambours en « batterie » ; basse et piano sont presque toujours vides.

Pistes séparées non utilisées et supprimées du dépôt (niveau moyen mesuré) : calm/bass -91.0 dB ; calm/drums -45.8 dB ; calm/piano -91.0 dB ; night/bass -91.0 dB ; night/drums -91.0 dB ; war/bass -91.0 dB ; war/piano -91.0 dB ; menu/bass -91.0 dB ; menu/drums -91.0 dB ; menu/piano -91.0 dB ; disaster/bass -91.0 dB ; frost/bass -91.0 dB ; frost/drums -77.3 dB ; frost/guitar -91.0 dB ; dunes/bass -91.0 dB ; dunes/drums -56.6 dB ; dunes/piano -85.5 dB ; tide/bass -91.0 dB ; tide/drums -90.3 dB ; tide/piano -91.0 dB.

## Crédits dépensés
Solde avant : 27 754. Génération : 12,5 crédits par seconde ; séparation : 25 crédits par seconde ; téléversement de la référence : 288. Total dépensé : 19 270 (essai 38, `calm` 1 214, séparation de `calm` 2 431, référence 288, essai de la voie A 287, sept pistes 5 001, sept séparations 10 011). **Solde après : 8 484.** C'est ce coût qui a fixé la longueur des boucles (48 à 53 s, 69 s pour `calm`).

## Fabriquer les fichiers du jeu
`node tools/music-build.js` (demande `ffmpeg`) lit `src/data/music.json` (bloc `audio` de chaque piste) et ces sources, et écrit `assets/music/music-<piste>.js`, les mesures `shots/musique/mesures.txt` et les extraits à écouter `shots/musique/*.mp3`. Puis `node tools/build.js`.
