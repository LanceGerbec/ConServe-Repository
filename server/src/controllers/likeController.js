import Like from '../models/Like.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';

export const toggleLike = async (req, res) => {
  try {
    const { researchId } = req.params;
    const existing = await Like.findOne({ user: req.user._id, research: researchId });
    if (existing) {
      await existing.deleteOne();
      await Research.findByIdAndUpdate(researchId, { $inc: { likes: -1 } });
      await AuditLog.create({ user: req.user._id, action: 'RESEARCH_UNLIKED', resource: 'Research', resourceId: researchId, ipAddress: req.ip, userAgent: req.get('user-agent') });
      return res.json({ liked: false });
    }
    await Like.create({ user: req.user._id, research: researchId });
    await Research.findByIdAndUpdate(researchId, { $inc: { likes: 1 } });
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_LIKED', resource: 'Research', resourceId: researchId, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ liked: true });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Already liked' });
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

export const checkLike = async (req, res) => {
  try {
    const { researchId } = req.params;
    const like = await Like.findOne({ user: req.user._id, research: researchId });
    res.json({ liked: !!like });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check like' });
  }
};

export const getMyLikes = async (req, res) => {
  try {
    const likes = await Like.find({ user: req.user._id })
      .populate({ path: 'research', populate: { path: 'submittedBy', select: 'firstName lastName' } })
      .sort({ createdAt: -1 });
    res.json({ likes, count: likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};