import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./src/config/db.js";


connectDB();

const PORT = process.env.PORT || 5000;

export default app;

