import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'RESEARCH_APPROVED', 'RESEARCH_REJECTED', 'RESEARCH_REVISION',
      'NEW_RESEARCH_SUBMITTED', 'REVIEW_RECEIVED', 'ACCOUNT_APPROVED',
      'SYSTEM_UPDATE', 'NEW_USER_REGISTERED', 'RESEARCH_VIEWED',
      'BOOKMARK_MILESTONE', 'NEW_FOLLOWER', 'CO_AUTHOR_TAGGED',
      'RESEARCH_APPROVED_FOR_REVIEW',
      // Login / security notifications
      'LOGIN_SUCCESS', 'LOGIN_FAILED'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  relatedResearch: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Notification', notificationSchema);