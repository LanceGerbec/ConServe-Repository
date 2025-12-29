// server/src/utils/emailService.js
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
    console.log('✅ Email sent to', to, ':', result.response?.body?.messageId);
    return { success: true, messageId: result.response?.body?.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw new Error(error.message || 'Email send failed');
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: 'BREVO_API_KEY not configured' };
    }
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    await accountApi.getAccount();
    console.log('✅ Brevo email service connected');
    return { success: true, provider: 'Brevo', from: SENDER_EMAIL };
  } catch (error) {
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
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px">✅ Account Approved!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151">Your ConServe account has been <strong>approved</strong>!</p>
            <div style="background:#eff6ff;padding:25px;border-left:4px solid #3b82f6;margin:30px 0;border-radius:8px">
              <p style="margin:8px 0;color:#1e40af"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>🎓 ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>👤 Role:</strong> ${user.role}</p>
            </div>
            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/login" style="display:inline-block;padding:16px 48px;background:#1e3a8a;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px">Login to ConServe</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
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
    subject: '🎉 Welcome to ConServe',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px">🎉 Welcome!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151">Thank you for registering with ConServe!</p>
            <div style="background:#fef3c7;padding:25px;border-left:4px solid #f59e0b;margin:30px 0;border-radius:8px">
              <p style="margin:0;color:#92400e;font-weight:bold">⏳ Pending Approval</p>
              <p style="margin:10px 0 0 0;color:#92400e">Your account is awaiting administrator approval.</p>
            </div>
            <div style="background:#f9fafb;padding:20px;margin:20px 0;border-radius:8px">
              <p style="margin:8px 0"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:8px 0"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:8px 0"><strong>ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0"><strong>Role:</strong> ${user.role}</p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af">© ${new Date().getFullYear()} ConServe</p>
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
    subject: '🔔 New User Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:#7c3aed;color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px">🔔 New Registration</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px">A new user has registered:</p>
            <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px">
              <p style="margin:10px 0;color:#1e40af"><strong>👤 Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:10px 0;color:#1e40af"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:10px 0;color:#1e40af"><strong>🆔 ID:</strong> ${user.studentId}</p>
              <p style="margin:10px 0;color:#1e40af"><strong>🎓 Role:</strong> ${user.role}</p>
            </div>
            <div style="text-align:center;margin:30px 0">
              <a href="${CLIENT_URL}/dashboard" style="display:inline-block;padding:16px 48px;background:#7c3aed;color:white;text-decoration:none;border-radius:10px;font-weight:bold">Review & Approve</a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af">© ${new Date().getFullYear()} ConServe Admin</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};