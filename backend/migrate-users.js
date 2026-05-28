require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI;

const oldUserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  barangay: String,
  barangayCode: String,
  isBarangayVerified: Boolean,
  role: String,
  status: String,
  verificationCode: String,
  createdAt: Date
});

const newAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  phone: String,
  role: { type: String, enum: ["admin"], default: "admin" },
  createdAt: Date
});

const newRespondentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  phone: String,
  barangay: String,
  station: String,
  badgeNumber: String,
  vehicleNumber: String,
  role: { type: String, enum: ["respondent"], default: "respondent" },
  createdAt: Date
});

const newResidentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  phone: String,
  barangay: String,
  barangayCode: String,
  isBarangayVerified: Boolean,
  role: { type: String, enum: ["resident"], default: "resident" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  verificationCode: String,
  createdAt: Date
});

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const OldUser = mongoose.model("OldUser", oldUserSchema, "users");
    const Admin = mongoose.model("Admin", newAdminSchema);
    const Respondent = mongoose.model("Respondent", newRespondentSchema);
    const Resident = mongoose.model("Resident", newResidentSchema);

    const oldUsers = await OldUser.find({});
    console.log(`Found ${oldUsers.length} users to migrate`);

    let adminsCreated = 0;
    let respondentsCreated = 0;
    let residentsCreated = 0;

    for (const user of oldUsers) {
      try {
        if (user.role === "admin") {
          await Admin.create({
            name: user.name,
            username: user.username,
            password: user.password,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
          });
          adminsCreated++;
          console.log(`Migrated admin: ${user.username}`);
        } else if (user.role === "respondent") {
          await Respondent.create({
            name: user.name,
            username: user.username,
            password: user.password,
            email: user.email,
            phone: user.phone,
            barangay: user.barangay,
            createdAt: user.createdAt
          });
          respondentsCreated++;
          console.log(`Migrated respondent: ${user.username}`);
        } else if (user.role === "resident") {
          await Resident.create({
            name: user.name,
            username: user.username,
            password: user.password,
            email: user.email,
            phone: user.phone,
            barangay: user.barangay,
            barangayCode: user.barangayCode,
            isBarangayVerified: user.isBarangayVerified,
            status: user.status,
            verificationCode: user.verificationCode,
            createdAt: user.createdAt
          });
          residentsCreated++;
          console.log(`Migrated resident: ${user.username}`);
        }
      } catch (err) {
        console.error(`Error migrating ${user.username}:`, err.message);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Admins: ${adminsCreated}`);
    console.log(`Respondents: ${respondentsCreated}`);
    console.log(`Residents: ${residentsCreated}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error.message);
    process.exit(1);
  }
}

migrate();
