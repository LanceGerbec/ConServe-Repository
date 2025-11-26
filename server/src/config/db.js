import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI not defined in .env');
    }

    console.log('🔄 Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'conserve',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error('💡 Check: 1) MongoDB Atlas IP whitelist (allow 0.0.0.0/0), 2) Username/password, 3) Database name');
    process.exit(1);
  }
};

export default connectDB;