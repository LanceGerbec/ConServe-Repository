// server/addSoftDelete.js
require('dotenv').config();
const mongoose = require('mongoose');

const addSoftDeleteFields = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🔄 Adding soft delete fields to existing users...');
    
    const result = await usersCollection.updateMany(
      { isDeleted: { $exists: false } },
      { 
        $set: { 
          isDeleted: false,
          deletedAt: null,
          deletedBy: null
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with soft delete fields`);

    // Drop old unique index on email
    console.log('🔄 Checking indexes...');
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name).join(', '));

    try {
      await usersCollection.dropIndex('email_1');
      console.log('✅ Dropped old email_1 index');
    } catch (e) {
      console.log('ℹ️  Old email_1 index not found (OK)');
    }

    // Create new partial unique index
    console.log('🔄 Creating new partial unique index...');
    try {
      await usersCollection.createIndex(
        { email: 1, isDeleted: 1 },
        { 
          unique: true, 
          partialFilterExpression: { isDeleted: false },
          name: 'email_isDeleted_unique'
        }
      );
      console.log('✅ Created new partial unique index: email_isDeleted_unique');
    } catch (e) {
      if (e.code === 85) {
        console.log('ℹ️  Index already exists (OK)');
      } else {
        console.error('⚠️  Index creation error:', e.message);
      }
    }

    const finalIndexes = await usersCollection.indexes();
    console.log('Final indexes:', finalIndexes.map(i => i.name).join(', '));

    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - ${result.modifiedCount} users updated`);
    console.log('   - Fields added: isDeleted, deletedAt, deletedBy');
    console.log('   - Email can now be reused after soft delete');
    console.log('   - Old research papers will be preserved\n');

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

console.log('🚀 Starting soft delete migration...\n');
addSoftDeleteFields();