import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { getGridFSBucket } from '../config/gridfs.js';
import { Readable } from 'stream';
import { generateCitation } from '../utils/citationGenerator.js';
import { generateSignedPdfUrl, verifySignedUrl } from '../utils/signedUrl.js';
import mongoose from 'mongoose';
import { notifyNewResearchSubmitted, notifyViewMilestone } from '../utils/notificationService.js';

export const submitResearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF required' });

    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted } = req.body;
    if (!title || !authors || !abstract || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf',
      metadata: { originalName: req.file.originalname }
    });

    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer).pipe(uploadStream).on('finish', resolve).on('error', reject);
    });

    const paper = await Research.create({
      title,
      authors: typeof authors === 'string' ? JSON.parse(authors) : authors,
      abstract,
      keywords: typeof keywords === 'string' ? JSON.parse(keywords) : keywords,
      category,
      subjectArea,
      yearCompleted: yearCompleted ? parseInt(yearCompleted) : undefined,
      submittedBy: req.user._id,
      fileUrl: `/api/research/file/${uploadStream.id}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      gridfsId: uploadStream.id,
      status: 'pending'
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_SUBMITTED',
      resource: 'Research',
      resourceId: paper._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const populatedPaper = await Research.findById(paper._id).populate('submittedBy', 'firstName lastName email');
    
    try {
      await notifyNewResearchSubmitted(populatedPaper);
    } catch (notifError) {
      console.error('⚠️ Notification failed:', notifError);
    }

    console.log('✅ Research uploaded:', uploadStream.id);
    res.status(201).json({ message: 'Research submitted successfully', paper });
  } catch (error) {
    console.error('❌ Submit error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllResearch = async (req, res) => {
  try {
    const { status, category, search, yearCompleted, subjectArea, author } = req.query;
    let query = {};

    if (req.user.role === 'student') query.status = 'approved';
    else if (status) query.status = status;
    
    if (category) query.category = category;
    if (yearCompleted) query.yearCompleted = parseInt(yearCompleted);
    if (subjectArea) query.subjectArea = { $regex: subjectArea, $options: 'i' };
    if (author) query.authors = { $regex: author, $options: 'i' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } }
      ];
    }

    const papers = await Research.find(query).populate('submittedBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

export const streamPDFWithToken = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { token } = req.query;

    if (!token) return res.status(401).json({ error: 'Token required' });

    let decoded;
    try {
      decoded = verifySignedUrl(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.fileId !== fileId) return res.status(403).json({ error: 'Token does not match file' });

    const bucket = getGridFSBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: 'File not found' });

    const file = files[0];
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': file.length,
      'Content-Disposition': 'inline; filename="protected.pdf"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    bucket.openDownloadStream(objectId).pipe(res);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

export const getResearchById = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'This research is not available.', status: paper.status });
    }

    const signedPdfUrl = generateSignedPdfUrl(paper.gridfsId.toString(), req.user._id.toString());
    const paperObj = paper.toObject();
    paperObj.signedPdfUrl = signedPdfUrl;

    if (paper.status === 'approved') {
      paper.views += 1;
      await paper.save();
      try {
        await notifyViewMilestone(paper, paper.views);
      } catch (e) { }
    }

    res.json({ paper: paperObj });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
};

export const updateResearchStatus = async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    const paper = await Research.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!paper) return res.status(404).json({ error: 'Not found' });

    paper.status = status;
    if (revisionNotes) paper.revisionNotes = revisionNotes;
    if (status === 'approved') paper.approvedDate = new Date();
    await paper.save();

    const { notifyResearchStatusChange, notifyFacultyOfApprovedPaper } = await import('../utils/notificationService.js');
    try {
      await notifyResearchStatusChange(paper, status, revisionNotes || '');
      if (status === 'approved') await notifyFacultyOfApprovedPaper(paper);
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.json({ message: `Research ${status}`, paper });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const deleteResearch = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Not found' });

    if (paper.gridfsId) {
      const bucket = getGridFSBucket();
      await bucket.delete(new mongoose.Types.ObjectId(paper.gridfsId));
    }

    await paper.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const papers = await Research.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

export const getResearchStats = async (req, res) => {
  try {
    const total = await Research.countDocuments();
    const pending = await Research.countDocuments({ status: 'pending' });
    const approved = await Research.countDocuments({ status: 'approved' });
    res.json({ total, pending, approved });
  } catch (error) {
    res.status(500).json({ error: 'Stats failed' });
  }
};

export const getCitation = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Not found' });
    const citation = generateCitation(paper, req.query.style || 'APA');
    res.json({ citation });
  } catch (error) {
    res.status(500).json({ error: 'Citation failed' });
  }
};

export const getRecentlyViewed = async (req, res) => {
  try {
    const papers = await Research.find({ status: 'approved' }).sort({ views: -1 }).limit(10);
    res.json({ papers });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const getTrendingPapers = async (req, res) => {
  try {
    const papers = await Research.find({ status: 'approved' }).sort({ views: -1 }).limit(10);
    res.json({ papers });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const logViolation = async (req, res) => {
  try {
    const { researchId, violationType } = req.body;
    if (!req.user || !researchId || !violationType) return res.status(400).json({ error: 'Missing required fields' });

    await AuditLog.create({
      user: req.user._id,
      action: `VIOLATION_${violationType.toUpperCase()}`,
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { violationType, timestamp: new Date(), userEmail: req.user.email || 'unknown' }
    });

    res.json({ message: 'Logged' });
  } catch (error) {
    res.status(200).json({ message: 'Logged with error', error: error.message });
  }
};