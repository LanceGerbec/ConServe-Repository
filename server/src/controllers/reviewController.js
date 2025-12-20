import Review from '../models/Review.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/emailService.js';

export const submitReview = async (req, res) => {
  try {
    const { researchId, decision, comments, ratings, revisionDeadline } = req.body;
    
    const research = await Research.findById(researchId).populate('submittedBy', 'email firstName lastName');
    if (!research) return res.status(404).json({ error: 'Research not found' });

    const review = await Review.create({
      research: researchId,
      reviewer: req.user._id,
      decision,
      comments,
      ratings,
      revisionRequested: decision === 'revision',
      revisionDeadline: decision === 'revision' ? revisionDeadline : null
    });

    research.status = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'revision';
    research.reviewedBy = req.user._id;
    if (decision === 'revision') research.revisionNotes = comments;
    await research.save();

    await AuditLog.create({
      user: req.user._id,
      action: `REVIEW_${decision.toUpperCase()}`,
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const { notifyResearchStatusChange } = await import('../utils/notificationService.js');
await notifyResearchStatusChange(research, decision, comments);

    // Send email notification
    const emailSubject = decision === 'approved' ? 'Your Research Has Been Approved!' :
                        decision === 'rejected' ? 'Research Review: Revision Required' :
                        'Research Review: Changes Requested';
    
    await sendEmail({
      to: research.submittedBy.email,
      subject: emailSubject,
      html: `
        <h2>Research Review Update</h2>
        <p>Hello ${research.submittedBy.firstName},</p>
        <p>Your research paper "<strong>${research.title}</strong>" has been reviewed.</p>
        <p><strong>Decision:</strong> ${decision.toUpperCase()}</p>
        <p><strong>Comments:</strong> ${comments}</p>
        ${decision === 'revision' ? `<p><strong>Revision Deadline:</strong> ${new Date(revisionDeadline).toLocaleDateString()}</p>` : ''}
        <p>Login to ConServe to view full details.</p>
      `
    });

    res.json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getReviewsForResearch = async (req, res) => {
  try {
    const { researchId } = req.params;
    const reviews = await Review.find({ research: researchId })
      .populate('reviewer', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json({ reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('research', 'title authors status')
      .sort({ createdAt: -1 });

    res.json({ reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
};

export const getPendingReviews = async (req, res) => {
  try {
    const pendingResearch = await Research.find({ status: 'pending' })
      .populate('submittedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ papers: pendingResearch, count: pendingResearch.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
};

export const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ reviewer: req.user._id });
    const approved = await Review.countDocuments({ reviewer: req.user._id, decision: 'approved' });
    const rejected = await Review.countDocuments({ reviewer: req.user._id, decision: 'rejected' });
    const revisions = await Review.countDocuments({ reviewer: req.user._id, decision: 'revision' });

    res.json({ totalReviews, approved, rejected, revisions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review stats' });
  }
};