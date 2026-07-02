import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getReportStats } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("super-admin"), getReportStats);

export default router;
