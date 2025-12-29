import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// ✅ NEW: Clean orphaned IDs (IDs marked as used but user doesn't exist)
router.post('/clean-orphaned', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🧹 Cleaning orphaned Student IDs...');
    
    const allUsedIds = await ValidStudentId.find({ isUsed: true });
    let cleaned = 0;

    for (const validId of allUsedIds) {
      if (validId.registeredUser) {
        const userExists = await User.findById(validId.registeredUser);
        if (!userExists) {
          validId.isUsed = false;
          validId.registeredUser = null;
          await validId.save();
          cleaned++;
          console.log(`✅ Cleaned: ${validId.studentId}`);
        }
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'ORPHANED_STUDENT_IDS_CLEANED',
      resource: 'ValidStudentId',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { cleanedCount: cleaned }
    });

    res.json({ message: `Cleaned ${cleaned} orphaned Student IDs`, cleaned });
  } catch (error) {
    console.error('❌ Clean error:', error);
    res.status(500).json({ error: 'Failed to clean IDs' });
  }
});

// Existing routes...
router.get('/check/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const validId = await ValidStudentId.findOne({ studentId: studentId.toUpperCase(), status: 'active' });
    if (!validId) return res.status(404).json({ valid: false, message: 'Invalid student ID' });
    if (validId.isUsed) return res.status(400).json({ valid: false, message: 'Already registered' });
    res.json({ valid: true, studentInfo: { fullName: validId.fullName, course: validId.course, yearLevel: validId.yearLevel }});
  } catch (error) {
    res.status(500).json({ error: 'Failed to check' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ studentId: { $regex: search, $options: 'i' }}, { fullName: { $regex: search, $options: 'i' }}];
    const validIds = await ValidStudentId.find(query).populate('registeredUser', 'firstName lastName email').populate('addedBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, fullName, course, yearLevel, email } = req.body;
    if (!studentId || !fullName) return res.status(400).json({ error: 'Required fields missing' });
    const existing = await ValidStudentId.findOne({ studentId: studentId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Already exists' });

    const validId = await ValidStudentId.create({
      studentId: studentId.toUpperCase(), fullName, course: course || '', yearLevel: yearLevel || '', email: email || '', addedBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id, action: 'VALID_STUDENT_ID_ADDED', resource: 'ValidStudentId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { studentId }
    });

    res.status(201).json({ message: 'Added', validId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const validId = await ValidStudentId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Not found' });
    if (validId.isUsed) return res.status(400).json({ error: 'Cannot delete: Already used' });

    await validId.deleteOne();
    await AuditLog.create({
      user: req.user._id, action: 'VALID_STUDENT_ID_DELETED', resource: 'ValidStudentId', resourceId: validId._id,
      ipAddress: req.ip, userAgent: req.get('user-agent'), details: { studentId: validId.studentId }
    });

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;