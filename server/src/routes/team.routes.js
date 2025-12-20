import express from 'express';
import { getAllTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController.js';
import { auth, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllTeamMembers);
router.post('/', auth, authorize('admin'), upload.single('image'), addTeamMember);
router.patch('/:id', auth, authorize('admin'), upload.single('image'), updateTeamMember);
router.delete('/:id', auth, authorize('admin'), deleteTeamMember);

export default router;