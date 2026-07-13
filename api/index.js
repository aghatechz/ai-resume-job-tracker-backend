// Vercel serverless entry point.
// Vercel auto-detects files in /api as serverless functions. We simply
// re-export the Express app, which acts as the (req, res) request handler.
import app from "../app.js";

export default app;
