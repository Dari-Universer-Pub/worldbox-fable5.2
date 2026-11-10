// Runs every test: headless simulation checks, then the browser robots. node tests/run-all.js
const { spawnSync } = require('child_process'); let fail = 0;
for (const [f, ...a] of [['tests/town-run.js', '30000', '7', '12', '--quiet'], ['tests/eco-run.js', '20000', '7'], ['tests/step4.js'], ['tests/step5.js'], ['tests/step6.js'], ['tests/war-run.js', '40000', '7', '--quiet'], ['tests/step7.js'], ['tests/powers-run.js'], ['tests/step8.js'], ['tools/check-provenance.js']]) { const r = spawnSync(process.execPath, [f, ...a], { encoding: 'utf8' }); const last = (r.stdout || '').trim().split('\n').pop(); console.log((r.status ? 'FAIL ' : 'ok   ') + f + '  ' + last); if (r.status) fail++; }
process.exit(fail ? 1 : 0);
