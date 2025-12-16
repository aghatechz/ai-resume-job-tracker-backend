import User from "../models/User.js";

const dummyInvites = [
  { email: "invite1@example.com" },
  { email: "invite2@example.com" },
  { email: "invite3@example.com" }
];
 
export const getDashboardUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getDashboardAdmins = async (req, res) => {
  try {
     const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

 export const getPendingInvites = async (req, res) => {
  try {
     res.status(200).json({ invites: dummyInvites });
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
