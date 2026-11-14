#!/usr/bin/env python3
# Score source of the five tracks reviewed in chantier A.10 (menu, disaster, frost, dunes, tide): rewrites these five entries of
# src/data/music.json and leaves the others (calm, night, war: written by hand in the JSON) untouched.
# Each track = a key, sections of four bars with their chords, a melody written note by note for every section, and the
# accompaniment (arpeggio, bass, pad, counter-line, bells, percussion) derived from the chords with a pattern of its own.
# A bar = 16 units; "e5/4" = note e5 for 4 units, "-" a rest, "a+b+c" a chord, "!" an accent.
# Run: python3 tools/art/music-scores.py   then   node tools/measure-audio.js --music
import json, os, re

CH = {  # chord -> (bass root, triad voiced around octave 3)
    'Em': ('e2', ['e3', 'g3', 'b3']), 'C': ('c2', ['c3', 'e3', 'g3']), 'G': ('g1', ['d3', 'g3', 'b3']), 'D': ('d2', ['d3', 'f#3', 'a3']),
    'Am': ('a1', ['c3', 'e3', 'a3']), 'B': ('b1', ['d#3', 'f#3', 'b3']), 'Bm': ('b1', ['d3', 'f#3', 'b3']), 'F': ('f1', ['c3', 'f3', 'a3']),
    'Dm': ('d2', ['d3', 'f3', 'a3']), 'E': ('e2', ['e3', 'g#3', 'b3']), 'Cm': ('c2', ['c3', 'd#3', 'g3']), 'Ab': ('g#1', ['c3', 'd#3', 'g#3']),
    'Fm': ('f1', ['c3', 'f3', 'g#3']), 'Gd': ('g1', ['b2', 'd3', 'g3']), 'Bb': ('a#1', ['d3', 'f3', 'a#3']), 'Eb': ('d#2', ['d#3', 'g3', 'a#3']),
    'Gm': ('g1', ['d3', 'g3', 'a#3']), 'A': ('a1', ['c#3', 'e3', 'a3']), 'Cd': ('c2', ['c3', 'd#3', 'g3']),
}
def up(n, k=1): return n[:-1] + str(int(n[-1]) + k)
def pool(c): t = CH[c][1]; return t + [up(x) for x in t]
def arp(c, idx, ln): p = pool(c); return ' '.join('%s/%d' % (p[i], ln) for i in idx)
def bass(c, pat):  # R root, H root an octave up, F the top note of the triad two octaves down
    r = CH[c][0]; return pat.replace('R', r).replace('H', up(r)).replace('F', up(CH[c][1][2], -2))
def pad(c): return '+'.join(CH[c][1]) + '/16'
def bars(fn, chords): return ' | '.join(fn(c, i) for i, c in enumerate(chords))
def check(name, part):
    for b in part.split('|'):
        n = sum(int(x.split('/')[1]) for x in b.split())
        assert n == 16, (name, b.strip(), n)

def track(title, bpm, vol, form, sections, melody, mel_inst, parts, loop=0):
    """sections: name -> 4 chords; melody: name -> bars; parts: list of (inst, layer, vel, extra, fn(chord, bar_index, section))"""
    out = [{'inst': mel_inst[0], 'layer': 'melody', 'vel': mel_inst[1], 'gate': 0.93, 'pan': 0.2, 'parts': dict(melody)}]
    for inst, layer, vel, extra, fn in parts:
        p = {s: bars(lambda c, i, s=s: fn(c, i, s), ch) for s, ch in sections.items()}
        t = {'inst': inst, 'layer': layer, 'vel': vel, 'parts': p}; t.update(extra); out.append(t)
    for t in out:
        for s, p in t['parts'].items(): check(title + ' ' + t['inst'] + ' ' + s, p)
        assert set(t['parts']) == set(sections), (title, t['inst'])
    return {'title': title, 'bpm': bpm, 'vol': vol, 'form': form, 'loopFrom': loop, 'tracks': out}

