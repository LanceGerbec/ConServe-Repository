import multer from 'multer';
import path from 'path';

// ── Magic Byte Signatures ────────────────────────────────────────────────
// Checks the actual binary content of the file, not just the extension.
// Attack blocked: rename malware.exe → document.pdf to bypass extension check.
const MAGIC = {
  pdf:  [0x25, 0x50, 0x44, 0x46],       // %PDF
  png:  [0x89, 0x50, 0x4E, 0x47],       // .PNG
  jpg:  [0xFF, 0xD8, 0xFF],             // JFIF/Exif
  jpeg: [0xFF, 0xD8, 0xFF],
};

const matchesMagic = (buf, sig) => sig.every((b, i) => buf[i] === b);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowed = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
  if (!allowed[ext] || file.mimetype !== allowed[ext])
    return cb(new Error('Only PDF and image files are allowed'), false);
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter
});

// Run AFTER multer has the buffer — verifies actual file bytes
export const verifyMagicBytes = (req, res, next) => {
  if (!req.file) return next();
  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const sig = MAGIC[ext];
  if (!sig || !matchesMagic(req.file.buffer, sig))
    return res.status(400).json({ error: 'File content does not match declared type.' });
  next();
};