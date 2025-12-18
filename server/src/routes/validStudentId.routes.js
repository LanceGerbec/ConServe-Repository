import express from 'express';
import ValidStudentId from '../models/ValidStudentId.js';
import AuditLog from '../models/AuditLog.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC route - check student ID validity
router.get('/check/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🔍 Checking student ID:', studentId);
    
    const validId = await ValidStudentId.findOne({ 
      studentId: studentId.toUpperCase(), 
      status: 'active' 
    });

    if (!validId) {
      return res.status(404).json({ valid: false, message: 'Invalid student ID' });
    }
    
    if (validId.isUsed) {
      return res.status(400).json({ valid: false, message: 'This student ID has already been registered' });
    }

    res.json({ 
      valid: true, 
      studentInfo: {
        fullName: validId.fullName,
        course: validId.course,
        yearLevel: validId.yearLevel
      }
    });
  } catch (error) {
    console.error('❌ Check student ID error:', error);
    res.status(500).json({ error: 'Failed to check student ID' });
  }
});

// ADMIN routes
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { studentId, fullName, course, yearLevel, email } = req.body;
    
    const existing = await ValidStudentId.findOne({ studentId: studentId.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    const validId = await ValidStudentId.create({
      studentId: studentId.toUpperCase(),
      fullName,
      course: course || '',
      yearLevel: yearLevel || '',
      email: email || '',
      addedBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'VALID_STUDENT_ID_ADDED',
      resource: 'ValidStudentId',
      resourceId: validId._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { studentId }
    });

    res.status(201).json({ message: 'Student ID added successfully', validId });
  } catch (error) {
    console.error('❌ Add student ID error:', error);
    res.status(500).json({ error: 'Failed to add student ID' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const validIds = await ValidStudentId.find(query)
      .populate('registeredUser', 'firstName lastName email')
      .populate('addedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ validIds, count: validIds.length });
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student IDs' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const validId = await ValidStudentId.findById(req.params.id);
    if (!validId) {
      return res.status(404).json({ error: 'Student ID not found' });
    }
    
    if (validId.isUsed) {
      return res.status(400).json({ error: 'Cannot delete: Student ID has already been used' });
    }

    await validId.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'VALID_STUDENT_ID_DELETED',
      resource: 'ValidStudentId',
      resourceId: validId._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { studentId: validId.studentId }
    });

    res.json({ message: 'Student ID deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete student ID' });
  }
});

export default router;