import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidStudentId from '../models/ValidStudentId.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

console.log('🔧 Loading Valid Student ID routes...');

// PUBLIC ROUTE - Check if student ID is valid (NO AUTH REQUIRED)
router.get('/check/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🔍 Checking student ID:', studentId);
    
    const validId = await ValidStudentId.findOne({ 
      studentId: studentId.toUpperCase(), 
      status: 'active' 
    });

    if (!validId) {
      console.log('❌ Invalid student ID:', studentId);
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid student ID. Please contact the administrator.' 
      });
    }
    
    if (validId.isUsed) {
      console.log('❌ Student ID already used:', studentId);
      return res.status(400).json({ 
        valid: false, 
        message: 'This student ID has already been registered.' 
      });
    }

    console.log('✅ Valid student ID found:', studentId);
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

// ADMIN ROUTES (AUTH REQUIRED)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('📋 Fetching all valid student IDs');
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

    console.log(`✅ Found ${validIds.length} student IDs`);
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student IDs' });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('➕ Adding new student ID');
    const { studentId, fullName, course, yearLevel, email } = req.body;
    
    if (!studentId || !fullName) {
      return res.status(400).json({ error: 'Student ID and Full Name are required' });
    }

    const existing = await ValidStudentId.findOne({ 
      studentId: studentId.toUpperCase() 
    });
    
    if (existing) {
      console.log('❌ Student ID already exists:', studentId);
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

    console.log('✅ Student ID added:', studentId);
    res.status(201).json({ 
      message: 'Student ID added successfully', 
      validId 
    });
  } catch (error) {
    console.error('❌ Add student ID error:', error);
    res.status(500).json({ error: 'Failed to add student ID' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🗑️ Deleting student ID:', req.params.id);
    const validId = await ValidStudentId.findById(req.params.id);
    
    if (!validId) {
      return res.status(404).json({ error: 'Student ID not found' });
    }
    
    if (validId.isUsed) {
      return res.status(400).json({ 
        error: 'Cannot delete: Student ID has already been used for registration' 
      });
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

    console.log('✅ Student ID deleted:', validId.studentId);
    res.json({ message: 'Student ID deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete student ID' });
  }
});

console.log('✅ Valid Student ID routes loaded successfully');

export default router;