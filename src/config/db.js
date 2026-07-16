import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let cached = global._mongoose;
if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

let mongod = null;

/** Cleanup in-memory MongoDB on exit */
process.on("SIGINT", async () => {
    if (mongod) await mongod.stop();
    process.exit();
});

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    const uri = process.env.MONGO_URI;

    // Try Atlas first
    if (uri) {
        try {
            cached.conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("MongoDB Connected (Atlas):", cached.conn.connection.host);
            return cached.conn;
        } catch (err) {
            console.error("MongoDB Atlas connection failed:", err.message);
            console.log("Falling back to in-memory MongoDB...");
        }
    } else {
        console.log("No MONGO_URI set. Starting in-memory MongoDB...");
    }

    // Fallback: in-memory MongoDB
    return startInMemoryMongo();
};

async function startInMemoryMongo() {
    if (!mongod) {
        mongod = await MongoMemoryServer.create();
        const localUri = mongod.getUri();
        console.log("In-memory MongoDB started at:", localUri);
    }

    cached.conn = await mongoose.connect(mongod.getUri());
    console.log("MongoDB Connected (In-Memory):", cached.conn.connection.host);
    return cached.conn;
}

export default connectDB;
