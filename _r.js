'use strict';
const fs = require('fs');
const { execSync } = require('child_process');
const log = [];
function logm(s) { log.push(s); }
function run(name, cmd) {
  try {
    const r = execSync(cmd, { encoding: 'utf8', timeout: 120000, cwd: 'C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend', shell: true });
    logm(name + ': OK\n' + r.substring(0, 5000));
  } catch (e) {
    logm(name + ': FAIL\n' + (e.stdout || '').substring(0, 5000) + '\n' + (e.stderr || '').substring(0, 5000));
  }
}
run('CLEAR', 'cmd /c "Remove-Item -Recurse -Force node_modules\\.vite 2>nul & echo cleared"');
run('BUILD', 'cmd /c "npx vite build 2>&1"');
fs.writeFileSync('C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend/_result.txt', log.join('\n===STEP===\n'), 'utf8');
