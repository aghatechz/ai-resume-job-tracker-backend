import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, uploadImage, getSettings, updateSettings } from '../controllers/profile.controller.js';
import fs from "fs";

const router = express.Router();

// On Vercel the project filesystem is read-only; only /tmp is writable.
// Creating folders under the project root at import time crashes the whole
// serverless function, so pick a writable base and never let mkdir throw.
const UPLOAD_BASE = process.env.VERCEL ? '/tmp/uploads' : 'uploads';

[`${UPLOAD_BASE}/avatars`, `${UPLOAD_BASE}/covers`].forEach(folder => {
  try {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  } catch (err) {
    console.warn('Could not create upload folder (read-only fs?):', folder, err.message);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.body.type || req.query.type;
    const uploadPath = type === 'avatar' ? `${UPLOAD_BASE}/avatars` : `${UPLOAD_BASE}/covers`;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

router.get('/me',protect, getProfile);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.patch('/:userId', protect, updateProfile);
router.post('/:userId/upload', protect, upload.single('image'), uploadImage);

export default router;
