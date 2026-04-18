import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
dotenv.config();

const createRET = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 60000 });
    console.log('✅ MongoDB Connected');
    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String, lastName: String, email: String, studentId: String,
      password: String, role: String, isApproved: Boolean, isActive: Boolean,
      isDeleted: Boolean, canUploadOnBehalf: Boolean, twoFactorEnabled: Boolean,
      loginAttempts: Number, passwordHistory: [String], createdAt: Date, updatedAt: Date
    }));
    const email = 'ret.neust2026@gmail.com';
    const password = 'RET@ConServe2026!';
    const existing = await User.findOne({ email });
    if (existing) { console.log('⚠️ Deleting existing RET...'); await User.deleteOne({ email }); }
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    const ret = await User.create({
      firstName: 'RET', lastName: 'Department', email, studentId: 'RET-DEPT-2026',
      password: hashed, role: 'ret', isApproved: true, isActive: true, isDeleted: false,
      canUploadOnBehalf: true, twoFactorEnabled: false, loginAttempts: 0,
      passwordHistory: [hashed], createdAt: new Date(), updatedAt: new Date()
    });
    const valid = await bcrypt.compare(password, ret.password);
    if (valid) {
      console.log('\n✅ RET Account Created!');
      console.log('━'.repeat(42));
      console.log('📧 Email   :', email);
      console.log('🔑 Password:', password);
      console.log('🆔 ID      : RET-DEPT-2026');
      console.log('👥 Role    : ret');
      console.log('🔗 Portal  : /portal/ret');
      console.log('━'.repeat(42));
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
};
createRET();