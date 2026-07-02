import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { polishCareerResume } from "../controllers/career.controller.js";
import { downloadCareerResumePDF } from "../controllers/careerDownload.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/polish", protect, upload.single("resumeFile"), polishCareerResume);
router.post("/download-pdf", protect, downloadCareerResumePDF);

export default router;
