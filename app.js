import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";

import express from "express";
import cors from "cors"
import authRoutes from "./src/routes/auth.routes.js";
import resumeRoutes from "./src/routes/resume.routes.js"
import jobRoutes from "./src/routes/job.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import axios from "axios"; 
import { OAuth2Client } from "google-auth-library";
import User from "./src/models/User.js";
import generateToken from "./src/utils/generateToken.js";
import profileRoutes from "./src/routes/profile.routes.js";
import manageUsersRoutes from "./src/routes/manage-users.routes.js";
import superAdminDashboardRoutes from "./src/routes/superadmin-dashboard.routes.js";
import careerRoutes from "./src/routes/career.routes.js";
import reportRoutes from "./src/routes/report.routes.js";
import path from "path";
import mongoose from "mongoose";

const app = express();

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (curl/Postman, no Origin header).
    if (!origin) return cb(null, true);
    let host = "";
    try { host = new URL(origin).hostname; } catch { /* invalid origin */ }
    // Allow configured/localhost origins and any Vercel deployment (prod + previews).
    if (allowedOrigins.includes(origin) || host.endsWith(".vercel.app")) {
      return cb(null, true);
    }
    return cb(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));




app.use(express.json());

// ---- Health checks (must work even if the DB is down) ----
app.get("/", (req, res) => {
  res.json({
    status: "API is running successfully",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  // mongoose.connection.readyState: 1 = connected, 2 = connecting
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  res.status(200).json({
    status: "UP",
    db: dbState,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---- Ensure the DB is connected before handling API requests ----
// On serverless the connection is cached, so this is cheap after the first hit.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection failed for request:", error.message);
    res.status(503).json({
      message: "Database unavailable. Please try again shortly.",
      error: error.message,
    });
  }
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/api/auth/google-login", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).send("No token provided");

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); 

        const { name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        password: null 
      });
    }

    const jwtToken = generateToken(user._id);
    res.json({
      success: true,
      token: jwtToken,  
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Google login failed");
  }
});

app.use("/api/auth", authRoutes );
app.use("/api/dashboard", dashboardRoutes); 
app.use("/api/resume", resumeRoutes );
app.use("/api/jobs", jobRoutes);
app.use('/api/profile', profileRoutes); 
app.use("/api/manage-users", manageUsersRoutes);
app.use("/api/superadmin-dashboard", superAdminDashboardRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/reports", reportRoutes);

app.post("/api/ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);

     if (err.response?.data?.error?.code === "insufficient_quota") {
      return res.status(429).json({
        reply: "Sorry! AI usage limit exceeded. Please try again later or upgrade your plan."
      });
    }

    res.status(500).json({ reply: "⚠️ AI server error. Please try again later." });
  }
});

export default app;