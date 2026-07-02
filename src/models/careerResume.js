// src/models/CareerResume.js
import mongoose from "mongoose";

const careerResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  originalResume: {
    type: String,
    required: true
  },

  jobDescription: {
    type: String,
    required: true
  },

  aiCorrectedResume: {
    type: String,
    required: true
  },

  score: {
    type: Number,
    default: 0
  },

  atsScore: {
    type: Number,
    default: 0
  },

  suggestions: {
    type: [String],
    default: []
  }

}, { timestamps: true });

export default mongoose.model("CareerResume", careerResumeSchema);
