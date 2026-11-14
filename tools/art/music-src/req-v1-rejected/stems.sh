#!/bin/bash
# stems.sh <name> : sends raw/<name>.mp3 to the ElevenLabs stem separation (six_stems_v1), unpacks raw/<name>-stems/*.mp3, logs the credits
set -e; cd "$(dirname "$0")"; n="$1"; d="raw/$n-stems"; [ -f "$d/other.mp3" ] && { echo "$d exists, not separated again"; exit 1; }; mkdir -p "$d"
b0=$(./bal.sh | awk '{print $2}')
code=$(curl -sS -m 600 -o "$d/out.bin" -w "%{http_code}" -H "xi-api-key: proxy-injected" -X POST "https://api.elevenlabs.io/v1/music/stem-separation?output_format=mp3_44100_128" -F "file=@raw/$n.mp3;type=audio/mpeg" -F "stem_variation_id=six_stems_v1")
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 600 "$d/out.bin"; echo; mv "$d/out.bin" "$d/error.json"; exit 2; fi
python3 -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$d/out.bin" "$d"; rm "$d/out.bin"; chmod 644 "$d"/*.mp3
b1=$(./bal.sh | awk '{print $2}'); echo "$(date -u +%FT%TZ) $n-stems credits=$((b1-b0)) used_total=$b1 left=$((39843-b1))" | tee -a credits.txt
