import Research from '../models/Research.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Review from '../models/Review.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPapers,
      totalUsers,
      totalViews,
      recentSubmissions,
      topPapers,
      monthlyData
    ] = await Promise.all([
      Research.countDocuments({ status: 'approved' }),
      User.countDocuments({ isApproved: true }),
      Research.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Research.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'firstName lastName'),
      Research.find({ status: 'approved' }).sort({ views: -1 }).limit(5).select('title views bookmarks'),
      getMonthlySubmissions()
    ]);

    res.json({
      totalPapers,
      totalUsers,
      totalViews: totalViews[0]?.total || 0,
      recentSubmissions,
      topPapers,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const getMonthlySubmissions = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await Research.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return data.map(d => ({ month: d._id, submissions: d.count }));
};

export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ logs, count: logs.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const [submissions, views, bookmarks, reviews] = await Promise.all([
      Research.countDocuments({ submittedBy: userId }),
      Research.aggregate([
        { $match: { submittedBy: userId } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      Research.countDocuments({ submittedBy: userId, status: 'approved' }),
      Review.countDocuments({ reviewer: userId })
    ]);

    res.json({
      submissions,
      totalViews: views[0]?.total || 0,
      approvedPapers: bookmarks,
      reviewsGiven: reviews
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};