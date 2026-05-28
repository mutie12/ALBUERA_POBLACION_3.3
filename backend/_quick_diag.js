const fs = require('fs');
const dns = require('dns');
const net = require('net');

const logFile = 'C:\\Users\\svlom\\OneDrive\\Desktop\\Albuera-Poblacion_EMS\\backend\\_diag_output.txt';
function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
}

log('=== Starting diagnostics ===');
log('Node version: ' + process.version);

// Test 1: Basic DNS with system resolver
log('\n--- Test 1: System DNS resolve4 google.com ---');
const timer1 = setTimeout(() => {
  log('TIMEOUT after 5s');
  test2();
}, 5000);
dns.resolve4('google.com', (err, addresses) => {
  clearTimeout(timer1);
  if (err) log('ERR: ' + err.code + ' ' + err.message);
  else log('OK: ' + JSON.stringify(addresses));
  test2();
});

// Test 2: Google DNS
function test2() {
  log('\n--- Test 2: Google DNS (8.8.8.8) resolve4 google.com ---');
  const opts = { family: 4, hints: dns.ADDRCONFIG };
  const timer2 = setTimeout(() => {
    log('TIMEOUT after 5s');
    test3();
  }, 5000);
  dns.resolve4('google.com', { timeout: 5000 }, (err, addresses) => {
    clearTimeout(timer2);
    if (err) log('ERR: ' + err.code + ' ' + err.message);
    else log('OK: ' + JSON.stringify(addresses));
    test3();
  });
}

// Test 3: SRV resolution
function test3() {
  log('\n--- Test 3: SRV _mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net ---');
  const timer3 = setTimeout(() => {
    log('TIMEOUT after 8s');
    test4();
  }, 8000);
  dns.resolveSrv('_mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net', (err, records) => {
    clearTimeout(timer3);
    if (err) log('ERR: ' + err.code + ' ' + err.message);
    else log('OK: ' + JSON.stringify(records));
    test4();
  });
}

// Test 4: TCP to Atlas
function test4() {
  log('\n--- Test 4: TCP connect to albueraesdb.4kmpz5z.mongodb.net:27017 ---');
  const timer4 = setTimeout(() => {
    log('TIMEOUT after 8s');
    test5();
  }, 8000);
  const s = net.connect(27017, 'albueraesdb.4kmpz5z.mongodb.net', () => {
    clearTimeout(timer4);
    log('TCP OPEN');
    s.destroy();
    test5();
  });
  s.on('error', (e) => {
    clearTimeout(timer4);
    log('TCP ERR: ' + e.code);
    test5();
  });
}

// Test 5: TCP to 8.8.8.8:53
function test5() {
  log('\n--- Test 5: TCP connect to 8.8.8.8:53 ---');
  const timer5 = setTimeout(() => {
    log('TIMEOUT after 5s');
    test6();
  }, 5000);
  const s = net.connect(53, '8.8.8.8', () => {
    clearTimeout(timer5);
    log('TCP OPEN');
    s.destroy();
    test6();
  });
  s.on('error', (e) => {
    clearTimeout(timer5);
    log('TCP ERR: ' + e.code);
    test6();
  });
}

// Test 6: DNS servers
function test6() {
  log('\n--- Test 6: Current DNS servers ---');
  log('Servers: ' + JSON.stringify(dns.getServers()));
  log('\n=== Done ===');
}
