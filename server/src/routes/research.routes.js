import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import Research from '../models/Research.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import AuditLog from '../models/AuditLog.js';
import { notifyNewResearchSubmitted, notifyResearchStatusChange, notifyFacultyOfApprovedPaper } from '../utils/notificationService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// PDF ACCESS - With Enhanced Logging
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    console.log(`📄 PDF Request: ${req.params.id} from ${req.user.email}`);
    
    const paper = await Research.findById(req.params.id).populate('submittedBy');
    if (!paper) {
      console.log(`❌ Paper not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Paper not found' });
    }

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      console.log(`🚫 Access denied: ${req.user.email} tried to access ${paper.status} paper`);
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!paper.fileUrl) {
      console.log(`❌ No file URL for paper: ${req.params.id}`);
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Log view (non-authors only)
    if (paper.status === 'approved' && !isAuthor) {
      await Research.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      console.log(`👁️ View logged for: ${paper.title}`);
    }

    console.log(`✅ Redirecting to Cloudinary: ${paper.fileUrl}`);
    
    // Redirect to Cloudinary
    return res.redirect(paper.fileUrl);
  } catch (error) {
    console.error('❌ PDF Access Error:', error);
    return res.status(500).json({ error: 'Failed to load PDF' });
  }
});

// Legacy support
router.get('/file/:id', auth, (req, res) => {
  console.log(`🔄 Redirecting legacy /file/${req.params.id} to new endpoint`);
  res.redirect(`/api/research/${req.params.id}/pdf`);
});

// LOG VIOLATION - Enhanced
router.post('/log-violation', auth, async (req, res) => {
  try {
    const { researchId, violationType } = req.body;
    
    console.log(`🚨 Violation logged: ${violationType} by ${req.user.email} on research ${researchId}`);
    
    await AuditLog.create({
      user: req.user._id,
      action: 'PDF_PROTECTION_VIOLATION',
      resource: 'Research',
      resourceId: researchId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { violationType }
    });
    
    res.json({ message: 'Violation logged', success: true });
  } catch (error) {
    console.error('❌ Log Violation Error:', error);
    res.status(500).json({ error: 'Failed to log violation' });
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
    console.error('❌ Stats Error:', error);
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
    console.error('❌ My Submissions Error:', error);
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
    console.error('❌ Citation Error:', error);
    res.status(500).json({ error: 'Failed to generate citation' });
  }
});

// GET SINGLE RESEARCH
router.get('/:id', auth, async (req, res) => {
  try {
    console.log(`📖 Fetching research: ${req.params.id} for ${req.user.email}`);
    
    const paper = await Research.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!paper) {
      console.log(`❌ Paper not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Paper not found' });
    }

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      console.log(`🚫 Access denied: ${req.user.email} to ${paper.status} paper`);
      return res.status(403).json({ error: 'Access denied' });
    }

    const paperObj = paper.toObject();
    paperObj.pdfUrl = `/api/research/${paper._id}/pdf`;
    
    console.log(`✅ Returning research: ${paper.title}`);
    res.json({ paper: paperObj });
  } catch (error) {
    console.error('❌ Get Research Error:', error);
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// LIST RESEARCH
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, yearCompleted, subjectArea, author, search } = req.query;
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
    
    const papers = await Research.find(query)
      .populate('submittedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('❌ List Research Error:', error);
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

// SUBMIT RESEARCH
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log(`📤 Research submission from ${req.user.email}`);
    
    if (!req.file) {
      console.log(`❌ No file uploaded`);
      return res.status(400).json({ error: 'PDF required' });
    }
    
    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted } = req.body;
    
    console.log(`☁️ Uploading to Cloudinary: ${req.file.originalname}`);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'research-papers', resource_type: 'raw', format: 'pdf' },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }
        
        console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
        
        const research = await Research.create({
          title,
          authors: JSON.parse(authors),
          abstract,
          keywords: JSON.parse(keywords),
          category,
          subjectArea,
          yearCompleted: parseInt(yearCompleted),
          fileUrl: result.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          submittedBy: req.user._id,
          status: 'pending'
        });
        
        console.log(`✅ Research created: ${research._id}`);
        
        await AuditLog.create({
          user: req.user._id,
          action: 'RESEARCH_SUBMITTED',
          resource: 'Research',
          resourceId: research._id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
        
        await notifyNewResearchSubmitted(research);
        
        res.status(201).json({ message: 'Research submitted', research });
      }
    );
    
    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('❌ Submit Error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// UPDATE STATUS
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    
    console.log(`📝 Status update: ${req.params.id} to ${status} by ${req.user.email}`);
    
    const research = await Research.findById(req.params.id).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Not found' });
    
    research.status = status;
    if (revisionNotes) research.revisionNotes = revisionNotes;
    if (status === 'approved') research.approvedDate = new Date();
    await research.save();
    
    console.log(`✅ Status updated: ${research.title}`);
    
    await AuditLog.create({
      user: req.user._id,
      action: `RESEARCH_${status.toUpperCase()}`,
      resource: 'Research',
      resourceId: research._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    await notifyResearchStatusChange(research, status, revisionNotes);
    if (status === 'approved') await notifyFacultyOfApprovedPaper(research);
    
    res.json({ message: 'Status updated', research });
  } catch (error) {
    console.error('❌ Update Status Error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

export default router;