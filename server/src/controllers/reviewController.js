import Review from '../models/Review.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/emailService.js';

// Faculty submits review (SUGGESTIONS ONLY - NO STATUS CHANGE)
export const submitReview = async (req, res) => {
  try {
    const { researchId, comments, ratings } = req.body;
    
    const research = await Research.findById(researchId)
      .populate('submittedBy', 'email firstName lastName');
    
    if (!research) return res.status(404).json({ error: 'Research not found' });

    // Faculty can ONLY submit comments/suggestions
    const review = await Review.create({
      research: researchId,
      reviewer: req.user._id,
      decision: 'pending', // Faculty review stays pending
      comments,
      ratings,
      revisionRequested: false
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'FACULTY_REVIEW_SUBMITTED',
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Email notification to author
    await sendEmail({
      to: research.submittedBy.email,
      subject: 'Faculty Review Received',
      html: `
        <h2>Faculty Review Received</h2>
        <p>Hello ${research.submittedBy.firstName},</p>
        <p>Your research paper "<strong>${research.title}</strong>" has received feedback from faculty.</p>
        <p><strong>Comments:</strong> ${comments}</p>
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