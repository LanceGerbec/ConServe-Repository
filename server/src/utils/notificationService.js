import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Notify admins & faculty of new research submission
export const notifyNewResearchSubmitted = async (research) => {
  try {
    const adminsAndFaculty = await User.find({ 
      role: { $in: ['admin', 'faculty'] }, 
      isApproved: true, 
      isActive: true 
    });

    const notifications = adminsAndFaculty.map(user => ({
      recipient: user._id,
      type: 'NEW_RESEARCH_SUBMITTED',
      title: '📚 New Research Submitted',
      message: `"${research.title}" by ${research.submittedBy.firstName} ${research.submittedBy.lastName}`,
      link: `/dashboard?review=${research._id}`, // CHANGED: Direct to review modal
      relatedResearch: research._id,
      relatedUser: research.submittedBy._id,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Notified ${notifications.length} admins/faculty of new research`);
  } catch (error) {
    console.error('❌ New research notification error:', error);
  }
};

// Notify author when research status changes
export const notifyResearchStatusChange = async (research, newStatus, reviewNotes = '') => {
  try {
    const statusConfig = {
      approved: {
        emoji: '✅',
        title: 'Research Approved!',
        message: `Great news! Your research "${research.title}" has been approved and is now published.`,
        priority: 'high'
      },
      rejected: {
        emoji: '❌',
        title: 'Research Needs Revision',
        message: `Your research "${research.title}" was not approved. Reason: ${reviewNotes.substring(0, 150)}${reviewNotes.length > 150 ? '...' : ''}`,
        priority: 'high'
      },
      revision: {
        emoji: '📝',
        title: 'Revisions Requested',
        message: `Please revise your research "${research.title}". Feedback: ${reviewNotes.substring(0, 150)}${reviewNotes.length > 150 ? '...' : ''}`,
        priority: 'high'
      }
    };

    const config = statusConfig[newStatus];
    if (!config) {
      console.warn(`⚠️ Unknown status: ${newStatus}`);
      return;
    }

    await Notification.create({
      recipient: research.submittedBy._id || research.submittedBy,
      type: `RESEARCH_${newStatus.toUpperCase()}`,
      title: `${config.emoji} ${config.title}`,
      message: config.message,
      link: `/research/${research._id}`,
      relatedResearch: research._id,
      priority: config.priority
    });

    console.log(`✅ ${newStatus.toUpperCase()} notification sent to author`);
  } catch (error) {
    console.error('❌ Research status notification error:', error);
  }
};

export const notifyViewMilestone = async (research, views) => {
  try {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    if (!milestones.includes(views)) return;

    await Notification.create({
      recipient: research.submittedBy,
      type: 'RESEARCH_VIEWED',
      title: `🎉 ${views} Views Milestone!`,
      message: `Your research "${research.title}" has reached ${views} views!`,
      link: `/research/${research._id}`,
      relatedResearch: research._id,
      priority: 'medium'
    });

    console.log(`✅ Milestone notification sent: ${views} views`);
  } catch (error) {
    console.error('❌ Milestone notification error:', error);
  }
};

export const notifyNewUserRegistered = async (user) => {
  try {
    const admins = await User.find({ 
      role: 'admin', 
      isApproved: true, 
      isActive: true 
    });

    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'NEW_USER_REGISTERED',
      title: '👤 New User Registration',
      message: `${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`,
      link: '/dashboard',
      relatedUser: user._id,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Notified ${notifications.length} admins of new user`);
  } catch (error) {
    console.error('❌ User registration notification error:', error);
  }
};

export const notifyAccountApproved = async (userId) => {
  try {
    await Notification.create({
      recipient: userId,
      type: 'ACCOUNT_APPROVED',
      title: '✅ Account Approved!',
      message: 'Your ConServe account has been approved. You can now login and access the system.',
      link: '/dashboard',
      priority: 'high'
    });

    console.log(`✅ Account approval notification sent to user ${userId}`);
  } catch (error) {
    console.error('❌ Approval notification error:', error);
  }
};

export const notifyAccountRejected = async (userEmail, userName) => {
  try {
    console.log(`⚠️ Account rejected: ${userName} (${userEmail})`);
  } catch (error) {
    console.error('❌ Rejection notification error:', error);
  }
};