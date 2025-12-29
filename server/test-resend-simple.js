// server/test-resend-simple.js
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

console.log('🧪 Testing Resend API Configuration...\n');
console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('🔑 API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 8) + '...');
console.log('📬 Sending to:', 'conserve2025@gmail.com\n');

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in .env');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: `ConServe Test <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
  to: 'conserve2025@gmail.com',
  subject: '✅ Resend API Test - ConServe',
  html: `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
      <h1 style="color:#10b981">✅ Success!</h1>
      <p>Your Resend email service is working correctly!</p>
      <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0">
        <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> Email service operational ✓</p>
      </div>
    </div>
  `
})
.then((result) => {
  console.log('✅ SUCCESS! Email sent!');
  console.log('📬 Result:', JSON.stringify(result, null, 2));
  process.exit(0);
})
.catch((error) => {
  console.error('❌ FAILED:', error);
  console.error('\n💡 Common fixes:');
  console.error('1. Check your API key is correct');
  console.error('2. Verify EMAIL_FROM is set to onboarding@resend.dev');
  console.error('3. Make sure you copied the FULL API key from Resend');
  process.exit(1);
});