// ============================================
// FILE: server/src/controllers/researchController.js - UPDATED
// ============================================
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Helper: Upload to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'conserve-research',
        resource_type: 'raw',
        public_id: `research_${Date.now()}_${filename}`,
        format: 'pdf'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// Get all research papers
export const getAllResearch = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    // Only show approved papers to students
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

// Get single research paper
export const getResearchById = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName');

    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    // Check access
    if (paper.status !== 'approved' && req.user.role === 'student') {
      if (paper.submittedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Increment view count
    paper.views += 1;
    await paper.save();

    // Log view
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

// Submit new research with file upload
export const submitResearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const { title, authors, abstract, keywords, category, subjectArea } = req.body;

    // Validate required fields
    if (!title || !authors || !abstract || !category) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Parse authors and keywords
    const authorsList = typeof authors === 'string' ? JSON.parse(authors) : authors;
    const keywordsList = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;

    // Create research paper
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

    // Log submission
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
    console.error('Submit research error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit research' });
  }
};

// Update research status
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

// Delete research
export const deleteResearch = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ error: 'Research not found' });
    }

    // Delete from Cloudinary
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

// Get user's submissions
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

// Get stats
export const getResearchStats = async (req, res) => {
  try {
    const total = await Research.countDocuments();
    const pending = await Research.countDocuments({ status: 'pending' });
    const approved = await Research.countDocuments({ status: 'approved' });
    const rejected = await Research.countDocuments({ status: 'rejected' });

    const totalViews = await Research.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const recentSubmissions = await Research.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('submittedBy', 'firstName lastName');

    res.json({
      total,
      pending,
      approved,
      rejected,
      totalViews: totalViews[0]?.total || 0,
      recentSubmissions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};