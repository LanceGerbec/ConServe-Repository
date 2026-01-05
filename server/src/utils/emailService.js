// server/src/utils/emailService.js - WORKING VERSION
import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

// Initialize API key
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
  console.log('✅ Brevo API key configured');
} else {
  console.error('❌ BREVO_API_KEY not found in environment variables');
}

const SENDER_EMAIL = process.env.EMAIL_FROM || 'conserve2025@gmail.com';
const SENDER_NAME = 'ConServe NEUST';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'conserve2025@gmail.com';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    console.log('📧 Sending email...');
    console.log('   From:', SENDER_EMAIL);
    console.log('   To:', to);
    console.log('   Subject:', subject);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Extract messageId from various possible response formats
    let messageId = 'sent';
    
    if (result) {
      messageId = result.messageId || 
                  result.response?.body?.messageId || 
                  result.body?.messageId ||
                  result.data?.messageId ||
                  JSON.stringify(result).substring(0, 50);
    }

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', messageId);
    console.log('📧 Recipient:', to);
    
    return { success: true, messageId, recipient: to };
  } catch (error) {
    console.error('❌ Email send failed:');
    console.error('   Recipient:', to);
    console.error('   Error:', error.message);
    console.error('   Error body:', error.response?.body || error.response?.text);
    
    return { 
      success: false, 
      error: error.message,
      recipient: to,
      details: error.response?.body || error.response?.text
    };
  }
};

export const testEmailConnection = async () => {
  try {
    console.log('🧪 Testing Brevo connection...');
    
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY not configured');
      return { success: false, error: 'BREVO_API_KEY not configured' };
    }

    console.log('🔑 API Key found:', process.env.BREVO_API_KEY.substring(0, 20) + '...');
    console.log('📧 Sender email:', SENDER_EMAIL);
    
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(
      brevo.AccountApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY
    );
    
    const account = await accountApi.getAccount();
    
    console.log('✅ Brevo connected successfully!');
    console.log('📧 Account email:', account.email || 'N/A');
    console.log('📊 Plan:', account.plan?.[0]?.type || 'Free');
    
    return { 
      success: true, 
      provider: 'Brevo',
      accountEmail: account.email,
      plan: account.plan?.[0]?.type || 'Free',
      from: SENDER_EMAIL
    };
  } catch (error) {
    console.error('❌ Brevo connection failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body || error.response?.text
    };
  }
};

export const sendApprovalEmail = async (user) => {
  if (!user?.email) {
    console.error('❌ User email is required for approval email');
    return { success: false, error: 'User email required' };
  }
  
  console.log('📧 Preparing approval email for:', user.email);
  
  const result = await sendEmail({
    to: user.email,
    subject: '✅ ConServe Account Approved - Login Now!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">✅ Account Approved!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">Great news! Your ConServe account has been <strong>approved</strong> by the administrator.</p>
            
            <div style="background:#eff6ff;padding:25px;border-left:4px solid #3b82f6;margin:30px 0;border-radius:8px">
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>🎓 Student/Faculty ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>👤 Role:</strong> ${user.role}</p>
            </div>

            <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #bbf7d0">
              <p style="margin:0;color:#166534;font-size:15px;font-weight:bold">✅ You can now:</p>
              <ul style="color:#166534;margin:10px 0;padding-left:20px;font-size:14px">
                <li>Browse research papers</li>
                <li>Submit your own research</li>
                <li>Bookmark papers</li>
                <li>Download research</li>
              </ul>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/login" style="display:inline-block;padding:16px 48px;background:#1e3a8a;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(30,58,138,0.3)">Login to ConServe</a>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
              Questions? Contact us at <a href="mailto:${ADMIN_EMAIL}" style="color:#2563eb;text-decoration:none">${ADMIN_EMAIL}</a>
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
  
  if (result.success) {
    console.log('✅ Approval email sent successfully to:', user.email);
  } else {
    console.error('❌ Approval email failed for:', user.email, '- Error:', result.error);
  }
  
  return result;
};

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) {
    console.error('❌ User email is required for welcome email');
    return { success: false, error: 'User email required' };
  }
  
  console.log('📧 Preparing welcome email for:', user.email);
  
  const result = await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to ConServe - Registration Successful',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">🎉 Welcome to ConServe!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">Thank you for registering with <strong>ConServe Research Repository</strong>!</p>
            
            <div style="background:#fef3c7;padding:25px;border-left:4px solid #f59e0b;margin:30px 0;border-radius:8px">
              <p style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:bold">⏳ Pending Administrator Approval</p>
              <p style="margin:0;color:#92400e;font-size:15px">Your account is awaiting approval. You'll receive another email once approved (usually within 24-48 hours).</p>
            </div>

            <div style="background:#f9fafb;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #e5e7eb">
              <p style="margin:0 0 15px 0;color:#111827;font-size:16px;font-weight:bold">📋 Your Registration Details:</p>
              <p style="margin:8px 0;color:#374151"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:8px 0;color:#374151"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#374151"><strong>ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#374151"><strong>Role:</strong> ${user.role}</p>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px">
              Questions? Contact us at <a href="mailto:${ADMIN_EMAIL}" style="color:#2563eb;text-decoration:none">${ADMIN_EMAIL}</a>
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
  
  if (result.success) {
    console.log('✅ Welcome email sent successfully to:', user.email);
  } else {
    console.error('❌ Welcome email failed for:', user.email, '- Error:', result.error);
  }
  
  return result;
};

