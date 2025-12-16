import Job from "../models/Job.js";

export const addJob = async (req, res) => {
    const {company, position, jobDescription, status, notes} = req.body;
    const userId = req.user._id;

    if(!company || !position) {
        return res.status(400).json({message: "Company and position are required"})
    }

    try {
        const job = await Job.create({
            userId,
            company,
            position,
            jobDescription,
            status,
            notes,
        });
        res.status(201).json({message: "Job added", job});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Failed to add job", error: error.message});
    }
};

export const getJobs = async (req, res) => {
    const userId = req.user._id;
    try {
        const jobs = await Job.find({userId}).sort({ createdAt: -1});
        res.status(200).json({ jobs });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Failed to fetch jobs", error: error.message})
    }
};

export const updateJob = async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    try {
      const job = await  Job.findOneAndUpdate(
        {_id: jobId, userId},
        updates,
        { new: true }
      );

      if(!job) return res.status(404).json({message: "Job nott found"});

      res.status(200).json({message: "Job updated", job});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Failed to update job", error: error.message});
    }
};

export const deleteJob = async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user._id;

    try {
        const job = await Job.findOneAndDelete({_id: jobId, userId});

        if (!job) return res.status(404).json({message: "Job not found"});

        res.status(200).json({message: "Job deleted", job});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete job", error: error.message });
    }
};