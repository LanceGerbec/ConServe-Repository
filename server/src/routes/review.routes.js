import express from 'express';
import { 
  submitReview, 
  getReviewsForResearch, 
  getMyReviews, 
  getPendingReviews,
  getReviewStats,
  deleteReview
} from '../controllers/reviewController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('faculty', 'admin'), submitReview);
router.get('/my-reviews', auth, authorize('faculty', 'admin'), getMyReviews);
router.get('/pending', auth, authorize('faculty', 'admin'), getPendingReviews);
router.get('/stats', auth, authorize('faculty', 'admin'), getReviewStats);
router.get('/:researchId', auth, getReviewsForResearch);
router.delete('/:reviewId', auth, deleteReview);

export default router;  