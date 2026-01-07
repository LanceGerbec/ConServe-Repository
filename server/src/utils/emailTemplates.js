// ============================================
// FILE: server/src/utils/emailTemplates.js
// EMAIL TEMPLATES WITH PROFESSIONAL ICONS
// ============================================

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const CURRENT_YEAR = new Date().getFullYear();

// Shared styles
const styles = {
  container: 'font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff',
  header: 'background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#ffffff;padding:40px 30px;text-align:center',
  body: 'padding:40px 30px;background:#ffffff',
  footer: 'background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb',
  button: 'display:inline-block;padding:16px 48px;background:#1e3a8a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px',
  infoBox: 'background:#eff6ff;padding:20px;border-left:4px solid #3b82f6;margin:20px 0;border-radius:8px',
  warningBox: 'background:#fef3c7;padding:20px;border-left:4px solid #f59e0b;margin:20px 0;border-radius:8px',
  successBox: 'background:#d1fae5;padding:20px;border-left:4px solid #10b981;margin:20px 0;border-radius:8px'
};

// Icons (HTML entities)
const icons = {
  check: '&#10003;',
  envelope: '&#9993;',
  warning: '&#9888;',
  info: '&#8505;',
  clock: '&#9200;',
  lock: '&#128274;',
  user: '&#128100;',
  document: '&#128196;',
  bell: '&#128276;'
};

// Email header component
const emailHeader = (title, subtitle = '') => `
  <div style="${styles.header}">
    <h1 style="margin:0;font-size:32px;font-weight:bold">${title}</h1>
    ${subtitle ? `<p style="margin:10px 0 0 0;font-size:14px;opacity:0.9">${subtitle}</p>` : ''}
  </div>
`;

// Email footer component
const emailFooter = () => `
  <div style="${styles.footer}">
    <p style="font-size:13px;color:#9ca3af;margin:5px 0">© ${CURRENT_YEAR} ConServe - NEUST College of Nursing</p>
    <p style="font-size:13px;color:#9ca3af;margin:5px 0">Research Repository System</p>
  </div>
`;

// Button component
const emailButton = (url, text) => `
  <div style="text-align:center;margin:30px 0">
    <a href="${url}" style="${styles.button}">${text}</a>
  </div>
`;

// Info box component
const infoBox = (content, type = 'info') => {
  const boxStyles = {
    info: styles.infoBox,
    warning: styles.warningBox,
    success: styles.successBox
  };
  return `<div style="${boxStyles[type]}">${content}</div>`;
};

// Welcome Email Template
export const welcomeEmailTemplate = (user) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:20px;background:#f3f4f6">
    <div style="${styles.container}">
      ${emailHeader('Welcome to ConServe', 'College of Nursing Research Repository')}
      <div style="${styles.body}">
        <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p style="font-size:16px;color:#374151;line-height:1.8">Thank you for registering with ConServe Research Repository!</p>
        
        ${infoBox(`
          <p style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:bold">${icons.clock} Pending Administrator Approval</p>
          <p style="margin:0;color:#92400e;font-size:15px">Your account is awaiting approval. You'll receive another email once approved (usually within 24-48 hours).</p>
        `, 'warning')}

        <div style="background:#f9fafb;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #e5e7eb">
          <p style="margin:0 0 15px 0;color:#111827;font-size:16px;font-weight:bold">${icons.document} Your Registration Details:</p>
          <p style="margin:8px 0;color:#374151"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p style="margin:8px 0;color:#374151"><strong>Email:</strong> ${user.email}</p>
          <p style="margin:8px 0;color:#374151"><strong>ID:</strong> ${user.studentId}</p>
          <p style="margin:8px 0;color:#374151"><strong>Role:</strong> ${user.role}</p>
        </div>

        <p style="font-size:14px;color:#6b7280;margin-top:30px">
          Questions? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
        </p>
      </div>
      ${emailFooter()}
    </div>
  </body>
  </html>