T = {}
# ---- menu: The Crown in the Dust (E minor, slow, a lute that never stops; the bridge C opens to G major before the return)
T['menu'] = track("The Crown in the Dust", 72, 0.85, ['A', 'B', 'A2', 'C', 'B2'],
    {'A': ['Em', 'C', 'G', 'D'], 'A2': ['Em', 'C', 'Am', 'B'], 'B': ['Am', 'Em', 'C', 'B'], 'C': ['G', 'D', 'Em', 'Bm'], 'B2': ['Am', 'C', 'D', 'Em']},
    {'A': 'b4/6 e5/2 g5/4 f#5/4 | e5/8 g4/4 c5/4 | d5/6 b4/2 g4/4 b4/4 | a4/12 -/4',
     'A2': 'b4/6 e5/2 g5/4 a5/4 | g5/6 e5/2 c5/8 | c5/4 e5/4 a5/6 g5/2 | f#5/12 d#5/4',
     'B': 'c5/4 e5/4 a5/6 g5/2 | g5/4 e5/4 b4/8 | e5/4 g5/4 c6/4 b5/4 | f#5/12 -/4',
     'C': 'd5/4 g5/4 b5/6 a5/2 | a5/4 f#5/4 d5/8 | e5/2 f#5/2 g5/4 b5/4 e6/4 | d6/6 b5/2 f#5/8',
     'B2': 'c5/4 e5/4 a5/6 g5/2 | e5/4 g5/4 c6/6 b5/2 | a5/4 f#5/4 d5/4 f#5/4 | e5/16'}, ('flute', 0.5), [
    ('lute', 'base', 0.5, {'gate': 1.6, 'pan': -0.15}, lambda c, i, s: arp(c, [0, 2, 3, 4, 2, 3, 4, 5] if s != 'C' else [0, 1, 2, 3, 4, 3, 2, 1], 2)),
    ('bass', 'base', 0.45, {'gate': 0.95}, lambda c, i, s: bass(c, 'R/16' if s[0] != 'C' else 'R/12 H/4')),
    ('pad', 'pad', 0.5, {'gate': 1}, lambda c, i, s: pad(c)),
    ('strings', 'pad', 0.32, {'gate': 1, 'pan': -0.3}, lambda c, i, s: '%s/16' % up(CH[c][1][1]) if i % 2 == 0 else '%s/8 %s/8' % (up(CH[c][1][2]), up(CH[c][1][1]))),
    ('bell', 'bells', 0.35, {'pan': 0.35}, lambda c, i, s: '-/8 %s/8' % up(CH[c][1][2], 2) if i < 3 else '-/4 %s/12' % up(CH[c][1][0], 2)),
    ('shaker', 'rhythm', 0.22, {}, lambda c, i, s: 'c5/4 c5/4 c5/2 c5/2 c5/4' if s in ('C', 'B2') else '-/8 c5/4 c5/4'),
])
# ---- disaster: Ashfall (C minor, driving toms; A2 pushes through Bb, the bridge C climbs to the dominant and holds it)
T['disaster'] = track('Ashfall', 120, 0.9, ['A', 'A2', 'B', 'A', 'C', 'A2'],
    {'A': ['Cm', 'Ab', 'Fm', 'Gd'], 'A2': ['Cm', 'Ab', 'Bb', 'Gd'], 'B': ['Ab', 'Bb', 'Fm', 'Gd'], 'C': ['Fm', 'Cm', 'Ab', 'Gd']},
    {'A': 'g4/6 d#4/2 c4/8 | g#4/6 f4/2 d#4/8 | f4/4 g#4/4 c5/6 a#4/2 | g4/12 -/4',
     'A2': 'g4/6 d#4/2 c4/8 | g#4/6 c5/2 d#5/8 | d5/4 a#4/4 f4/6 a#4/2 | b4/12 d5/4',
     'B': 'c5/8 d#5/8 | d5/8 a#4/8 | c5/4 g#4/4 f4/8 | d4/8 b3/8',
     'C': 'f4/4 g#4/4 c5/8 | d#5/6 c5/2 g4/8 | g#4/4 c5/4 d#5/4 g#5/4 | g5/8 d5/4 b4/4'}, ('horn', 0.6), [
    ('tom', 'base', 0.6, {}, lambda c, i, s: ('c2!/8 g2!/8' if i % 2 == 0 else 'c2!/8 g2!/4 g2/4') if s == 'B' and i < 3 else 'c2!/2 c2/2 c2!/2 c2/2 g2!/2 g2/2 g2!/2 g2/2' if i == 3 else 'c2!/4 c2/2 c2/2 c2!/4 g2/4' if i % 2 == 0 else 'c2!/4 c2/2 c2/2 c2!/2 c2/2 g2!/4'),
    ('drum', 'rhythm', 0.5, {}, lambda c, i, s: 'c2!/4 -/4 c2!/4 -/4' if s != 'C' else 'c2!/4 c2/4 c2!/4 c2/2 c2/2'),
    ('bass', 'base', 0.55, {'gate': 0.9}, lambda c, i, s: bass(c, 'R/4 R/4 R/4 H/4' if s != 'B' else 'R/8 R/8')),
    ('strings', 'pad', 0.5, {'gate': 1}, lambda c, i, s: pad(c)),
    ('strings', 'tension', 0.4, {'gate': 0.7, 'pan': -0.25}, lambda c, i, s: arp(c, [3, 4, 3, 4, 5, 4, 3, 4], 2)),
    ('bell', 'tension', 0.3, {'pan': 0.3}, lambda c, i, s: '-/12 %s/4' % up(CH[c][1][2], 2) if i < 3 else '%s/8 %s/8' % (up(CH[c][1][0], 3), up(CH[c][1][1], 2))),
    ('lute', 'bells', 0.4, {'gate': 0.8, 'pan': 0.2}, lambda c, i, s: arp(c, [0, 3, 2, 3], 4) if s in ('B', 'C') else '-/16'),
])
# ---- frost: White Silence (A minor, very slow, bells over a held pad; long rests are part of the writing)
T['frost'] = track('White Silence', 54, 0.8, ['A', 'B', 'A2', 'C', 'B'],
    {'A': ['Am', 'F', 'Dm', 'E'], 'B': ['Am', 'Gd', 'F', 'E'], 'A2': ['Am', 'F', 'C', 'E'], 'C': ['Dm', 'Am', 'F', 'E']},
    {'A': 'e5/4 a5/4 -/4 c6/4 | -/4 a5/4 f5/8 | d5/4 f5/4 a5/8 | g#5/8 b5/8',
     'B': 'c6/6 b5/2 a5/8 | b5/6 a5/2 g5/8 | a5/4 f5/4 c5/8 | e5/16',
     'A2': 'e5/4 a5/4 -/4 c6/4 | -/4 c6/4 a5/8 | g5/4 e5/4 c5/8 | b4/8 e5/8',
     'C': 'f5/8 a5/8 | e5/8 c5/8 | a5/6 g5/2 f5/8 | e5/16'}, ('bell', 0.4), [
    ('pad', 'base', 0.5, {'gate': 1}, lambda c, i, s: pad(c)),
    ('bass', 'pad', 0.4, {'gate': 1}, lambda c, i, s: bass(c, 'R/16')),
    ('flute', 'bells', 0.4, {'gate': 0.95, 'pan': -0.2}, lambda c, i, s: '-/16' if (i + (s in ('B', 'C'))) % 2 == 0 else '%s/8 %s/8' % (up(CH[c][1][2]), up(CH[c][1][1])) if i < 3 else '%s/12 -/4' % up(CH[c][1][2])),
    ('lute', 'bells', 0.3, {'gate': 1.8, 'pan': 0.3}, lambda c, i, s: arp(c, [0, 2, 3, 4], 4) if s in ('A2', 'C') else '-/8 %s/4 %s/4' % (pool(c)[3], pool(c)[2])),
    ('strings', 'tension', 0.28, {'gate': 1}, lambda c, i, s: '%s/16' % up(CH[c][1][2], 2)),
    ('shaker', 'rhythm', 0.15, {}, lambda c, i, s: '-/12 c5/4' if i % 2 else '-/16'),
])
# ---- dunes: Caravan of Embers (D with a lowered second, a walking lute and hand drums; the bridge C rests on G minor)
T['dunes'] = track('Caravan of Embers', 96, 0.85, ['A', 'A2', 'B', 'A2', 'C', 'A2'],
    {'A': ['D', 'Eb', 'D', 'Cd'], 'A2': ['D', 'Eb', 'Cd', 'D'], 'B': ['Gm', 'D', 'Gm', 'A'], 'C': ['Gm', 'D', 'Eb', 'D']},
    {'A': 'a4/4 a#4/2 a4/2 f#4/4 d#4/2 f#4/2 | g4/6 a#4/2 a4/8 | d5/4 c5/2 a#4/2 a4/4 f#4/4 | g4/6 d#4/2 d4/8',
     'A2': 'a4/4 a#4/2 a4/2 f#4/4 d#4/2 f#4/2 | g4/6 a#4/2 d5/8 | d#5/4 d5/2 c5/2 a#4/4 g4/4 | a4/12 -/4',
     'B': 'd5/6 a#4/2 g4/8 | f#4/4 a4/4 d5/8 | d#5/6 d5/2 a#4/8 | a4/6 c#5/2 e5/8',
     'C': 'g5/4 a#5/2 a5/2 g5/4 f#5/4 | a5/6 f#5/2 d5/8 | d#5/2 g5/2 a#5/4 a5/4 g5/4 | f#5/12 -/4'}, ('flute', 0.55), [
    ('lute', 'base', 0.5, {'gate': 1.3, 'pan': -0.2}, lambda c, i, s: arp(c, [0, 2, 3, 2, 1, 2, 3, 2], 2)),
    ('bass', 'base', 0.5, {'gate': 0.9}, lambda c, i, s: bass(c, 'R/6 R/2 F/4 R/4' if not (s == 'A2' and i == 3) else 'R/12 -/4')),
    ('pad', 'pad', 0.4, {'gate': 1}, lambda c, i, s: pad(c)),
    ('shaker', 'rhythm', 0.35, {}, lambda c, i, s: 'c4/2 c4/1 c4/1 c4!/2 c4/2 c4/2 c4/1 c4/1 c4!/2 c4/2'),
    ('tom', 'rhythm', 0.4, {}, lambda c, i, s: 'c2!/3 c2/3 g2/2 c2!/3 g2/3 g2/2' if s != 'B' else 'c2!/6 g2/2 c2!/4 g2/4'),
    ('bell', 'bells', 0.3, {'pan': 0.35}, lambda c, i, s: '-/8 %s/8' % up(CH[c][1][2], 2) if i % 2 else '-/16'),
    ('strings', 'tension', 0.35, {'gate': 1}, lambda c, i, s: '%s+%s/16' % (up(CH[c][1][0]), up(CH[c][1][2]))),
])
# ---- tide: Salt Wind (G major, a lute rocking like a swell; A2 leans on F then D, the bridge C rises from C to D)
T['tide'] = track('Salt Wind', 80, 0.85, ['A', 'B', 'A2', 'C', 'B2'],
    {'A': ['G', 'F', 'C', 'G'], 'B': ['Em', 'C', 'F', 'D'], 'A2': ['G', 'F', 'Am', 'D'], 'C': ['C', 'G', 'Am', 'D'], 'B2': ['Em', 'C', 'D', 'G']},
    {'A': 'd5/6 b4/2 g4/4 b4/4 | c5/6 a4/2 f4/8 | e5/4 g5/4 e5/4 c5/4 | d5/12 -/4',
     'B': 'g5/6 e5/2 b4/8 | e5/4 g5/4 c6/6 b5/2 | a5/6 f5/2 c5/8 | d5/4 f#5/4 a5/8',
     'A2': 'd5/6 b4/2 g4/4 d5/4 | c5/6 a4/2 f5/8 | e5/4 c5/4 a4/4 c5/4 | d5/8 f#5/8',
     'C': 'e5/4 g5/4 c6/8 | b5/6 g5/2 d5/8 | c5/4 e5/4 a5/6 g5/2 | f#5/12 -/4',
     'B2': 'g5/6 e5/2 b4/8 | e5/4 g5/4 c6/6 b5/2 | a5/4 f#5/4 d5/4 f#5/4 | g5/16'}, ('flute', 0.5), [
    ('lute', 'base', 0.5, {'gate': 1.5, 'pan': -0.15}, lambda c, i, s: arp(c, [0, 1, 2, 3, 4, 3, 2, 1], 2)),
    ('bass', 'base', 0.45, {'gate': 0.95}, lambda c, i, s: bass(c, 'R/12 H/4' if i < 3 else 'R/16')),
    ('pad', 'pad', 0.45, {'gate': 1}, lambda c, i, s: pad(c)),
    ('bell', 'bells', 0.3, {'pan': 0.35}, lambda c, i, s: '-/12 %s/4' % up(CH[c][1][2], 2) if i < 3 else '-/8 %s/8' % up(CH[c][1][1], 2)),
    ('strings', 'tension', 0.3, {'gate': 1, 'pan': -0.3}, lambda c, i, s: '%s/8 %s/8' % (up(CH[c][1][1]), up(CH[c][1][2])) if s in ('C', 'B2') else '%s/16' % up(CH[c][1][1])),
    ('shaker', 'rhythm', 0.2, {}, lambda c, i, s: 'c5/6 c5/2 c5/6 c5/2'),  # the wash of a wave on each half bar
])

out = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'music.json')
M = json.load(open(out))
for k, v in T.items(): M['tracks'][k] = v
json.dump(M, open(out, 'w'), indent=1)
print('scores written:', ', '.join('%s (%d sections, %d parts)' % (k, len(v['form']), len(v['tracks'])) for k, v in T.items()))
