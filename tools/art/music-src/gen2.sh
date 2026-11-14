#!/bin/bash
# gen2.sh <name> : sends req2/<name>.json (prompt mode, instrumental forced), writes raw2/<name>.mp3, logs the credits
set -e; cd "$(dirname "$0")"; n="$1"; [ -f "raw2/$n.mp3" ] && { echo "raw2/$n.mp3 exists, not generated again"; exit 1; }
b0=$(./bal.sh | awk '{print $2}'); [ $((40000-b0)) -lt 5430 ] && { echo "balance too close to the 5000 floor: stop"; exit 3; }
code=$(curl -sS -m 600 -o "raw2/$n.out" -w "%{http_code}" -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" -X POST "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128" --data @"req2/$n.json")
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 700 "raw2/$n.out"; echo; rm "raw2/$n.out"; exit 2; fi
mv "raw2/$n.out" "raw2/$n.mp3"; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "raw2/$n.mp3")
b1=$(./bal.sh | awk '{print $2}'); echo "$(date -u +%FT%TZ) v2 $n duration=${d}s used_total=$b1 left=$((40000-b1)) (the balance lags behind by a few requests)" | tee -a credits.txt
