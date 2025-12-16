import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const exists = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL
    });

    if (exists) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    await User.create({
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: process.env.SUPER_ADMIN_ROLE || "super-admin"
    });

    console.log("Super Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
