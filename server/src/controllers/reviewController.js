import Review from '../models/Review.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailService.js';

export const submitReview = async (req, res) => {
  try {
    const { researchId, comments, ratings } = req.body;
    
    const research = await Research.findById(researchId)
      .populate('submittedBy', 'email firstName lastName');
    
    if (!research) return res.status(404).json({ error: 'Research not found' });

    const review = await Review.create({
      research: researchId,
      reviewer: req.user._id,
      decision: 'pending',
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

    await Notification.create({
      recipient: research.submittedBy._id,
      type: 'REVIEW_RECEIVED',
      title: '📋 Faculty Review Received',
      message: `Your research "${research.title}" has received feedback from ${req.user.firstName} ${req.user.lastName}.`,
      link: `/research/${researchId}`,
      relatedResearch: researchId,
      relatedUser: req.user._id,
      priority: 'high'
    });

     try {
      const { facultyReviewNotificationTemplate } = await import('../utils/emailTemplates.js');
      await sendEmail({
        to: research.submittedBy.email,
        subject: 'Faculty Review Received - ConServe',
        html: facultyReviewNotificationTemplate(research, req.user, comments)
      });
      
    } catch (emailError) {
      console.error('⚠️ Email send failed:', emailError);
    }

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

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId).populate('research', 'title');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isReviewer = review.reviewer.toString() === req.user._id.toString();

    if (!isAdmin && !isReviewer) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'REVIEW_DELETED',
      resource: 'Review',
      resourceId: reviewId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: {
        researchTitle: review.research.title,
        deletedBy: isAdmin ? 'admin' : 'reviewer'
      }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};