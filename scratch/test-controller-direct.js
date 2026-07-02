import { polishCareerResume } from "../src/controllers/career.controller.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
dotenv.config();

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected successfully");

    // Find any existing user to use for the request
    let user = await User.findOne();
    if (!user) {
      console.log("Creating a mock user...");
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user"
      });
    }

    const req = {
      user: user,
      body: {
        resumeText: "aghadeveloper.pdf MERN Stack Developer. 1+ year React, Tailwind CSS, Node.js.",
        jobDescription: "React.js Developer. 2+ years ReactJS, 3+ years JavaScript, HTML, CSS."
      },
      file: null
    };

    const res = {
      status(code) {
        console.log("Response Status set to:", code);
        return this;
      },
      json(data) {
        console.log("Response JSON:", JSON.stringify(data, null, 2));
        return this;
      }
    };

    console.log("Invoking polishCareerResume controller...");
    await polishCareerResume(req, res);

  } catch (e) {
    console.error("Controller direct execution threw error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("DB disconnected");
  }
}

run();
