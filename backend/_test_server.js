const fs = require('fs');
const { spawn } = require('child_process');

const outFile = 'C:\\Users\\svlom\\OneDrive\\Desktop\\Albuera-Poblacion_EMS\\backend\\_server_test.txt';
const stream = fs.createWriteStream(outFile);

const child = spawn('node', ['server.js'], {
  cwd: 'C:\\Users\\svlom\\OneDrive\\Desktop\\Albuera-Poblacion_EMS\\backend',
  env: process.env
});

child.stdout.on('data', (data) => {
  stream.write('[OUT] ' + data);
});

child.stderr.on('data', (data) => {
  stream.write('[ERR] ' + data);
});

setTimeout(() => {
  child.kill();
  stream.end('\n=== Test complete ===\n');
  process.exit(0);
}, 15000);
