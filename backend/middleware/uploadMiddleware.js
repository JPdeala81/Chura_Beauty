import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'salon-beaute',
    resource_type: 'auto',
  },
});

// File size limit: 5MB per file, 50MB total
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      const err = new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, MP4, WebM`);
      err.status = 400;
      err.code = 'INVALID_FILE_TYPE';
      return cb(err);
    }

    // Check cumulative file size
    const totalSize = Object.values(req.files || {}).reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      const err = new Error('Total file size exceeds 50MB limit');
      err.status = 413;
      err.code = 'FILE_TOO_LARGE';
      return cb(err);
    }

    cb(null, true);
  },
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: 'File exceeds maximum size of 5MB',
        maxSize: '5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files per request',
        maxFiles: 10,
      });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many form fields',
      });
    }
  }

  if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Allowed: JPEG, PNG, WebP, MP4, WebM',
      allowedTypes: ALLOWED_TYPES,
    });
  }

  if (err && err.code === 'FILE_TOO_LARGE') {
    return res.status(413).json({
      success: false,
      message: 'Total file size exceeds 50MB limit',
      maxSize: '50MB',
    });
  }

  next(err);
};

export default upload;
