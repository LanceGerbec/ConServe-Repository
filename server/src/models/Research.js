// ============================================
// FILE: server/src/models/Research.js
// ============================================
import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authors: [{ type: String, required: true }],
  abstract: { type: String, required: true },
  keywords: [String],
  category: { 
    type: String, 
    enum: ['Completed', 'Published'], 
    required: true 
  },
  subjectArea: String,
  fileUrl: { type: String, required: true },
  fileSize: Number,
  fileName: String,
gridfsId: mongoose.Schema.Types.ObjectId,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'revision'], 
    default: 'pending' 
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revisionNotes: String,
  awards: [String],
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

  // ADD these new fields to the schema:
  citationClicks: { type: Number, default: 0 }, // NEW: Track citation button clicks
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



// Indexes for search
researchSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
researchSchema.index({ status: 1, submittedBy: 1 });

export default mongoose.model('Research', researchSchema);