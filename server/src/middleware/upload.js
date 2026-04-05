// server/src/middleware/upload.js
// RATIONALE: File uploads are one of the most dangerous attack vectors.
// Attackers disguise malicious executables as PDFs, images, etc.
// Checking file extension ALONE is not enough — a .pdf file can contain
// PHP code. We must verify the actual file content (magic bytes).

import multer from 'multer';
import path from 'path';

// ── Magic bytes (file signatures) ────────────────────────────────────────
// WHY: Every file format starts with specific bytes. A real PDF always
//      starts with %PDF (25 50 44 46). A disguised .php renamed to .pdf
//      would start with <?php (3C 3F 70 68 70) — we catch that here.
//      This check happens in MEMORY before saving anywhere.
const FILE_SIGNATURES = {
  pdf:  [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  jpg:  [
    [0xFF, 0xD8, 0xFF],       // JPEG
  ],
  jpeg: [
    [0xFF, 0xD8, 0xFF],       // JPEG
  ],
  png:  [
    [0x89, 0x50, 0x4E, 0x47], // PNG
  ],
};

// Verify file starts with expected magic bytes
const verifyMagicBytes = (buffer, ext) => {
  const signatures = FILE_SIGNATURES[ext.toLowerCase()];
  if (!signatures) return false;

  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  );
};

// ── Allowed MIME types (whitelist) ────────────────────────────────────────
// WHY: Whitelist only what you need. Allowing all image/* could permit
//      SVG files which can contain embedded JavaScript.
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

// ── File filter ───────────────────────────────────────────────────────────
const secureFileFilter = (req, file, cb) => {
  // 1. Check MIME type against whitelist
  const ext = ALLOWED_MIME_TYPES[file.mimetype];
  if (!ext) {
    return cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }

  // 2. Check extension matches MIME type
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  if (fileExt !== ext && !(fileExt === 'jpg' && ext === 'jpeg')) {
    return cb(new Error('File extension does not match content type'), false);
  }

  // 3. Check for double extensions (e.g. malware.pdf.exe)
  // WHY: "shell.php.pdf" should be rejected — the real extension is .php
  const nameParts = file.originalname.split('.');
  if (nameParts.length > 2) {
    const innerExts = nameParts.slice(1, -1);
    const dangerousExts = ['php', 'exe', 'sh', 'js', 'py', 'rb', 'pl', 'asp', 'aspx', 'jsp'];
    if (innerExts.some(e => dangerousExts.includes(e.toLowerCase()))) {
      return cb(new Error('Suspicious file name rejected'), false);
    }
  }

  cb(null, true);
};

// ── Post-upload magic byte check ──────────────────────────────────────────
// WHY: The fileFilter only runs before upload. We verify bytes AFTER the
//      buffer is in memory to catch files that passed the MIME check but
//      have wrong actual content.
export const verifyFileContent = (req, res, next) => {
  if (!req.file) return next();

  const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
  const normalizedExt = ext === 'jpg' ? 'jpeg' : ext;

  if (!verifyMagicBytes(req.file.buffer, normalizedExt === 'jpeg' ? 'jpg' : normalizedExt)) {
    console.warn(`[UPLOAD SECURITY] Magic byte mismatch from ${req.ip}: ${req.file.originalname}`);
    return res.status(400).json({
      error: 'File content does not match declared type. Upload rejected.'
    });
  }

  // Sanitize filename — remove path separators and null bytes
  // WHY: "../../server.js" as a filename could overwrite server files
  req.file.originalname = path.basename(req.file.originalname)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_');

  next();
};

// ── Multer instance ───────────────────────────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(), // never write to disk unvalidated
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB hard limit
    files: 1,                    // one file at a time
    fields: 20,                  // max form fields
    fieldNameSize: 100,          // max field name length
    fieldSize: 1024 * 1024,      // max non-file field size (1MB)
  },
  fileFilter: secureFileFilter,
});

// ── Avatar-specific upload (images only, smaller limit) ───────────────────
export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1,
    fields: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG images allowed for avatars'), false);
    }
    cb(null, true);
  },
});