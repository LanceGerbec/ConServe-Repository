// server/src/routes/research.routes.js
// CHANGES:
// 1. All delete endpoints now soft-delete (set isDeleted=true) instead of hard delete
// 2. New GET /recently-deleted endpoint
// 3. New PATCH /:id/restore endpoint
// 4. New DELETE /:id/permanent endpoint (hard delete)
// 5. New POST /:id/delete-with-password endpoint (verifies password then soft deletes)
// 6. All list/get queries now filter isDeleted: false
// 7. Added 'ret' role to authorize for status updates
import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import { getGridFSBucket } from '../config/gridfs.js';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import { notifyNewResearchSubmitted, notifyResearchStatusChange, notifyFacultyOfApprovedPaper } from '../utils/notificationService.js';
import { sendResearchSubmissionNotification, sendResearchApprovedNotification, sendResearchRevisionNotification, sendResearchRejectedNotification, sendFacultyApprovedPaperNotification } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ✅ CRITICAL: log-violation MUST BE BEFORE /:id
router.post('/log-violation', auth, async (req, res) => {
  try {
    const { researchId, violationType, researchTitle, severity, attemptCount } = req.body;
    if (!researchId) return res.status(400).json({ error: 'ResearchId required' });
    if (!violationType) return res.status(400).json({ error: 'ViolationType required' });
    const log = await AuditLog.create({
      user: req.user._id, action: 'PDF_PROTECTION_VIOLATION', resource: 'Research', resourceId: researchId,
      ipAddress: req.ip, userAgent: req.get('user-agent'),
      details: { violationType: violationType || 'Unknown', researchTitle: researchTitle || 'Unknown Paper', severity: severity || 'medium', attemptCount: attemptCount || 1, timestamp: new Date() }
    });
    res.json({ success: true, message: 'Violation logged', logId: log._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log violation' });
  }
});

// ✅ RECENTLY DELETED
router.get('/recently-deleted', auth, authorize('admin'), async (req, res) => {
  try {
    const papers = await Research.find({ isDeleted: true })
      .populate('submittedBy', 'firstName lastName email')
      .populate('deletedBy', 'firstName lastName')
      .sort({ deletedAt: -1 });
    res.json({ papers, count: papers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recently deleted' });
  }
});

// ✅ RESTORE
router.patch('/:id/restore', auth, authorize('admin'), async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, isDeleted: true });
    if (!research) return res.status(404).json({ error: 'Paper not found in deleted items' });
    research.isDeleted = false;
    research.deletedAt = null;
    research.deletedBy = null;
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_RESTORED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { title: research.title } });
    res.json({ message: 'Paper restored successfully', research });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore' });
  }
});

// ✅ PERMANENT DELETE (hard delete from recently deleted)
router.delete('/:id/permanent', auth, authorize('admin'), async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, isDeleted: true });
    if (!research) return res.status(404).json({ error: 'Paper not found in deleted items' });
    if (research.gridfsId) {
      try { const bucket = getGridFSBucket(); await bucket.delete(new mongoose.Types.ObjectId(research.gridfsId)); } catch {}
    }
    await research.deleteOne();
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_PERMANENTLY_DELETED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { title: research.title } });
    res.json({ message: 'Permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to permanently delete' });
  }
});

