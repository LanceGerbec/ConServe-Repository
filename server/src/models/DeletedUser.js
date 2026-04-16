import mongoose from 'mongoose';

const deletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  firstName: String, lastName: String,
  email: String, studentId: String, role: String,
  isApproved: Boolean, isActive: Boolean,
  createdAt: Date, deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  reason: String,
  snapshot: mongoose.Schema.Types.Mixed // full user snapshot
}, { timestamps: false });

// TTL index: auto-delete after expiresAt
deletedUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
deletedUserSchema.index({ deletedAt: -1 });

export default mongoose.model('DeletedUser', deletedUserSchema);