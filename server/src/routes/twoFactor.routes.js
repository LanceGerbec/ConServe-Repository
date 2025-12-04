import express from 'express';
import { setup2FA, verify2FA, disable2FA } from '../controllers/twoFactorController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/setup', auth, setup2FA);
router.post('/verify', auth, verify2FA);
router.post('/disable', auth, disable2FA);

export default router;