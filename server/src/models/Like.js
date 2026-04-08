import mongoose from 'mongoose';
const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  research: { type: mongoose.Schema.Types.ObjectId, ref: 'Research', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
likeSchema.index({ user: 1, research: 1 }, { unique: true });
export default mongoose.model('Like', likeSchema);