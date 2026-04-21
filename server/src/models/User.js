import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Progressive lockout durations in minutes: [1, 3, 5, 10, 30, 60, ...]
const LOCKOUT_STEPS = [1, 3, 5, 10, 30, 60];

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  studentId: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['student', 'faculty', 'admin', 'ret'], default: 'student' },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: null },
  avatarCloudinaryId: { type: String, default: null },
  bio: { type: String, default: '', maxlength: 500 },
  department: { type: String, default: '', maxlength: 100 },
  position: { type: String, default: '', maxlength: 100 },
  institution: { type: String, default: '', maxlength: 150 },
  researchInterests: { type: String, default: '', maxlength: 300 },
  website: { type: String, default: '', maxlength: 200 },
  orcid: { type: String, default: '', maxlength: 50 },
  isSuperAdmin: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  canUploadOnBehalf: { type: Boolean, default: false },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  lastLoginIp: String,
  lastLoginUserAgent: String,
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: Date,
  lockoutStep: { type: Number, default: 0 }, // tracks progressive step
  passwordHistory: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (this.passwordHistory.length >= 5) this.passwordHistory.shift();
  this.passwordHistory.push(this.password);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

userSchema.methods.getLockoutRemainingSeconds = function() {
  if (!this.lockoutUntil || this.lockoutUntil <= Date.now()) return 0;
  return Math.ceil((this.lockoutUntil - Date.now()) / 1000);
};

userSchema.methods.incLoginAttempts = async function() {
  // If previous lockout has expired, reset step but keep it as a warning
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    // After serving lockout, increment step for next failure
    const nextStep = Math.min((this.lockoutStep || 0) + 1, LOCKOUT_STEPS.length - 1);
    return this.updateOne({
      $set: { loginAttempts: 1, lockoutStep: nextStep },
      $unset: { lockoutUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const newAttempts = this.loginAttempts + 1;

  // Lock after first wrong attempt
  if (newAttempts >= 1) {
    const step = Math.min(this.lockoutStep || 0, LOCKOUT_STEPS.length - 1);
    const lockMinutes = LOCKOUT_STEPS[step];
    const lockMs = lockMinutes * 60 * 1000;
    updates.$set = {
      lockoutUntil: new Date(Date.now() + lockMs),
      lockoutStep: Math.min(step + 1, LOCKOUT_STEPS.length - 1)
    };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lockoutStep: 0 },
    $unset: { lockoutUntil: 1 }
  });
};

userSchema.methods.softDelete = async function(deletedByUserId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  this.isActive = false;
  return await this.save();
};

userSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.isActive = true;
  return await this.save();
};

userSchema.index({ email: 1, isDeleted: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
});
userSchema.index({ role: 1, isApproved: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 'text', lastName: 'text', department: 'text', researchInterests: 'text' });

export default mongoose.model('User', userSchema);