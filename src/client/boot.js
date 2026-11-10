// last file of the bundle: start the game once every module is defined
(function (AL) { 'use strict'; if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', AL.Game.boot); else AL.Game.boot(); } })(self.AL);
