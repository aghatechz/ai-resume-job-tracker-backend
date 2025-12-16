import mongoose, { Types } from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        },
        originalText: {
            type: String,
            required: true,
        }, 
        aiImprovedText: {
            type: String,
        },
        aiScore: {
            type: Number,
        },
        atsScore: {
            type: Number,
        },
        suggestions: [
            {
                type: String,
            },
        ],
    },
    {timestamps: true}
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;