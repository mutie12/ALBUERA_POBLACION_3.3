const dns = require("dns");
const { promisify } = require("util");

const resolveSrv = promisify(dns.resolveSrv).bind(dns);
const reverse = promisify(dns.reverse).bind(dns);

const SRV = "_mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net";

(async () => {
  try {
    const records = await resolveSrv(SRV);
    console.log("=== SRV records ===");
    for (const r of records) {
      console.log(`  priority=${r.priority} weight=${r.weight} port=${r.port} name=${r.name}`);
    }

    // Pick the first host and resolve its IPs
    const host = records.sort((a, b) => a.priority - b.priority)[0].name;
    console.log(`\n=== A records for ${host} ===`);
    const addresses = await promisify(dns.resolve4)(host);
    for (const addr of addresses) {
      console.log(`  ${addr}`);
    }
    console.log("\n=== Build your MONGO_URI ===");
    // Pick first 3 IPs as direct hosts
    const hosts = addresses.slice(0, 3).map(ip => {
      const port = records[0].port;
      return `${ip}:${port}`;
    }).join(",");
    console.log(`MONGO_URI=mongodb://AlbueraESDB:MonkeyD.Luffy12@${hosts}/albuera_ems?retryWrites=true&w=majority&directConnection=true`);
  } catch (err) {
    console.error("Resolution failed:", err.message);
    process.exit(1);
  }
})();
