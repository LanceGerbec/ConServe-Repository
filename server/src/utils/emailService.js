import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
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

export const sendApprovalEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">Welcome to ConServe!</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your account has been approved! You can now access the ConServe Research Repository.</p>
      <p>
        <a href="${process.env.CLIENT_URL}/login" 
           style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Login to ConServe
        </a>
      </p>
      <p>Best regards,<br>The ConServe Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Your ConServe Account Has Been Approved',
    html,
  });
};

export const sendReviewNotification = async (research, decision, comments) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e3a8a;">Research Review Update</h2>
      <p>Hello ${research.submittedBy.firstName},</p>
      <p>Your research paper "<strong>${research.title}</strong>" has been reviewed.</p>
      <p><strong>Decision:</strong> ${decision.toUpperCase()}</p>
      <p><strong>Reviewer Comments:</strong></p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 8px;">${comments}</p>
      <p>
        <a href="${process.env.CLIENT_URL}/research/${research._id}" 
           style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View Research
        </a>
      </p>
      <p>Best regards,<br>The ConServe Team</p>
    </div>
  `;

  await sendEmail({
    to: research.submittedBy.email,
    subject: `Research Review: ${decision.toUpperCase()}`,
    html,
  });
};