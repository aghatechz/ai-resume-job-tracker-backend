import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getDashboardUsers, getDashboardAdmins, getPendingInvites } from "../controllers/superadmin-dashboard.controller.js";

const router = express.Router();

router.get("/users", protect, authorizeRoles("super-admin"), getDashboardUsers);
router.get("/admins", protect, authorizeRoles("super-admin"), getDashboardAdmins);
router.get("/pending-invites", protect, authorizeRoles("super-admin"), getPendingInvites);

export default router;
