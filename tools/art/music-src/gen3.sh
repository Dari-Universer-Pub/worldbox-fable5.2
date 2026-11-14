#!/bin/bash
# gen3.sh <name> : sends req3/<name>.json (continuation of the validated audition), writes raw3/<name>.mp3 and its Song-Id, logs the credits
set -e; cd "$(dirname "$0")"; n="$1"; [ -f "raw3/$n.mp3" ] && { echo "raw3/$n.mp3 exists, not generated again"; exit 1; }
left=$(./bal.sh | awk '{print $4}'); [ "$left" -lt 7500 ] && { echo "balance $left too close to the 5000 floor: stop"; exit 3; }
code=$(curl -sS -m 600 -D "raw3/$n.hdr" -o "raw3/$n.out" -w "%{http_code}" -H "xi-api-key: proxy-injected" -H "Content-Type: application/json" -X POST "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192" --data @"req3/$n.json")
sid=$(grep -i '^song-id:' "raw3/$n.hdr" | tr -d '\r' | awk '{print $2}'); rm -f "raw3/$n.hdr"
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 700 "raw3/$n.out"; echo; rm "raw3/$n.out"; exit 2; fi
mv "raw3/$n.out" "raw3/$n.mp3"; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "raw3/$n.mp3")
echo "$(date -u +%FT%TZ) key2 gen3 $n duration=${d}s song_id=$sid left=$(./bal.sh | awk '{print $4}') (lags)" | tee -a credits.txt
