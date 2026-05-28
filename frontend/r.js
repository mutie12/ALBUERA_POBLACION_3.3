// Self-sufficient build runner - writes external flags so caller can detect progress
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve('C:\\Users\\svlom\\OneDrive\\Desktop\\ALBUERA_POBLACION_3\\frontend');
const doneFile = path.join(root, '_done.flag');
const outFile  = path.join(root, '_build_result.txt');

function p(msg) { console.log(msg); }
function w (msg) { try { fs.appendFileSync(outFile, msg + '\n', 'utf8'); } catch(_){} }

// --- no-op promise to gather spin state
async function build() {
  w('=== START ===');
  w(new Date().toISOString());
  p('Step 1: clearing .vite');
  w('Step 1: clearing cache');
  try {
    fs.rmSync(path.join(root, 'node_modules', '.vite'), { recursive: true, force: true });
    w('CACHE CLEARED');
  } catch(e) {
    w('CACHE ERROR: ' + e.message);
  }

  p('Step 2: running npx vite build --force');
  w('Step 2: npx vite build --force');
  const t0 = Date.now();
  try {
    const raw = execSync('npx vite build --force', {
      cwd: root,
      encoding: 'utf8',
      timeout: 300000,
      maxBuffer: 50*1024*1024,
    });
    p('Step 3: build output captured');
    w('Step 3: COMPLETED in ' + (Date.now()-t0) + 'ms');
    w(raw);
    w('SUCCESS');
  } catch(e) {
    const elapsed = Date.now() - t0;
    p('Step 3: build error captured (' + elapsed + 'ms)');
    w('Step 3: FAILED in ' + elapsed + 'ms');
    w('STDOUT:\n' + (e.stdout || ''));
    w('STDERR:\n' + (e.stderr || ''));
    w('ERROR: ' + (e.message || ''));
    w('FAILED');
  }

  w(new Date().toISOString() + ' DONE');
  fs.writeFileSync(doneFile, '1', 'utf8');
  p('Done file written.');
}

build();
