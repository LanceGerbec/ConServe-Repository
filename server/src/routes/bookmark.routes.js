import express from 'express';
import { toggleBookmark, getMyBookmarks, checkBookmark } from '../controllers/bookmarkController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-bookmarks', auth, getMyBookmarks);
router.get('/check/:researchId', auth, checkBookmark);
router.post('/toggle/:researchId', auth, toggleBookmark);

export default router;