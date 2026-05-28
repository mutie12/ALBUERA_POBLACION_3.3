const net = require("net");
const dns = require("dns");
const { promisify } = require("util");

const resolve4 = promisify(dns.resolve4.bind(dns));

(async () => {
  console.log("=== Testing general internet (ping 8.8.8.8) ===");
  await new Promise((resolve, reject) => {
    const s = net.connect(53, "8.8.8.8", () => {
      console.log("TCP 8.8.8.8:53 OPEN");
      s.destroy(); resolve();
    });
    s.on("error", err => { console.log("TCP 8.8.8.8:53 FAILED:", err.code); reject(err); });
    s.setTimeout(3000, reject);
  });
  console.log();
  
  // Try to connect to standard Atlas port (SRV-less DNS first)
  const atlasHosts = [
    "albueraesdb.4kmpz5z.mongodb.net",
    "cluster0-shard-00-00.4kmpz5z.mongodb.net",
    "cluster0-shard-00-01.4kmpz5z.mongodb.net",
    "cluster0-shard-00-02.4kmpz5z.mongodb.net",
  ];
  
  for (const h of atlasHosts) {
    // Step 1: TCP test port 27017
    console.log(`--- ${h} ---`);
    await new Promise((resolve) => {
      const s = net.connect(27017, h, () => {
        console.log(`  TCP 27017: OPEN`);
        s.destroy(); resolve();
      });
      s.on("error", err => { console.log(`  TCP 27017: ${err.code}`); resolve(); });
      s.setTimeout(4000, () => { console.log(`  TCP 27017: ETIMEOUT`); s.destroy(); resolve(); });
    });
    // Step 2: DNS A record
    try {
      const ips = await resolve4(h, { timeout: 3000 }).catch(e => { throw e; });
      console.log(`  A records: ${ips.map(x => x.address || x.address || String(x)).join(", ")}`);
    } catch (e) {
      console.log(`  A records: ${e.code} ${e.message}`);
    }
    console.log();
  }
  process.exit(0);
})();
