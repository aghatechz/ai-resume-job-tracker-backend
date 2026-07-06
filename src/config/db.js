import mongoose from "mongoose";

/**
 * Serverless-safe Mongo connection.
 * Vercel re-imports the module on every cold start, so we cache the
 * connection (and the in-flight promise) on the global object to avoid
 * opening a new connection on every invocation.
 */
let cached = global._mongoose;
if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!process.env.MONGO_URI) {
        // Do NOT process.exit() on serverless — it crashes the whole function.
        throw new Error("MONGO_URI environment variable is not set");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
            })
            .then((m) => {
                console.log("MongoDB Connected:", m.connection.host);
                return m;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset so the next request can retry instead of being stuck.
        cached.promise = null;
        console.error("MongoDB Error:", error.message);
        throw error;
    }

    return cached.conn;
};

export default connectDB;
