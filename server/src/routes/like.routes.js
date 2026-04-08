import express from 'express';
import { toggleLike, checkLike, getMyLikes } from '../controllers/likeController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.get('/my-likes', auth, getMyLikes);
router.get('/check/:researchId', auth, checkLike);
router.post('/toggle/:researchId', auth, toggleLike);
export default router;