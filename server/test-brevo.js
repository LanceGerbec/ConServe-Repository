// server/test-brevo.js
import dotenv from 'dotenv';
import brevo from '@getbrevo/brevo';

dotenv.config();

console.log('🧪 Testing Brevo Email Service...\n');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendSmtpEmail = new brevo.SendSmtpEmail();

sendSmtpEmail.sender = { 
  email: 'conserve2025@gmail.com', 
  name: 'ConServe Test' 
};
sendSmtpEmail.to = [{ email: 'conserve2025@gmail.com' }];
sendSmtpEmail.subject = '✅ Brevo Test - ConServe';
sendSmtpEmail.htmlContent = `
  <div style="font-family:Arial;padding:20px;max-width:600px;margin:0 auto">
    <h1 style="color:#10b981">✅ Success!</h1>
    <p>Your Brevo email service is working perfectly!</p>
    <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0">
      <p><strong>Provider:</strong> Brevo (Sendinblue)</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Status:</strong> Email service operational ✓</p>
      <p><strong>Daily Limit:</strong> 300 emails/day FREE</p>
    </div>
    <p style="color:#6b7280">You can now send emails to ANY email address!</p>
  </div>
`;

apiInstance.sendTransacEmail(sendSmtpEmail)
  .then((result) => {
    console.log('✅ SUCCESS! Email sent via Brevo!');
    console.log('📬 Message ID:', result.response?.body?.messageId);
    console.log('\n🎉 Brevo is ready for production!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED:', error);
    console.error('\n💡 Fix: Check your BREVO_API_KEY in .env');
    process.exit(1);
  });