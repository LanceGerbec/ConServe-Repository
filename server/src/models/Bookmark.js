import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  research: { type: mongoose.Schema.Types.ObjectId, ref: 'Research', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

bookmarkSchema.index({ user: 1, research: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);