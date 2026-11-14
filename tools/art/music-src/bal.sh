#!/bin/bash
# prints the ElevenLabs credit balance (the proxy injects the real key)
curl -sS -m 30 -H "xi-api-key: proxy-injected" https://api.elevenlabs.io/v1/user/subscription | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log("used",j.character_count,"left",j.character_limit-j.character_count)})'
