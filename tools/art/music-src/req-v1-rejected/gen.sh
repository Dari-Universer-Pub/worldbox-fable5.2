#!/bin/bash
# gen.sh <name> : sends req/<name>.json to the ElevenLabs music API (one request at a time), writes raw/<name>.mp3 and logs the credits spent
set -e; cd "$(dirname "$0")"; n="$1"; [ -f "raw/$n.mp3" ] && { echo "raw/$n.mp3 exists, not generated again"; exit 1; }
b0=$(./bal.sh | awk '{print $2}')
code=$(curl -sS -m 600 -o "raw/$n.out" -w "%{http_code}" -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" -X POST "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128" --data @"req/$n.json")
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 600 "raw/$n.out"; echo; mv "raw/$n.out" "raw/$n.error.json"; exit 2; fi
mv "raw/$n.out" "raw/$n.mp3"; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "raw/$n.mp3")
b1=$(./bal.sh | awk '{print $2}'); echo "$(date -u +%FT%TZ) $n duration=${d}s credits=$((b1-b0)) used_total=$b1 left=$((39843-b1))" | tee -a credits.txt
