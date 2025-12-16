import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        position: {
            type: String,
            required: true,
            trim: true,
        },
        jobDescription: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Applied","Interviewing", "Rejected", "Offered"],
            default: "Applied",
        },
        notes: {
            type: String,
            default: "",
        },
    },
    {timestamps: true}
);

const Job = mongoose.model("Job", jobSchema);
export default Job;