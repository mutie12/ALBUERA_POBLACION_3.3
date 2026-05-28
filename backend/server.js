// Load environment variables (MUST be first)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authroutes");
const reportRoutes = require("./routes/reportroutes");
const notificationRoutes = require("./routes/notificationroutes");
const newsRoutes = require("./routes/newsroutes");

const app = express();
let dbConnected = false;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_URL,
        /\.onrender\.com$/,
      ]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Allow 50 MB JSON bodies (base64 images are ~1.3× original size)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Fallback routes for sample data when DB is unavailable
const sampleReports = [
  { _id: "1", reporterName: "Maria Santos", location: "123 Rizal St, Brgy. Poblacion", emergencyType: "Medical Emergency", description: "Elderly person experiencing chest pain and difficulty breathing. Needs immediate medical attention.", status: "Pending", date: new Date().toISOString() },
  { _id: "2", reporterName: "Juan Dela Cruz", location: "456 Mabini Ave, Brgy. San Isidro", emergencyType: "Fire", description: "Grass fire spreading near residential area. Firefighters needed immediately.", status: "Responding", date: new Date().toISOString() },
  { _id: "3", reporterName: "Ana Reyes", location: "789 Bonifacio St, Brgy. San Juan", emergencyType: "Vehicular Accident", description: "Minor collision involving two motorcycles. One rider injured, needs assistance.", status: "Resolved", date: new Date().toISOString() }
];

const sampleNews = [
  { _id: "1", title: "Community Emergency Preparedness Week", content: "Join us for emergency preparedness training this week. Learn life-saving techniques and emergency response procedures.", category: "announcement", priority: "high", author: { name: "Admin" }, createdAt: new Date().toISOString() }
];

// Fallback public reports route (must be before regular routes)
app.get("/api/reports/public", async (req, res, next) => {
  if (!dbConnected) {
    return res.json(sampleReports);
  }
  next();
});

// Fallback news route (must be before regular routes)
app.get("/api/news", async (req, res, next) => {
  if (!dbConnected) {
    return res.json(sampleNews);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/news", newsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Albuera EMS Backend is running");
});

// Start server FIRST
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// THEN connect to MongoDB (non-blocking)
const MONGO_URI = process.env.MONGO_URI
  || "mongodb://AlbueraESDB:MonkeyD.Luffy12@ac-yzx5rpj-shard-00-00.4kmpz5z.mongodb.net:27017,ac-yzx5rpj-shard-00-01.4kmpz5z.mongodb.net:27017,ac-yzx5rpj-shard-00-02.4kmpz5z.mongodb.net:27017/ALBUERA_POBLACION_3?ssl=true&replicaSet=atlas-m0c5ou-shard-0&authSource=admin&appName=AlbueraESDB";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
})
.then(() => {
  console.log("MongoDB Connected");
  dbConnected = true;
})
.catch(err => {
  console.error("MongoDB Connection Error:", err.message);
  console.warn("Running in fallback mode - database unavailable");
  dbConnected = false;
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});
