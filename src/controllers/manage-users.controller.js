import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");  
    res.status(200).json({ users });  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status, profileCompleted } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status !== undefined) user.status = status;
    if (profileCompleted !== undefined) user.profileCompleted = profileCompleted;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


function refreshData() {
    fetchUsers();  
}

function exportUsers() {
    const csvRows = [];
    const headers = ["Name", "Email", "Role", "Status", "Joined Date", "Last Active"];
    csvRows.push(headers.join(","));

    usersData.forEach(user => {
        const row = [
            `"${user.name}"`,
            `"${user.email}"`,
            user.role,
            user.status ? "Active" : "Inactive",
            new Date(user.createdAt).toLocaleDateString(),
            user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "-"
        ];
        csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
}
