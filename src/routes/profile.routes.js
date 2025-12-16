import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, uploadImage } from '../controllers/profile.controller.js';
import fs from "fs";

const router = express.Router();

['uploads/avatars', 'uploads/covers'].forEach(folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});


 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.body.type || req.query.type;
    const uploadPath = type === 'avatar' ? 'uploads/avatars' : 'uploads/covers';
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
router.patch('/:userId', protect, updateProfile);
router.post('/:userId/upload', protect, upload.single('image'), uploadImage);

export default router;
