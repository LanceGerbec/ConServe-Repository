import mongoose from 'mongoose';

// Stores invalidated JWT IDs so logged-out tokens can't be reused.
// MongoDB TTL index auto-deletes expired entries — no manual cleanup needed.
const schema = new mongoose.Schema({
  jti:       { type: String, required: true, unique: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  expiresAt: { type: Date, required: true }
});

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-purge

export default mongoose.model('BlacklistedToken', schema);