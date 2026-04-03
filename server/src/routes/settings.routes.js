import express from 'express';
import {
  getSettings, updateSettings,
  uploadSchoolLogo, uploadCollegeLogo,
  uploadConserveLogo, uploadHeroBg,
  updateProfileName, uploadAvatar
} from '../controllers/settingsController.js';
import { auth, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/',                                                                  getSettings);
router.patch('/',               auth, authorize('admin'),                        updateSettings);
router.patch('/profile',        auth,                                            updateProfileName);
router.post('/avatar',          auth,              upload.single('avatar'),      uploadAvatar);
router.post('/logo/school',     auth, authorize('admin'), upload.single('logo'), uploadSchoolLogo);
router.post('/logo/college',    auth, authorize('admin'), upload.single('logo'), uploadCollegeLogo);
router.post('/logo/conserve',   auth, authorize('admin'), upload.single('logo'), uploadConserveLogo);
router.post('/hero-background', auth, authorize('admin'), upload.single('image'), uploadHeroBg);

export default router;