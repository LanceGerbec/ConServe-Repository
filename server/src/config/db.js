// ============================================
// FILE: server/src/config/db.js - FINAL FIX
// ============================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI is not defined in .env file');
    }

    console.log('🔄 Attempting MongoDB connection...');

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Check: 1) .env file exists, 2) MONGO_URI is correct, 3) MongoDB password is correct');
    process.exit(1);
  }
};

export default connectDB;