// ✅ DELETE WITH PASSWORD CONFIRMATION
router.post('/:id/delete-with-password', auth, authorize('admin'), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const user = await User.findById(req.user._id);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false });
    if (!research) return res.status(404).json({ error: 'Research not found' });
    research.isDeleted = true;
    research.deletedAt = new Date();
    research.deletedBy = req.user._id;
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_SOFT_DELETED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { title: research.title } });
    res.json({ message: 'Paper moved to recently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ✅ AUTHOR DELETE WITH PASSWORD CONFIRMATION
router.post('/:id/author-delete-with-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const user = await User.findById(req.user._id);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false });
    if (!research) return res.status(404).json({ error: 'Paper not found' });
    const isAuthor = research.submittedBy.toString() === req.user._id.toString();
    if (!isAuthor) return res.status(403).json({ error: 'Only author can delete' });
    if (research.status !== 'rejected') return res.status(400).json({ error: 'Only rejected papers can be deleted' });
    research.isDeleted = true;
    research.deletedAt = new Date();
    research.deletedBy = req.user._id;
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'REJECTED_RESEARCH_SOFT_DELETED_BY_AUTHOR', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { title: research.title } });
    res.json({ message: 'Paper moved to recently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

// ✅ EDIT RESEARCH
router.patch('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false }).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Research not found' });
    const isAuthor = research.submittedBy._id.toString() === req.user._id.toString();
    if (!isAuthor) return res.status(403).json({ error: 'Only the author can edit this research' });
    if (research.status !== 'pending' && research.status !== 'revision') return res.status(403).json({ error: `Cannot edit ${research.status} research` });
    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted } = req.body;
    if (title) research.title = title;
    if (authors) research.authors = JSON.parse(authors);
    if (abstract) research.abstract = abstract;
    if (keywords) research.keywords = JSON.parse(keywords);
    if (category) research.category = category;
    if (subjectArea) research.subjectArea = subjectArea;
    if (yearCompleted) research.yearCompleted = parseInt(yearCompleted);
    if (req.file) {
      const bucket = getGridFSBucket();
      if (research.gridfsId) { try { await bucket.delete(new mongoose.Types.ObjectId(research.gridfsId)); } catch {} }
      const uploadStream = bucket.openUploadStream(req.file.originalname, { contentType: 'application/pdf', metadata: { submittedBy: req.user._id, title: research.title, uploadDate: new Date() } });
      const readableStream = Readable.from(req.file.buffer);
      await new Promise((resolve, reject) => { readableStream.pipe(uploadStream); uploadStream.on('finish', resolve); uploadStream.on('error', reject); });
      research.gridfsId = uploadStream.id;
      research.fileName = req.file.originalname;
      research.fileSize = req.file.size;
      research.fileUrl = `/research/${uploadStream.id}/pdf`;
    }
    if (!research.versionHistory) research.versionHistory = [];
    research.versionHistory.push({ fileUrl: research.fileUrl, uploadedAt: new Date(), changes: 'Research edited by author' });
    const wasRevision = research.status === 'revision';
    if (wasRevision) { research.status = 'pending'; research.revisionNotes = ''; }
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_EDITED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { wasRevision, pdfReplaced: !!req.file } });
    res.json({ message: 'Research updated successfully', research });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update research' });
  }
});

// PDF STREAMING
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const paper = await Research.findOne({ _id: req.params.id, isDeleted: false }).populate('submittedBy');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) return res.status(403).json({ error: 'Access denied' });
    if (!paper.gridfsId) return res.status(404).json({ error: 'PDF not available' });
    if (paper.status === 'approved' && !isAuthor) await Research.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(paper.gridfsId));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline', 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0', 'Access-Control-Allow-Origin': '*' });
    downloadStream.on('error', (error) => { if (!res.headersSent) res.status(404).json({ error: 'PDF stream failed' }); });
    downloadStream.pipe(res);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: 'Failed to load PDF' });
  }
});

