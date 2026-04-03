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
    const { siteName, siteDescription, theme, features, email, security } = req.body;
    const s = await getOrCreate();
    if (siteName) s.siteName = siteName;
    if (siteDescription) s.siteDescription = siteDescription;
    if (theme) s.theme = { ...s.theme, ...theme };
    if (features) s.features = { ...s.features, ...features };
    if (email) s.email = { ...s.email, ...email };
    if (security) s.security = { ...s.security, ...security };
    s.updatedBy = req.user._id;
    s.updatedAt = new Date();
    await s.save();
    await AuditLog.create({ user: req.user._id, action: 'SETTINGS_UPDATED', resource: 'Settings', ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Settings updated', settings: s });
  } catch { res.status(500).json({ error: 'Failed to update settings' }); }
};

// ── Profile name update (any logged-in user) ──
export const updateProfileName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    if (!firstName?.trim() || !lastName?.trim())
      return res.status(400).json({ error: 'First and last name are required' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName: firstName.trim(), lastName: lastName.trim() },
      { new: true }
    ).select('-password -passwordHistory');
    await AuditLog.create({ user: req.user._id, action: 'PROFILE_NAME_UPDATED', resource: 'User', resourceId: req.user._id, ipAddress: req.ip, userAgent: req.get('user-agent') });
    res.json({ message: 'Profile updated', user });
  } catch { res.status(500).json({ error: 'Failed to update profile' }); }
};

const makeLogoUploader = (key, folder, label, transformation) => async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const s = await getOrCreate();
    if (s.logos?.[key]?.cloudinaryId) {
      try { await cloudinary.uploader.destroy(s.logos[key].cloudinaryId); } catch {}
    }
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