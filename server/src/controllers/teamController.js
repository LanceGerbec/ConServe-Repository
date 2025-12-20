import TeamMember from '../models/TeamMember.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import AuditLog from '../models/AuditLog.js';

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'conserve-team', resource_type: 'image', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
      (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1 });
    res.json({ members, count: members.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const { name, role, order } = req.body;
    let imageData = {};

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      imageData = { imageUrl: result.secure_url, cloudinaryId: result.public_id };
    }

    const member = await TeamMember.create({ name, role, order: order || 0, ...imageData });

    await AuditLog.create({
      user: req.user._id,
      action: 'TEAM_MEMBER_ADDED',
      resource: 'TeamMember',
      resourceId: member._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ message: 'Team member added', member });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { name, role, order } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (req.file) {
      if (member.cloudinaryId) await cloudinary.uploader.destroy(member.cloudinaryId);
      const result = await uploadImage(req.file.buffer);
      member.imageUrl = result.secure_url;
      member.cloudinaryId = result.public_id;
    }

    if (name) member.name = name;
    if (role) member.role = role;
    if (order !== undefined) member.order = order;
    await member.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'TEAM_MEMBER_UPDATED',
      resource: 'TeamMember',
      resourceId: member._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Team member updated', member });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (member.cloudinaryId) await cloudinary.uploader.destroy(member.cloudinaryId);
    await member.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'TEAM_MEMBER_DELETED',
      resource: 'TeamMember',
      resourceId: member._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
};