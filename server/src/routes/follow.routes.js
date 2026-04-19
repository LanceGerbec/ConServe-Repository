// server/src/routes/follow.routes.js
import express from 'express';
import { toggleFollow, getFollowStatus, getFollowers, getFollowing, getFollowStats } from '../controllers/followController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.post('/toggle/:userId', auth, toggleFollow);
router.get('/status/:userId', auth, getFollowStatus);
router.get('/followers/:userId', auth, getFollowers);
router.get('/following/:userId', auth, getFollowing);
router.get('/stats/:userId', auth, getFollowStats);
export default router;