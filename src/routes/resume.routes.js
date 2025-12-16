import express from "express";
import { analyzeResume } from "../controllers/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {generateResumePDF} from "../controllers/resumePDF.controller.js"

const router = express.Router();

router.post("/analyze",protect, analyzeResume);

router.post("/download-pdf", generateResumePDF);


export default router;