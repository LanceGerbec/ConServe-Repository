import express from 'express';
import {
  getSettings, updateSettings,
  uploadSchoolLogo, uploadCollegeLogo,
  uploadConserveLogo, uploadHeroBg,
  updateProfileName, uploadAvatar,
  addBannerImage, deleteBannerImage,
  addHomeImage, deleteHomeImage
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
router.post('/banners', auth, authorize('admin'), upload.single('image'), addBannerImage);
router.delete('/banners/:index', auth, authorize('admin'), deleteBannerImage);

// NEW: Home page section images (about: 0-2, types: 0-2)
router.post('/home-images/:section/:index', auth, authorize('admin'), upload.single('image'), addHomeImage);
router.delete('/home-images/:section/:index', auth, authorize('admin'), deleteHomeImage);

export default router;