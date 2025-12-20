// ============================================
// FILE: server/src/utils/emailService.js
// REPLACE ENTIRE FILE - SIMPLIFIED VERSION
// ============================================
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `ConServe <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>🎉 Welcome to ConServe!</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>Thank you for registering with ConServe Research Repository!</p>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
          <strong>📋 What happens next?</strong><br>
          Your account is currently <strong>pending approval</strong>. You will receive another email once approved.
        </div>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Role:</strong> ${user.role}</li>
          <li><strong>ID:</strong> ${user.studentId}</li>
        </ul>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to ConServe - Account Pending Approval',
    html,
  });
};

export const sendApprovalEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>✅ Account Approved!</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
        <p>Hello <strong>${user.firstName}</strong>,</p>
        <p>Your ConServe account has been <strong>approved</strong>!</p>
        <p style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 30px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Login to ConServe
          </a>
        </p>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: '✅ Your ConServe Account Has Been Approved',
    html,
  });
};

export const sendAdminNewUserNotification = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>🔔 New User Registration</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
        <p>Hello <strong>Admin</strong>,</p>
        <p>A new user has registered:</p>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #7c3aed; margin: 20px 0;">
          <strong>Name:</strong> ${user.firstName} ${user.lastName}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Role:</strong> ${user.role}<br>
          <strong>ID:</strong> ${user.studentId}
        </div>
        <p style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px;">
            Review User
          </a>
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'conserve2025@gmail.com',
    subject: '🔔 New User Registration - Approval Required',
    html,
  });
};

export const sendAdminNewResearchNotification = async (research) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1>📚 New Research Submission</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
        <p>Hello <strong>Admin</strong>,</p>
        <p>A new research paper has been submitted:</p>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #0891b2; margin: 20px 0;">
          <strong>Paper Title:</strong><br>
          ${research.title}
        </div>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #0891b2; margin: 20px 0;">
          <strong>Author:</strong> ${research.submittedBy.firstName} ${research.submittedBy.lastName}<br>
          <strong>Category:</strong> ${research.category}
        </div>
        <p style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/research/${research._id}" style="display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 8px;">
            Review Research
          </a>
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'conserve2025@gmail.com',
    subject: '📚 New Research Submission - Review Required',
    html,
  });
};