// server/test-brevo-http.js - DIRECT HTTP VERSION
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

console.log('🧪 Testing Brevo with HTTP API...\n');
console.log('🔑 API Key:', process.env.BREVO_API_KEY ? 'Found ✅' : 'Missing ❌');

if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY not found in .env');
  process.exit(1);
}

const emailData = JSON.stringify({
  sender: { email: 'conserve2025@gmail.com', name: 'ConServe Test' },
  to: [{ email: 'conserve2025@gmail.com' }],
  subject: '✅ Brevo HTTP Test - ConServe',
  htmlContent: `
    <div style="font-family:Arial;padding:20px">
      <h1 style="color:#10b981">✅ Success!</h1>
      <p>Brevo email service is working via HTTP API!</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `
});

const options = {
  hostname: 'api.brevo.com',
  port: 443,
  path: '/v3/smtp/email',
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'api-key': process.env.BREVO_API_KEY,
    'content-type': 'application/json',
    'Content-Length': Buffer.byteLength(emailData)
  }
};

console.log('📧 Sending test email...\n');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('📬 Response Status:', res.statusCode);
    console.log('📨 Response Body:', responseData);

    if (res.statusCode === 201) {
      const result = JSON.parse(responseData);
      console.log('\n✅ SUCCESS! Email sent!');
      console.log('📬 Message ID:', result.messageId);
      process.exit(0);
    } else {
      console.error('\n❌ FAILED!');
      console.error('Status:', res.statusCode);
      console.error('Error:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(emailData);
req.end();