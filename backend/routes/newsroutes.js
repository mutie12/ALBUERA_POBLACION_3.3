const express = require("express");
const News = require("../models/news");
const User = require("../models/user");
const Notification = require("../models/notification");
const auth = require("../middleware/auth");
const { sendEmergencyAlert, sendSMS } = require("../services/smsservice");

const router = express.Router();

// Get all news (public)
router.get("/", async (req, res) => {
  try {
    const news = await News.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(news || []);
  } catch (err) {
    console.error("Get news error:", err);
    res.status(500).json({ message: "Failed to fetch news", error: err.message });
  }
});

// Get single news
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id).lean();
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (err) {
    console.error("Get news error:", err);
    res.status(500).json({ message: "Server error fetching news", error: err.message });
  }
});

// Create news (admin or respondent)
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "respondent")) {
      return res.status(403).json({ message: "Only admins and respondents can create news" });
    }

    const { title, content, category, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const authorDepartment = req.user.department || (req.user.role === "respondent" ? "Respondent" : "Admin");

    const news = await News.create({
      title,
      content,
      category: category || "announcement",
      priority: priority || "normal",
      author: {
        id: req.user.id,
        name: req.user.name,
        department: authorDepartment
      }
    });

    res.json(news);
  } catch (err) {
    console.error("Create news error:", err);
    res.status(500).json({ message: "Server error creating news", error: err.message });
  }
});

// Emergency Alert endpoint - sends to all residents and respondents
router.post("/emergency-alert", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can send emergency alerts" });
    }

    const { title, message, urgency, barangay, subLocation, hazardType, details } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const location = barangay && subLocation
      ? `${barangay} - ${subLocation}`
      : barangay || "All Areas";

    // Create news entry for the alert
    const news = await News.create({
      title,
      content: message,
      category: "alert",
      priority: urgency === "critical" ? "high" : urgency === "high" ? "normal" : "low",
      author: {
        id: req.user.id,
        name: req.user.name,
        department: req.user.department || "Admin"
      },
      hazardType: hazardType || "Emergency",
      location,
      details: details || ""
    });

    // Get all users (residents and respondents) for notifications
    const allUsers = await User.find({ role: { $in: ["resident", "respondent"] } }).lean();

    // Get phone numbers for SMS
    const phoneNumbers = allUsers
      .filter(u => u.phone)
      .map(u => u.phone);

    // Generate SMS message based on hazard type
    const hazardIcons = {
      "Flood": "🌊",
      "Fire": "🔥",
      "Earthquake": "⚡",
      "Typhoon": "🌪️",
      "Landslide": "⛰️",
      "Medical Emergency": "🚑",
      "Vehicular Accident": "🚗",
      "Crime/Violence": "🛡️",
      "Power Outage": "⚡",
      "Water Supply Issue": "💧",
      "Natural Disaster": "🌍",
      "Infrastructure Damage": "🔧"
    };
    const icon = hazardIcons[hazardType] || "📢";

    const smsMessage = `${icon} EMERGENCY ALERT: ${title}\n\n${message}\n\nLocation: ${location}\n\n- Albuera Emergency Management`;

    // Send SMS to all users with phone numbers
    let smsResult = { sent: 0, failed: 0 };
    if (phoneNumbers.length > 0) {
      smsResult = await sendBulkSMSWithLimit(phoneNumbers, smsMessage);
    }

    // Create in-app notifications for all users
    await Promise.all(
      allUsers.map(u => 
        Notification.create({
          recipientId: u._id,
          recipientName: u.name,
          senderId: req.user.id,
          senderName: req.user.name,
          type: "emergency",
          title,
          message,
          status: "unread"
        })
      )
    );

    // Update news with SMS status
    await News.findByIdAndUpdate(news._id, { smsSent: smsResult.sent > 0 });

    res.json({ 
      message: `Emergency alert sent to ${allUsers.length} users${smsResult.sent > 0 ? ` (${smsResult.sent} SMS sent)` : ''}`,
      count: allUsers.length,
      smsSent: smsResult.sent
    });
  } catch (err) {
    console.error("Emergency alert error:", err);
    res.status(500).json({ message: "Server error sending emergency alert", error: err.message });
  }
});

// Helper function to send bulk SMS with delay to avoid rate limits
async function sendBulkSMSWithLimit(phoneNumbers, message) {
  const results = [];
  let sent = 0;
  let failed = 0;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (const phone of phoneNumbers) {
    const result = await sendSMS(phone, message);
    results.push({ phone, ...result });
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    await delay(100); // Small delay between SMS to avoid rate limits
  }

  return { success: failed === 0, sent, failed, results };
}

// Update news (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update news" });
    }

    const { title, content, category, priority, isActive } = req.body;

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, category, priority, isActive },
      { new: true }
    ).lean();

    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (err) {
    console.error("Update news error:", err);
    res.status(500).json({ message: "Server error updating news", error: err.message });
  }
});

// Delete news (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete news" });
    }

    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    console.error("Delete news error:", err);
    res.status(500).json({ message: "Server error deleting news", error: err.message });
  }
});

module.exports = router;
