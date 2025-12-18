import ValidStudentId from '../models/ValidStudentId.js';
import AuditLog from '../models/AuditLog.js';

export const addStudentId = async (req, res) => {
  try {
    const { studentId, fullName, course, yearLevel, email } = req.body;
    const existing = await ValidStudentId.findOne({ studentId: studentId.toUpperCase() });
    if (existing) return res.status(400).json({ error: 'Student ID already exists' });

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

    res.status(201).json({ message: 'Student ID added', validId });
  } catch (error) {
    console.error('Add student ID error:', error);
    res.status(500).json({ error: 'Failed to add student ID' });
  }
};

export const bulkUploadStudentIds = async (req, res) => {
  try {
    const { studentIds } = req.body;
    const results = { added: 0, skipped: 0, errors: [] };

    for (const item of studentIds) {
      try {
        const existing = await ValidStudentId.findOne({ studentId: item.studentId.toUpperCase() });
        if (existing) { results.skipped++; continue; }

        await ValidStudentId.create({
          studentId: item.studentId.toUpperCase(),
          fullName: item.fullName,
          course: item.course || '',
          yearLevel: item.yearLevel || '',
          email: item.email || '',
          addedBy: req.user._id
        });
        results.added++;
      } catch (err) {
        results.errors.push({ studentId: item.studentId, error: err.message });
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'BULK_STUDENT_IDS_UPLOADED',
      resource: 'ValidStudentId',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: results
    });

    res.json({ message: 'Bulk upload completed', results });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Bulk upload failed' });
  }
};

export const getAllValidStudentIds = async (req, res) => {
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
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student IDs' });
  }
};

export const deleteStudentId = async (req, res) => {
  try {
    const validId = await ValidStudentId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Student ID not found' });
    if (validId.isUsed) return res.status(400).json({ error: 'Cannot delete: Already used' });

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

    res.json({ message: 'Student ID deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete student ID' });
  }
};

export const updateStudentIdStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validId = await ValidStudentId.findById(req.params.id);
    if (!validId) return res.status(404).json({ error: 'Student ID not found' });

    validId.status = status;
    await validId.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'STUDENT_ID_STATUS_UPDATED',
      resource: 'ValidStudentId',
      resourceId: validId._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { studentId: validId.studentId, newStatus: status }
    });

    res.json({ message: 'Status updated', validId });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const checkStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const validId = await ValidStudentId.findOne({ 
      studentId: studentId.toUpperCase(), 
      status: 'active' 
    });

    if (!validId) return res.status(404).json({ valid: false, message: 'Invalid student ID' });
    if (validId.isUsed) return res.status(400).json({ valid: false, message: 'Already registered' });

    res.json({ 
      valid: true, 
      studentInfo: {
        fullName: validId.fullName,
        course: validId.course,
        yearLevel: validId.yearLevel
      }
    });
  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({ error: 'Failed to check student ID' });
  }
};