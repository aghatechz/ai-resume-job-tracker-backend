import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "support"],
      default: "admin",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    }
  },
  { timestamps: true }
);

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;
