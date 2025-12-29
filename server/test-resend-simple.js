import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🧪 Testing Resend API...');
console.log('📧 Using FROM:', process.env.EMAIL_FROM);

resend.emails.send({
  from: `ConServe <${process.env.EMAIL_FROM}>`,
  to: 'conserverv2025@gmail.com',
  subject: '✅ Resend Test - ConServe',
  html: '<h1>✅ Success!</h1><p>Email service is working!</p>'
})
.then((result) => {
  console.log('✅ SUCCESS! Email sent!');
  console.log('📬 Full result:', result);
  if (result?.data?.id) {
    console.log('📬 Message ID:', result.data.id);
  } else if (result?.id) {
    console.log('📬 Message ID:', result.id);
  }
  process.exit(0);
})
.catch((error) => {
  console.error('❌ FAILED:', error);
  process.exit(1);
});