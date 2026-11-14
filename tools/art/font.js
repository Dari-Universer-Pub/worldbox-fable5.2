// "Dustscript" — the game's pixel font, drawn glyph by glyph (pipeline B). Caps 5x7, x-height 5, descenders 2.
// Rows are top-aligned to the cap line; glyphs with 9 rows have descenders. Accents are composed by tools/bake-font.js.
'use strict';
const G = {
  ' ': '.../.../.../.../.../.../...',
  A: '.XXX./X...X/X...X/XXXXX/X...X/X...X/X...X', B: 'XXXX./X...X/X...X/XXXX./X...X/X...X/XXXX.', C: '.XXX./X...X/X..../X..../X..../X...X/.XXX.',
  D: 'XXXX./X...X/X...X/X...X/X...X/X...X/XXXX.', E: 'XXXXX/X..../X..../XXXX./X..../X..../XXXXX', F: 'XXXXX/X..../X..../XXXX./X..../X..../X....',
  G: '.XXX./X...X/X..../X.XXX/X...X/X...X/.XXXX', H: 'X...X/X...X/X...X/XXXXX/X...X/X...X/X...X', I: 'XXX/.X./.X./.X./.X./.X./XXX',
  J: '..XXX/...X./...X./...X./...X./X..X./.XX..', K: 'X...X/X..X./X.X../XX.../X.X../X..X./X...X', L: 'X..../X..../X..../X..../X..../X..../XXXXX',
  M: 'X...X/XX.XX/X.X.X/X.X.X/X...X/X...X/X...X', N: 'X...X/XX..X/XX..X/X.X.X/X..XX/X..XX/X...X', O: '.XXX./X...X/X...X/X...X/X...X/X...X/.XXX.',
  P: 'XXXX./X...X/X...X/XXXX./X..../X..../X....', Q: '.XXX./X...X/X...X/X...X/X.X.X/X..X./.XX.X', R: 'XXXX./X...X/X...X/XXXX./X.X../X..X./X...X',
  S: '.XXXX/X..../X..../.XXX./....X/....X/XXXX.', T: 'XXXXX/..X../..X../..X../..X../..X../..X..', U: 'X...X/X...X/X...X/X...X/X...X/X...X/.XXX.',
  V: 'X...X/X...X/X...X/X...X/X...X/.X.X./..X..', W: 'X...X/X...X/X...X/X.X.X/X.X.X/XX.XX/X...X', X: 'X...X/X...X/.X.X./..X../.X.X./X...X/X...X',
  Y: 'X...X/X...X/.X.X./..X../..X../..X../..X..', Z: 'XXXXX/....X/...X./..X../.X.../X..../XXXXX',
  a: '...../...../.XXX./....X/.XXXX/X...X/.XXXX', b: 'X..../X..../XXXX./X...X/X...X/X...X/XXXX.', c: '..../..../.XXX/X.../X.../X.../.XXX',
  d: '....X/....X/.XXXX/X...X/X...X/X...X/.XXXX', e: '...../...../.XXX./X...X/XXXXX/X..../.XXX.', f: '..XX/.X../XXXX/.X../.X../.X../.X..',
  g: '...../...../.XXXX/X...X/X...X/X...X/.XXXX/....X/.XXX.', h: 'X..../X..../XXXX./X...X/X...X/X...X/X...X', i: 'X/./X/X/X/X/X',
  j: '..X/.../..X/..X/..X/..X/..X/..X/XX.', k: 'X.../X.../X..X/X.X./XX../X.X./X..X', l: 'X./X./X./X./X./X./.X',
  m: '...../...../XX.X./X.X.X/X.X.X/X.X.X/X.X.X', n: '...../...../XXXX./X...X/X...X/X...X/X...X', o: '...../...../.XXX./X...X/X...X/X...X/.XXX.',
  p: '...../...../XXXX./X...X/X...X/X...X/XXXX./X..../X....', q: '...../...../.XXXX/X...X/X...X/X...X/.XXXX/....X/....X', r: '..../..../X.XX/XX../X.../X.../X...',
  s: '..../..../.XXX/X.../.XX./...X/XXX.', t: '.X../.X../XXXX/.X../.X../.X../..XX', u: '...../...../X...X/X...X/X...X/X...X/.XXXX',
  v: '...../...../X...X/X...X/X...X/.X.X./..X..', w: '...../...../X...X/X.X.X/X.X.X/X.X.X/.X.X.', x: '...../...../X...X/.X.X./..X../.X.X./X...X',
  y: '...../...../X...X/X...X/X...X/X...X/.XXXX/....X/.XXX.', z: '...../...../XXXXX/...X./..X../.X.../XXXXX',
  0: '.XXX./X...X/X..XX/X.X.X/XX..X/X...X/.XXX.', 1: '..X../.XX../..X../..X../..X../..X../.XXX.', 2: '.XXX./X...X/....X/...X./..X../.X.../XXXXX',
  3: 'XXXX./....X/....X/.XXX./....X/....X/XXXX.', 4: '...X./..XX./.X.X./X..X./XXXXX/...X./...X.', 5: 'XXXXX/X..../XXXX./....X/....X/X...X/.XXX.',
  6: '.XXX./X..../X..../XXXX./X...X/X...X/.XXX.', 7: 'XXXXX/....X/...X./..X../..X../.X.../.X...', 8: '.XXX./X...X/X...X/.XXX./X...X/X...X/.XXX.',
  9: '.XXX./X...X/X...X/.XXXX/....X/....X/.XXX.',
  '.': './././././X/X', ',': '../../../../../.X/.X/X.', ':': './X/X/././X/X', ';': '../.X/.X/../../.X/.X/X.', '!': 'X/X/X/X/X/./X', '?': '.XXX./X...X/....X/...X./..X../...../..X..',
  "'": 'X/X/./././.', '"': 'X.X/X.X/.../.../.../.../...', '-': '..../..../..../XXXX/..../..../....', '+': '...../..X../..X../XXXXX/..X../..X../.....',
  '=': '..../..../XXXX/..../XXXX/..../....', '/': '....X/...X./...X./..X../.X.../.X.../X....', '\\': 'X..../.X.../.X.../..X../...X./...X./....X',
  '(': '.X/X./X./X./X./X./.X', ')': 'X./.X/.X/.X/.X/.X/X.', '[': 'XX/X./X./X./X./X./XX', ']': 'XX/.X/.X/.X/.X/.X/XX', '%': 'XX..X/XX.X./...X./..X../.X.../.X.XX/X..XX',
  '*': '...../X.X.X/.XXX./XXXXX/.XXX./X.X.X/.....', '#': '.X.X./.X.X./XXXXX/.X.X./XXXXX/.X.X./.X.X.', '<': '...X/..X./.X../X.../.X../..X./...X', '>': 'X.../.X../..X./...X/..X./.X../X...',
  '_': '...../...../...../...../...../...../XXXXX', '&': '.XX../X..X./X..X./.XX../X.X.X/X..X./.XX.X', '@': '.XXX./X...X/X.XXX/X.X.X/X.XXX/X..../.XXX.',
  '×': '...../X...X/.X.X./..X../.X.X./X...X/.....', '°': '.X./X.X/.X./.../.../.../...', '…': '...../...../...../...../...../X.X.X/X.X.X', '’': '.X/.X/X./../../../..',
  '«': '...../..X.X/.X.X./X.X../.X.X./..X.X/.....', '»': '...../X.X../.X.X./..X.X/.X.X./X.X../.....', '–': '...../...../...../XXXXX/...../...../.....',
  '|': 'X/X/X/X/X/X/X', '~': '...../...../.X..X/X.X.X/X..X./...../.....', '^': '..X../.X.X./X...X/...../...../...../.....', '$': '..X../.XXXX/X.X../.XXX./..X.X/XXXX./..X..',
  '{': '..X/.X./.X./X../.X./.X./..X', '}': 'X../.X./.X./..X/.X./.X./X..', '`': 'X./.X/../../../../..',
  'ı': './X/X/X/X/X'.replace(/^/, '././').split('/').slice(0, 7).join('/'), 'œ': '...../...../.X.X./X.X.X/X.XXX/X.X../.X.XX', 'æ': '...../...../XX.X./..X.X/.XXXX/X.X../.XXXX',
  'Œ': '.XXXX/X.X../X.X../X.XX./X.X../X.X../.XXXX', 'ß': '.XX../X..X./X..X./X.X../X..X./X..X./X.X..',
  // symbols used by the UI (drawn here so text can embed them)
  '♥': '...../.X.X./XXXXX/XXXXX/.XXX./..X../.....', '★': '..X../..X../XXXXX/.XXX./.XXX./X...X/.....', '→': '...../..X../...X./XXXXX/...X./..X../.....', '←': '...../..X../.X.../XXXXX/.X.../..X../.....',
  '↑': '..X../.XXX./X.X.X/..X../..X../..X../.....', '↓': '..X../..X../..X../X.X.X/.XXX./..X../.....', '•': '.../.../.X./XXX/.X./.../...', '✓': '...../....X/...X./X.X../.X.../...../.....',
};
const ACC = { acute: ['..X', '.X.'], grave: ['X..', '.X.'], circ: ['.X.', 'X.X'], uml: ['X.X', '...'], tilde: ['.XX.X', 'X.XX.'] };
// composed glyphs: [base, accent]; lowercase use rows 0-1, capitals get two extra rows above (yoff -2... handled by baker)
const COMPOSE = { 'é': ['e', 'acute'], 'è': ['e', 'grave'], 'ê': ['e', 'circ'], 'ë': ['e', 'uml'], 'à': ['a', 'grave'], 'â': ['a', 'circ'], 'ä': ['a', 'uml'], 'î': ['ı', 'circ'], 'ï': ['ı', 'uml'], 'ô': ['o', 'circ'], 'ö': ['o', 'uml'],
  'ù': ['u', 'grave'], 'û': ['u', 'circ'], 'ü': ['u', 'uml'], 'ÿ': ['y', 'uml'], 'ñ': ['n', 'tilde'], 'ç': ['c', 'ced'], 'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'uml'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'],
  'Î': ['I', 'circ'], 'Ï': ['I', 'uml'], 'Ô': ['O', 'circ'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'uml'], 'Ç': ['C', 'ced'] };
module.exports = { G, ACC, COMPOSE };
