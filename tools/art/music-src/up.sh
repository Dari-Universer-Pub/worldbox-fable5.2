#!/bin/bash
# up.sh <name> : uploads the validated audition raw2/<name>.mp3 so that it can be continued; writes req3/<name>.song.json (its song_id)
set -e; cd "$(dirname "$0")"; n="$1"; [ -f "req3/$n.song.json" ] && { echo "already uploaded"; exit 0; }
left=$(./bal.sh | awk '{print $4}'); [ "$left" -lt 6500 ] && { echo "balance $left too close to the 5000 floor: stop"; exit 3; }
code=$(curl -sS -m 300 -o "req3/$n.song.out" -w "%{http_code}" -H "xi-api-key: proxy-injected" -X POST "https://api.elevenlabs.io/v1/music/upload" -F "file=@raw2/$n.mp3;type=audio/mpeg")
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 600 "req3/$n.song.out"; echo; rm "req3/$n.song.out"; exit 2; fi
mv "req3/$n.song.out" "req3/$n.song.json"; echo "$(date -u +%FT%TZ) key2 upload $n left=$(./bal.sh | awk '{print $4}') (lags)" | tee -a credits.txt
