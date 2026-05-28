const fs = require('fs');
const net = require('net');

const logFile = 'C:\\Users\\svlom\\OneDrive\\Desktop\\Albuera-Poblacion_EMS\\backend\\_diag_output.txt';
fs.writeFileSync(logFile, '=== Starting ===\n');

// Test TCP to well-known hosts
const tests = [
  { host: '8.8.8.8', port: 53, name: 'Google DNS' },
  { host: '1.1.1.1', port: 53, name: 'Cloudflare DNS' },
  { host: '208.67.222.222', port: 53, name: 'OpenDNS' },
];

let i = 0;
function next() {
  if (i >= tests.length) {
    fs.appendFileSync(logFile, '=== Done ===\n');
    process.exit(0);
  }
  const t = tests[i++];
  fs.appendFileSync(logFile, `\nTesting ${t.name} (${t.host}:${t.port})...\n`);
  const s = net.connect(t.port, t.host, () => {
    fs.appendFileSync(logFile, `  TCP OPEN\n`);
    s.destroy();
    next();
  });
  s.on('error', (e) => {
    fs.appendFileSync(logFile, `  ERR: ${e.code}\n`);
    next();
  });
  s.setTimeout(5000, () => {
    fs.appendFileSync(logFile, `  TIMEOUT\n`);
    s.destroy();
    next();
  });
}
next();
