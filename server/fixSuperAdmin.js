import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const fixSuperAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    const email = 'conservea2026@gmail.com';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error('❌ Super admin not found!');
      process.exit(1);
    }

    console.log('📝 Current user data:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- isSuperAdmin:', user.isSuperAdmin);
    console.log('- isApproved:', user.isApproved);
    console.log('- isActive:', user.isActive);

    // Fix the super admin
    user.isSuperAdmin = true;
    user.role = 'admin';
    user.isApproved = true;
    user.isActive = true;
    await user.save();

    console.log('\n✅ Super admin fixed!');
    console.log('- isSuperAdmin: true ✓');
    console.log('- Role: admin ✓');
    console.log('- Status: Active & Approved ✓');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixSuperAdmin();