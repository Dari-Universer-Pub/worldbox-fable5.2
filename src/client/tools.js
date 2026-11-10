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
  // powers (data: src/data/powers.json): point/area/zone powers fire on press, 'drag' powers keep firing while the pointer moves,
  // 'move' powers (teleport) take the press as the source and the release as the destination, 'control' takes over a unit
  T.power = function (M, first) { const t = Game.tool, d = AL.DATA.powers[t.id]; if (!d || d.kind === 'brush' || d.kind === 'spawn') return; const x = M.wx / 8, y = M.wy / 8;
    if (d.kind === 'move') { if (first) T.moveFrom = [x, y]; return; }
    if (d.kind === 'control') { if (!first) return; const ctl = Game.hud ? Game.hud.ctl : -1, i = AL.Scene.pick(M.wx, M.wy + 8); if (ctl >= 0) AL.Link.send({ t: 'order', x, y, target: i >= 0 && i !== ctl ? i : -1, special: !!Game.keys.ShiftLeft }); else if (i >= 0) { AL.Link.send({ t: 'control', i }); Game.follow = i; } return; }
    if (!first && !d.drag) return; AL.Link.send({ t: 'power', id: t.id, x, y, r: t.r || d.r || 0 }); T.lastPX = M.tileX; T.lastPY = M.tileY; };
  T.onDrag = function (M) { const d = AL.DATA.powers[Game.tool.id]; if (d && d.drag && (M.tileX !== T.lastPX || M.tileY !== T.lastPY)) T.power(M, false); };
  T.onRelease = function (M) { const t = Game.tool, d = AL.DATA.powers[t.id]; if (d && d.kind === 'move' && T.moveFrom) { AL.Link.send({ t: 'power', id: t.id, x: M.wx / 8, y: M.wy / 8, x0: T.moveFrom[0], y0: T.moveFrom[1], r: t.r || d.r }); T.moveFrom = null; } };
  T.release = function () { AL.Link.send({ t: 'control', i: -1 }); };
  // holding the button with raise/lower keeps sculpting (called each frame)
  T.frame = function (dt) { const M = Game.mouse, t = Game.tool; if (M.down && /^(raise|lower|dig)$/.test(t.id) && t.shape !== 'line') { T.hold += dt; if (T.hold > 0.09) { T.hold = 0; AL.Link.send({ t: 'brush', op: T.brushOp(M, true) }); } } };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
