import express from 'express';
import { getAuthorProfile, searchAuthors, updateExtendedProfile } from '../controllers/authorProfileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', auth, searchAuthors);
router.get('/:userId', auth, getAuthorProfile);
router.patch('/me/extended', auth, updateExtendedProfile);

export default router;