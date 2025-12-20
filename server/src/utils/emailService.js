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

// Welcome Email (New Registration)
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .info-box { background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ConServe!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Thank you for registering with ConServe Research Repository!</p>
          
          <div class="info-box">
            <strong>📋 What happens next?</strong><br>
            Your account is currently <strong>pending approval</strong> by our administrator. 
            You will receive another email once your account has been reviewed and approved.
          </div>

          <p><strong>Account Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
            <li><strong>Student/Faculty ID:</strong> ${user.studentId}</li>
          </ul>

          <p><strong>⏰ Approval Time:</strong> Typically 1-3 business days</p>
          
          <p>If you have any questions, please contact us at <a href="mailto:conserve2025@gmail.com">conserve2025@gmail.com</a></p>
        </div>
        <div class="footer">
          <p>This is an automated message from ConServe Research Repository</p>
          <p>© ${new Date().getFullYear()} NEUST College of Nursing. All rights reserved.</p>
        </div>
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

// Account Approval Email
export const sendApprovalEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .success-box { background: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Account Approved!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Great news! Your ConServe account has been <strong>approved</strong> by the administrator.</p>
          
          <div class="success-box">
            <strong>🎊 You can now:</strong><br>
            • Access the full research repository<br>
            • Submit your own research papers<br>
            • Bookmark and cite papers<br>
            • Collaborate with other researchers
          </div>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/login" class="button">
              Login to ConServe
            </a>
          </p>

          <p><strong>Your Login Credentials:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
          </ul>

          <p>If you encounter any issues, please contact support at <a href="mailto:conserve2025@gmail.com">conserve2025@gmail.com</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
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

// Account Rejection Email
export const sendRejectionEmail = async (user, reason = 'Please contact administrator for details') => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .warning-box { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Account Application Update</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>We regret to inform you that your ConServe account application has not been approved at this time.</p>
          
          <div class="warning-box">
            <strong>Reason:</strong><br>
            ${reason}
          </div>

          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Contact the administrator at <a href="mailto:conserve2025@gmail.com">conserve2025@gmail.com</a></li>
            <li>Verify your student/faculty ID is correct</li>
            <li>Reapply if eligibility criteria are met</li>
          </ul>

          <p>If you believe this is an error, please reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: '❌ ConServe Account Application Update',
    html,
  });
};

// Research Review Notification
export const sendReviewNotification = async (research, review) => {
  const statusColors = {
    approved: '#10b981',
    rejected: '#ef4444',
    revision: '#f59e0b'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; color: white; font-weight: bold; margin: 20px 0; background: ${statusColors[review.decision]}; }
        .info-box { background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Research Review Update</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${research.submittedBy.firstName}</strong>,</p>
          <p>Your research paper has been reviewed:</p>
          
          <div class="info-box">
            <strong>Paper Title:</strong><br>
            ${research.title}
          </div>
          
          <div class="status-badge">
            ${review.decision.toUpperCase()}
          </div>
          
          <h3>Reviewer Comments:</h3>
          <div class="info-box">
            ${review.comments}
          </div>
          
          ${review.ratings ? `
            <h3>Ratings:</h3>
            <div class="info-box">
              <strong>Methodology:</strong> ${review.ratings.methodology}/5<br>
              <strong>Clarity:</strong> ${review.ratings.clarity}/5<br>
              <strong>Contribution:</strong> ${review.ratings.contribution}/5<br>
              <strong>Overall:</strong> ${review.ratings.overall}/5
            </div>
          ` : ''}
          
          ${review.revisionDeadline ? `
            <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
              <strong>⏰ Revision Deadline:</strong> ${new Date(review.revisionDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/research/${research._id}" class="button">
              View Full Details
            </a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from ConServe Research Repository</p>
          <p>© ${new Date().getFullYear()} NEUST College of Nursing. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: research.submittedBy.email,
    subject: `📄 Research Review: ${review.decision.toUpperCase()} - ${research.title}`,
    html,
  });
};

// Admin Notification - New User Registration
export const sendAdminNewUserNotification = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .info-box { background: #f9fafb; padding: 15px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New User Registration</h1>
        </div>
        <div class="content">
          <p>Hello <strong>Admin</strong>,</p>
          <p>A new user has registered and is <strong>pending your approval</strong>:</p>
          
          <div class="info-box">
            <strong>User Details:</strong><br>
            <strong>Name:</strong> ${user.firstName} ${user.lastName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Role:</strong> ${user.role}<br>
            <strong>ID:</strong> ${user.studentId}<br>
            <strong>Registered:</strong> ${new Date(user.createdAt).toLocaleString()}
          </div>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="button">
              Review User
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ConServe - Admin Notification</p>
        </div>
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

// Admin Notification - New Research Submission
export const sendAdminNewResearchNotification = async (research) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .info-box { background: #f9fafb; padding: 15px; border-left: 4px solid #0891b2; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #0891b2; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 New Research Submission</h1>
        </div>
        <div class="content">
          <p>Hello <strong>Admin</strong>,</p>
          <p>A new research paper has been submitted for <strong>review</strong>:</p>
          
          <div class="info-box">
            <strong>Paper Title:</strong><br>
            ${research.title}
          </div>

          <div class="info-box">
            <strong>Author:</strong> ${research.submittedBy.firstName} ${research.submittedBy.lastName}<br>
            <strong>Email:</strong> ${research.submittedBy.email}<br>
            <strong>Category:</strong> ${research.category}<br>
            <strong>Submitted:</strong> ${new Date(research.createdAt).toLocaleString()}
          </div>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/research/${research._id}" class="button">
              Review Research
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ConServe - Admin Notification</p>
        </div>
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

// Password Reset Email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .warning-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>We received a request to reset your ConServe password.</p>
          
          <div class="warning-box">
            <strong>⚠️ Security Notice:</strong><br>
            This link expires in <strong>1 hour</strong> for your security.
          </div>

          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">
              Reset Password
            </a>
          </p>

          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            Or copy and paste this link:<br>
            <code style="background: #f3f4f6; padding: 5px; border-radius: 3px; word-break: break-all;">${resetUrl}</code>
          </p>

          <div class="warning-box">
            <strong>Didn't request this?</strong><br>
            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔒 Password Reset Request - ConServe',
    html,
  });
};

// Revision Deadline Reminder
export const sendRevisionReminderEmail = async (research, daysRemaining) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .warning-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Revision Deadline Reminder</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${research.submittedBy.firstName}</strong>,</p>
          <p>This is a reminder that your research paper revision is due soon:</p>
          
          <div class="warning-box">
            <strong>Paper:</strong> ${research.title}<br>
            <strong>Days Remaining:</strong> ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}
          </div>

          <p>Please submit your revised paper before the deadline to avoid rejection.</p>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/dashboard" class="button">
              View Details
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: research.submittedBy.email,
    subject: `⏰ Revision Due in ${daysRemaining} Days - ${research.title}`,
    html,
  });
};

