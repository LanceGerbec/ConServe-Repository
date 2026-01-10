// server/src/routes/research.routes.js
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { getGridFSBucket } from '../config/gridfs.js';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import { notifyNewResearchSubmitted, notifyResearchStatusChange, notifyFacultyOfApprovedPaper } from '../utils/notificationService.js';
import { sendResearchSubmissionNotification, sendResearchApprovedNotification, sendResearchRevisionNotification, sendResearchRejectedNotification } from '../utils/emailService.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ✅ CRITICAL: log-violation MUST BE BEFORE /:id
router.post('/log-violation', auth, async (req, res) => {
  try {
    const { researchId, violationType, researchTitle, severity, attemptCount } = req.body;
    
    console.log('🔴 [VIOLATION] Received:', {
      user: req.user.email,
      type: violationType,
      paper: researchTitle,
      severity: severity || 'medium'
    });
    
    const log = await AuditLog.create({
      user: req.user._id,
      action: 'PDF_PROTECTION_VIOLATION',
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { 
        violationType,
        researchTitle: researchTitle || 'Unknown',
        severity: severity || 'medium',
        attemptCount: attemptCount || 1,
        timestamp: new Date()
      }
    });
    
    console.log('✅ [VIOLATION] Saved:', log._id);
    res.json({ message: 'Violation logged', logId: log._id });
  } catch (error) {
    console.error('❌ [VIOLATION] Error:', error);
    res.status(500).json({ error: 'Failed to log violation' });
  }
});

// ✅ EDIT RESEARCH (must be before GET /:id)
router.patch('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const research = await Research.findById(req.params.id).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Research not found' });

    // Check authorization
    const isAuthor = research.submittedBy._id.toString() === req.user._id.toString();
    if (!isAuthor) return res.status(403).json({ error: 'Only the author can edit this research' });

    // Check if editable
    if (research.status !== 'pending' && research.status !== 'revision') {
      return res.status(403).json({ error: `Cannot edit ${research.status} research` });
    }

    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted } = req.body;

    // Update fields
    if (title) research.title = title;
    if (authors) research.authors = JSON.parse(authors);
    if (abstract) research.abstract = abstract;
    if (keywords) research.keywords = JSON.parse(keywords);
    if (category) research.category = category;
    if (subjectArea) research.subjectArea = subjectArea;
    if (yearCompleted) research.yearCompleted = parseInt(yearCompleted);

    // Handle PDF replacement
    if (req.file) {
      const bucket = getGridFSBucket();
      
      // Delete old PDF
      if (research.gridfsId) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(research.gridfsId));
        } catch (err) {
          console.error('Old PDF deletion error:', err);
        }
      }

      // Upload new PDF
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: 'application/pdf',
        metadata: { submittedBy: req.user._id, title: research.title, uploadDate: new Date() }
      });

      const readableStream = Readable.from(req.file.buffer);
      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream);
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      research.gridfsId = uploadStream.id;
      research.fileName = req.file.originalname;
      research.fileSize = req.file.size;
      research.fileUrl = `/research/${uploadStream.id}/pdf`;
    }

    // Save version to history
    if (!research.versionHistory) research.versionHistory = [];
    research.versionHistory.push({
      fileUrl: research.fileUrl,
      uploadedAt: new Date(),
      changes: 'Research edited by author'
    });

    // Change revision → pending
    const wasRevision = research.status === 'revision';
    if (wasRevision) {
      research.status = 'pending';
      research.revisionNotes = '';
    }

    await research.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_EDITED',
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { wasRevision, pdfReplaced: !!req.file }
    });

    res.json({ message: 'Research updated successfully', research });
  } catch (error) {
    console.error('Edit research error:', error);
    res.status(500).json({ error: 'Failed to update research' });
  }
});

