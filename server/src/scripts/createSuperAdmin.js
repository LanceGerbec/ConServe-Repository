import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 60000 });
    console.log('✅ Connected');

    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String, lastName: String, email: String, studentId: String,
      password: String, role: String, isApproved: Boolean, isActive: Boolean,
      isSuperAdmin: Boolean, loginAttempts: Number, createdAt: Date, updatedAt: Date
    }));

    const existing = await User.findOne({ email: 'superadmin@conserve.com' });
    if (existing) {
      console.log('❌ Super admin already exists');
      process.exit(0);
    }

    const password = await bcrypt.hash('SuperAdmin@2025!', 12);
    await User.create({
      firstName: 'Super', lastName: 'Admin', email: 'superadmin@conserve.com',
      studentId: 'SUPERADMIN-001', password, role: 'admin', isApproved: true,
      isActive: true, isSuperAdmin: true, loginAttempts: 0,
      createdAt: new Date(), updatedAt: new Date()
    });

    console.log('✅ Super Admin Created!');
    console.log('📧 Email: superadmin@conserve.com');
    console.log('🔑 Password: SuperAdmin@2025!');
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
};

createSuperAdmin();