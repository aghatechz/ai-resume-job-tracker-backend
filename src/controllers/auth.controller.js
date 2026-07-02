import User from "../models/User.js";
import generateToken from "../utils/generateToken.js"

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exits" })
    }

    const user = await User.create({ name, email, password })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",  
            token: generateToken(user),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }

};

export const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Update status to active
        user.status = true;
        user.lastActive = Date.now();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } else {
        res.status(400).json({ message: "Invalid email or password" })
    }
};

export const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (user) {
            user.status = false;
            user.lastActive = Date.now();
            await user.save();
            res.json({ message: "Logged out successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};