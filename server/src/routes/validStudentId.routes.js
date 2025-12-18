import express from 'express';
import {
  addStudentId,
  bulkUploadStudentIds,
  getAllValidStudentIds,
  deleteStudentId,
  updateStudentIdStatus,
  checkStudentId
} from '../controllers/validStudentIdController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/check/:studentId', checkStudentId);
router.post('/', auth, authorize('admin'), addStudentId);
router.post('/bulk', auth, authorize('admin'), bulkUploadStudentIds);
router.get('/', auth, authorize('admin'), getAllValidStudentIds);
router.delete('/:id', auth, authorize('admin'), deleteStudentId);
router.patch('/:id/status', auth, authorize('admin'), updateStudentIdStatus);

export default router;