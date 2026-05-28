const {execSync} = require('child_process');
process.chdir('C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/frontend');
try {
  execSync('Remove-Item -Recurse -Force node_modules\\.vite', {shell:true, encoding:'utf8'});
  console.log('VITE CACHE CLEARED');
} catch(e) { console.log('CLEAR ERR:', e.message.slice(0,200)); }
try {
  execSync('npx vite build', {shell:true, encoding:'utf8', timeout:120000});
  console.log('BUILD SUCCEEDED');
} catch(e) {
  console.log('BUILD FAILED:', e.message.slice(0, 5000));
}
