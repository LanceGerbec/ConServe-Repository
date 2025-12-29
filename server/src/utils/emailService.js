import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `ConServe <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }
    
    console.log('✅ Email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not set in .env');
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM not set in .env');
    }
    console.log('✅ Resend configured with key:', process.env.RESEND_API_KEY.substring(0, 8) + '...');
    return { success: true };
  } catch (error) {
    console.error('❌ Config error:', error.message);
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
      <body style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0">
          <h1>✅ Account Approved!</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Your ConServe account has been approved!</p>
          <div style="background:#eff6ff;padding:15px;border-left:4px solid #3b82f6;margin:20px 0">
            <strong>Email:</strong> ${user.email}<br>
            <strong>Role:</strong> ${user.role}
          </div>
          <p style="text-align:center">
            <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;padding:15px 40px;background:#1e3a8a;color:white;text-decoration:none;border-radius:8px">Login Now</a>
          </p>
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
          <h1>🎉 Welcome!</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e5e7eb">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Thank you for registering! Your account is pending approval.</p>
          <div style="background:#f9fafb;padding:15px;margin:20px 0">
            <strong>Name:</strong> ${user.firstName} ${user.lastName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Role:</strong> ${user.role}
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendAdminNewUserNotification = async (user) => {
  return await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@neust.edu.ph',
    subject: '🔔 New User Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#7c3aed;color:white;padding:30px;text-align:center">
          <h1>🔔 New Registration</h1>
        </div>
        <div style="padding:30px;background:white;border:1px solid #e5e7eb">
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p style="text-align:center;margin-top:20px">
            <a href="${process.env.CLIENT_URL}/dashboard" style="padding:12px 30px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">Review</a>
          </p>
        </div>
      </body>
      </html>
    `,
  });
};