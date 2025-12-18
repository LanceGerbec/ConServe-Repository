import mongoose from 'mongoose';

const validStudentIdSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    uppercase: true 
  },
  fullName: { 
    type: String, 
    required: true 
  },
  course: String,
  yearLevel: String,
  email: String,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'graduated'], 
    default: 'active' 
  },
  registeredUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

validStudentIdSchema.index({ studentId: 1 });
validStudentIdSchema.index({ status: 1 });

export default mongoose.model('ValidStudentId', validStudentIdSchema);