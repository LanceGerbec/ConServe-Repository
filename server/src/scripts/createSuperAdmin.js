// server/src/scripts/createSuperAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    
    console.log('✅ MongoDB Connected');

    // Import User model AFTER connection
    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      studentId: String,
      password: String,
      role: String,
      isApproved: Boolean,
      isActive: Boolean,
      isDeleted: Boolean,
      isSuperAdmin: Boolean,
      twoFactorEnabled: Boolean,
      loginAttempts: Number,
      passwordHistory: [String],
      createdAt: Date,
      updatedAt: Date
    }));

    const adminEmail = 'conservea2026@gmail.com';
    const adminPassword = 'Admin@ConServe2026!';

    console.log('🔍 Checking if super admin exists...');
    
    // Delete existing super admin if any
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Found existing admin, deleting...');
      await User.deleteOne({ email: adminEmail });
    }

    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    console.log('📝 Creating new super admin user...');
    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      studentId: 'SUPERADMIN-001',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isActive: true,
      isDeleted: false,
      isSuperAdmin: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      passwordHistory: [hashedPassword],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Verify the password works
    console.log('🔍 Verifying password...');
    const isValid = await bcrypt.compare(adminPassword, admin.password);
    
    if (isValid) {
      console.log('\n✅ Super Admin created and verified successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('🆔 Student ID: SUPERADMIN-001');
      console.log('👑 Super Admin: YES');
      console.log('✓ Password verification: PASSED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Password verification FAILED!');
      console.log('Please try again or check your User model');
    }
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

console.log('🚀 Starting super admin creation...\n');
createSuperAdmin();