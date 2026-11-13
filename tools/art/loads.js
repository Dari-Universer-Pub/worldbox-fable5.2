// What a villager carries (chantier B.7), pipeline B: one small pixel grid per resource, drawn over the unit by the scene.
// Order = src/data/resources.json. o outline; W/w/E wood; S/s/n stone; C/c/d cloth; K/k gold; M/m metal; then the ore tones A/a.
exports.GRIDS = {
  wood: ['.ooooo.', 'oEWwwwo', 'ooooooo', 'oEWWwwo', '.ooooo.'],
  stone: ['.oooo.', 'oSSsso', 'oSssno', 'osnnno', '.oooo.'],
  food: ['..Kk..', '.okko.', 'oCCcco', 'oCccdo', 'occddo', '.oooo.'],
  copper: ['..aA..', '.AaaA.', 'owwwwo', 'oWwwwo', '.oooo.'],
  iron: ['.Aa...', '.aAaA.', 'owwwwo', 'oWwwwo', '.oooo.'],
  gold: ['...A..', '.aAAa.', 'owwwwo', 'oWwwwo', '.oooo.'],
  aetherite: ['..A.A.', '.AaAa.', 'owwwwo', 'oWwwwo', '.oooo.'],
  tools: ['ooooo.', 'oMMmo.', 'ooWoo.', '.oWo..', '.owo..', '..o...'],
  weapons: ['..M..', '.oMo.', '.oMo.', '.oMo.', 'okKko', '.owo.', '..o..'],
  armor: ['.oooo.', 'oMMmmo', 'oMKkmo', 'omkmno', '.omno.', '..oo..'] };
// ore tones [A, a] per resource (ramp, tone)
exports.ORE = { copper: [['fire', 3], ['fire', 1]], iron: [['ice', 3], ['stone', 2]], gold: [['fire', 5], ['fire', 4]], aetherite: [['magic', 5], ['magic', 3]] };
