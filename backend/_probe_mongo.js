require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  console.log("Connecting with MONGO_URI from .env...\n");

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 60000 });
    console.log(`MongoDB CONNECTED  readyState=${mongoose.connection.readyState}`);
    const colNames = await mongoose.connection.db.collections()
      .then(colls => colls.map(c => c.collectionName))
      .catch(() => []);
    console.log(`Collections found: ${colNames.join(", ") || "(none)"}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("CONNECT FAILED:", err.message);
    process.exit(1);
  }
}

main();
