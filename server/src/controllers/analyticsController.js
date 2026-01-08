// server/src/controllers/analyticsController.js - ENHANCED VERSION
import Research from '../models/Research.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Review from '../models/Review.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalPapers, totalUsers, totalViews, recentSubmissions, topPapers, monthlyData] = await Promise.all([
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
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const getMonthlySubmissions = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await Research.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return data.map(d => ({ month: d._id, submissions: d.count }));
};

// 🆕 LOGIN/LOGOUT TRENDS
export const getLoginLogoutTrends = async (req, res) => {
  try {
    const { days = 30, role } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Build match query
    const matchQuery = {
      action: { $in: ['USER_LOGIN', 'USER_LOGOUT'] },
      timestamp: { $gte: startDate }
    };

    // Get daily trends with role filter
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }
    ];

    // Add role filter if specified
    if (role && role !== 'all') {
      pipeline.push({ $match: { 'userDetails.role': role } });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action',
            role: '$userDetails.role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    );

    const results = await AuditLog.aggregate(pipeline);

    // Transform data for frontend
    const dailyTrends = {};
    const roleBreakdown = { student: 0, faculty: 0, admin: 0 };

    results.forEach(item => {
      const date = item._id.date;
      if (!dailyTrends[date]) {
        dailyTrends[date] = { date, logins: 0, logouts: 0, student: 0, faculty: 0, admin: 0 };
      }
      
      if (item._id.action === 'USER_LOGIN') {
        dailyTrends[date].logins += item.count;
        if (item._id.role) {
          dailyTrends[date][item._id.role] += item.count;
          roleBreakdown[item._id.role] += item.count;
        }
      } else {
        dailyTrends[date].logouts += item.count;
      }
    });

    // Peak hours analysis
    const peakHours = await AuditLog.aggregate([
      { $match: { ...matchQuery, action: 'USER_LOGIN' } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Calculate summary
    const totalLogins = Object.values(dailyTrends).reduce((sum, day) => sum + day.logins, 0);
    const totalLogouts = Object.values(dailyTrends).reduce((sum, day) => sum + day.logouts, 0);

    res.json({
      dailyTrends: Object.values(dailyTrends),
      peakHours: peakHours.map(h => ({ hour: h._id, count: h.count })),
      roleBreakdown,
      summary: {
        totalLogins,
        totalLogouts,
        avgLoginsPerDay: Math.round(totalLogins / parseInt(days)),
        dateRange: { start: startDate, end: new Date() }
      }
    });
  } catch (error) {
    console.error('Login trends error:', error);
    res.status(500).json({ error: 'Failed to fetch login trends' });
  }
};

// 🆕 WEEKLY SUBMISSION TRENDS
export const getWeeklySubmissionTrends = async (req, res) => {
  try {
    const { weeks = 8 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (parseInt(weeks) * 7));

    const weeklyData = await Research.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'submitter'
        }
      },
      { $unwind: '$submitter' },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status',
            role: '$submitter.role',
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    // Transform data
    const weeklyMap = {};
    const categoryBreakdown = {};
    const roleBreakdown = { student: 0, faculty: 0 };

    weeklyData.forEach(item => {
      const weekKey = `${item._id.year}-W${item._id.week}`;
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          week: weekKey,
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          student: 0,
          faculty: 0
        };
      }

      weeklyMap[weekKey].total += item.count;
      weeklyMap[weekKey][item._id.status] += item.count;
      
      if (item._id.role === 'student' || item._id.role === 'faculty') {
        weeklyMap[weekKey][item._id.role] += item.count;
        roleBreakdown[item._id.role] += item.count;
      }

      // Category tracking
      if (item._id.category) {
        categoryBreakdown[item._id.category] = (categoryBreakdown[item._id.category] || 0) + item.count;
      }
    });

    const sortedWeeks = Object.values(weeklyMap).sort((a, b) => {
      const [aYear, aWeek] = a.week.split('-W').map(Number);
      const [bYear, bWeek] = b.week.split('-W').map(Number);
      return aYear === bYear ? aWeek - bWeek : aYear - bYear;
    });

    // Calculate week-over-week growth
    const thisWeek = sortedWeeks[sortedWeeks.length - 1]?.total || 0;
    const lastWeek = sortedWeeks[sortedWeeks.length - 2]?.total || 0;
    const growth = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : 0;

    res.json({
      weeklyData: sortedWeeks,
      categoryBreakdown,
      roleBreakdown,
      comparison: {
        thisWeek,
        lastWeek,
        growth: `${growth > 0 ? '+' : ''}${growth}%`,
        trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
      }
    });
  } catch (error) {
    console.error('Weekly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly trends' });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 500, action, startDate, endDate } = req.query;
    let query = {};

    if (action && action !== 'all') {
      query.action = { $regex: action, $options: 'i' };
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

export const getMyActivityLogs = async (req, res) => {
  try {
    const { limit = 500 } = req.query;

    const logs = await AuditLog.find({ user: req.user._id })
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('My logs error:', error);
    res.status(500).json({ error: 'Failed to fetch your activity logs' });
  }
};

export const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Activity log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
};

export const clearAllLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({});
    res.json({ 
      message: 'All activity logs cleared successfully', 
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Clear all logs error:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
};

export const clearMyLogs = async (req, res) => {
  try {
    const result = await AuditLog.deleteMany({ user: req.user._id });
    
    await AuditLog.create({
      user: req.user._id,
      action: 'MY_LOGS_CLEARED',
      resource: 'AuditLog',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { deletedCount: result.deletedCount }
    });
    
    res.json({ 
      message: 'Your activity logs cleared successfully', 
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Clear my logs error:', error);
    res.status(500).json({ error: 'Failed to clear your logs' });
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
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};