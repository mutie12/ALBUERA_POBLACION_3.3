const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const MONGO_URI = process.env.MONGO_URI;

const reportSchema = new mongoose.Schema({
  reporterName: String,
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: { type: String, required: true },
  emergencyType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Responding", "Resolved"], default: "Pending" },
  assignedTo: { respondentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, respondentName: String, assignedAt: Date },
  date: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

async function seedReports() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const count = await Report.countDocuments();
    if (count > 0) {
      console.log(`✅ Already have ${count} reports. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    const sampleReports = [
      {
        reporterName: "Maria Santos",
        location: "123 Rizal St, Brgy. Poblacion",
        emergencyType: "Medical Emergency",
        description: "Elderly person experiencing chest pain and difficulty breathing. Needs immediate medical attention.",
        status: "Pending"
      },
      {
        reporterName: "Juan Dela Cruz",
        location: "456 Mabini Ave, Brgy. San Isidro",
        emergencyType: "Fire",
        description: "Grass fire spreading near residential area. Firefighters needed immediately.",
        status: "Responding",
        assignedTo: { respondentName: "Lourdes Bisoc", assignedAt: new Date() }
      },
      {
        reporterName: "Ana Reyes",
        location: "789 Bonifacio St, Brgy. San Juan",
        emergencyType: "Vehicular Accident",
        description: "Minor collision involving two motorcycles. One rider injured, needs assistance.",
        status: "Resolved"
      },
      {
        reporterName: "Pedro Garcia",
        location: "321 Delgado St, Brgy. San Roque",
        emergencyType: "Flood",
        description: "Heavy rainfall caused flooding in low-lying areas. Families need evacuation assistance.",
        status: "Pending"
      },
      {
        reporterName: "Catherine Lopez",
        location: "654 Luna St, Brgy. Balugo",
        emergencyType: "Crime/Violence",
        description: "Suspicious activity reported near the market area. Police presence requested.",
        status: "Responding",
        assignedTo: { respondentName: "Lourdes Bisoc", assignedAt: new Date() }
      }
    ];

    for (const reportData of sampleReports) {
      const report = new Report(reportData);
      await report.save();
      console.log(`✅ Created report: ${report.emergencyType} at ${report.location}`);
    }

    console.log(`\n📊 Total reports in database: ${await Report.countDocuments()}`);
    console.log("\n✅ Sample reports seeded successfully!");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedReports();
