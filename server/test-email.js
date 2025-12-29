import dotenv from 'dotenv';
import { sendApprovalEmail } from './src/utils/emailService.js';

dotenv.config();

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'YOUR_TEST_EMAIL@gmail.com', // CHANGE THIS
  role: 'student'
};

console.log('🧪 Testing approval email...');
sendApprovalEmail(testUser)
  .then(result => {
    console.log('✅ SUCCESS:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED:', error.message);
    process.exit(1);
  });