`;

// Approval Email Template
export const approvalEmailTemplate = (user) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:20px;background:#f3f4f6">
    <div style="${styles.container}">
      ${emailHeader('Account Approved', 'You can now access ConServe')}
      <div style="${styles.body}">
        <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p style="font-size:16px;color:#374151;line-height:1.8">Great news! Your ConServe account has been <strong>approved</strong> by the administrator.</p>
        
        <div style="background:#eff6ff;padding:25px;border-left:4px solid #3b82f6;margin:30px 0;border-radius:8px">
          <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>${icons.envelope} Email:</strong> ${user.email}</p>
          <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>${icons.document} ID:</strong> ${user.studentId}</p>
          <p style="margin:8px 0;color:#1e40af;font-size:15px"><strong>${icons.user} Role:</strong> ${user.role}</p>
        </div>

        ${infoBox(`
          <p style="margin:0;color:#166534;font-size:15px;font-weight:bold">${icons.check} You can now:</p>
          <ul style="color:#166534;margin:10px 0;padding-left:20px;font-size:14px">
            <li>Browse research papers</li>
            <li>Submit your own research</li>
            <li>Bookmark papers</li>
            <li>Download research</li>
          </ul>
        `, 'success')}

        ${emailButton(CLIENT_URL + '/login', 'Login to ConServe')}

        <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
          Questions? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
        </p>
      </div>
      ${emailFooter()}
    </div>
  </body>
  </html>
`;

// Password Reset Email Template
export const passwordResetEmailTemplate = (user, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Reset - ConServe</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;">
    <tr>
      <td style="padding:20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background:linear-gradient(135deg, #dc2626 0%, #ef4444 100%);padding:40px 30px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align:center;">
                    <div style="display:inline-block;width:60px;height:60px;background-color:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:60px;margin-bottom:15px;">
                      <span style="font-size:32px;color:#ffffff;">&#128274;</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
                    <h1 style="margin:0;font-size:32px;font-weight:bold;color:#ffffff;line-height:1.2;">Password Reset Request</h1>
                    <p style="margin:10px 0 0 0;font-size:14px;color:rgba(255,255,255,0.9);">ConServe Account Security</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0;font-size:18px;color:#111827;line-height:1.5;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">We received a request to reset your password for your ConServe account.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:14px;color:#92400e;font-weight:bold;">
                            <span style="font-size:16px;">&#9200;</span> This link expires in 1 hour
                          </p>
                          <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                            If you didn't request this, please ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center;padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td style="background-color:#dc2626;border-radius:10px;text-align:center;">
                          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:16px 48px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;">Reset Password</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9fafb;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:14px;color:#374151;font-weight:bold;">Or copy this link:</p>
                          <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;line-height:1.5;">
                            ${resetUrl}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:30px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
                      Questions? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none;">conserve2025@gmail.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:5px 0;font-size:13px;color:#9ca3af;">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
              <p style="margin:5px 0;font-size:13px;color:#9ca3af;">Research Repository System</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

// Password Reset Confirmation Template
export const passwordResetConfirmationTemplate = (user) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Reset Complete - ConServe</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;">
    <tr>
      <td style="padding:20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background:linear-gradient(135deg, #10b981 0%, #34d399 100%);padding:40px 30px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align:center;">
                    <div style="display:inline-block;width:60px;height:60px;background-color:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:60px;margin-bottom:15px;">
                      <span style="font-size:32px;color:#ffffff;">&#10003;</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
                    <h1 style="margin:0;font-size:32px;font-weight:bold;color:#ffffff;line-height:1.2;">Password Reset Complete</h1>
                    <p style="margin:10px 0 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Your account is secure</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0;font-size:18px;color:#111827;line-height:1.5;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">Your ConServe password has been successfully reset.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#d1fae5;border-left:4px solid #10b981;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:14px;color:#065f46;font-weight:bold;">
                            <span style="font-size:16px;">&#10003;</span> Your account is secure
                          </p>
                          <p style="margin:0;font-size:14px;color:#065f46;line-height:1.5;">
                            You can now log in with your new password.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="text-align:center;padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td style="background-color:#10b981;border-radius:10px;text-align:center;">
                          <a href="${CLIENT_URL}/login" target="_blank" style="display:inline-block;padding:16px 48px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;">Login to ConServe</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 10px 0;font-size:14px;color:#92400e;font-weight:bold;">
                            <span style="font-size:16px;">&#9888;</span> Didn't reset your password?
                          </p>
                          <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                            Contact support immediately at conserve2025@gmail.com
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:30px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                      <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                      <strong>Security:</strong> Action logged for your protection
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f9fafb;padding:25px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:5px 0;font-size:13px;color:#9ca3af;">© ${new Date().getFullYear()} ConServe - NEUST College of Nursing</p>
              <p style="margin:5px 0;font-size:13px;color:#9ca3af;">Research Repository System</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Admin New User Notification Template
export const adminNewUserNotificationTemplate = (user) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:20px;background:#f3f4f6">
    <div style="${styles.container}">
      ${emailHeader('New User Registration', 'Action Required')}
      <div style="${styles.body}">
        <p style="font-size:18px;color:#111827;margin-bottom:20px">A new user has registered and is awaiting approval:</p>
        
        <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
          <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.user} Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.envelope} Email:</strong> ${user.email}</p>
          <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.document} ID:</strong> ${user.studentId}</p>
          <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.user} Role:</strong> ${user.role}</p>
          <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.clock} Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        ${infoBox(`
          <p style="margin:0;color:#92400e;font-size:15px;font-weight:bold">${icons.warning} Action Required</p>
          <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">Please review and approve this user to grant system access.</p>
        `, 'warning')}

        ${emailButton(CLIENT_URL + '/dashboard', 'Review & Approve User')}
      </div>
      ${emailFooter()}
    </div>
  </body>
  </html>
