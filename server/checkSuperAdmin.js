import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const checkAndFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    const email = 'conservea2026@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    console.log('📊 Current Status:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- isSuperAdmin:', user.isSuperAdmin);
    console.log('- Type of isSuperAdmin:', typeof user.isSuperAdmin);
    
    if (!user.isSuperAdmin || user.role !== 'admin') {
      console.log('\n🔧 Fixing...');
      user.isSuperAdmin = true;
      user.role = 'admin';
      user.isApproved = true;
      user.isActive = true;
      await user.save();
      console.log('✅ Fixed!');
    } else {
      console.log('\n✅ Already correct!');
    }
    
    // Verify
    const verified = await User.findOne({ email });
    console.log('\n🔍 Verification:');
    console.log('- isSuperAdmin:', verified.isSuperAdmin, '(', typeof verified.isSuperAdmin, ')');
    console.log('- Boolean check:', Boolean(verified.isSuperAdmin));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAndFix();