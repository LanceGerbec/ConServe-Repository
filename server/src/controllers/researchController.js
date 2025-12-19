import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import { generateCitation } from '../utils/citationGenerator.js';

// FIXED: Upload PDF to Cloudinary with proper content-type for viewing
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'conserve-research',
        resource_type: 'auto', // CHANGED: Let Cloudinary detect the type
        public_id: `research_${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`,
        access_mode: 'public',
        type: 'upload',
        format: 'pdf', // ADDED: Force PDF format
        flags: 'attachment:false' // CRITICAL: Don't force download
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const submitResearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    console.log('📄 Uploading file:', req.file.originalname, 'Size:', req.file.size);

    const { title, authors, abstract, keywords, category, subjectArea } = req.body;

    if (!title || !authors || !abstract || !category) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    console.log('✅ File uploaded to Cloudinary:', uploadResult.secure_url);

    const authorsList = typeof authors === 'string' ? JSON.parse(authors) : authors;
    const keywordsList = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;

    const paper = await Research.create({
      title,
      authors: authorsList,
      abstract,
      keywords: keywordsList,
      category,
      subjectArea,
      submittedBy: req.user._id,
      fileUrl: uploadResult.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      cloudinaryId: uploadResult.public_id,
      status: 'pending'
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_SUBMITTED',
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { title }
    });

    res.status(201).json({ 
      message: 'Research submitted successfully. Awaiting admin approval.',
      paper 
    });
  } catch (error) {
    console.error('❌ Submit research error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit research' });
  }
};

export const getAllResearch = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ error: 'Failed to fetch research papers' });
  }
};

export const getResearchById = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName');

    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    if (paper.status !== 'approved' && req.user.role === 'student') {
      if (paper.submittedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    paper.views += 1;
    paper.recentViews = paper.recentViews || [];
    paper.recentViews = paper.recentViews.filter(
      v => v.user.toString() !== req.user._id.toString()
    );
    paper.recentViews.unshift({ user: req.user._id, viewedAt: new Date() });
    paper.recentViews = paper.recentViews.slice(0, 100);
    await paper.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_VIEWED',
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ paper });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ error: 'Failed to fetch research paper' });
  }
};

export const updateResearchStatus = async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    
    const paper = await Research.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Research not found' });
    }

    paper.status = status;
    if (revisionNotes) paper.revisionNotes = revisionNotes;
    if (status === 'approved') {
      paper.approvedDate = new Date();
      paper.reviewedBy = req.user._id;
    }
    
    await paper.save();

    await AuditLog.create({
      user: req.user._id,
      action: `RESEARCH_${status.toUpperCase()}`,
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: `Research ${status} successfully`, paper });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update research status' });
  }
};

export const deleteResearch = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ error: 'Research not found' });
    }

    if (paper.cloudinaryId) {
      await cloudinary.uploader.destroy(paper.cloudinaryId, { resource_type: 'raw' });
    }

    await paper.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_DELETED',
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { title: paper.title }
    });

    res.json({ message: 'Research deleted successfully' });
  } catch (error) {
    console.error('Delete research error:', error);
    res.status(500).json({ error: 'Failed to delete research' });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const papers = await Research.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

export const getResearchStats = async (req, res) => {
  try {
    const total = await Research.countDocuments();
    const pending = await Research.countDocuments({ status: 'pending' });
    const approved = await Research.countDocuments({ status: 'approved' });
    const rejected = await Research.countDocuments({ status: 'rejected' });

    const totalViews = await Research.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const totalCitations = await Research.aggregate([
      { $group: { _id: null, total: { $sum: '$citationClicks' } } }
    ]);

    const recentSubmissions = await Research.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('submittedBy', 'firstName lastName');

    const mostCited = await Research.find({ status: 'approved' })
      .sort({ citationClicks: -1 })
      .limit(5)
      .select('title authors citationClicks views');

    res.json({
      total,
      pending,
      approved,
      rejected,
      totalViews: totalViews[0]?.total || 0,
      totalCitations: totalCitations[0]?.total || 0,
      recentSubmissions,
      mostCited
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getCitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { style } = req.query;
    
    const paper = await Research.findById(id).populate('submittedBy', 'firstName lastName');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    paper.citationClicks += 1;
    if (paper.analytics && paper.analytics.citationsByStyle) {
      paper.analytics.citationsByStyle[style || 'APA'] += 1;
    }
    await paper.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'CITATION_GENERATED',
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { citationStyle: style || 'APA' }
    });

    const citation = generateCitation(paper, style || 'APA');
    res.json({ citation, style: style || 'APA' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate citation' });
  }
};

export const getRecentlyViewed = async (req, res) => {
  try {
    const papers = await Research.find({
      'recentViews.user': req.user._id,
      status: 'approved'
    })
    .sort({ 'recentViews.viewedAt': -1 })
    .limit(10)
    .populate('submittedBy', 'firstName lastName')
    .select('title authors abstract category createdAt views');

    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recently viewed' });
  }
};

export const getTrendingPapers = async (req, res) => {
  try {
    const papers = await Research.find({ status: 'approved' })
      .sort({ views: -1 })
      .limit(10)
      .populate('submittedBy', 'firstName lastName')
      .select('title authors abstract views bookmarks category');

    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending papers' });
  }
};