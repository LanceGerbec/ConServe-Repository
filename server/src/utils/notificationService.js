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
      title: 'New Research Submitted',
      message: `"${research.title}" by ${research.submittedBy.firstName} ${research.submittedBy.lastName}`,
      link: `/research/${research._id}`,
      relatedResearch: research._id,
      relatedUser: research.submittedBy._id,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Notified ${notifications.length} admins/faculty`);
  } catch (error) {
    console.error('❌ Notification error:', error);
  }
};

// Notify author when research reaches view milestone
export const notifyViewMilestone = async (research, views) => {
  try {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    if (!milestones.includes(views)) return;

    await Notification.create({
      recipient: research.submittedBy,
      type: 'RESEARCH_VIEWED',
      title: `${views} Views Milestone! 🎉`,
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

// Notify user of new registration (admins only)
export const notifyNewUserRegistered = async (user) => {
  try {
    const admins = await User.find({ role: 'admin', isApproved: true, isActive: true });

    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type: 'NEW_USER_REGISTERED',
      title: 'New User Registration',
      message: `${user.firstName} ${user.lastName} (${user.role}) registered`,
      link: '/dashboard?tab=users',
      relatedUser: user._id,
      priority: 'high'
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Notified ${notifications.length} admins`);
  } catch (error) {
    console.error('❌ User notification error:', error);
  }
};

// Notify user when account is approved
export const notifyAccountApproved = async (userId) => {
  try {
    await Notification.create({
      recipient: userId,
      type: 'ACCOUNT_APPROVED',
      title: 'Account Approved! 🎉',
      message: 'Your ConServe account has been approved. You can now login.',
      link: '/dashboard',
      priority: 'high'
    });

    console.log(`✅ Approval notification sent to user ${userId}`);
  } catch (error) {
    console.error('❌ Approval notification error:', error);
  }
};

// Notify author when research is reviewed
export const notifyResearchReviewed = async (research, review) => {
  try {
    const statusMessages = {
      approved: 'Your research has been approved! 🎉',
      rejected: 'Your research needs revision.',
      revision: 'Revisions requested for your research.'
    };

    await Notification.create({
      recipient: research.submittedBy,
      type: `RESEARCH_${review.decision.toUpperCase()}`,
      title: statusMessages[review.decision],
      message: `"${research.title}" - ${review.comments.substring(0, 100)}...`,
      link: `/research/${research._id}`,
      relatedResearch: research._id,
      priority: 'high'
    });

    console.log(`✅ Review notification sent: ${review.decision}`);
  } catch (error) {
    console.error('❌ Review notification error:', error);
  }
};