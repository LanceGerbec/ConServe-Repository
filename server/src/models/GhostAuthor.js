// server/src/models/GhostAuthor.js
// Represents co-authors who don't have a platform account
import mongoose from 'mongoose';

const ghostAuthorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  normalizedName: { type: String, required: true, lowercase: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  affiliation: { type: String, default: '' },
  papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Research' }],
  // If this ghost author later creates an account, link it
  linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

ghostAuthorSchema.index({ normalizedName: 1 });
ghostAuthorSchema.index({ linkedUser: 1 });

export default mongoose.model('GhostAuthor', ghostAuthorSchema);