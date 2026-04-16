// server/src/models/DeletedResearch.js
import mongoose from 'mongoose';

const deletedResearchSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  originalData: { type: mongoose.Schema.Types.Mixed, required: true },
  originalStatus: { type: String, default: 'pending' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date, default: Date.now },
  autoDeleteAt: { type: Date, required: true } // auto-purge after 30 days
}, { timestamps: true });

// TTL index: MongoDB auto-deletes docs when autoDeleteAt is reached
deletedResearchSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });
deletedResearchSchema.index({ deletedAt: -1 });
deletedResearchSchema.index({ deletedBy: 1 });

export default mongoose.model('DeletedResearch', deletedResearchSchema);