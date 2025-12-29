import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'conserve2025@gmail.com';

export const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `ConServe <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) throw new Error(error.message);
    console.log('✅ Email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }
    console.log('✅ Resend API configured');
    return { success: true };
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendApprovalEmail = async (user) => {
  if (!user?.email) throw new Error('User email required');
  
  return await sendEmail({
    to: user.email,
    subject: '✅ Your ConServe Account Has Been Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
        <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0">
          <h1 style="margin:0;font-size:28px">✅ Account Approved!</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px">
          <p style="font-size:16px;color:#374151">Hello <strong>${user.firstName}</strong>,</p>
          <p style="font-size:16px;color:#374151">Your ConServe account has been <strong>approved</strong> and is now active.</p>
          <div style="background:#eff6ff;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #3b82f6">
            <p style="margin:0;font-size:14px;color:#1e40af"><strong>📋 Account Details:</strong></p>
            <ul style="margin:10px 0;padding-left:20px;color:#374151">
              <li>Email: ${user.email}</li>
              <li>Role: ${user.role}</li>
              <li>Status: <span style="color:#10b981;font-weight:bold">Active</span></li>
            </ul>
          </div>
          <p style="text-align:center;margin:30px 0">
            <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;padding:15px 40px;background:#1e3a8a;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Login to ConServe</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0">
          <p style="font-size:12px;color:#9ca3af;text-align:center">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
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
      <body style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0">
          <h1>🎉 Welcome to ConServe!</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Thank you for registering!</p>
          <div style="background:#f9fafb;padding:15px;border-left:4px solid #1e3a8a;margin:20px 0">
            <strong>📋 Next Steps:</strong><br>Your account is <strong>pending approval</strong>. You'll receive an email once approved.
          </div>
          <p><strong>Account Details:</strong></p>
          <ul>
            <li>Name: ${user.firstName} ${user.lastName}</li>
            <li>Email: ${user.email}</li>
            <li>Role: ${user.role}</li>
            <li>ID: ${user.studentId}</li>
          </ul>
        </div>
        <div style="text-align:center;padding:20px;color:#6b7280;font-size:12px">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendAdminNewUserNotification = async (user) => {
  return await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: '🔔 New User Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#7c3aed,#a78bfa);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0">
          <h1>🔔 New User Registration</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb">
          <p>A new user has registered:</p>
          <div style="background:#f9fafb;padding:15px;border-left:4px solid #7c3aed;margin:20px 0">
            <strong>Name:</strong> ${user.firstName} ${user.lastName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Role:</strong> ${user.role}<br>
            <strong>ID:</strong> ${user.studentId}
          </div>
          <p style="text-align:center">
            <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;padding:12px 30px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">Review User</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
};