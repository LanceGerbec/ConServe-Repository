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
          <h1>Research Review Update</h1>
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
              Methodology: ${review.ratings.methodology}/5<br>
              Clarity: ${review.ratings.clarity}/5<br>
              Contribution: ${review.ratings.contribution}/5<br>
              Overall: ${review.ratings.overall}/5
            </div>
          ` : ''}
          
          ${review.revisionDeadline ? `
            <div class="info-box">
              <strong>⏰ Revision Deadline:</strong> ${new Date(review.revisionDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          ` : ''}
          
          <a href="${process.env.CLIENT_URL}/research/${research._id}" class="button">
            View Full Details
          </a>
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
    subject: `Research Review: ${review.decision.toUpperCase()} - ${research.title}`,
    html,
  });
};

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
          <p>Great news! Your ConServe account has been approved by the administrator.</p>
          <p>You can now access the full research repository and submit your own papers.</p>
          
          <a href="${process.env.CLIENT_URL}/login" class="button">
            Login to ConServe
          </a>
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
    subject: 'Your ConServe Account Has Been Approved',
    html,
  });
};