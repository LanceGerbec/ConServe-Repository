import ValidStudentId from '../models/ValidStudentId.js';
import ValidFacultyId from '../models/ValidFacultyId.js';
import AuditLog from '../models/AuditLog.js';

// ✅ STRIP QUOTES HELPER
const cleanString = (str) => {
  if (!str) return '';
  return str.toString().replace(/^["']|["']$/g, '').trim();
};

export const bulkUploadStudentIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const item of ids) {
      try {
        const cleanId = cleanString(item.studentId);
        const cleanName = cleanString(item.fullName);
        
        if (!cleanId || !cleanName) {
          results.errors.push({ studentId: item.studentId, error: 'Missing required fields' });
          continue;
        }

        const existing = await ValidStudentId.findOne({ studentId: cleanId.toUpperCase() });
        if (existing) { results.skipped++; continue; }

        await ValidStudentId.create({
          studentId: cleanId.toUpperCase(),
          fullName: cleanName,
          addedBy: req.user._id,
          status: 'active'
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

export const bulkUploadFacultyIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const item of ids) {
      try {
        const cleanId = cleanString(item.facultyId);
        const cleanName = cleanString(item.fullName);
        
        if (!cleanId || !cleanName) {
          results.errors.push({ facultyId: item.facultyId, error: 'Missing required fields' });
          continue;
        }

        const existing = await ValidFacultyId.findOne({ facultyId: cleanId.toUpperCase() });
        if (existing) { results.skipped++; continue; }

        await ValidFacultyId.create({
          facultyId: cleanId.toUpperCase(),
          fullName: cleanName,
          addedBy: req.user._id,
          status: 'active'
        });
        results.added++;
      } catch (err) {
        results.errors.push({ facultyId: item.facultyId, error: err.message });
      }
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'BULK_FACULTY_IDS_UPLOADED',
      resource: 'ValidFacultyId',
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