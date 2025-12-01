import Settings from '../models/Settings.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import AuditLog from '../models/AuditLog.js';

const uploadLogo = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `conserve-logos/${folder}`,
        resource_type: 'image',
        format: 'png',
        transformation: [{ width: 200, height: 200, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { siteName, siteDescription, theme, features, email, security } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (siteName) settings.siteName = siteName;
    if (siteDescription) settings.siteDescription = siteDescription;
    if (theme) settings.theme = { ...settings.theme, ...theme };
    if (features) settings.features = { ...settings.features, ...features };
    if (email) settings.email = { ...settings.email, ...email };
    if (security) settings.security = { ...settings.security, ...security };

    settings.updatedBy = req.user._id;
    settings.updatedAt = new Date();
    await settings.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'SETTINGS_UPDATED',
      resource: 'Settings',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const uploadSchoolLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadLogo(req.file.buffer, 'school');
    
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    if (settings.logos?.school?.cloudinaryId) {
      await cloudinary.uploader.destroy(settings.logos.school.cloudinaryId);
    }

    settings.logos = settings.logos || {};
    settings.logos.school = {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date()
    };
    settings.updatedBy = req.user._id;
    await settings.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'LOGO_UPLOADED',
      resource: 'Settings',
      details: { logoType: 'school' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'School logo uploaded', logo: settings.logos.school });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const uploadCollegeLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadLogo(req.file.buffer, 'college');
    
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    if (settings.logos?.college?.cloudinaryId) {
      await cloudinary.uploader.destroy(settings.logos.college.cloudinaryId);
    }

    settings.logos = settings.logos || {};
    settings.logos.college = {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date()
    };
    settings.updatedBy = req.user._id;
    await settings.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'LOGO_UPLOADED',
      resource: 'Settings',
      details: { logoType: 'college' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'College logo uploaded', logo: settings.logos.college });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const uploadConserveLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadLogo(req.file.buffer, 'conserve');
    
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    if (settings.logos?.conserve?.cloudinaryId) {
      await cloudinary.uploader.destroy(settings.logos.conserve.cloudinaryId);
    }

    settings.logos = settings.logos || {};
    settings.logos.conserve = {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date()
    };
    settings.updatedBy = req.user._id;
    await settings.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'LOGO_UPLOADED',
      resource: 'Settings',
      details: { logoType: 'conserve' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'ConServe logo uploaded', logo: settings.logos.conserve });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
};