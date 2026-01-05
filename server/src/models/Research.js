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
  
  // 🆕 NEW FIELDS FOR "UPLOAD ON BEHALF"
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Account that uploaded
  uploadedOnBehalf: { type: Boolean, default: false }, // True if uploaded for someone else
  actualAuthors: [String], // Names of real authors (if they don't have accounts)
  
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
  versionHistory: [{
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now },
    changes: String
  }],
  metadata: {
    fileType: String,
    uploadedAt: { type: Date, default: Date.now },
    lastModified: Date
  },
  citationClicks: { type: Number, default: 0 },
  analytics: {
    viewsByDate: [{ date: Date, count: Number }],
    citationsByStyle: {
      APA: { type: Number, default: 0 },
      MLA: { type: Number, default: 0 },
      Chicago: { type: Number, default: 0 },
      Harvard: { type: Number, default: 0 }
    }
  },
  recentViews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

researchSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
researchSchema.index({ status: 1, submittedBy: 1 });
researchSchema.index({ yearCompleted: 1 });
researchSchema.index({ subjectArea: 1 });
researchSchema.index({ createdAt: -1 });
researchSchema.index({ views: -1 });
researchSchema.index({ authors: 1 });

export default mongoose.model('Research', researchSchema);