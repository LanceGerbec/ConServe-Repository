import Settings from '../models/Settings.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import AuditLog from '../models/AuditLog.js';

const uploadToCloudinary = (buffer, folder, opts = {}) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: `conserve-logos/${folder}`, resource_type: 'image', format: 'png', ...opts },
    (err, result) => err ? reject(err) : resolve(result)
  );
  Readable.from(buffer).pipe(stream);
});

const getOrCreate = async () => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
};

export const getSettings = async (req, res) => {
  try { res.json({ settings: await getOrCreate() }); }
  catch { res.status(500).json({ error: 'Failed to fetch settings' }); }
};

export const updateSettings = async (req, res) => {
  try {
    const { siteName, siteDescription, theme, features, email, security, featuredPapers, homeStats } = req.body;
    const s = await getOrCreate();
    if (siteName) s.siteName = siteName;
    if (siteDescription) s.siteDescription = siteDescription;
    if (theme) s.theme = { ...s.theme, ...theme };
    if (features) s.features = { ...s.features, ...features };
    if (email) s.email = { ...s.email, ...email };
    if (security) s.security = { ...s.security, ...security };
    if (featuredPapers !== undefined) s.featuredPapers = featuredPapers;
    // NEW: Save home stats
    if (homeStats) s.homeStats = { ...((s.homeStats || {})), ...homeStats };
    s.updatedBy = req.user._id;
    s.updatedAt = new Date();
    await s.save();
    await AuditLog.create({ user: req.user._id, action: 'SETTINGS_UPDATED', resource: 'Settings', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Settings updated', settings: s });
  } catch { res.status(500).json({ error: 'Failed to update settings' }); }
};

export const updateProfileName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) return res.status(400).json({ error: 'First and last name are required' });
    const user = await User.findByIdAndUpdate(req.user._id, { firstName: firstName.trim(), lastName: lastName.trim() }, { new: true }).select('-password -passwordHistory');
    await AuditLog.create({ user: req.user._id, action: 'PROFILE_NAME_UPDATED', resource: 'User', resourceId: req.user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Profile updated', user });
  } catch { res.status(500).json({ error: 'Failed to update profile' }); }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    if (user.avatarCloudinaryId) { try { await cloudinary.uploader.destroy(user.avatarCloudinaryId); } catch {} }
    const result = await uploadToCloudinary(req.file.buffer, 'avatars', { transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }] });
    user.avatar = result.secure_url;
    user.avatarCloudinaryId = result.public_id;
    await user.save();
    await AuditLog.create({ user: req.user._id, action: 'AVATAR_UPLOADED', resource: 'User', resourceId: req.user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Avatar uploaded', avatar: result.secure_url });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Avatar upload failed' }); }
};

const makeLogoUploader = (key, folder, label, transformation) => async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const s = await getOrCreate();
    if (s.logos?.[key]?.cloudinaryId) { try { await cloudinary.uploader.destroy(s.logos[key].cloudinaryId); } catch {} }
    const result = await uploadToCloudinary(req.file.buffer, folder, { transformation });
    s.logos = s.logos || {};
    s.logos[key] = { url: result.secure_url, cloudinaryId: result.public_id, uploadedAt: new Date() };
    s.updatedBy = req.user._id;
    await s.save();
    await AuditLog.create({ user: req.user._id, action: 'LOGO_UPLOADED', resource: 'Settings', details: { logoType: key }, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: `${label} uploaded`, logo: s.logos[key] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Upload failed' }); }
};

export const uploadSchoolLogo   = makeLogoUploader('school',   'school',   'School logo',   [{ width: 200, height: 200, crop: 'limit' }]);
export const uploadCollegeLogo  = makeLogoUploader('college',  'college',  'College logo',  [{ width: 200, height: 200, crop: 'limit' }]);
export const uploadConserveLogo = makeLogoUploader('conserve', 'conserve', 'ConServe logo', [{ width: 200, height: 200, crop: 'limit' }]);
export const uploadHeroBg       = makeLogoUploader('heroBg',   'hero-bg',  'Hero background', [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }]);

export const addBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const s = await getOrCreate();
    const result = await uploadToCloudinary(req.file.buffer, 'banners', { transformation: [{ width: 1920, height: 600, crop: 'limit', quality: 'auto' }] });
    const banners = s.bannerImages || [];
    if (banners.length >= 8) return res.status(400).json({ error: 'Max 8 banners allowed' });
    banners.push({ url: result.secure_url, cloudinaryId: result.public_id, caption: req.body.caption || '', addedAt: new Date() });
    s.bannerImages = banners;
    s.updatedBy = req.user._id;
    await s.save();
    await AuditLog.create({ user: req.user._id, action: 'BANNER_IMAGE_ADDED', resource: 'Settings', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Banner added', bannerImages: banners });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Upload failed' }); }
};

export const deleteBannerImage = async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    const s = await getOrCreate();
    const banners = s.bannerImages || [];
    if (idx < 0 || idx >= banners.length) return res.status(404).json({ error: 'Banner not found' });
    const removed = banners[idx];
    if (removed.cloudinaryId) { try { await cloudinary.uploader.destroy(removed.cloudinaryId); } catch {} }
    banners.splice(idx, 1);
    s.bannerImages = banners;
    s.updatedBy = req.user._id;
    await s.save();
    await AuditLog.create({ user: req.user._id, action: 'BANNER_IMAGE_DELETED', resource: 'Settings', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Banner removed', bannerImages: banners });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Delete failed' }); }
};

// NEW: Upload home page section images (about / types)
export const addHomeImage = async (req, res) => {
  try {
    const { section, index } = req.params; // section = 'about' | 'types', index = 0|1|2
    if (!['about', 'types'].includes(section)) return res.status(400).json({ error: 'Invalid section' });
    const idx = parseInt(index);
    if (idx < 0 || idx > 2) return res.status(400).json({ error: 'Index must be 0-2' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const s = await getOrCreate();
    if (!s.homeImages) s.homeImages = { about: [], types: [] };
    if (!s.homeImages[section]) s.homeImages[section] = [];

    // Delete old cloudinary image if exists
    const existing = s.homeImages[section][idx];
    if (existing?.cloudinaryId) { try { await cloudinary.uploader.destroy(existing.cloudinaryId); } catch {} }

    const result = await uploadToCloudinary(req.file.buffer, `home-${section}`, {
      transformation: [{ width: 1200, height: 900, crop: 'fill', quality: 'auto' }]
    });

    s.homeImages[section][idx] = { url: result.secure_url, cloudinaryId: result.public_id, addedAt: new Date() };
    s.markModified('homeImages');
    s.updatedBy = req.user._id;
    await s.save();

    await AuditLog.create({ user: req.user._id, action: 'HOME_IMAGE_UPLOADED', resource: 'Settings', details: { section, index: idx }, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Home image updated', homeImages: s.homeImages });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Upload failed' }); }
};

export const deleteHomeImage = async (req, res) => {
  try {
    const { section, index } = req.params;
    if (!['about', 'types'].includes(section)) return res.status(400).json({ error: 'Invalid section' });
    const idx = parseInt(index);
    const s = await getOrCreate();
    if (!s.homeImages?.[section]?.[idx]) return res.status(404).json({ error: 'Image not found' });

    const img = s.homeImages[section][idx];
    if (img?.cloudinaryId) { try { await cloudinary.uploader.destroy(img.cloudinaryId); } catch {} }
    s.homeImages[section][idx] = null;
    s.markModified('homeImages');
    s.updatedBy = req.user._id;
    await s.save();

    res.json({ message: 'Home image deleted', homeImages: s.homeImages });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Delete failed' }); }
};