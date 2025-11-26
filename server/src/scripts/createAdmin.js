import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    const existingAdmin = await User.findOne({ email: 'conserve2025@gmail.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists');
      process.exit(0);
    }

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'ConServe',
      email: 'conserve2025@gmail.com',
      studentId: 'ADMIN-001',
      password: 'Admin@ConServe2025!',
      role: 'admin',
      isApproved: true,
      isActive: true
    });

    console.log('✅ Admin created successfully');
    console.log('📧 Email: conserve2025@gmail.com');
    console.log('🔑 Password: Admin@ConServe2025!');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();