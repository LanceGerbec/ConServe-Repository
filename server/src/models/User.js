// ============================================
// FILE: server/src/models/User.js
// ============================================
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 12 },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
deletedAt: Date,
originalEmail: String,      // Store original before anonymizing
originalStudentId: String,  // Store original before anonymizing

  // 🆕 NEW FIELD
  canUploadOnBehalf: { type: Boolean, default: false }, // Special permission for students
  
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: Date,
  passwordHistory: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Add to password history
  if (this.passwordHistory.length >= 5) {
    this.passwordHistory.shift();
  }
  this.passwordHistory.push(this.password);
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockoutUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockoutUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1, isApproved: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
