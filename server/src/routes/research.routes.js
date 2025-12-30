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

// PDF DIRECT ACCESS - SIMPLIFIED (NO JWT TOKEN NEEDED)
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    console.log('📄 PDF Request for ID:', req.params.id);
    
    const paper = await Research.findById(req.params.id);
    if (!paper) {
      console.error('❌ Paper not found');
      return res.status(404).json({ error: 'Paper not found' });
    }

    // Check access permissions
    const isAuthor = paper.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      console.error('❌ Access denied');
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Access granted, redirecting to:', paper.fileUrl);
    
    // Log view
    if (paper.status === 'approved' && !isAuthor) {
      await Research.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      await AuditLog.create({
        user: req.user._id,
        action: 'PDF_VIEWED',
        resource: 'Research',
        resourceId: paper._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    // Redirect to Cloudinary URL
    res.redirect(paper.fileUrl);
  } catch (error) {
    console.error('❌ PDF access error:', error);
    res.status(500).json({ error: 'Failed to load PDF' });
  }
});

// Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const baseQuery = isAdmin ? {} : { status: 'approved' };
    const [total, pending, approved, rejected] = await Promise.all([
      Research.countDocuments(baseQuery),
      Research.countDocuments({ ...baseQuery, status: 'pending' }),
      Research.countDocuments({ ...baseQuery, status: 'approved' }),
      Research.countDocuments({ ...baseQuery, status: 'rejected' })
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// My submissions
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const papers = await Research.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('title abstract authors status views yearCompleted subjectArea category keywords createdAt');
    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Citation
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

// Get single research
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching paper:', req.params.id);
    
    const paper = await Research.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!paper) {
      console.error('❌ Paper not found');
      return res.status(404).json({ error: 'Paper not found' });
    }

    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) {
      console.error('❌ Access denied');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate simple PDF access URL (no JWT token)
    const pdfUrl = `/api/research/${paper._id}/pdf`;
    
    const paperObj = paper.toObject();
    paperObj.pdfUrl = pdfUrl; // Simple URL

    console.log('✅ Paper fetched successfully');
    console.log('📄 PDF URL:', pdfUrl);

    res.json({ paper: paperObj });
  } catch (error) {
    console.error('❌ Get paper error:', error);
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// List research
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
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

// Submit research
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted } = req.body;
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'research-papers',
        resource_type: 'raw',
        format: 'pdf',
        public_id: `paper_${Date.now()}`
      },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }
        
        console.log('✅ PDF uploaded to Cloudinary:', result.secure_url);
        
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
    console.error('❌ Submission error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Update status
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    const research = await Research.findById(req.params.id).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Research not found' });
    
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
    
    await notifyResearchStatusChange(research, status, revisionNotes);
    if (status === 'approved') await notifyFacultyOfApprovedPaper(research);
    
    res.json({ message: 'Status updated', research });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;