// STATS
router.get('/stats', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'ret';
    const base = isAdmin ? { isDeleted: false } : { status: 'approved', isDeleted: false };
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
    const papers = await Research.find({ submittedBy: req.user._id, isDeleted: false })
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
    const paper = await Research.findOne({ _id: req.params.id, isDeleted: false });
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
    const paper = await Research.findOne({ _id: req.params.id, isDeleted: false }).populate('submittedBy', 'firstName lastName email');
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    const isAuthor = paper.submittedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'ret';
    if (paper.status !== 'approved' && !isAuthor && !isAdmin) return res.status(403).json({ error: 'Access denied' });
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
    const isAdmin = req.user.role === 'admin' || req.user.role === 'ret';
    let query = isAdmin ? { isDeleted: false } : { status: 'approved', isDeleted: false };
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
    const papers = await Research.find(query).populate('submittedBy', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
    res.json({ papers, count: papers.length, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), hasMore: skip + papers.length < total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

// SUBMIT RESEARCH
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF required' });
    const { title, authors, abstract, keywords, category, subjectArea, yearCompleted, uploadOnBehalf, actualAuthors } = req.body;
    const canUploadOnBehalf = req.user.role === 'admin' || req.user.role === 'faculty' || req.user.canUploadOnBehalf;
    if (uploadOnBehalf === 'true' && !canUploadOnBehalf) return res.status(403).json({ error: 'No permission to upload on behalf' });
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, { contentType: 'application/pdf', metadata: { submittedBy: req.user._id, title, uploadDate: new Date() } });
    const readableStream = Readable.from(req.file.buffer);
    readableStream.pipe(uploadStream);
    uploadStream.on('finish', async () => {
      try {
        let authorNames = [];
        let isUploadedOnBehalf = false;
        let realAuthors = [];
        if (uploadOnBehalf === 'true' && actualAuthors) { isUploadedOnBehalf = true; realAuthors = JSON.parse(actualAuthors); authorNames = realAuthors; }
        else { authorNames = JSON.parse(authors); }
        const research = await Research.create({
          title, authors: authorNames, abstract, keywords: JSON.parse(keywords), category, subjectArea,
          yearCompleted: parseInt(yearCompleted), gridfsId: uploadStream.id, fileName: req.file.originalname,
          fileSize: req.file.size, fileUrl: `/research/${uploadStream.id}/pdf`, submittedBy: req.user._id,
          uploadedOnBehalf: isUploadedOnBehalf, actualAuthors: isUploadedOnBehalf ? realAuthors : [], status: 'pending', isDeleted: false
        });
        await AuditLog.create({ user: req.user._id, action: isUploadedOnBehalf ? 'RESEARCH_SUBMITTED_ON_BEHALF' : 'RESEARCH_SUBMITTED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
        await notifyNewResearchSubmitted(research);
        sendResearchSubmissionNotification(research, req.user).catch(() => {});
        res.status(201).json({ message: 'Research submitted', research });
      } catch (error) {
        res.status(500).json({ error: 'Failed to save' });
      }
    });
    uploadStream.on('error', () => res.status(500).json({ error: 'Upload failed' }));
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

// UPDATE STATUS — allow admin AND ret
router.patch('/:id/status', auth, authorize('admin', 'ret'), async (req, res) => {
  try {
    const { status, revisionNotes } = req.body;
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false }).populate('submittedBy');
    if (!research) return res.status(404).json({ error: 'Not found' });
    research.status = status;
    if (revisionNotes) research.revisionNotes = revisionNotes;
    if (status === 'approved') research.approvedDate = new Date();
    await research.save();
    await AuditLog.create({ user: req.user._id, action: `RESEARCH_${status.toUpperCase()}`, resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    await notifyResearchStatusChange(research, status, revisionNotes);
    if (status === 'approved') await notifyFacultyOfApprovedPaper(research);
    const author = research.submittedBy;
    if (status === 'approved') {
      sendResearchApprovedNotification(research, author).catch(() => {});
      sendFacultyApprovedPaperNotification(research).catch(() => {});
    } else if (status === 'revision') {
      sendResearchRevisionNotification(research, author, revisionNotes).catch(() => {});
    } else if (status === 'rejected') {
      sendResearchRejectedNotification(research, author, revisionNotes).catch(() => {});
    }
    res.json({ message: 'Status updated', research });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// DELETE (admin) — now soft delete WITH password confirmation
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false });
    if (!research) return res.status(404).json({ error: 'Not found' });
    research.isDeleted = true;
    research.deletedAt = new Date();
    research.deletedBy = req.user._id;
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'RESEARCH_SOFT_DELETED', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Paper moved to recently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// DELETE REJECTED PAPER (Author Only) — now soft delete with password
router.delete('/:id/author-delete', auth, async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, isDeleted: false });
    if (!research) return res.status(404).json({ error: 'Paper not found' });
    const isAuthor = research.submittedBy.toString() === req.user._id.toString();
    if (!isAuthor) return res.status(403).json({ error: 'Only author can delete' });
    if (research.status !== 'rejected') return res.status(400).json({ error: 'Only rejected papers can be deleted' });
    research.isDeleted = true;
    research.deletedAt = new Date();
    research.deletedBy = req.user._id;
    await research.save();
    await AuditLog.create({ user: req.user._id, action: 'REJECTED_RESEARCH_SOFT_DELETED_BY_AUTHOR', resource: 'Research', resourceId: research._id, ipAddress: req.ip, userAgent: req.get('user-agent'), details: { title: research.title } });
    res.json({ message: 'Paper moved to recently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

export default router;