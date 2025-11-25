// ============================================
// FILE: server/src/models/Review.js
// ============================================
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  research: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Research', 
    required: true 
  },
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  decision: { 
    type: String, 
    enum: ['approved', 'rejected', 'revision'], 
    required: true 
  },
  comments: { type: String, required: true },
  ratings: {
    methodology: { type: Number, min: 1, max: 5 },
    clarity: { type: Number, min: 1, max: 5 },
    contribution: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 }
  },
  revisionRequested: { type: Boolean, default: false },
  revisionDeadline: Date,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);