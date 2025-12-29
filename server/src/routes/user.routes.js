import express from 'express';
import {
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  updateUserRole,
  toggleUserStatus,
  getUserStats
} from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/stats', auth, authorize('admin'), getUserStats);
router.get('/:id', auth, authorize('admin'), getUserById);
router.patch('/:id/approve', auth, authorize('admin'), approveUser);
router.delete('/:id/reject', auth, authorize('admin'), rejectUser);
router.patch('/:id/role', auth, authorize('admin'), updateUserRole);
router.patch('/:id/toggle-status', auth, authorize('admin'), toggleUserStatus);

export default router;