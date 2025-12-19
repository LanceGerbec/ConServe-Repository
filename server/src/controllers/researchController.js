import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { getGridFSBucket } from '../config/gridfs.js';
import { Readable } from 'stream';
import { generateCitation } from '../utils/citationGenerator.js';
import mongoose from 'mongoose';

export const submitResearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF required' });

    const { title, authors, abstract, keywords, category, subjectArea } = req.body;
    if (!title || !authors || !abstract || !category) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf',
      metadata: { originalName: req.file.originalname }
    });

    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    const paper = await Research.create({
      title,
      authors: typeof authors === 'string' ? JSON.parse(authors) : authors,
      abstract,
      keywords: typeof keywords === 'string' ? JSON.parse(keywords) : keywords,
      category,
      subjectArea,
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

    console.log('✅ Uploaded:', uploadStream.id);
    res.status(201).json({ message: 'Success', paper });
  } catch (error) {
    console.error('❌ Submit error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const streamPDF = async (req, res) => {
  try {
    console.log('📄 Streaming PDF:', req.params.fileId);
    
    const bucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (error) => {
      console.error('❌ Stream error:', error);
      res.status(404).json({ error: 'File not found' });
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('❌ Stream PDF error:', error);
    res.status(500).json({ error: 'Stream failed' });
  }
};

export const getAllResearch = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (req.user.role === 'student') query.status = 'approved';
    else if (status) query.status = status;
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } }
      ];
    }

    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

export const getResearchById = async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email');

    if (!paper) return res.status(404).json({ error: 'Not found' });

    paper.views += 1;
    await paper.save();

    res.json({ paper });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

export const updateResearchStatus = async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    const paper = await Research.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Not found' });

    paper.status = status;
    if (revisionNotes) paper.revisionNotes = revisionNotes;
    if (status === 'approved') paper.approvedDate = new Date();
    await paper.save();

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