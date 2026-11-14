// node make-req3.js — third step (chantier C.11): each audition VALIDATED by Julien (raw2/, uploaded by up.sh) is continued. The plan starts
// with the full part of the audition itself (an audio reference chunk: start_ms..end_ms, cut on its bars, without its slow start or its
// ending), then one generated chunk conditioned on that same passage. The chunk text holds a section name only: any other text is SUNG.
'use strict';
const fs = require('fs'), dir = __dirname + '/req3/';
const NEG = ['vocals', 'singing', 'spoken word', 'choir', 'humming', 'electronic', 'synthesizer', 'electric guitar', 'long intro', 'ending', 'fade out', 'silence'];
const COMMON = ['instrumental', 'warm wooden hall', 'same instruments throughout', 'full ensemble playing all along', 'steady level', 'seamless continuation'];
// name: [bpm, first bar of the validated audition kept, last bar kept (exclusive), bars to generate, styles, extra negatives]
const T = {
  calm: [84.04, 4, 10, 21, ['pastoral village morning', '84 bpm', 'D major', 'flowing lute arpeggio', 'happy wooden flute melody', 'soft strings', 'small bells'], ['drums']],
  war: [131.68, 0, 16, 32, ['war march', '132 bpm', 'B minor', 'deep war drums', 'fast low string ostinato', 'bold horn melody', 'hard strummed lute', 'full force'], ['soft', 'slow']],
  menu: [72.02, 2, 9, 18, ['noble wistful main theme', '72 bpm', 'E minor', 'memorable wooden flute melody', 'lute arpeggio', 'warm strings', 'small bells'], ['drums']],
  disaster: [120.18, 0, 16, 28, ['catastrophe', '120 bpm', 'B minor', 'urgent low strings', 'big drum hits', 'tolling deep bell', 'falling horn alarm melody', 'dark and urgent'], ['soft', 'happy']],
  frost: [54, 1, 6, 14, ['frozen silent land', '54 bpm', 'B minor', 'slow sparse crystal bells melody', 'high thin cold strings', 'single lute notes', 'cold and beautiful'], ['drums', 'loud']],
  dunes: [96.14, 0, 12, 24, ['desert caravan', '96 bpm', 'Phrygian dominant on D', 'frame drum and finger cymbals', 'winding lute riff', 'ornamented wooden flute melody', 'low string drone'], []],
  tide: [80.12, 0, 10, 20, ['open sea voyage', '80 bpm', 'G major', 'rolling lute arpeggios', 'swelling warm strings', 'bright wooden flute melody', 'sparkling small bells'], ['drums']]
};
for (const [name, [bpm, b0, b1, bars, styles, neg]] of Object.entries(T)) { const bar = 240000 / bpm, id = JSON.parse(fs.readFileSync(dir + name + '.song.json', 'utf8')).song_id, range = { start_ms: Math.round(b0 * bar), end_ms: Math.round(b1 * bar) };
  fs.writeFileSync(dir + name + '.json', JSON.stringify({ model_id: 'music_v2_5', composition_plan: { chunks: [{ song_id: id, range }, { text: '[Instrumental]', duration_ms: Math.round(bars * bar), context_adherence: 'high', condition_strength: 'high', conditioning_ref: { song_id: id, range: { start_ms: Math.max(range.start_ms, range.end_ms - 30000), end_ms: range.end_ms } }, positive_styles: COMMON.concat(styles), negative_styles: NEG.concat(neg) }] } }, null, 2) + '\n');
  console.log(name, 'kept', (range.start_ms / 1000).toFixed(1) + '-' + (range.end_ms / 1000).toFixed(1), 's, then', (bars * bar / 1000).toFixed(1), 's generated'); }
