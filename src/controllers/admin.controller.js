import User from "../models/User.js";

 export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json({admins});
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins", error });
  }
};

 export const createAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const newAdmin = await Admin.create({ name, email, role });
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: "Failed to create admin", error });
  }
};

 export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const admin = await Admin.findByIdAndUpdate(id, updates, { new: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Failed to update admin", error });
  }
};

 export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete admin", error });
  }
};
