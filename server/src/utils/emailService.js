// server/src/utils/emailService.js - BREVO VERSION (BEST FREE OPTION)
import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const SENDER_EMAIL = process.env.EMAIL_FROM || 'conserve2025@gmail.com';
const SENDER_NAME = 'ConServe NEUST';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'conserve2025@gmail.com';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email sent:', result.response?.body?.messageId);
    return { success: true, messageId: result.response?.body?.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw new Error(error.message || 'Email send failed');
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: 'BREVO_API_KEY not configured' };
    }
    
    // Test by getting account info
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(
      brevo.AccountApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
    
    await accountApi.getAccount();
    console.log('✅ Brevo email service connected');
    
    return { success: true, provider: 'Brevo', from: SENDER_EMAIL };
  } catch (error) {
    console.error('❌ Brevo connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendApprovalEmail = async (user) => {
  if (!user?.email) throw new Error('User email required');
  
  return await sendEmail({
    to: user.email,
    subject: '✅ ConServe Account Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">✅ Account Approved!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">Great news! Your ConServe account has been <strong>approved by the administrator</strong>.</p>
            
            <div style="background:#eff6ff;padding:25px;border-left:4px solid #3b82f6;margin:30px 0;border-radius:8px">
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>🎓 Student/Faculty ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>👤 Role:</strong> ${user.role}</p>
            </div>

            <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #bbf7d0">
              <p style="margin:0;color:#166534;font-size:15px">✅ <strong>You can now access:</strong></p>
              <ul style="color:#166534;margin:10px 0;padding-left:20px">
                <li>Browse research papers</li>
                <li>Submit your own research</li>
                <li>Bookmark and download papers</li>
                <li>Track your submissions</li>
              </ul>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/login" style="display:inline-block;padding:16px 48px;background:#1e3a8a;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(30,58,138,0.3)">Login to ConServe</a>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
              If you have any questions, contact us at <a href="mailto:${ADMIN_EMAIL}" style="color:#2563eb">${ADMIN_EMAIL}</a>
            </p>
          </div>
          <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">Research Repository System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) throw new Error('User email required');
  
  return await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to ConServe - Registration Successful',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">🎉 Welcome to ConServe!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">Thank you for registering with <strong>ConServe Research Repository</strong>!</p>
            
            <div style="background:#fef3c7;padding:25px;border-left:4px solid #f59e0b;margin:30px 0;border-radius:8px">
              <p style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:bold">⏳ Pending Administrator Approval</p>
              <p style="margin:0;color:#92400e;font-size:15px">Your account is awaiting approval from our administrator. You'll receive another email once approved.</p>
            </div>

            <div style="background:#f9fafb;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #e5e7eb">
              <p style="margin:0 0 15px 0;color:#111827;font-size:16px;font-weight:bold">📋 Your Registration Details:</p>
              <p style="margin:8px 0;color:#374151"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:8px 0;color:#374151"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#374151"><strong>ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#374151"><strong>Role:</strong> ${user.role}</p>
            </div>

            <div style="background:#e0e7ff;padding:20px;border-radius:8px;margin:25px 0">
              <p style="margin:0;color:#3730a3;font-size:14px"><strong>⏱️ What happens next?</strong></p>
              <p style="margin:10px 0 0 0;color:#3730a3;font-size:14px">Our administrator will review your registration within 24-48 hours.</p>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px">
              Questions? Contact us at <a href="mailto:${ADMIN_EMAIL}" style="color:#2563eb">${ADMIN_EMAIL}</a>
            </p>
          </div>
          <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendAdminNewUserNotification = async (user) => {
  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: '🔔 New User Registration - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:#7c3aed;color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">🔔 New User Registration</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">A new user has registered and is awaiting approval:</p>
            
            <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>👤 Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>🆔 ID:</strong> ${user.studentId}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>🎓 Role:</strong> ${user.role}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>📅 Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:25px 0;border-radius:8px">
              <p style="margin:0;color:#92400e;font-size:15px;font-weight:bold">⚠️ Action Required</p>
              <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">Please review and approve this user.</p>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/dashboard" style="display:inline-block;padding:16px 48px;background:#7c3aed;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(124,58,237,0.3)">Review & Approve</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};