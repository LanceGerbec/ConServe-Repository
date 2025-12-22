import mongoose from 'mongoose';

const validFacultyIdSchema = new mongoose.Schema({
  facultyId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true 
  },
  fullName: { type: String, required: true },
  department: String,
  position: String,
  email: String,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'retired'], 
    default: 'active' 
  },
  registeredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isUsed: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// REMOVE DUPLICATE INDEXES - Keep only one
validFacultyIdSchema.index({ facultyId: 1 }, { unique: true });

export default mongoose.model('ValidFacultyId', validFacultyIdSchema);