// ============================================
// 🆕 PASSWORD RESET EMAIL
// ============================================
export const sendPasswordResetEmail = async (user, token) => {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  return await sendEmail({
    to: user.email,
    subject: '🔐 Password Reset Request - ConServe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#dc2626,#ef4444);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">🔐 Password Reset</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">We received a request to reset your password for your ConServe account.</p>
            
            <div style="background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:30px 0;border-radius:8px">
              <p style="margin:0;color:#92400e;font-size:14px;font-weight:bold">⏰ This link expires in 1 hour</p>
              <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">If you didn't request this, please ignore this email.</p>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:16px 48px;background:#dc2626;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(220,38,38,0.3)">Reset Password</a>
            </div>

            <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:25px 0">
              <p style="margin:0 0 10px 0;color:#374151;font-size:14px;font-weight:bold">Or copy this link:</p>
              <p style="margin:0;color:#6b7280;font-size:12px;word-break:break-all">${resetUrl}</p>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px">
              Questions? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
            </p>
          </div>
          <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">Research Repository System</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};
// ============================================
// 🆕 PASSWORD RESET CONFIRMATION EMAIL
// ============================================
export const sendPasswordResetConfirmation = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: '✅ Password Successfully Reset - ConServe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">✅ Password Reset Complete</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151;line-height:1.8">Your ConServe password has been successfully reset.</p>
            
            <div style="background:#d1fae5;padding:20px;border-left:4px solid #10b981;margin:30px 0;border-radius:8px">
              <p style="margin:0;color:#065f46;font-size:14px;font-weight:bold">✓ Your account is secure</p>
              <p style="margin:10px 0 0 0;color:#065f46;font-size:14px">You can now log in with your new password.</p>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/login" style="display:inline-block;padding:16px 48px;background:#10b981;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(16,185,129,0.3)">Login to ConServe</a>
            </div>

            <div style="background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:30px 0;border-radius:8px">
              <p style="margin:0;color:#92400e;font-size:14px;font-weight:bold">⚠️ Didn't reset your password?</p>
              <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">Contact support immediately at ${ADMIN_EMAIL}</p>
            </div>

            <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
              <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              <strong>IP Address:</strong> (logged for security)
            </p>
          </div>
          <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

export const sendAdminNewUserNotification = async (user) => {
  console.log('📧 Preparing admin notification for new user:', user.email);
  
  const result = await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🔔 New User Registration: ${user.firstName} ${user.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
          <div style="background:#7c3aed;color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:32px;font-weight:bold">🔔 New User Registration</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:18px;color:#111827;margin-bottom:20px">A new user has registered and is awaiting approval:</p>
            
            <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>👤 Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>📧 Email:</strong> ${user.email}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>🆔 Student/Faculty ID:</strong> ${user.studentId}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>🎓 Role:</strong> ${user.role}</p>
              <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>📅 Registration Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:25px 0;border-radius:8px">
              <p style="margin:0;color:#92400e;font-size:15px;font-weight:bold">⚠️ Action Required</p>
              <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">Please review and approve this user to grant system access.</p>
            </div>

            <div style="text-align:center;margin:35px 0">
              <a href="${CLIENT_URL}/dashboard" style="display:inline-block;padding:16px 48px;background:#7c3aed;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:18px;box-shadow:0 4px 6px rgba(124,58,237,0.3)">Review & Approve User</a>
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
  
  if (result.success) {
    console.log('✅ Admin notification sent successfully');
  } else {
    console.error('❌ Admin notification failed - Error:', result.error);
  }
  
  return result;
};