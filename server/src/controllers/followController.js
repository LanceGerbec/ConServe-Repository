// server/src/controllers/followController.js
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) return res.status(400).json({ error: 'Cannot follow yourself' });
    const target = await User.findOne({ _id: userId, isDeleted: false, isApproved: true });
    if (!target) return res.status(404).json({ error: 'User not found' });

    const existing = await Follow.findOne({ follower: req.user._id, following: userId });
    if (existing) {
      await existing.deleteOne();
      await AuditLog.create({ user: req.user._id, action: 'UNFOLLOW_USER', resource: 'User', resourceId: userId, ipAddress: req.ip, userAgent: req.get('user-agent') });
      return res.json({ following: false, message: 'Unfollowed' });
    }

    await Follow.create({ follower: req.user._id, following: userId });
    await Notification.create({
      recipient: userId,
      type: 'NEW_FOLLOWER',
      title: 'New Follower',
      message: `${req.user.firstName} ${req.user.lastName} started following you.`,
      link: `/author/${req.user._id}`,
      relatedUser: req.user._id,
      priority: 'medium'
    });
    await AuditLog.create({ user: req.user._id, action: 'FOLLOW_USER', resource: 'User', resourceId: userId, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ following: true, message: 'Following' });
  } catch (error) {
    if (error.code === 11000) return res.json({ following: true, message: 'Already following' });
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const [isFollowing, isFollowedBy] = await Promise.all([
      Follow.findOne({ follower: req.user._id, following: userId }),
      Follow.findOne({ follower: userId, following: req.user._id })
    ]);
    res.json({ following: !!isFollowing, followedBy: !!isFollowedBy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get follow status' });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate('follower', 'firstName lastName avatar role department').sort({ createdAt: -1 }).limit(50);
    res.json({ followers: follows.map(f => f.follower), count: follows.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get followers' });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate('following', 'firstName lastName avatar role department').sort({ createdAt: -1 }).limit(50);
    res.json({ following: follows.map(f => f.following), count: follows.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get following' });
  }
};

export const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const [followers, following] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId })
    ]);
    res.json({ followers, following });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get follow stats' });
  }
};