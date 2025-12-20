import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });
    
    console.log('📧 Transporter created for:', process.env.EMAIL_USER);
  }
  return transporter;
};

export const sendEmail = async (options) => {
  try {
    const transport = getTransporter();
    
    const mailOptions = {
      from: `"ConServe" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    console.log('📤 Sending email to:', options.to);
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Email failed but continuing...');
      return null;
    }
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('✅ Email server verified');
    return true;
  } catch (error) {
    console.error('❌ Email verification failed:', error.message);
    return false;
  }
};

export const sendWelcomeEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to ConServe',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🎉 Welcome to ConServe!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Thank you for registering!</p>
          <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
            <strong>📋 Next Steps:</strong><br>
            Your account is <strong>pending approval</strong>. You'll receive an email once approved.
          </div>
          <p><strong>Account Details:</strong></p>
          <ul>
            <li>Name: ${user.firstName} ${user.lastName}</li>
            <li>Email: ${user.email}</li>
            <li>Role: ${user.role}</li>
            <li>ID: ${user.studentId}</li>
          </ul>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} NEUST College of Nursing</p>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendApprovalEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: '✅ Account Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>✅ Account Approved!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Your ConServe account has been <strong>approved</strong>!</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 30px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Login Now
            </a>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
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
      <body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🔔 New User Registration</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
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
    `,
  });
};

export const sendAdminNewResearchNotification = async (research) => {
  return await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: '📚 New Research Submission',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 New Research Submission</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <p>A new research paper has been submitted:</p>
          <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #0891b2; margin: 20px 0;">
            <strong>Title:</strong><br>${research.title}
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
    `,
  });
};