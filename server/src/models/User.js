// server/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  studentId: { type: String, required: true },
  password: { type: String, required: true, minlength: 12 },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // 🆕 SOFT DELETE FIELDS
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  canUploadOnBehalf: { type: Boolean, default: false },
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
  if (this.passwordHistory.length >= 5) this.passwordHistory.shift();
  this.passwordHistory.push(this.password);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if locked
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
  const lockTime = 30 * 60 * 1000;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockoutUntil: Date.now() + lockTime };
  }
  return this.updateOne(updates);
};

// 🆕 SOFT DELETE METHOD
userSchema.methods.softDelete = async function(deletedByUserId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  this.isActive = false;
  return await this.save();
};

// 🆕 RESTORE METHOD
userSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.isActive = true;
  return await this.save();
};

// 🆕 INDEX - Allow same email if deleted
userSchema.index({ email: 1, isDeleted: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDeleted: false } 
});

userSchema.index({ role: 1, isApproved: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);