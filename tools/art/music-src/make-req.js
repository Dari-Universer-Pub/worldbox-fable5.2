// node make-req.js — writes req/<track>.json for the 7 tracks that follow `calm` (chantier C.11). The plans are sources: edit here, not the JSON.
// Every track shares the family (lute, wooden flute, strings, small bells, hand percussion, same wooden hall) and the conditioning reference cut from calm.
'use strict';
const fs = require('fs'), REF = '6d62s8om3WvF29B6BgvY_upload';
const FAMILY = ['medieval fantasy folk', 'acoustic instruments', 'warm wooden hall reverb', 'instrumental'];
const NEG = ['vocals', 'choir', 'electronic', 'synthesizer', 'electric guitar', 'tempo changes', 'fade out', 'ending', 'ritardando'];
// name: [bpm, key, seed, [ [bars, text, extra positive styles, extra negative styles], ... ]]
const T = {
  night: [60, 'B minor', 6001, [
    [6, 'Lanterns. 60 BPM, 4/4, B minor. Quiet night: slow soft strings hold long chords, a lute plucks sparse single notes, small bells ring far away. Still and tender.', ['slow sustained strings', 'sparse lute', 'small bells', 'nocturne'], ['drums', 'loud']],
    [8, 'Same tempo and key. A low wooden flute sings a slow lullaby melody over the strings and the sparse lute; bells answer softly. Steady and calm, the music keeps going at the same level.', ['slow sustained strings', 'sparse lute', 'low wooden flute melody', 'small bells', 'nocturne', 'steady loop'], ['drums', 'loud']]]],
  war: [132, 'B minor', 13201, [
    [8, 'Iron Oaths. 132 BPM, 4/4, B minor. War march: deep war drums pound a driving pattern, low strings play a fast ostinato, a lute strums hard. Tense and determined.', ['war drums', 'low string ostinato', 'strummed lute', 'battle march'], ['soft', 'slow']],
    [12, 'Same tempo and key. A horn calls a bold heroic melody over the pounding war drums and the string ostinato; a wooden flute doubles it high. Full force.', ['war drums', 'low string ostinato', 'horn melody', 'wooden flute', 'battle march'], ['soft', 'slow']],
    [11, 'Same tempo and key. The horn melody returns higher, drums and strings at full force, no ending and no slowing down: the march keeps going at the same level.', ['war drums', 'low string ostinato', 'horn melody', 'battle march', 'steady loop'], ['soft', 'slow']]]],
  menu: [72, 'E minor', 7201, [
    [8, 'The Crown in the Dust. 72 BPM, 4/4, E minor. Main theme: a wooden flute plays a noble, wistful melody over a lute arpeggio and warm strings; small bells mark the phrases.', ['noble main theme', 'wooden flute melody', 'lute arpeggio', 'warm string ensemble', 'small bells'], ['drums', 'loud']],
    [10, 'Same tempo and key. The strings take the theme and lift it to G major, the flute answers above, lute and bells continue; grand but gentle, the music keeps going at the same level.', ['noble main theme', 'wooden flute melody', 'lute arpeggio', 'warm string ensemble', 'small bells', 'steady loop'], ['drums', 'loud']]]],
  disaster: [120, 'B minor', 12001, [
    [8, 'Ashfall. 120 BPM, 4/4, B minor. Catastrophe: low strings saw an urgent rhythm, a big drum hits hard, a deep bell tolls, a horn cries a falling alarm melody. Dark and urgent.', ['urgent low strings', 'big drums', 'tolling deep bell', 'horn alarm melody', 'dark'], ['soft', 'happy', 'major key']],
    [10, 'Same tempo and key. The horn melody climbs in distress, drums and strings drive harder, the deep bell keeps tolling, a lute tremolo shivers underneath.', ['urgent low strings', 'big drums', 'tolling deep bell', 'horn alarm melody', 'lute tremolo', 'dark'], ['soft', 'happy', 'major key']],
    [9, 'Same tempo and key. Full force, the alarm melody again, no ending and no slowing down: the music keeps going at the same level.', ['urgent low strings', 'big drums', 'tolling deep bell', 'horn alarm melody', 'dark', 'steady loop'], ['soft', 'happy', 'major key']]]],
  frost: [54, 'B minor', 5401, [
    [6, 'White Silence. 54 BPM, 4/4, B minor. Frozen land: small crystal bells play a slow sparse melody, high thin strings hold cold long notes, much silence and air.', ['crystal bells melody', 'high thin strings', 'cold', 'sparse', 'slow'], ['drums', 'loud', 'warm']],
    [8, 'Same tempo and key. A lute adds slow single notes under the bells, a breathy wooden flute holds one long note now and then; cold and still, the music keeps going at the same level.', ['crystal bells melody', 'high thin strings', 'sparse lute', 'breathy wooden flute', 'cold', 'slow', 'steady loop'], ['drums', 'loud', 'warm']]]],
  dunes: [96, 'D Phrygian dominant', 9601, [
    [8, 'Caravan of Embers. 96 BPM, 4/4, D Phrygian dominant scale. Desert caravan: a frame drum and finger cymbals keep a swaying rhythm, a lute plays a winding riff.', ['desert caravan', 'frame drum', 'finger cymbals', 'lute riff', 'Phrygian dominant'], ['loud drums']],
    [8, 'Same tempo and key. A wooden flute plays an ornamented, winding melody over the frame drum and the lute riff; low strings hold a drone on D.', ['desert caravan', 'frame drum', 'lute riff', 'ornamented wooden flute melody', 'string drone', 'Phrygian dominant'], ['loud drums']],
    [7, 'Same tempo and key. The flute melody again with new ornaments, drum, lute and drone steady, no ending and no slowing down: the caravan keeps going.', ['desert caravan', 'frame drum', 'lute riff', 'ornamented wooden flute melody', 'string drone', 'steady loop'], ['loud drums']]]],
  tide: [80, 'G major', 8001, [
    [8, 'Salt Wind. 80 BPM, 4/4, G major. Open sea: a lute plays rolling arpeggios like waves, warm strings swell and fall, a wooden flute plays a bright sailing melody.', ['sea voyage', 'rolling lute arpeggio', 'swelling strings', 'bright wooden flute melody', 'small bells'], ['loud drums']],
    [10, 'Same tempo and key. The flute melody rises higher, a light hand drum joins, small bells sparkle; fresh and hopeful, no ending: the music keeps going at the same level.', ['sea voyage', 'rolling lute arpeggio', 'swelling strings', 'bright wooden flute melody', 'small bells', 'light hand drum', 'steady loop'], ['loud drums']]]]
};
for (const [name, [bpm, key, seed, chunks]] of Object.entries(T)) { const bar = 240000 / bpm;
  const plan = { model_id: 'music_v2_5', conditioning_ref: REF, composition_plan: { chunks: chunks.map(([bars, text, pos, neg]) => { if (text.length > 200) throw new Error(name + ': text of ' + text.length + ' characters'); return { text, duration_ms: Math.round(bars * bar), positive_styles: FAMILY.concat(pos, [bpm + ' bpm', key]), negative_styles: NEG.concat(neg) }; }) }, seed };
  fs.writeFileSync(__dirname + '/req/' + name + '.json', JSON.stringify(plan, null, 2) + '\n'); console.log(name, chunks.reduce((a, c) => a + c[0], 0), 'bars', (plan.composition_plan.chunks.reduce((a, c) => a + c.duration_ms, 0) / 1000).toFixed(1), 's'); }
