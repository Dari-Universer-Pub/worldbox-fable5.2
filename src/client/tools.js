// AL.Tools — the god's hand: applies the selected power/brush under the mouse. Brush powers are sent to the simulation as segments.
(function (AL) {
  'use strict';
  const Game = AL.Game, T = AL.Tools = { lastSend: 0 };
  // tool = {id, size, shape, power}; brush tools: raise lower dig ground:<name> forest river grass lava erase
  T.brushOp = function (M, first) { const t = Game.tool, id = t.id; const op = { tool: id, x: M.tileX, y: M.tileY, x0: first ? M.tileX : M.lastTX, y0: first ? M.tileY : M.lastTY, size: t.size, shape: t.shape === 'line' ? 'round' : t.shape, strength: 8 };
    if (id.startsWith('ground:')) { op.tool = 'ground'; op.ground = AL.G[id.slice(7)]; } return op; };
  T.isBrush = id => /^(raise|lower|dig|ground:|forest|river|grass|lava|erase)/.test(id);
  Game.onPress = function (M) { const t = Game.tool; if (T.isBrush(t.id)) { if (t.shape === 'line') { T.lineFrom = [M.tileX, M.tileY]; return; } AL.Link.send({ t: 'brush', op: T.brushOp(M, true) }); M.lastTX = M.tileX; M.lastTY = M.tileY; T.hold = 0; if (AL.Fx) AL.Fx.brushFeedback(t.id, M); } else if (T.onPress) T.onPress(M); };
  Game.onDrag = function (M) { const t = Game.tool; if (T.isBrush(t.id)) { if (t.shape === 'line') return; if (M.tileX === M.lastTX && M.tileY === M.lastTY && !/raise|lower|dig/.test(t.id)) return; AL.Link.send({ t: 'brush', op: T.brushOp(M, false) }); M.lastTX = M.tileX; M.lastTY = M.tileY; if (AL.Fx) AL.Fx.brushFeedback(t.id, M); } else if (T.onDrag) T.onDrag(M); };
  Game.onRelease = function (M) { const t = Game.tool; if (T.isBrush(t.id) && t.shape === 'line' && T.lineFrom) { M.lastTX = T.lineFrom[0]; M.lastTY = T.lineFrom[1]; AL.Link.send({ t: 'brush', op: T.brushOp(M, false) }); T.lineFrom = null; } else if (T.onRelease) T.onRelease(M); };
  // spawn tools: 'spawn:<kind>' drops a group of creatures or people under the pointer
  T.onPress = function (M) { const t = Game.tool; if (t.id.startsWith('spawn:')) { AL.Link.send({ t: 'spawn', kind: t.id.slice(6), x: M.wx / 8, y: M.wy / 8, count: t.count || 1 }); if (AL.Fx && AL.Fx.brushFeedback) AL.Fx.brushFeedback(t.id, M); } else if (T.power) T.power(M, true); };
  // holding the button with raise/lower keeps sculpting (called each frame)
  T.frame = function (dt) { const M = Game.mouse, t = Game.tool; if (M.down && /^(raise|lower|dig)$/.test(t.id) && t.shape !== 'line') { T.hold += dt; if (T.hold > 0.09) { T.hold = 0; AL.Link.send({ t: 'brush', op: T.brushOp(M, true) }); } } };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
