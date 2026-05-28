const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const uri = process.env.MONGO_URI || "";
console.log("[DEBUG] __dirname:", __dirname);
console.log("[DEBUG] MONGO_URI:", uri ? uri.replace(/:([^:]+)@/, ':***@') : "(undefined)");

mongoose.set("strictQuery", false);

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 12000,
    socketTimeoutMS: 12000,
  })
  .then(() => {
    console.log("✅ MongoDB CONNECTED");
    console.log("  readyState:", mongoose.connection.readyState);
    console.log("  host:", mongoose.connection.host);
    console.log("  name:", mongoose.connection.name);
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ CONNECT FAILED:", err.name);
    console.error("  message:", err.message);
    if (err.reason) {
      console.error("  reason.type:", err.reason.type);
      if (err.reason.servers) {
        for (const [addr, sd] of err.reason.servers.entries()) {
          console.error(
            "  server[" + addr + "] type=" + sd.type + " rtt=" + sd.roundTripTime + "ms"
          );
        }
      }
    }
    if (err.stack) console.error("  stack:", err.stack.split("\n").slice(1, 5).join("\n"));
    process.exit(1);
  });
