import User from "../models/User.js";
import Invite from "../models/Invite.js";
import sendEmail from "../utils/sendEmail.js";
 
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
     const invites = await Invite.find({ status: "pending" }).sort("-createdAt");
     res.status(200).json({ invites });
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const inviteAdmin = async (req, res) => {
  try {
    const { email, role, message } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if invite already exists
    const inviteExists = await Invite.findOne({ email, status: "pending" });
    if (inviteExists) {
      return res.status(400).json({ message: "An invitation is already pending for this email" });
    }

    const invite = await Invite.create({
      email,
      role,
      message,
      invitedBy: req.user._id // Set by auth middleware
    });

    // Send Email
    const inviteLink = `http://localhost:5000/signup.html?email=${email}&role=${role}`;
    
    const htmlContent = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #7f265b;">You're Invited!</h2>
        </div>
        <p>Hello,</p>
        <p>You have been invited to join <strong>AI Resume Tracker</strong> as a <strong>${role}</strong>.</p>
        ${message ? `<div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #7f265b; margin: 20px 0;">"${message}"</div>` : ''}
        <p>Please click the button below to complete your registration and join the team:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Join Now</a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 40px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: email,
        subject: "Invitation to join AI Resume Tracker",
        html: htmlContent
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // We don't return 500 here because the invite was already saved in DB
      return res.status(201).json({
        message: "Invitation saved, but email failed to send. Please check SMTP settings.",
        invite
      });
    }

    res.status(201).json({
      message: "Invitation sent successfully!",
      invite
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
