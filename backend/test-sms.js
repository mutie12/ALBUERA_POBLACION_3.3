// Test script for SMS service - verifies Twilio integration
const { sendSMS, sendBulkSMS, sendEmergencyAlert, generateAssignmentSMS, generateCompletionSMS, isTwilioConfigured } = require('./services/smsservice');

console.log('\n========================================');
console.log('  Albuera EMS - SMS Service Test');
console.log('========================================\n');

// Test 1: Configuration check
console.log('1. Configuration Check:');
console.log('   Twilio Configured:', isTwilioConfigured());
console.log('');

// Test 2: Single SMS
console.log('2. Single SMS Test (Simulated):');
sendSMS('+639123456789', 'Test SMS from Albuera EMS - Emergency alert system is operational')
  .then(result => {
    console.log('   Result:', result.success ? '✓ Success' : '✗ Failed');
    if (result.simulated) {
      console.log('   Mode: Simulated (no Twilio credentials)');
    }
    if (result.messageId) {
      console.log('   Message SID:', result.messageId);
    }
    console.log('');
    
    // Test 3: Bulk SMS
    console.log('3. Bulk SMS Test:');
    return sendBulkSMS(
      ['+639123456789', '+639876543210', '+639111111111'],
      'Bulk test: Emergency response system check'
    );
  })
  .then(result => {
    console.log('   Total sent:', result.sent);
    console.log('   Failed:', result.failed);
    console.log('   Success:', result.success);
    console.log('');
    
    // Test 4: Emergency Alert
    console.log('4. Emergency Alert Test:');
    return sendEmergencyAlert(
      'Fire Emergency',
      'A fire has been reported at the municipal hall. Immediate response required.',
      'Albuera Municipal Hall',
      ['+639123456789', '+639876543210']
    );
  })
  .then(result => {
    console.log('   Alerts sent:', result.sent);
    console.log('   Failed:', result.failed);
    console.log('');
    
    // Test 5: SMS Generation Functions
    console.log('5. SMS Template Generation:');
    const mockReport = {
      emergencyType: 'Fire',
      location: 'Poblacion, Albuera',
      description: 'A residential building is on fire with people trapped inside'
    };
    
    console.log('   Assignment SMS:');
    console.log('   ' + generateAssignmentSMS(mockReport).replace(/\n/g, '\n   '));
    console.log('');
    
    console.log('   Completion SMS:');
    console.log('   ' + generateCompletionSMS(mockReport, 'John Responder').replace(/\n/g, '\n   '));
    console.log('');
    
    console.log('========================================');
    console.log('  All Tests Complete');
    console.log('========================================\n');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
