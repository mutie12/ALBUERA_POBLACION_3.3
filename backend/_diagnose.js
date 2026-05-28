require("dotenv").config();
const dns = require("dns");
const { promisify } = require("util");

const resolveSrv = promisify(dns.resolveSrv.bind(dns));

(async () => {
  try {
    console.log("Resolving SRV: _mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net");
    const recs = await resolveSrv("_mongodb._tcp.albueraesdb.4kmpz5z.mongodb.net");
    console.log("OK:", JSON.stringify(recs));
  } catch(err) {
    console.error("SRV FAILED:", err.code, err.message);
  }

  try {
    console.log("\nResolving A: cluster0-shard-00-00.4kmpz5z.mongodb.net");
    const recs = await promisify(dns.resolve4.bind(dns))("cluster0-shard-00-00.4kmpz5z.mongodb.net");
    console.log("OK:", JSON.stringify(recs));
  } catch(err) {
    console.error("A FAILED:", err.code, err.message);
  }

  try {
    console.log("\nResolving A: cluster0-shard-00-00.4kmpz5z.mongodb.net via lookup");
    const recs = await promisify(dns.lookup.bind(dns))("cluster0-shard-00-00.4kmpz5z.mongodb.net");
    console.log("OK:", JSON.stringify(recs));
  } catch(err) {
    console.error("lookup FAILED:", err.code, err.message);
  }

  // Test plain TCP
  const net = require("net");
  await new Promise(resolve => {
    const s = net.connect(27017, "cluster0-shard-00-00.4kmpz5z.mongodb.net", () => {
      console.log("\nTCP 27017: OPEN");
      s.destroy(); resolve();
    });
    s.on("error", e => { console.error("TCP 27017:", e.code, e.message); resolve(); });
    s.setTimeout(4000, () => { console.log("TCP 27017: ETIMEOUT"); s.destroy(); resolve(); });
  });

  console.log("\nMONGO_URI from .env:", process.env.MONGO_URI);
  
  // Now try mongoose connect
  const mongoose = require("mongoose");
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 8000
  }).then(() => {
    console.log("MONGOOSE CONNECTED");
    mongoose.disconnect();
  }).catch(e => {
    console.error("MONGOOSE FAILED:", e.message);
    console.error("  name:", e.name);
    console.error("  code:", e.code);
    console.error("  errno:", e.errno);
    console.error("  syscall:", e.syscall);
    if (e.stack) console.error("  stack:", e.stack.split("\n").slice(1,4).join("\n"));
  });

  process.exit(0);
})();
