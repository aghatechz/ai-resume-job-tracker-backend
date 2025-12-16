import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/manage-users.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "super-admin"));

router.get("/", getAllUsers);            
router.get("/:id", getUserById);          
router.put("/:id", updateUser);           
router.delete("/:id", deleteUser);        

router.get("/", protect, authorizeRoles("super-admin"), getAllUsers);


export default router;
