import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
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
      twoFactorEnabled: Boolean,
      loginAttempts: Number,
      passwordHistory: [String],
      createdAt: Date,
      updatedAt: Date
    }));

    const adminEmail = 'conserve2025@gmail.com';
    const adminPassword = 'Admin@ConServe2025!';

    console.log('🔍 Checking if admin exists...');
    
    // Delete existing admin if any
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Found existing admin, deleting...');
      await User.deleteOne({ email: adminEmail });
    }

    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    console.log('📝 Creating new admin user...');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'ConServe',
      email: adminEmail,
      studentId: 'ADMIN-001',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isActive: true,
      isDeleted: false,
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
      console.log('\n✅ Admin created and verified successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('✓ Password verification: PASSED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Password verification FAILED!');
      console.log('Please try again or check your User model');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();