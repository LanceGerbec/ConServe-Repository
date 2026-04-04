// server/src/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'ConServe' },
  siteDescription: { type: String, default: 'NEUST College of Nursing Research Repository' },
  logos: {
    school:   { url: String, cloudinaryId: String, uploadedAt: Date },
    college:  { url: String, cloudinaryId: String, uploadedAt: Date },
    conserve: { url: String, cloudinaryId: String, uploadedAt: Date },
    heroBg:   { url: String, cloudinaryId: String, uploadedAt: Date }
  },
  bannerImages: [{
    url: { type: String, required: true },
    cloudinaryId: String,
    caption: { type: String, default: '' },
    addedAt: { type: Date, default: Date.now }
  }],
  // NEW: Separate home page section images
  homeImages: {
    // "About Us" section - 3 images
    about: [{ url: String, cloudinaryId: String, addedAt: { type: Date, default: Date.now } }],
    // "Research Types" section - 3 images
    types: [{ url: String, cloudinaryId: String, addedAt: { type: Date, default: Date.now } }]
  },
  // NEW: Admin-editable stats displayed on home page
  homeStats: {
    papers:    { type: String, default: '500+' },
    users:     { type: String, default: '300+' },
    completed: { type: String, default: '200+' },
    published: { type: String, default: '100+' },
    faculty:   { type: String, default: '500+' }
  },
  // Featured papers for Explore page carousel
  featuredPapers: [{
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
    caption: { type: String, default: '' }
  }],
  theme: {
    primaryColor: { type: String, default: '#1e3a8a' },
    accentColor:  { type: String, default: '#60a5fa' }
  },
  features: {
    allowRegistration:   { type: Boolean, default: true },
    requireApproval:     { type: Boolean, default: true },
    enableNotifications: { type: Boolean, default: true },
    maintenanceMode:     { type: Boolean, default: false }
  },
  email: {
    host: String, port: Number, user: String,
    fromName: { type: String, default: 'ConServe' }
  },
  security: {
    maxLoginAttempts:  { type: Number, default: 5 },
    sessionTimeout:    { type: Number, default: 20 },
    passwordMinLength: { type: Number, default: 12 }
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);