// server/src/models/Research.js
// CHANGE: Added isDeleted, deletedAt, deletedBy fields for soft delete / recently deleted
import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authors: [{ type: String, required: true }],
  coAuthors: [String],
  abstract: { type: String, required: true },
  keywords: [String],
  category: { type: String, enum: ['Completed', 'Published'], required: true },
  subjectArea: String,
  yearCompleted: { type: Number, min: 1900, max: 2100 },
  fileUrl: { type: String, required: true },
  fileSize: Number,
  fileName: String,
  gridfsId: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'revision'], default: 'pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedOnBehalf: { type: Boolean, default: false },
  actualAuthors: [String],
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revisionNotes: String,
  awards: [{
    name: { type: String, required: true },
    color: { type: String, default: 'gold' },
    addedAt: { type: Date, default: Date.now }
  }],
  publishedDate: Date,
  approvedDate: Date,
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  citations: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  versionHistory: [{ fileUrl: String, uploadedAt: { type: Date, default: Date.now }, changes: String }],
  metadata: { fileType: String, uploadedAt: { type: Date, default: Date.now }, lastModified: Date },
  citationClicks: { type: Number, default: 0 },
  analytics: {
    viewsByDate: [{ date: Date, count: Number }],
    citationsByStyle: { APA: { type: Number, default: 0 }, MLA: { type: Number, default: 0 }, Chicago: { type: Number, default: 0 }, Harvard: { type: Number, default: 0 } }
  },
  recentViews: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, viewedAt: { type: Date, default: Date.now } }],

  // SOFT DELETE FIELDS
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// TTL index: auto-hard-delete 30 days after soft delete
researchSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isDeleted: true } });

researchSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
researchSchema.index({ status: 1, submittedBy: 1 });
researchSchema.index({ yearCompleted: 1 });
researchSchema.index({ subjectArea: 1 });
researchSchema.index({ createdAt: -1 });
researchSchema.index({ views: -1 });
researchSchema.index({ authors: 1 });
researchSchema.index({ isDeleted: 1 });

export default mongoose.model('Research', researchSchema);