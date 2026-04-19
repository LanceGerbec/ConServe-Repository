// server/src/controllers/authorProfileController.js
import User from '../models/User.js';
import Research from '../models/Research.js';
import GhostAuthor from '../models/GhostAuthor.js';
import Follow from '../models/Follow.js';
import AuditLog from '../models/AuditLog.js';

const upsertGhostAuthor = async (name, paperId) => {
  const normalized = name.toLowerCase().trim();
  let ghost = await GhostAuthor.findOne({ normalizedName: normalized });
  if (!ghost) {
    ghost = await GhostAuthor.create({ name: name.trim(), normalizedName: normalized, papers: [paperId] });
  } else if (!ghost.papers.map(String).includes(paperId.toString())) {
    ghost.papers.push(paperId);
    await ghost.save();
  }
  return ghost;
};

export const resolveAuthorLinks = async (authorNames, paperId, submitterId) => {
  const links = [];
  for (const name of authorNames) {
    const normalized = name.toLowerCase().trim();
    const parts = normalized.split(' ');
    const user = await User.findOne({
      isDeleted: false, isApproved: true,
      $expr: { $eq: [{ $toLower: { $concat: ['$firstName', ' ', '$lastName'] } }, normalized] }
    }).select('_id').catch(() => null);
    if (user) {
      links.push({ name: name.trim(), userId: user._id, ghostId: null });
    } else {
      const ghost = await upsertGhostAuthor(name, paperId);
      links.push({ name: name.trim(), userId: null, ghostId: ghost._id });
    }
  }
  return links;
};

export const getAuthorProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const author = await User.findOne({ _id: userId, isDeleted: false, isApproved: true, isActive: true })
      .select('firstName lastName email studentId role avatar bio department position institution researchInterests website orcid createdAt');
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const papers = await Research.find({
      status: 'approved',
      $or: [{ submittedBy: userId }, { 'coAuthorLinks.userId': userId }]
    })
      .select('title abstract authors category subjectArea yearCompleted views likes bookmarks citations keywords awards createdAt coAuthorLinks submittedBy')
      .populate('submittedBy', 'firstName lastName')
      .sort({ views: -1 });

    const currentUserId = req.user?._id?.toString();
    const [followerCount, followingCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
      currentUserId && currentUserId !== userId
        ? Follow.findOne({ follower: currentUserId, following: userId }).then(f => !!f)
        : Promise.resolve(false)
    ]);

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

    await AuditLog.create({ user: req.user._id, action: 'AUTHOR_PROFILE_VIEWED', resource: 'User', resourceId: userId, ipAddress: req.ip, userAgent: req.get('user-agent') }).catch(() => {});
    res.json({ author, papers, stats: { totalPapers: papers.length, totalViews, totalLikes, totalCitations, totalBookmarks }, analytics: { subjectAreas, categories, yearlyData }, social: { followers: followerCount, following: followingCount, isFollowing } });
  } catch (error) {
    console.error('Author profile error:', error);
    res.status(500).json({ error: 'Failed to fetch author profile' });
  }
};

export const searchAuthors = async (req, res) => {
  try {
    const { q = '', role, limit = 18, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const submitterIds = await Research.distinct('submittedBy', { status: 'approved' });
    const coAuthorIds = await Research.distinct('coAuthorLinks.userId', { status: 'approved', 'coAuthorLinks.userId': { $ne: null } });
    const allIds = [...new Set([...submitterIds.map(String), ...coAuthorIds.filter(Boolean).map(String)])];

    let query = { _id: { $in: allIds }, isDeleted: false, isApproved: true, isActive: true, role: { $in: ['student', 'faculty'] } };
    if (role && ['student', 'faculty'].includes(role)) query.role = role;
    if (q.trim()) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
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
      const [paperCount, agg, followersCount] = await Promise.all([
        Research.countDocuments({ status: 'approved', $or: [{ submittedBy: author._id }, { 'coAuthorLinks.userId': author._id }] }),
        Research.aggregate([{ $match: { status: 'approved', $or: [{ submittedBy: author._id }, { 'coAuthorLinks.userId': author._id }] } }, { $group: { _id: null, views: { $sum: '$views' }, citations: { $sum: '$citations' } } }]),
        Follow.countDocuments({ following: author._id })
      ]);
      return { ...author.toObject(), paperCount, totalViews: agg[0]?.views || 0, totalCitations: agg[0]?.citations || 0, followers: followersCount };
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
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const suggestCoAuthors = async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim() || q.length < 2) return res.json({ suggestions: [] });
    const [users, ghosts] = await Promise.all([
      User.find({ isDeleted: false, isApproved: true, isActive: true, $or: [{ firstName: { $regex: q, $options: 'i' } }, { lastName: { $regex: q, $options: 'i' } }] }).select('firstName lastName avatar role department studentId').limit(8),
      GhostAuthor.find({ normalizedName: { $regex: q.toLowerCase(), $options: 'i' } }).select('name affiliation papers').limit(5)
    ]);
    const suggestions = [
      ...users.map(u => ({ type: 'user', id: u._id, name: `${u.firstName} ${u.lastName}`, role: u.role, avatar: u.avatar, department: u.department, studentId: u.studentId })),
      ...ghosts.map(g => ({ type: 'ghost', id: g._id, name: g.name, affiliation: g.affiliation, paperCount: g.papers?.length || 0 }))
    ];
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suggest co-authors' });
  }
};