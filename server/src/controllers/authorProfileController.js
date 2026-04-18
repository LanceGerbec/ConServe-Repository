import User from '../models/User.js';
import Research from '../models/Research.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';

export const getAuthorProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const author = await User.findOne({ _id: userId, isDeleted: false, isApproved: true, isActive: true })
      .select('firstName lastName email studentId role avatar bio department position institution researchInterests website orcid createdAt');
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const papers = await Research.find({ submittedBy: userId, status: 'approved' })
      .select('title abstract authors category subjectArea yearCompleted views likes bookmarks citations keywords awards createdAt')
      .sort({ views: -1 });

    const totalViews = papers.reduce((s, p) => s + (p.views || 0), 0);
    const totalLikes = papers.reduce((s, p) => s + (p.likes || 0), 0);
    const totalCitations = papers.reduce((s, p) => s + (p.citations || 0), 0);
    const totalBookmarks = papers.reduce((s, p) => s + (p.bookmarks || 0), 0);

    const subjectAreas = [...new Set(papers.map(p => p.subjectArea).filter(Boolean))];
    const categories = papers.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const yearlyData = papers.reduce((acc, p) => {
      const yr = p.yearCompleted || new Date(p.createdAt).getFullYear();
      acc[yr] = (acc[yr] || 0) + 1; return acc;
    }, {});

    await AuditLog.create({
      user: req.user._id, action: 'AUTHOR_PROFILE_VIEWED',
      resource: 'User', resourceId: userId,
      ipAddress: req.ip, userAgent: req.get('user-agent')
    }).catch(() => {});

    res.json({
      author,
      papers,
      stats: { totalPapers: papers.length, totalViews, totalLikes, totalCitations, totalBookmarks },
      analytics: { subjectAreas, categories, yearlyData }
    });
  } catch (error) {
    console.error('Author profile error:', error);
    res.status(500).json({ error: 'Failed to fetch author profile' });
  }
};

export const searchAuthors = async (req, res) => {
  try {
    const { q = '', role, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = { isDeleted: false, isApproved: true, isActive: true, role: { $in: ['student', 'faculty'] } };
    if (role && ['student', 'faculty'].includes(role)) query.role = role;
    if (q.trim()) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { institution: { $regex: q, $options: 'i' } },
        { researchInterests: { $regex: q, $options: 'i' } }
      ];
    }
    const [authors, total] = await Promise.all([
      User.find(query).select('firstName lastName email studentId role avatar bio department institution researchInterests createdAt').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    const authorsWithStats = await Promise.all(authors.map(async (author) => {
      const paperCount = await Research.countDocuments({ submittedBy: author._id, status: 'approved' });
      const agg = await Research.aggregate([
        { $match: { submittedBy: author._id, status: 'approved' } },
        { $group: { _id: null, views: { $sum: '$views' }, citations: { $sum: '$citations' } } }
      ]);
      return { ...author.toObject(), paperCount, totalViews: agg[0]?.views || 0, totalCitations: agg[0]?.citations || 0 };
    }));

    res.json({ authors: authorsWithStats, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Search authors error:', error);
    res.status(500).json({ error: 'Failed to search authors' });
  }
};

export const updateExtendedProfile = async (req, res) => {
  try {
    const { bio, department, position, institution, researchInterests, website, orcid } = req.body;
    const allowed = {};
    if (bio !== undefined) allowed.bio = bio?.slice(0, 500);
    if (department !== undefined) allowed.department = department?.slice(0, 100);
    if (position !== undefined) allowed.position = position?.slice(0, 100);
    if (institution !== undefined) allowed.institution = institution?.slice(0, 150);
    if (researchInterests !== undefined) allowed.researchInterests = researchInterests?.slice(0, 300);
    if (website !== undefined) allowed.website = website?.slice(0, 200);
    if (orcid !== undefined) allowed.orcid = orcid?.slice(0, 50);

    const user = await User.findByIdAndUpdate(req.user._id, { $set: allowed }, { new: true }).select('-password -passwordHistory');
    await AuditLog.create({ user: req.user._id, action: 'EXTENDED_PROFILE_UPDATED', resource: 'User', resourceId: req.user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update extended profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};