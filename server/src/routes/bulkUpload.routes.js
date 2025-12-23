import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { bulkUploadStudentIds, bulkUploadFacultyIds } from '../controllers/bulkUploadController.js';

const router = express.Router();

router.post('/students', auth, authorize('admin'), bulkUploadStudentIds);
router.post('/faculty', auth, authorize('admin'), bulkUploadFacultyIds);

export default router;