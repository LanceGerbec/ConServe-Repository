import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect with longer timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 60000,
    });
    
    console.log('✅ MongoDB Connected');

    const User = mongoose.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      studentId: String,
      password: String,
      role: String,
      isApproved: Boolean,
      isActive: Boolean,
      twoFactorEnabled: Boolean,
      loginAttempts: Number,
      passwordHistory: [String],
      createdAt: Date,
      updatedAt: Date
    }));

    console.log('🔍 Checking if admin exists...');
    const existingAdmin = await User.findOne({ email: 'conserve2025@gmail.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin already exists');
      console.log('📧 Email: conserve2025@gmail.com');
      console.log('🔑 Password: Admin@ConServe2025!');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@ConServe2025!', salt);

    console.log('📝 Creating admin user...');
    await User.create({
      firstName: 'Admin',
      lastName: 'ConServe',
      email: 'conserve2025@gmail.com',
      studentId: 'ADMIN-001',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isActive: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      passwordHistory: [hashedPassword],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: conserve2025@gmail.com');
    console.log('🔑 Password: Admin@ConServe2025!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();