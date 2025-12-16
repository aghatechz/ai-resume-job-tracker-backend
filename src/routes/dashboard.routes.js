import express from "express";
import Resume from "../models/Resume.js"; 
import Job from "../models/Job.js";       
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

 router.use(protect);

router.get("/", async (req, res) => {
  try {
     const totalResumes = await Resume.countDocuments({ userId: req.user._id });
    const jobsApplied = await Job.countDocuments({ userId: req.user._id });
    const profileCompleteness = "80%"; 

    const resumeGrowth = 12;

    res.json({
      totalResumes,
      jobsApplied,
      profileCompleteness,
      resumeGrowth ,
      analytics: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        applications: [3, 5, 2, 8, 6, 7, 4],  
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments({ userId: req.user._id });
    const jobsApplied = await Job.countDocuments({ userId: req.user._id });
    res.json({ totalResumes, jobsApplied });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
