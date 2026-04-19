// server/src/routes/authorProfile.routes.js
import express from 'express';
import { getAuthorProfile, searchAuthors, updateExtendedProfile, suggestCoAuthors } from '../controllers/authorProfileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/suggest-coauthors', auth, suggestCoAuthors);
router.get('/search', auth, searchAuthors);
router.patch('/me/extended', auth, updateExtendedProfile);
router.get('/:userId', auth, getAuthorProfile);

export default router;