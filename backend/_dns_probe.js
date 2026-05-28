const dns = require('dns');
const { promisify } = require('util');
const resolveSrv = promisify(dns.resolveSrv.bind(dns));
const resolve4  = promisify(dns.resolve4.bind(dns));
const fs = require('fs');
const log = [];
function w(m) { log.push(m); console.log(m); }
async function main() {
  w('=== DNS + TCP probe for Atlas ===');
  w(`Node: ${process.version}  platform: ${process.platform}`);
  w(`DNS servers: ${JSON.stringify(dns.getServers())}`);

  // 1 — resolve shard hostnames to A records
  w('\n--- 1. A-record lookup (no SRV) ---');
  const shards = [
    'albueraesdb-shard-00-00.4kmpz5z.mongodb.net',
    'albueraesdb-shard-00-01.4kmpz5z.mongodb.net',
    'albueraesdb-shard-00-02.4kmpz5z.mongodb.net',
  ];
  const hosts = [];
  for (const s of shards) {
    try {
      const ips = await resolve4(s, { timeout: 5000 });
      hosts.push({ host: s, ips: ips.map(i => i.address || i) });
      w(`  ✓ ${s}  ->  ${hosts[hosts.length-1].ips.join(', ')}`);
    } catch(e) {
      hosts.push({ host: s, ips: [] });
      w(`  ✗ ${s}  code=${e.code}  ${e.message}`);
    }
  }

  // 2 — direct TCP connect to each resolved IP on 27017
  w('\n--- 2. TCP connect to shards on :27017 ---');
  const net = require('net');
  for (const { host, ips } of hosts) {
    const targets = ips.length ? ips : [host];            // fall back to hostname
    for (const ip of targets) {
      await new Promise((ok) => {
        const s = net.connect(27017, ip, () => {
          w(`  ✓ TCP OPEN  ${ip}:27017`);
          s.destroy();
          ok();
        });
        s.on('error', e => {
          w(`  ✗ TCP FAIL  ${ip}:27017  ${e.code}`);
          ok();
        });
        s.setTimeout(4000, () => {
          w(`  ✗ TCP TIMEOUT ${ip}:27017`);
          s.destroy();
          ok();
        });
      });
    }
  }

  // 3 — direct TCP to a known-working host (Google 8.8.8.8:53)
  w('\n--- 3. TCP connect to 8.8.8.8:53 (control) ---');
  await new Promise((ok) => {
    const s = net.connect(53, '8.8.8.8', () => {
      w('  ✓ 8.8.8.8:53 OPEN');
      s.destroy();
      ok();
    });
    s.on('error', e => { w(`  ✗ 8.8.8.8:53 ${e.code}`); ok(); });
    s.setTimeout(4000, () => { w('  ✗ 8.8.8.8:53 TIMEOUT'); s.destroy(); ok(); });
  });

  // 4 — SRV record query (will likely fail on this network)
  w('\n--- 4. SRV query (expected: failed on this network) ---');
  try {
    const recs = await resolveSrv('_mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net', { timeout: 5000 });
    w(`  ✓ SRV OK  ${JSON.stringify(recs.map(r => `${r.name}:${r.port}`))}`);
  } catch(e) {
    w(`  ✗ SRV FAILED  code=${e.code}  ${e.message}`);
  }

  // 5 — summary: produce a working literal URI
  const working = hosts.filter(h => h.ips.length > 0);
  if (working.length > 0) {
    const hostsList = working.map(h => h.ips.map(ip => `${ip}:27017`).join(',')).join(',');
    const uri = `mongodb://AlbueraESDB:MonkeyD%2ELuffy12@${hostsList}/Albuera-PoblacionEMS?ssl=true&replicaSet=atlas-12fq44-shard-0&authSource=admin&retryWrites=true&w=majority`;
    w(`\n=== Suggested non-SRV MONGO_URI ===`);
    w(uri);
  } else {
    w('\nNo shard IPs resolved — IP whitelist or network block is preventing resolution.');
  }

  w('\n=== done ===');
  fs.writeFileSync('_dns_probe_log.txt', log.join('\n'));
}

main().catch(e => { console.error(e); process.exit(1); });