`;

// Faculty Review Notification Template
export const facultyReviewNotificationTemplate = (research, reviewer, comments) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:20px;background:#f3f4f6">
    <div style="${styles.container}">
      ${emailHeader('Faculty Review Received', 'Research Feedback Available')}
      <div style="${styles.body}">
        <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${research.submittedBy.firstName}</strong>,</p>
        <p style="font-size:16px;color:#374151;line-height:1.8">Your research paper has received feedback from faculty.</p>
        
        <div style="background:#f9fafb;padding:15px;border-left:4px solid #1e3a8a;margin:20px 0">
          <strong>Paper:</strong> ${research.title}<br>
          <strong>Reviewed by:</strong> ${reviewer.firstName} ${reviewer.lastName}
        </div>

        <div style="background:#eff6ff;padding:15px;border-radius:8px;margin:20px 0">
          <strong>Comments:</strong><br>
          <p style="margin-top:10px">${comments}</p>
        </div>

        ${emailButton(`${CLIENT_URL}/research/${research._id}`, 'View Full Review')}

        <p style="color:#6b7280;font-size:14px;margin-top:20px">
          <strong>Note:</strong> This is a faculty review/suggestion. The admin will make the final decision on your paper.
        </p>
      </div>
      ${emailFooter()}
    </div>
  </body>
  </html>
`;

// Research Submission Notification (Admin)
export const researchSubmissionNotificationTemplate = (research, author) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6">
  <div style="${styles.container}">
    ${emailHeader('New Research Submission', 'Pending Review')}
    <div style="${styles.body}">
      <p style="font-size:16px;color:#374151;line-height:1.8;margin-bottom:20px">A new research paper has been submitted and requires your review.</p>
      
      <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
        <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.document} Title:</strong> ${research.title}</p>
        <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.user} Author:</strong> ${author.firstName} ${author.lastName}</p>
        <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.envelope} Email:</strong> ${author.email}</p>
        <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>${icons.calendar} Submitted:</strong> ${new Date(research.createdAt).toLocaleDateString()}</p>
        <p style="margin:10px 0;color:#1e40af;font-size:15px"><strong>Category:</strong> ${research.category}</p>
      </div>

      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 10px 0;font-weight:bold;color:#111827">Abstract:</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">${research.abstract.substring(0, 200)}${research.abstract.length > 200 ? '...' : ''}</p>
      </div>

      ${infoBox(`
        <p style="margin:0;color:#92400e;font-size:15px;font-weight:bold">${icons.clock} Action Required</p>
        <p style="margin:10px 0 0 0;color:#92400e;font-size:14px">Please review this submission and approve or request revisions.</p>
      `, 'warning')}

      ${emailButton(CLIENT_URL + '/dashboard?adminReview=' + research._id, 'Review Paper')}
    </div>
    ${emailFooter()}
  </div>
