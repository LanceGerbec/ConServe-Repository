import Bookmark from '../models/Bookmark.js';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';

export const toggleBookmark = async (req, res) => {
  try {
    const { researchId } = req.params;
    const existing = await Bookmark.findOne({ user: req.user._id, research: researchId });

    if (existing) {
      await existing.deleteOne();
      await Research.findByIdAndUpdate(researchId, { $inc: { bookmarks: -1 } });
      await AuditLog.create({
        user: req.user._id,
        action: 'BOOKMARK_REMOVED',
        resource: 'Research',
        resourceId: researchId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.json({ message: 'Bookmark removed', bookmarked: false });
    }

    await Bookmark.create({ user: req.user._id, research: researchId });
    await Research.findByIdAndUpdate(researchId, { $inc: { bookmarks: 1 } });
    await AuditLog.create({
      user: req.user._id,
      action: 'BOOKMARK_ADDED',
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({ message: 'Bookmark added', bookmarked: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'research',
        populate: { path: 'submittedBy', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 });

    res.json({ bookmarks, count: bookmarks.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

export const checkBookmark = async (req, res) => {
  try {
    const { researchId } = req.params;
    const bookmark = await Bookmark.findOne({ user: req.user._id, research: researchId });
    res.json({ bookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
};