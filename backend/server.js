if (process.env.NODE_ENV !== "production") {
  try { require("dotenv").config(); } catch { /* dotenv not installed */ }
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authroutes");
const reportRoutes = require("./routes/reportroutes");
const notificationRoutes = require("./routes/notificationroutes");
const newsRoutes = require("./routes/newsroutes");

const app = express();
let dbConnected = false;

const CORS_ORIGINS = [
  "https://albuera-poblacion-mary.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.FRONTEND_URL) {
  CORS_ORIGINS.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: CORS_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const sampleReports = [
  { _id: "1", reporterName: "Maria Santos", location: "123 Rizal St, Brgy. Poblacion", emergencyType: "Medical Emergency", description: "Elderly person experiencing chest pain and difficulty breathing. Needs immediate medical attention.", status: "Pending", date: new Date().toISOString() },
  { _id: "2", reporterName: "Juan Dela Cruz", location: "456 Mabini Ave, Brgy. San Isidro", emergencyType: "Fire", description: "Grass fire spreading near residential area. Firefighters needed immediately.", status: "Responding", date: new Date().toISOString() },
  { _id: "3", reporterName: "Ana Reyes", location: "789 Bonifacio St, Brgy. San Juan", emergencyType: "Vehicular Accident", description: "Minor collision involving two motorcycles. One rider injured, needs assistance.", status: "Resolved", date: new Date().toISOString() },
];

const sampleNews = [
  { _id: "1", title: "Community Emergency Preparedness Week", content: "Join us for emergency preparedness training this week. Learn life-saving techniques and emergency response procedures.", category: "announcement", priority: "high", author: { name: "Admin" }, createdAt: new Date().toISOString() },
];

app.get("/api/reports/public", (req, res, next) => {
  if (!dbConnected) return res.json(sampleReports);
  next();
});

app.get("/api/news", (req, res, next) => {
  if (!dbConnected) return res.json(sampleNews);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/news", newsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", dbConnected });
});

app.get("/", (req, res) => {
  res.json({ message: "Albuera EMS Backend is running", dbConnected });
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("MONGO_URI not set — running in fallback mode");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
  })
    .then(() => { console.log("MongoDB Connected"); dbConnected = true; })
    .catch((err) => { console.error("MongoDB Connection Error:", err.message); dbConnected = false; });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});
