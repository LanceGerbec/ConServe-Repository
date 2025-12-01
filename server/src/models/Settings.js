// ============================================
// FILE: server/src/models/Settings.js
// ============================================
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'ConServe' },
  siteDescription: { type: String, default: 'NEUST College of Nursing Research Repository' },
  
  logos: {
    school: {
      url: String,
      cloudinaryId: String,
      uploadedAt: Date
    },
    college: {
      url: String,
      cloudinaryId: String,
      uploadedAt: Date
    },
    conserve: {
      url: String,
      cloudinaryId: String,
      uploadedAt: Date
    }
  },
  
  theme: {
    primaryColor: { type: String, default: '#1e3a8a' },
    accentColor: { type: String, default: '#60a5fa' }
  },
  
  features: {
    allowRegistration: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: true },
    enableNotifications: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  },
  
  email: {
    host: String,
    port: Number,
    user: String,
    fromName: { type: String, default: 'ConServe' }
  },
  
  security: {
    maxLoginAttempts: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 20 },
    passwordMinLength: { type: Number, default: 12 }
  },
  
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);