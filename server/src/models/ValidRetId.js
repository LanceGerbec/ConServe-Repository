// server/src/models/ValidRetId.js
import mongoose from 'mongoose';

const validRetIdSchema = new mongoose.Schema({
  retId: { type: String, required: true, unique: true, trim: true, uppercase: true },
  fullName: { type: String, required: true },
  department: { type: String, default: 'Research, Extension and Training' },
  position: String,
  email: String,
  status: { type: String, enum: ['active', 'inactive', 'retired'], default: 'active' },
  registeredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isUsed: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

validRetIdSchema.index({ retId: 1 }, { unique: true });

export default mongoose.model('ValidRetId', validRetIdSchema);