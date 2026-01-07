// server/src/utils/emailService.js
import brevo from '@getbrevo/brevo';
import {
  welcomeEmailTemplate,
  approvalEmailTemplate,
  passwordResetEmailTemplate,
  passwordResetConfirmationTemplate,
  adminNewUserNotificationTemplate,
  researchSubmissionNotificationTemplate,
  researchApprovedTemplate,
  researchRevisionRequestedTemplate,
  researchRejectedTemplate,
  facultyReviewNotificationTemplate
} from './emailTemplates.js';

const apiInstance = new brevo.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  console.log('✓ Brevo API configured');
} else {
  console.error('✗ BREVO_API_KEY not found');
}

const SENDER_EMAIL = process.env.EMAIL_FROM || 'conserve2025@gmail.com';
const SENDER_NAME = 'ConServe NEUST';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'conserve2025@gmail.com';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('✗ BREVO_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    console.log(`→ Sending: ${subject} to ${to}`);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    let messageId = 'sent';
    if (result) {
      messageId = result.messageId || result.response?.body?.messageId || result.body?.messageId || result.data?.messageId || JSON.stringify(result).substring(0, 50);
    }

    console.log(`✓ Email sent to ${to}`);
    return { success: true, messageId, recipient: to };
  } catch (error) {
    console.error(`✗ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message, recipient: to };
  }
};

export const testEmailConnection = async () => {
  try {
    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: 'BREVO_API_KEY not configured' };
    }

    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    
    const account = await accountApi.getAccount();
    
    console.log('✓ Brevo connected');
    return { 
      success: true, 
      provider: 'Brevo',
      accountEmail: account.email,
      plan: account.plan?.[0]?.type || 'Free',
      from: SENDER_EMAIL
    };
  } catch (error) {
    console.error('✗ Brevo connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// User Registration & Approval
export const sendWelcomeEmail = async (user) => {
  if (!user?.email) return { success: false, error: 'User email required' };
  return await sendEmail({
    to: user.email,
    subject: 'Welcome to ConServe - Registration Successful',
    html: welcomeEmailTemplate(user)
  });
};

export const sendApprovalEmail = async (user) => {
  if (!user?.email) return { success: false, error: 'User email required' };
  return await sendEmail({
    to: user.email,
    subject: 'ConServe Account Approved - Login Now',
    html: approvalEmailTemplate(user)
  });
};

// Password Reset
export const sendPasswordResetEmail = async (user, token) => {
  return await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - ConServe',
    html: passwordResetEmailTemplate(user, token)
  });
};

export const sendPasswordResetConfirmation = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: 'Password Successfully Reset - ConServe',
    html: passwordResetConfirmationTemplate(user)
  });
};

// Admin Notifications
export const sendAdminNewUserNotification = async (user) => {
  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New User Registration: ${user.firstName} ${user.lastName}`,
    html: adminNewUserNotificationTemplate(user)
  });
};

// ✅ RESEARCH SUBMISSION NOTIFICATION (ADMIN)
export const sendResearchSubmissionNotification = async (research, author) => {
  try {
    const User = (await import('../models/User.js')).default;
    const admins = await User.find({ 
      role: 'admin', 
      isApproved: true, 
      isActive: true 
    });

    console.log(`📧 Sending research submission emails to ${admins.length} admins...`);

    const results = [];
    for (const admin of admins) {
      const result = await sendEmail({
        to: admin.email,
        subject: `New Research Submission: ${research.title}`,
        html: researchSubmissionNotificationTemplate(research, author)
      });
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✓ Research submission: ${successCount}/${admins.length} admin emails sent`);

    return { success: successCount > 0, results };
  } catch (error) {
    console.error('✗ Research submission email error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ FACULTY: Notify when paper is approved (ready for review)
export const sendFacultyApprovedPaperNotification = async (research) => {
  try {
    const User = (await import('../models/User.js')).default;
    const faculty = await User.find({ 
      role: 'faculty', 
      isApproved: true, 
      isActive: true 
    });

    console.log(`📧 Sending approved paper notification to ${faculty.length} faculty...`);

    const results = [];
    for (const f of faculty) {
      const result = await sendEmail({
        to: f.email,
        subject: `New Approved Paper: ${research.title}`,
        html: facultyApprovedPaperNotificationTemplate(research)
      });
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✓ Faculty notifications: ${successCount}/${faculty.length} emails sent`);

    return { success: successCount > 0, results };
  } catch (error) {
    console.error('✗ Faculty notification email error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ RESEARCH APPROVED NOTIFICATION (AUTHOR)
export const sendResearchApprovedNotification = async (research, author) => {
  console.log(`📧 Sending approval email to ${author.email}...`);
  const result = await sendEmail({
    to: author.email,
    subject: `Research Approved: ${research.title}`,
    html: researchApprovedTemplate(research, author)
  });
  console.log(result.success ? '✓ Approval email sent' : '✗ Approval email failed');
  return result;
};

// ✅ RESEARCH REVISION REQUESTED (AUTHOR)
export const sendResearchRevisionNotification = async (research, author, revisionNotes) => {
  console.log(`📧 Sending revision request to ${author.email}...`);
  const result = await sendEmail({
    to: author.email,
    subject: `Revision Requested: ${research.title}`,
    html: researchRevisionRequestedTemplate(research, author, revisionNotes)
  });
  console.log(result.success ? '✓ Revision email sent' : '✗ Revision email failed');
  return result;
};

// ✅ RESEARCH REJECTED (AUTHOR)
export const sendResearchRejectedNotification = async (research, author, rejectionNotes) => {
  console.log(`📧 Sending rejection email to ${author.email}...`);
  const result = await sendEmail({
    to: author.email,
    subject: `Research Update: ${research.title}`,
    html: researchRejectedTemplate(research, author, rejectionNotes)
  });
  console.log(result.success ? '✓ Rejection email sent' : '✗ Rejection email failed');
  return result;
};

// ✅ FACULTY REVIEW NOTIFICATION (AUTHOR)
export const sendFacultyReviewNotification = async (research, reviewer, comments) => {
  console.log(`📧 Sending faculty review to author...`);
  const result = await sendEmail({
    to: research.submittedBy.email,
    subject: `Faculty Review: ${research.title}`,
    html: facultyReviewNotificationTemplate(research, reviewer, comments)
  });
  console.log(result.success ? '✓ Faculty review email sent' : '✗ Faculty review email failed');
  return result;
};