import express from "express";
import { addJob, getJobs, updateJob, deleteJob } from "../controllers/job.controller.js";
import {protect} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addJob);
router.get("/", getJobs);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;