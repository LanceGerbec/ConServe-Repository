import { Resend } from 'resend';

const resend = new Resend('re_UHXHd5G6_8nKFR4Xwnqsp6Gs4588kChbs');

console.log('🧪 Testing Resend with new API key...');

resend.emails.send({
  from: 'ConServe <onboarding@resend.dev>',
  to: 'conserverv2025@gmail.com',
  subject: '✅ Hello from ConServe!',
  html: '<h1>Success!</h1><p>Resend is working perfectly!</p>'
})
.then((result) => {
  console.log('✅ SUCCESS!');
  console.log('📨 Email sent!');
  console.log('📬 Result:', result);
  console.log('🎉 Check your inbox: conserverv2025@gmail.com');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ FAILED:', error);
  process.exit(1);
});