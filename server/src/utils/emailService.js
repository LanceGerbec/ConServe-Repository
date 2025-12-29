// server/src/utils/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'conserve2025@gmail.com';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `ConServe <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Email error:', error);
      throw new Error(error.message || 'Email send failed');
    }
    
    console.log('✅ Email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }
    if (!FROM_EMAIL) {
      return { success: false, error: 'EMAIL_FROM not configured' };
    }
    console.log('✅ Resend configured');
    return { success: true };
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
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#10b981,#34d399);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:28px">✅ Account Approved!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:16px;color:#374151">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151">Great news! Your ConServe account has been approved by the administrator.</p>
            <div style="background:#eff6ff;padding:20px;border-left:4px solid #3b82f6;margin:25px 0;border-radius:4px">
              <p style="margin:5px 0"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:5px 0"><strong>Role:</strong> ${user.role}</p>
            </div>
            <p style="font-size:16px;color:#374151">You can now login and start using the research repository system.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${CLIENT_URL}/login" style="display:inline-block;padding:15px 40px;background:#1e3a8a;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">Login to ConServe</a>
            </div>
            <p style="font-size:14px;color:#6b7280;margin-top:30px">If you have any questions, please contact the administrator.</p>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
            <p style="font-size:12px;color:#9ca3af;margin:5px 0">Research Repository System</p>
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
    subject: '🎉 Welcome to ConServe - Account Created',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;margin:0;padding:0;background:#f3f4f6">
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:28px">🎉 Welcome to ConServe!</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:16px;color:#374151">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p style="font-size:16px;color:#374151">Thank you for registering with ConServe Research Repository!</p>
            <div style="background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:25px 0;border-radius:4px">
              <p style="margin:0;color:#92400e"><strong>⏳ Pending Approval</strong></p>
              <p style="margin:10px 0 0 0;color:#92400e">Your account is currently awaiting administrator approval. You'll receive another email once approved.</p>
            </div>
            <div style="background:#f9fafb;padding:20px;margin:25px 0;border-radius:8px">
              <p style="margin:5px 0;color:#374151"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:5px 0;color:#374151"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:5px 0;color:#374151"><strong>Student/Faculty ID:</strong> ${user.studentId}</p>
              <p style="margin:5px 0;color:#374151"><strong>Role:</strong> ${user.role}</p>
            </div>
            <p style="font-size:14px;color:#6b7280">This usually takes 24-48 hours. If you have questions, contact the administrator at ${ADMIN_EMAIL}</p>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
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
        <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
          <div style="background:#7c3aed;color:white;padding:40px;text-align:center">
            <h1 style="margin:0;font-size:28px">🔔 New User Registration</h1>
          </div>
          <div style="padding:40px">
            <p style="font-size:16px;color:#374151">A new user has registered and is awaiting approval:</p>
            <div style="background:#eff6ff;padding:20px;margin:25px 0;border-radius:8px;border:1px solid #bfdbfe">
              <p style="margin:8px 0;color:#1e40af"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>Email:</strong> ${user.email}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>Student/Faculty ID:</strong> ${user.studentId}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>Role:</strong> ${user.role}</p>
              <p style="margin:8px 0;color:#1e40af"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align:center;margin:30px 0">
              <a href="${CLIENT_URL}/dashboard" style="display:inline-block;padding:15px 40px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">Review & Approve</a>
            </div>
            <p style="font-size:14px;color:#6b7280;margin-top:30px">Please review and approve this user to grant system access.</p>
          </div>
          <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="font-size:12px;color:#9ca3af;margin:5px 0">© ${new Date().getFullYear()} ConServe Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};