const twilio = require('twilio');

let twilioClient = null;
let twilioPhoneNumber = null;

// Initialize Twilio client if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC") && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_PHONE_NUMBER) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  console.log("✓ Twilio SMS service initialized");
} else {
  console.log("ℹ Twilio not configured - SMS will be logged to console (demo mode)");
}

// Phone number formatter - ensures proper E.164 format
function formatPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 0, remove it and add +63
  if (cleaned.startsWith('0')) {
    cleaned = '+63' + cleaned.substring(1);
  }
  // If it doesn't start with +, add +63
  else if (!cleaned.startsWith('+')) {
    cleaned = '+63' + cleaned;
  }
  
  return cleaned;
}

/**
 * Send SMS message to a phone number
 * @param {string} toPhone - Recipient phone number
 * @param {string} message - SMS message content
 * @param {object} options - Optional settings
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendSMS(toPhone, message, options = {}) {
  const formattedPhone = formatPhoneNumber(toPhone);
  
  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  // If Twilio is not configured, log SMS to console (simulated SMS)
  if (!twilioClient || !twilioPhoneNumber) {
    console.log("=".repeat(50));
    console.log("📱 SMS NOTIFICATION (Simulated)");
    console.log("=".repeat(50));
    console.log(`To: ${formattedPhone}`);
    console.log(`Message: ${message}`);
    console.log("=".repeat(50));
    return { success: true, simulated: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
      ...options
    });
    
    console.log(`SMS sent to ${formattedPhone} (SID: ${result.sid})`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error(`SMS send error to ${formattedPhone}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS to multiple recipients
 * @param {Array<string>} phoneNumbers - Array of phone numbers
 * @param {string} message - SMS message content
 * @returns {Promise<{success: boolean, sent: number, failed: number, results: Array}>}
 */
async function sendBulkSMS(phoneNumbers, message) {
  const results = [];
  let sent = 0;
  let failed = 0;

  for (const phone of phoneNumbers) {
    const result = await sendSMS(phone, message);
    results.push({ phone, ...result });
    
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { success: failed === 0, sent, failed, results };
}

/**
 * Send emergency alert SMS
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} location - Emergency location
 * @param {Array<string>} phoneNumbers - Target phone numbers
 * @returns {Promise<{success: boolean, sent: number, failed: number}>}
 */
async function sendEmergencyAlert(title, message, location, phoneNumbers) {
  const alertText = `🚨 ALERT: ${title}\n\n${message}\n\nLocation: ${location || 'N/A'}\n\n- Albuera Emergency Management`;
  return await sendBulkSMS(phoneNumbers, alertText);
}

/**
 * Generate SMS content for report assignment
 * @param {object} report - Report object
 * @returns {string} SMS message text
 */
function generateAssignmentSMS(report) {
  return `🚨 EMERGENCY TASK ASSIGNED\n\nType: ${report.emergencyType}\n📍 Location: ${report.location}\n\n${report.description ? report.description.substring(0, 100) + '...' : ''}\n\nPlease check the dashboard for full details.`;
}

/**
 * Generate SMS content for task completion
 * @param {object} report - Report object
 * @param {string} respondentName - Name of completing respondent
 * @returns {string} SMS message text
 */
function generateCompletionSMS(report, respondentName) {
  return `✅ TASK COMPLETED\n\nRespondent: ${respondentName}\nEmergency: ${report.emergencyType}\n📍 Location: ${report.location}\n\nThe emergency response has been completed.`;
}

/**
 * Check if Twilio is configured
 * @returns {boolean}
 */
function isTwilioConfigured() {
  return !!twilioClient && !!twilioPhoneNumber;
}

module.exports = {
  twilioClient,
  twilioPhoneNumber,
  formatPhoneNumber,
  sendSMS,
  sendBulkSMS,
  sendEmergencyAlert,
  generateAssignmentSMS,
  generateCompletionSMS,
  isTwilioConfigured
};