const fs = require('fs');
const {execSync} = require('child_process');
const out = [];
function run(name, cmd, opts) {
  try {
    const r = execSync(cmd, {shell:true, encoding:'utf8', timeout:120000, cwd:'C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend', ...opts});
    out.push(name + ': OK\n' + r.slice(0,3000));
  } catch(e) {
    out.push(name + ': ERR\n' + (e.stdout||'') + (e.stderr||''));
  }
}
run('CLEAR', 'Remove-Item -Recurse -Force node_modules\\.vite');
run('BUILD', 'npx vite build', {timeout:120000});
fs.writeFileSync('C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend/_rebuild_result.txt', out.join('\n---\n'), 'utf8');
fs.writeFileSync('C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend/_rebuild_done.txt', 'done');
out.push('WRITTEN TO _rebuild_result.txt');
process.stdout.write(out.join('\n---\n'));
