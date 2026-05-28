# Twilio SMS Integration - Albuera Emergency Management System

## Overview
The Albuera EMS now includes complete SMS integration via Twilio for emergency alerts, notifications, and resident communication.

## Configuration

### Environment Variables (.env)
```
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
```

## Features

### 1. SMS Service Module (`backend/services/smsservice.js`)
- **sendSMS(toPhone, message)**: Send single SMS
- **sendBulkSMS(phoneNumbers, message)**: Send to multiple recipients
- **sendEmergencyAlert(title, message, location, phones)**: Emergency alert formatting
- **generateAssignmentSMS(report)**: Task assignment template
- **generateCompletionSMS(report, respondentName)**: Task completion template
- **formatPhoneNumber(phone)**: E.164 format conversion (+63 prefix)

### 2. Emergency Alerts
POST `/api/notifications/emergency-alert`

Sends emergency alerts via:
- In-app notifications (all users)
- SMS (to users with phone numbers)
- Email (if configured)

**Request Body:**
```json
{
  "adminId": "...",
  "adminName": "Admin Name",
  "alertType": "Fire",
  "title": "Fire Emergency",
  "message": "Emergency details...",
  "location": "Municipal Hall",
  "priority": "high"
}
```

**Response:**
```json
{
  "message": "Emergency alert sent successfully",
  "count": 50,
  "usersNotified": 50,
  "smsSent": 45,
  "emailSent": 30,
  "details": {
    "inAppNotifications": 50,
    "smsNotifications": 45,
    "emailNotifications": 30,
    "usersWithPhones": 45,
    "usersWithoutPhones": 5
  }
}
```

### 3. Resident Messages with SMS Forwarding
POST `/api/notifications/resident-message`

Residents can send messages to admins with optional SMS forwarding.

**Request Body:**
```json
{
  "residentId": "...",
  "residentName": "John Resident",
  "subject": "Emergency Report",
  "message": "There's a fire in my area",
  "messageType": "emergency",
  "location": "Poblacion",
  "forwardToPhone": true
}
```

### 4. New Emergency Reports - SMS to Respondents
POST `/api/reports`

When a new emergency report is created (non-informational), SMS is automatically sent to all respondents.

**Request Body:**
```json
{
  "location": "Municipal Hall",
  "emergencyType": "Fire",
  "description": "Building on fire",
  "sendSMS": true
}
```

### 5. Task Assignment - SMS to Respondents
PATCH `/api/reports/:id/assign`

When a report is assigned to a respondent, SMS notification is sent.

**Request Body:**
```json
{
  "respondentId": "...",
  "respondentName": "John Responder",
  "sendSMS": true
}
```

### 6. Task Completion - SMS to Admins
PATCH `/api/reports/:id/status`

When a respondent completes a task, admins receive SMS notification.

**Request Body:**
```json
{
  "action": "completed",
  "status": "Completed",
  "sendSMS": true
}
```

### 7. SMS OTP Verification
POST `/api/auth/send-phone-otp`

Sends verification code via SMS during resident registration.

**Request Body:**
```json
{
  "phone": "09123456789"
}
```

### 8. Resident Approval/Rejection - SMS Notifications
- **POST** `/api/auth/approve-resident/:id` - Sends approval SMS
- **POST** `/api/auth/reject-resident/:id` - Sends rejection SMS

## Phone Number Formatting

All phone numbers are automatically converted to E.164 format:
- `09123456789` → `+639123456789`
- `+639123456789` → `+639123456789`
- `9123456789` → `+639123456789`

## Demo Mode

When Twilio credentials are not configured or invalid:
- SMS is logged to console instead of being sent
- Shows formatted output simulating actual SMS
- No external API calls made

## SMS Templates

### Emergency Alert
```
🚨 ALERT: {title}

{message}

Location: {location}

- Albuera Emergency Management
```

### Task Assignment
```
🚨 EMERGENCY TASK ASSIGNED

Type: {emergencyType}
📍 Location: {location}

{description}

Please check the dashboard for full details.
```

### Task Completion
```
✅ TASK COMPLETED

Respondent: {respondentName}
Emergency: {emergencyType}
📍 Location: {location}

The emergency response has been completed.
```

### Resident Message to Admin
```
📨 NEW RESIDENT {EMERGENCY|MESSAGE}

From: {residentName}
📍 Location: {location}

{message}

- Albuera EMS
```

### Account Approval
```
Hi {name}! Your Albuera Emergency account has been approved by the admin. 
You can now login to the system.
```

### Account Rejection
```
Hi {name}, your Albuera Emergency account registration has been rejected. 
Reason: {reason}
```

## Testing

Run the SMS service test:
```bash
node backend/test-sms.js
```

## Error Handling

- Failed SMS sends are logged to console
- Errors don't block in-app notifications
- System continues operating even if SMS fails
- All SMS failures tracked and reported in responses

## Rate Limiting & Best Practices

- Bulk SMS sends are sequential (not concurrent) to avoid rate limits
- Phone number validation before sending
- E.164 format ensures international delivery
- Message length automatically handled by Twilio
- Opt-out handling should be configured in Twilio console for production

## Production Checklist

- [x] Twilio account created
- [x] Twilio phone number purchased
- [x] Account SID and Auth Token configured in .env
- [x] SMS service tests passing
- [ ] Phone number verified in Twilio console
- [ ] Messaging service configured (optional)
- [ ] Rate limits configured for Twilio account
- [ ] Opt-out keywords configured (STOP, UNSUBSCRIBE)
- [ ] Delivery status webhooks configured (optional)
- [ ] SMS logging/audit trail enabled
- [ ] Test with actual phone numbers
- [ ] Monitor Twilio usage dashboard
- [ ] Set up billing alerts

## Cost Considerations

- US SMS: ~$0.0079 per message
- International SMS: varies by country
- Inbound SMS: ~$0.0085 per message
- Phone number rental: ~$1/month

Estimate for 1000 emergency alerts: ~$7.90

## Security Notes

- Twilio credentials stored ONLY in .env (never in code)
- .env file should NOT be committed to version control
- Use environment-specific .env files
- Rotate Twilio Auth Token periodically
- Monitor Twilio console for unusual activity
- Implement IP whitelisting if available

## Support

For issues or questions:
- Check Twilio Console → Monitor → Logs
- Review error messages in application logs
- Verify phone numbers are in E.164 format
- Ensure sufficient balance in Twilio account
