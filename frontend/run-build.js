const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontend = path.resolve('C:\\Users\\svlom\\OneDrive\\Desktop\\ALBUERA_POBLACION_3\\frontend');
const logPath = path.join(frontend, '_build_result.txt');

function runAndCapture(label, cmd, args) {
  return new Promise((resolve) => {
    const chunks = [];
    const p = spawn(cmd, args, {
      cwd: frontend,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    p.stdout.on('data', d => chunks.push(`[OUT] ${d.toString().trim()}`));
    p.stderr.on('data', d => chunks.push(`[ERR] ${d.toString().trim()}`));
    p.on('close', code => {
      fs.appendFileSync(logPath, `\n=== ${label} (exit ${code}) ===\n${chunks.join('\n')}\n`);
      resolve(code);
    });
    p.on('error', e => {
      fs.appendFileSync(logPath, `\n=== ${label} SPAWN ERROR ===\n${e.message}\n`);
      resolve(-1);
    });
  });
}

(async () => {
  try { fs.unlinkSync(logPath); } catch(_) {}
  fs.writeFileSync(logPath, 'BUILD LOG START\n');

  // Step 1
  fs.appendFileSync(logPath, '\n=== Step 1: Remove stale Vite cache ===\n');
  const viteCache = path.join(frontend, 'node_modules', '.vite');
  fs.rmSync(viteCache, { recursive: true, force: true });
  fs.appendFileSync(logPath, `Removed: ${viteCache}\n`);

  // Step 2 – try npx vite build --force first
  fs.appendFileSync(logPath, '\n=== Step 2a: npx vite build --force ===\n');
  const code1 = await runAndCapture('vite build --force', 'npx', ['vite', 'build', '--force']);

  if (code1 !== 0) {
    // Step 3 – retry without --force (cache already nuked)
    fs.appendFileSync(logPath, '\n=== Step 2b: npx vite build (retry without --force) ===\n');
    await runAndCapture('vite build retry', 'npx', ['vite', 'build']);
  }

  fs.appendFileSync(logPath, '\n=== BUILD LOG END ===\n');
})();
