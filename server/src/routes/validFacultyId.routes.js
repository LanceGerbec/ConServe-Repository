import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

console.log('🔧 Loading Valid Faculty ID routes...');

// PUBLIC ROUTE - Check if faculty ID is valid
router.get('/check/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    console.log('🔍 Checking faculty ID:', facultyId);
    
    const validId = await ValidFacultyId.findOne({ 
      facultyId: facultyId.toUpperCase(), 
      status: 'active' 
    });

    if (!validId) {
      console.log('❌ Invalid faculty ID:', facultyId);
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid faculty ID. Please contact the administrator.' 
      });
    }
    
    if (validId.isUsed) {
      console.log('❌ Faculty ID already used:', facultyId);
      return res.status(400).json({ 
        valid: false, 
        message: 'This faculty ID has already been registered.' 
      });
    }

    console.log('✅ Valid faculty ID found:', facultyId);
    res.json({ 
      valid: true, 
      facultyInfo: {
        fullName: validId.fullName,
        department: validId.department,
        position: validId.position
      }
    });
  } catch (error) {
    console.error('❌ Check faculty ID error:', error);
    res.status(500).json({ error: 'Failed to check faculty ID' });
  }
});

// ADMIN ROUTES
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('📋 Fetching all valid faculty IDs');
    const { status, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { facultyId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const validIds = await ValidFacultyId.find(query)
      .populate('registeredUser', 'firstName lastName email')
      .populate('addedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${validIds.length} faculty IDs`);
    res.json({ validIds, count: validIds.length });
  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty IDs' });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('➕ Adding new faculty ID');
    const { facultyId, fullName, department, position, email } = req.body;
    
    if (!facultyId || !fullName) {
      return res.status(400).json({ error: 'Faculty ID and Full Name are required' });
    }

    const existing = await ValidFacultyId.findOne({ 
      facultyId: facultyId.toUpperCase() 
    });
    
    if (existing) {
      console.log('❌ Faculty ID already exists:', facultyId);
      return res.status(400).json({ error: 'Faculty ID already exists' });
    }

    const validId = await ValidFacultyId.create({
      facultyId: facultyId.toUpperCase(),
      fullName,
      department: department || '',
      position: position || '',
      email: email || '',
      addedBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'VALID_FACULTY_ID_ADDED',
      resource: 'ValidFacultyId',
      resourceId: validId._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { facultyId }
    });

    console.log('✅ Faculty ID added:', facultyId);
    res.status(201).json({ 
      message: 'Faculty ID added successfully', 
      validId 
    });
  } catch (error) {
    console.error('❌ Add faculty ID error:', error);
    res.status(500).json({ error: 'Failed to add faculty ID' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🗑️ Deleting faculty ID:', req.params.id);
    const validId = await ValidFacultyId.findById(req.params.id);
    
    if (!validId) {
      return res.status(404).json({ error: 'Faculty ID not found' });
    }
    
    if (validId.isUsed) {
      return res.status(400).json({ 
        error: 'Cannot delete: Faculty ID has already been used for registration' 
      });
    }

    await validId.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'VALID_FACULTY_ID_DELETED',
      resource: 'ValidFacultyId',
      resourceId: validId._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { facultyId: validId.facultyId }
    });

    console.log('✅ Faculty ID deleted:', validId.facultyId);
    res.json({ message: 'Faculty ID deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete faculty ID' });
  }
});

console.log('✅ Valid Faculty ID routes loaded successfully');

export default router;