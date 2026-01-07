// ============================================
// FILE: server/src/utils/emailService.js
// UPDATED WITH PROFESSIONAL TEMPLATES
// ============================================
import brevo from '@getbrevo/brevo';
import {
  welcomeEmailTemplate,
  approvalEmailTemplate,
  passwordResetEmailTemplate,
  passwordResetConfirmationTemplate,
  adminNewUserNotificationTemplate,
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

    console.log(`✓ Sent to ${to}`);
    return { success: true, messageId, recipient: to };
  } catch (error) {
    console.error(`✗ Failed to ${to}:`, error.message);
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

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) {
    console.error('✗ User email required');
    return { success: false, error: 'User email required' };
  }
  
  return await sendEmail({
    to: user.email,
    subject: 'Welcome to ConServe - Registration Successful',
    html: welcomeEmailTemplate(user)
  });
};

export const sendApprovalEmail = async (user) => {
  if (!user?.email) {
    console.error('✗ User email required');
    return { success: false, error: 'User email required' };
  }
  
  return await sendEmail({
    to: user.email,
    subject: 'ConServe Account Approved - Login Now',
    html: approvalEmailTemplate(user)
  });
};

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

export const sendAdminNewUserNotification = async (user) => {
  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New User Registration: ${user.firstName} ${user.lastName}`,
    html: adminNewUserNotificationTemplate(user)
  });
};

// Research Submission Notification (Admin)
export const sendResearchSubmissionNotification = async (research, author) => {
  const admins = await (await import('../models/User.js')).default.find({ 
    role: 'admin', 
    isApproved: true, 
    isActive: true 
  });

  const results = [];
  for (const admin of admins) {
    const result = await sendEmail({
      to: admin.email,
      subject: 'New Research Submission - Review Required',
      html: researchSubmissionNotificationTemplate(research, author)
    });
    results.push(result);
  }

  return results;
};

// Research Approved Notification (Author)
export const sendResearchApprovedNotification = async (research, author) => {
  return await sendEmail({
    to: author.email,
    subject: 'Research Paper Approved - ConServe',
    html: researchApprovedTemplate(research, author)
  });
};

// Research Revision Requested Notification (Author)
export const sendResearchRevisionNotification = async (research, author, revisionNotes) => {
  return await sendEmail({
    to: author.email,
    subject: 'Revision Requested for Your Research Paper - ConServe',
    html: researchRevisionRequestedTemplate(research, author, revisionNotes)
  });
};

// Research Rejected Notification (Author)
export const sendResearchRejectedNotification = async (research, author, rejectionNotes) => {
  return await sendEmail({
    to: author.email,
    subject: 'Research Submission Update - ConServe',
    html: researchRejectedTemplate(research, author, rejectionNotes)
  });
};