// PDF STREAMING
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id).populate('submittedBy');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!paper.gridfsId) return res.status(404).json({ error: 'PDF not available' });

    if (paper.status === 'approved' && !isAuthor) {
      await Research.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(paper.gridfsId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });

    downloadStream.on('error', (error) => {
      console.error('❌ GridFS Error:', error);
      if (!res.headersSent) res.status(404).json({ error: 'PDF stream failed' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('❌ PDF Error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to load PDF' });
  }
});

// STATS
router.get('/stats', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const base = isAdmin ? {} : { status: 'approved' };
    const [total, pending, approved, rejected] = await Promise.all([
      Research.countDocuments(base),
      Research.countDocuments({ ...base, status: 'pending' }),
      Research.countDocuments({ ...base, status: 'approved' }),
      Research.countDocuments({ ...base, status: 'rejected' })
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// MY SUBMISSIONS
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const papers = await Research.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('title abstract authors status views yearCompleted subjectArea category keywords createdAt');
    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// CITATION
router.get('/:id/citation', auth, async (req, res) => {
  try {
    const { style = 'APA' } = req.query;
    const paper = await Research.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    
    const authors = paper.authors.join(', ');
    const year = paper.yearCompleted || new Date(paper.createdAt).getFullYear();
    const citations = {
      APA: `${authors} (${year}). ${paper.title}. NEUST College of Nursing Research Repository.`,
      MLA: `${authors}. "${paper.title}." NEUST College of Nursing Research Repository, ${year}.`,
      Chicago: `${authors}. "${paper.title}." NEUST College of Nursing Research Repository (${year}).`,
      Harvard: `${authors}, ${year}. ${paper.title}. NEUST College of Nursing Research Repository.`
    };
    res.json({ citation: citations[style] || citations.APA });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate citation' });
  }
});


// GET SINGLE
router.get('/:id', auth, async (req, res) => {
  try {
    const paper = await Research.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const paperObj = paper.toObject();
    paperObj.pdfUrl = `/research/${paper._id}/pdf`;
    
    res.json({ paper: paperObj });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// LIST
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, yearCompleted, subjectArea, author, search, page = 1, limit = 20 } = req.query;
    const isAdmin = req.user.role === 'admin';
    let query = isAdmin ? {} : { status: 'approved' };
    
    if (status && isAdmin) query.status = status;
    if (category) query.category = category;
    if (yearCompleted) query.yearCompleted = parseInt(yearCompleted);
    if (subjectArea) query.subjectArea = { $regex: subjectArea, $options: 'i' };
    if (author) query.authors = { $regex: author, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Research.countDocuments(query);
    
    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    res.json({ 
      papers, 
      count: papers.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + papers.length < total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

// ✅ SUBMIT RESEARCH
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF required' });
    
    const { 
      title, authors, abstract, keywords, category, subjectArea, yearCompleted,
      uploadOnBehalf, actualAuthors
    } = req.body;
    
    const canUploadOnBehalf = 
      req.user.role === 'admin' || 
      req.user.role === 'faculty' || 
      req.user.canUploadOnBehalf;
    
    if (uploadOnBehalf === 'true' && !canUploadOnBehalf) {
      return res.status(403).json({ error: 'No permission to upload on behalf' });
    }
    
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf',
      metadata: { submittedBy: req.user._id, title, uploadDate: new Date() }
    });

    const readableStream = Readable.from(req.file.buffer);
    readableStream.pipe(uploadStream);

    uploadStream.on('finish', async () => {
      try {
        let authorNames = [];
        let isUploadedOnBehalf = false;
        let realAuthors = [];
        
        if (uploadOnBehalf === 'true' && actualAuthors) {
          isUploadedOnBehalf = true;
          realAuthors = JSON.parse(actualAuthors);
          authorNames = realAuthors;
        } else {
          authorNames = JSON.parse(authors);
        }
        
        const research = await Research.create({
          title,
          authors: authorNames,
          abstract,
          keywords: JSON.parse(keywords),
          category,
          subjectArea,
          yearCompleted: parseInt(yearCompleted),
          gridfsId: uploadStream.id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileUrl: `/research/${uploadStream.id}/pdf`,
          submittedBy: req.user._id,
          uploadedOnBehalf: isUploadedOnBehalf,
          actualAuthors: isUploadedOnBehalf ? realAuthors : [],
          status: 'pending'
        });
        
        await AuditLog.create({
          user: req.user._id,
          action: isUploadedOnBehalf ? 'RESEARCH_SUBMITTED_ON_BEHALF' : 'RESEARCH_SUBMITTED',
          resource: 'Research',
          resourceId: research._id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          details: { uploadedOnBehalf: isUploadedOnBehalf, actualAuthors: isUploadedOnBehalf ? realAuthors : null }
        });
        
        // In-app notification
        await notifyNewResearchSubmitted(research);
        
        // ✅ EMAIL NOTIFICATION (won't block response)
        sendResearchSubmissionNotification(research, req.user)
          .then(result => console.log('✓ Admin emails:', result.success ? 'sent' : 'failed'))
          .catch(err => console.error('✗ Email error:', err.message));
        
        res.status(201).json({ message: 'Research submitted', research });
      } catch (error) {
        console.error('Research creation error:', error);
        res.status(500).json({ error: 'Failed to save' });
      }
    });

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// ✅ UPDATE STATUS
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    const research = await Research.findById(req.params.id).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Not found' });
    
    research.status = status;
    if (revisionNotes) research.revisionNotes = revisionNotes;
    if (status === 'approved') research.approvedDate = new Date();
    await research.save();
    
    await AuditLog.create({
      user: req.user._id,
      action: `RESEARCH_${status.toUpperCase()}`,
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // In-app notification to author
    await notifyResearchStatusChange(research, status, revisionNotes);
    
    // ✅ NEW: Notify faculty ONLY when approved
    if (status === 'approved') {
      await notifyFacultyOfApprovedPaper(research);
    }
    
   // ✅ EMAIL NOTIFICATIONS (won't block)
const author = research.submittedBy;

if (status === 'approved') {
  sendResearchApprovedNotification(research, author)
    .then(r => console.log('✓ Approval email:', r.success ? 'sent' : 'failed'))
    .catch(e => console.error('✗ Email error:', e.message));

  sendFacultyApprovedPaperNotification(research)
    .then(r => console.log('✓ Faculty notification email:', r.success ? 'sent' : 'failed'))
    .catch(e => console.error('✗ Faculty email error:', e.message));

} else if (status === 'revision') {
  sendResearchRevisionNotification(research, author, revisionNotes)
    .then(r => console.log('✓ Revision email:', r.success ? 'sent' : 'failed'))
    .catch(e => console.error('✗ Email error:', e.message));

} else if (status === 'rejected') {
  sendResearchRejectedNotification(research, author, revisionNotes)
    .then(r => console.log('✓ Rejection email:', r.success ? 'sent' : 'failed'))
    .catch(e => console.error('✗ Email error:', e.message));
}

      

    
    res.json({ message: 'Status updated', research });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// DELETE
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ error: 'Not found' });

    if (research.gridfsId) {
      const bucket = getGridFSBucket();
      await bucket.delete(new mongoose.Types.ObjectId(research.gridfsId));
    }

    await research.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESEARCH_DELETED',
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// DELETE REJECTED PAPER (Author Only)
router.delete('/:id/author-delete', auth, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ error: 'Paper not found' });

    const isAuthor = research.submittedBy.toString() === req.user._id.toString();
    if (!isAuthor) return res.status(403).json({ error: 'Only author can delete' });
    if (research.status !== 'rejected') return res.status(400).json({ error: 'Only rejected papers can be deleted' });

    if (research.gridfsId) {
      const bucket = getGridFSBucket();
      await bucket.delete(new mongoose.Types.ObjectId(research.gridfsId));
    }

    await research.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'REJECTED_RESEARCH_DELETED_BY_AUTHOR',
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { title: research.title }
    });

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete rejected paper error:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

export default router;