</body>
</html>
`;

// Research Approved Notification (Author)
export const researchApprovedTemplate = (research, author) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6">
  <div style="${styles.container}">
    ${emailHeader('Research Paper Approved', 'Published Successfully')}
    <div style="${styles.body}">
      <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${author.firstName} ${author.lastName}</strong>,</p>
      <p style="font-size:16px;color:#374151;line-height:1.8">Congratulations! Your research paper has been approved and is now published in the repository.</p>
      
      ${infoBox(`
        <p style="margin:0 0 10px 0;color:#166534;font-size:16px;font-weight:bold">${icons.check} Paper Approved</p>
        <p style="margin:0;color:#166534;font-size:15px"><strong>Title:</strong> ${research.title}</p>
        <p style="margin:10px 0 0 0;color:#166534;font-size:14px">Your paper is now accessible to all users in the repository.</p>
      `, 'success')}

      <div style="background:#f9fafb;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #e5e7eb">
        <p style="margin:0 0 15px 0;color:#111827;font-size:16px;font-weight:bold">Paper Details:</p>
        <p style="margin:8px 0;color:#374151"><strong>Status:</strong> Published</p>
        <p style="margin:8px 0;color:#374151"><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin:8px 0;color:#374151"><strong>Category:</strong> ${research.category}</p>
      </div>

      ${emailButton(CLIENT_URL + '/research/' + research._id, 'View Published Paper')}

      <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
        Questions? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
      </p>
    </div>
    ${emailFooter()}
  </div>
</body>
</html>
`;

// Research Revision Requested Notification (Author)
export const researchRevisionRequestedTemplate = (research, author, revisionNotes) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6">
  <div style="${styles.container}">
    ${emailHeader('Revision Requested', 'Action Required')}
    <div style="${styles.body}">
      <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${author.firstName} ${author.lastName}</strong>,</p>
      <p style="font-size:16px;color:#374151;line-height:1.8">Your research paper requires revisions before it can be approved.</p>
      
      <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
        <p style="margin:0 0 10px 0;color:#1e40af;font-size:16px;font-weight:bold">${icons.document} ${research.title}</p>
        <p style="margin:8px 0;color:#1e40af;font-size:14px"><strong>Submitted:</strong> ${new Date(research.createdAt).toLocaleDateString()}</p>
      </div>

      ${infoBox(`
        <p style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:bold">${icons.warning} Revision Notes</p>
        <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6">${revisionNotes || 'Please review the feedback and resubmit your paper.'}</p>
      `, 'warning')}

      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 10px 0;font-weight:bold;color:#111827">Next Steps:</p>
        <ol style="margin:10px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
          <li>Review the revision notes carefully</li>
          <li>Make the requested changes</li>
          <li>Resubmit your paper through the dashboard</li>
        </ol>
      </div>

      ${emailButton(CLIENT_URL + '/dashboard', 'View Paper Details')}

      <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
        Need help? Contact us at <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
      </p>
    </div>
    ${emailFooter()}
  </div>
</body>
</html>
`;

// Research Rejected Notification (Author)
export const researchRejectedTemplate = (research, author, rejectionNotes) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6">
  <div style="${styles.container}">
    ${emailHeader('Research Review Update', 'Further Review Needed')}
    <div style="${styles.body}">
      <p style="font-size:18px;color:#111827;margin-bottom:20px">Hello <strong>${author.firstName} ${author.lastName}</strong>,</p>
      <p style="font-size:16px;color:#374151;line-height:1.8">Thank you for your submission. After careful review, your paper requires additional work before it can be accepted.</p>
      
      <div style="background:#eff6ff;padding:25px;margin:25px 0;border-radius:10px;border:1px solid #bfdbfe">
        <p style="margin:0 0 10px 0;color:#1e40af;font-size:16px;font-weight:bold">${icons.document} ${research.title}</p>
        <p style="margin:8px 0;color:#1e40af;font-size:14px"><strong>Submitted:</strong> ${new Date(research.createdAt).toLocaleDateString()}</p>
      </div>

      ${infoBox(`
        <p style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:bold">${icons.warning} Reviewer Feedback</p>
        <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6">${rejectionNotes || 'Your submission does not meet the current requirements. Please review the guidelines and consider resubmitting with improvements.'}</p>
      `, 'warning')}

      <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0">
        <p style="margin:0 0 10px 0;font-weight:bold;color:#111827">What You Can Do:</p>
        <ul style="margin:10px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
          <li>Review the submission guidelines</li>
          <li>Address the feedback provided</li>
          <li>Consider submitting a new, revised paper</li>
          <li>Contact support if you have questions</li>
        </ul>
      </div>

      ${emailButton(CLIENT_URL + '/dashboard', 'Go to Dashboard')}

      <p style="font-size:14px;color:#6b7280;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
        Questions? We're here to help: <a href="mailto:conserve2025@gmail.com" style="color:#2563eb;text-decoration:none">conserve2025@gmail.com</a>
      </p>
    </div>
    ${emailFooter()}
  </div>
</body>
</html>
`;