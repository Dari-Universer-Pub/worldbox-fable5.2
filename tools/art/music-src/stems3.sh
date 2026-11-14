#!/bin/bash
# stems3.sh <name> : sends raw3/<name>.mp3 to the ElevenLabs stem separation (six_stems_v1), unpacks raw3/<name>-stems/*.mp3, logs the credits
set -e; cd "$(dirname "$0")"; n="$1"; d="raw3/$n-stems"; [ -f "$d/other.mp3" ] && { echo "$d exists, not separated again"; exit 0; }; mkdir -p "$d"
left=$(./bal.sh | awk '{print $4}'); [ "$left" -lt 8000 ] && { echo "balance $left too close to the 5000 floor: stop"; exit 3; }
code=$(curl -sS -m 600 -o "$d/out.bin" -w "%{http_code}" -H "xi-api-key: proxy-injected" -X POST "https://api.elevenlabs.io/v1/music/stem-separation?output_format=mp3_44100_128" -F "file=@raw3/$n.mp3;type=audio/mpeg" -F "stem_variation_id=six_stems_v1")
if [ "$code" != "200" ]; then echo "HTTP $code"; head -c 600 "$d/out.bin"; echo; rm -rf "$d"; exit 2; fi
python3 -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$d/out.bin" "$d"; rm "$d/out.bin"; chmod 644 "$d"/*.mp3
echo "$(date -u +%FT%TZ) key2 stems3 $n left=$(./bal.sh | awk '{print $4}') (lags)" | tee -a credits.txt
