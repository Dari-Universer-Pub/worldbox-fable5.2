// node make-req2.js — second attempt (the first one was rejected by Julien: the chunk `text` of a composition plan is LYRICS, so a voice
// read the descriptions aloud). Here: prompt mode with force_instrumental, which the API documents as a guarantee of no voice.
// These are 34 s auditions for Julien, one per track; nothing is integrated before he validates them.
'use strict';
const fs = require('fs');
const FAMILY = 'Instrumental only, no voice, no singing, no speech, no choir. Acoustic medieval fantasy folk played by a small ensemble in a warm wooden hall: lute, wooden flute, string ensemble, small bells, hand percussion. Soundtrack of a peaceful pixel-art god game. No electronic sounds, no synthesizer, no electric guitar. Steady tempo from the first second to the last, no introduction, no ending, no fade out.';
const T = {
  calm: 'Pastoral village morning, around 84 beats per minute, D major. A lute plays a flowing arpeggio, a wooden flute sings a simple happy melody, soft strings underneath, a few small bells. Gentle and bright.',
  night: 'Quiet night lullaby, around 60 beats per minute, B minor. Slow soft strings hold long chords, a lute plucks sparse single notes, a low wooden flute plays a slow tender melody, far small bells. Still and intimate.',
  war: 'War march, around 132 beats per minute, B minor. Deep war drums pound a driving pattern, low strings play a fast ostinato, a horn calls a bold heroic melody, a lute strums hard. Tense and determined, full force.',
  menu: 'Noble and wistful main theme, around 72 beats per minute, E minor. A wooden flute plays a memorable melody over a lute arpeggio and warm strings, small bells mark the phrases. Grand but gentle.',
  disaster: 'Catastrophe, around 120 beats per minute, B minor. Low strings saw an urgent rhythm, a big drum hits hard, a deep bell tolls, a horn cries a falling alarm melody. Dark, urgent, frightening.',
  frost: 'Frozen silent land, around 54 beats per minute, B minor. Small crystal bells play a slow sparse melody, high thin strings hold cold long notes, a lute adds a single note now and then. Cold, empty, beautiful.',
  dunes: 'Desert caravan, around 96 beats per minute, Phrygian dominant scale on D. A frame drum and finger cymbals keep a swaying rhythm, a lute plays a winding riff, a wooden flute plays an ornamented melody, low strings hold a drone.',
  tide: 'Open sea voyage, around 80 beats per minute, G major. A lute plays rolling arpeggios like waves, warm strings swell and fall, a wooden flute plays a bright sailing melody, small bells sparkle. Fresh and hopeful.'
};
for (const [name, text] of Object.entries(T)) fs.writeFileSync(__dirname + '/req2/' + name + '.json', JSON.stringify({ model_id: 'music_v2_5', prompt: text + ' ' + FAMILY, music_length_ms: 34000, force_instrumental: true }, null, 2) + '\n');
console.log(Object.keys(T).length + ' requests written');
