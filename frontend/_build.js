const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\svlom\\OneDrive\\Desktop\\ALBUERA_POBLACION_3\\frontend';
const logFile = path.join(root, '_build_result.txt');
const nodeExe = 'C:\\Program Files\\nodejs\\node.exe';
const viteScript = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

fs.writeFileSync(logFile, '=== BUILD LOG ===\n');
function log(m) { fs.appendFileSync(logFile, m + '\n'); 'utf8'); }

function wipe() {
  const d = path.join(root, 'node_modules', '.vite');
  try { fs.rmSync(d, { recursive: true, force: true }); log('>>> CACHE CLEARED'); }
  catch (e) { log('>>> CACHE CLEAR ERROR: ' + e.message); }
}

function build(label, args) {
  log(`>>> [${label}] vite build ${args.join(' ')}`);
  const t0 = Date.now();
  try {
    const out = execFileSync(nodeExe, [viteScript, 'build', ...args], {
      cwd: root, encoding: 'utf8', timeout: 300000, maxBuffer: 50*1024*1024, windowsHide: true
    });
    log(`>>> [${label}] SUCCESS ${Date.now()-t0}ms\n${out}`);
    return true;
  } catch (e) {
    log(`>>> [${label}] FAILED ${Date.now()-t0}ms code=${e.status}`);
    log(e.stdout || '');
    log(e.stderr || '');
    log(e.message || '');
    return false;
  }
}

var ok = false;
wipe();
ok = build('force', ['--force']);
if (!ok) {
  log('');
  wipe();
  ok = build('retry', []);
}
log(`\n>>> BUILD ${ok ? 'PASSED' : 'FAILED'}`);
log('=== END ===');
