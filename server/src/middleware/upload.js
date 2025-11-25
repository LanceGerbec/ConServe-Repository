// ============================================
// FILE: server/src/middleware/upload.js
// ============================================
import multer from 'multer';
import path from 'path';

// Memory storage for Cloudinary
const storage = multer.memoryStorage();

// File filter - PDF only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Multer config
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});