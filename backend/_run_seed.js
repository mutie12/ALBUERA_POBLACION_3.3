const {execSync} = require('child_process');
try {
  const r = execSync('node seed-all.js', {cwd:'C:/Users/svlom/OneDrive/Desktop/ALBUERA_POBLACION_3/backend', encoding:'utf8', timeout:30000, shell:true});
  console.log(r);
} catch(e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
