
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Use the production User model
const User = require("./models/user");

// Production Report model
const reportSchema = new mongoose.Schema({
  reporterName: String,
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: { type: String, required: true },
  emergencyType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Responding", "Resolved"], default: "Pending" },
  assignedTo: {
    respondentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondentName: String,
    assignedAt: Date
  },
  date: { type: Date, default: Date.now }
});
const Report = mongoose.model("Report", reportSchema);

// Production News model
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ["announcement", "safety-tip", "update", "alert"], default: "announcement" },
  priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
  author: { id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, name: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const News = mongoose.model("News", newsSchema);

// ─── SEED DATA ───────────────────────────────────────────────────────────────

const admins = [
  { name: "Administrator",       username: "admin",         password: "admin123",     email: "admin@albuera.gov.ph",    phone: "+639111111111" },
  { name: "Mercy Alga",           username: "Mercy.admin",   password: "Alga123",       email: "mercy.alga@albuera.gov.ph", phone: "+639122222222" },
  { name: "Lovelyn Penserga",     username: "Lovelyn.admin", password: "Penserga123",   email: "lovelyn.p@albuera.gov.ph",  phone: "+639133333333" },
  { name: "Mariniel Butlay",      username: "Mariniel.admin",password: "Butlay123",     email: "mariniel.b@albuera.gov.ph", phone: "+639144444444" },
  { name: "Jose Rizal",           username: "jose.admin",     password: "Rizal123",      email: "jose.rizal@albuera.gov.ph", phone: "+639155555555" },
];

const respondents = [
  {
    name: "Lourdes Bisoc",
    username: "lourdes.bisoc",
    password: "lourdes2024",
    role: "respondent",
    email: "lourdes.bisoc@albuera.gov.ph",
    phone: "+639123456789",
    barangay: "Poblacion",
    department: "MDRRMC Department",
    badgeNumber: "MDRR-001",
    vehicleNumber: "ABC-1234",
    status: "approved"
  },
  {
    name: "Carlos Santos",
    username: "carlos.santos",
    password: "carlos2024",
    role: "respondent",
    email: "carlos.santos@albuera.gov.ph",
    phone: "+639198765432",
    barangay: "Balugo",
    department: "Fire Department",
    badgeNumber: "FIR-002",
    vehicleNumber: "XYZ-5678",
    status: "approved"
  },
  {
    name: "Ana Garcia",
    username: "ana.garcia",
    password: "ana2024",
    role: "respondent",
    email: "ana.garcia@albuera.gov.ph",
    phone: "+639187654321",
    barangay: "San Pedro",
    department: "Barangay Tanod",
    badgeNumber: "TAN-003",
    vehicleNumber: null,
    status: "approved"
  },
  {
    name: "Pedro Mendoza",
    username: "pedro.mendoza",
    password: "pedro2024",
    role: "respondent",
    email: "pedro.mendoza@albuera.gov.ph",
    phone: "+639176543210",
    barangay: "Damula-an",
    department: "Police Department",
    badgeNumber: "PNP-004",
    vehicleNumber: "POL-9012",
    status: "approved"
  },
];

const residents = [
  {
    name: "Maria Santos",
    username: "maria.santos",
    password: "maria2024",
    role: "resident",
    email: "maria.santos@gmail.com",
    phone: "+639091234567",
    barangay: "Poblacion",
    barangayCode: "POB001",
    isBarangayVerified: true,
    status: "approved"
  },
  {
    name: "Juan Dela Cruz",
    username: "juan.delacruz",
    password: "juan2024",
    role: "resident",
    email: "juan.delacruz@gmail.com",
    phone: "+639092345678",
    barangay: "San Isidro",
    barangayCode: "SID002",
    isBarangayVerified: true,
    status: "approved"
  },
  {
    name: "Ana Reyes",
    username: "ana.reyes",
    password: "ana2024",
    role: "resident",
    email: "ana.reyes@gmail.com",
    phone: "+639093456789",
    barangay: "San Juan",
    barangayCode: "SJU003",
    isBarangayVerified: true,
    status: "approved"
  },
  {
    name: "Pedro Garcia",
    username: "pedro.garcia",
    password: "pedro2024",
    role: "resident",
    email: "pedro.garcia@gmail.com",
    phone: "+639094567890",
    barangay: "San Roque",
    barangayCode: "SRO004",
    isBarangayVerified: false,
    status: "pending"
  },
  {
    name: "Catherine Lopez",
    username: "catherine.lopez",
    password: "catherine2024",
    role: "resident",
    email: "catherine.lopez@gmail.com",
    phone: "+639095678901",
    barangay: "Balugo",
    barangayCode: "BAL005",
    isBarangayVerified: true,
    status: "approved"
  },
  {
    name: "Josefa Mendoza",
    username: "josefa.mendoza",
    password: "josefa2024",
    role: "resident",
    email: "josefa.mendoza@gmail.com",
    phone: "+639096789012",
    barangay: "Mahayag",
    barangayCode: "MAH006",
    isBarangayVerified: true,
    status: "approved"
  },
  {
    name: "Roberto dela Cruz",
    username: "roberto.delacruz",
    password: "roberto2024",
    role: "resident",
    email: "roberto.delacruz@gmail.com",
    phone: "+639097890123",
    barangay: "Talisayan",
    barangayCode: "TAL007",
    isBarangayVerified: false,
    status: "pending"
  },
];

const sampleNews = [
  {
    title: "Community Emergency Preparedness Seminar",
    content: "The Municipal Disaster Risk Reduction and Management Office (MDRRMO) will conduct a free Community Emergency Preparedness Seminar for all residents. Topics include earthquake safety, fire prevention, and flood evacuation procedures. All barangay captains are enjoined to participate and encourage their constituents to attend.",
    category: "announcement",
    priority: "high",
    isActive: true
  },
  {
    title: "Safety Tip: How to Report an Emergency",
    content: "Always provide your exact location when reporting an emergency. Use landmarks or nearby establishments to describe your location accurately. Stay on the line until the operator confirms all necessary information has been collected. Do not hang up prematurely.",
    category: "safety-tip",
    priority: "normal",
    isActive: true
  },
  {
    title: "New Barangay Water Pumps Installed",
    content: "Six new submersible water pumps have been installed in low-lying barangays of Poblacion, Balugo, and San Pedro ahead of the rainy season. Each pump has a capacity of 500 gallons per minute and is powered by the barangay's solar panel system.",
    category: "update",
    priority: "normal",
    isActive: true
  },
  {
    title: "Typhoon Season Preparedness Reminder",
    content: "As we enter the typhoon season, all residents are advised to: (1) Clean drainage canals and culverts, (2) Trim trees near your homes, (3) Prepare an emergency kit with food, water, and medicine, (4) Know your nearest evacuation center. Stay safe and alert!",
    category: "alert",
    priority: "high",
    isActive: true
  },
];

// ─── SEED FUNCTIONS ─────────────────────────────────────────────────────────

async function seedAdmins() {
  console.log("\n👤 Seeding Admins...");
  for (const admin of admins) {
    const existing = await User.findOne({ username: admin.username });
    const hashed = await bcrypt.hash(admin.password, 10);
    if (existing) {
      await User.findByIdAndUpdate(existing._id, {
        password: hashed,
        name: admin.name,
        role: "admin",
        email: admin.email,
        phone: admin.phone,
        status: "approved",
      });
      console.log(`  ✅ Updated admin: ${admin.username}`);
    } else {
      await User.create({
        name: admin.name,
        username: admin.username,
        password: hashed,
        role: "admin",
        email: admin.email,
        phone: admin.phone,
        status: "approved",
      });
      console.log(`  ✅ Created admin: ${admin.username}`);
    }
  }
}

async function seedRespondents() {
  console.log("\n🚑 Seeding Respondents...");
  for (const r of respondents) {
    const existing = await User.findOne({ username: r.username });
    const hashed = await bcrypt.hash(r.password, 10);
    if (existing) {
      await User.findByIdAndUpdate(existing._id, {
        password: hashed,
        name: r.name,
        role: "respondent",
        email: r.email,
        phone: r.phone,
        barangay: r.barangay,
        department: r.department,
        badgeNumber: r.badgeNumber,
        vehicleNumber: r.vehicleNumber,
        status: "approved",
      });
      console.log(`  ✅ Updated respondent: ${r.username}`);
    } else {
      await User.create({
        name: r.name,
        username: r.username,
        password: hashed,
        role: "respondent",
        email: r.email,
        phone: r.phone,
        barangay: r.barangay,
        department: r.department,
        badgeNumber: r.badgeNumber,
        vehicleNumber: r.vehicleNumber,
        status: "approved",
      });
      console.log(`  ✅ Created respondent: ${r.username}`);
    }
  }
}

async function seedResidents() {
  console.log("\n🏠 Seeding Residents...");
  for (const r of residents) {
    const existing = await User.findOne({ username: r.username });
    const hashed = await bcrypt.hash(r.password, 10);
    if (existing) {
      await User.findByIdAndUpdate(existing._id, {
        password: hashed,
        name: r.name,
        role: "resident",
        email: r.email,
        phone: r.phone,
        barangay: r.barangay,
        barangayCode: r.barangayCode,
        isBarangayVerified: r.isBarangayVerified,
        status: r.status,
        verificationCode: null,
      });
      console.log(`  ✅ Updated resident: ${r.username} (${r.status})`);
    } else {
      await User.create({
        name: r.name,
        username: r.username,
        password: hashed,
        role: "resident",
        email: r.email,
        phone: r.phone,
        barangay: r.barangay,
        barangayCode: r.barangayCode,
        isBarangayVerified: r.isBarangayVerified,
        status: r.status,
        verificationCode: null,
      });
      console.log(`  ✅ Created resident: ${r.username} (${r.status})`);
    }
  }
}

async function seedNews() {
  console.log("\n📰 Seeding News Articles...");
  // Find the first admin to use as author
  const author = await User.findOne({ role: "admin" });
  if (!author) {
    console.log("  ⚠️  No admin found — skipping news seed");
    return;
  }

  const existingCount = await News.countDocuments();
  if (existingCount > 0) {
    console.log(`  ℹ️  ${existingCount} news articles already exist — skipping`);
    return;
  }

  for (const article of sampleNews) {
    await News.create({
      title: article.title,
      content: article.content,
      category: article.category,
      priority: article.priority,
      isActive: article.isActive,
      author: { id: author._id, name: author.name },
    });
    console.log(`  ✅ Created news: "${article.title}"`);
  }
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB:", process.env.MONGO_URI.split("@")[1]?.split("/")[1] || "ALBUERA_POBLACION_3");

    await seedAdmins();
    await seedRespondents();
    await seedResidents();
    await seedNews();

    console.log("\n📊 Database Summary:");
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const respondentCount = await User.countDocuments({ role: "respondent" });
    const residentCount = await User.countDocuments({ role: "resident" });
    const reportCount = await Report.countDocuments();
    const newsCount = await News.countDocuments();
    console.log(`  Users total:   ${userCount}  (admin: ${adminCount}, respondent: ${respondentCount}, resident: ${residentCount})`);
    console.log(`  Reports:       ${reportCount}`);
    console.log(`  News:          ${newsCount}`);

    await mongoose.disconnect();
    console.log("\n✅ All seed data written successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

run();
