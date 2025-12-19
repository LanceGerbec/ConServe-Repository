import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let bucket;

export const initGridFS = () => {
  mongoose.connection.once('open', () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'research' });
    console.log('✅ GridFS initialized');
  });
};

export const getGridFSBucket = () => {
  if (!bucket) throw new Error('GridFS not initialized');
  return bucket;
};