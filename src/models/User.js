import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"]
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please add a password"]
        },

        title: { 
            type: String, 
            default: 'Software Engineer' 
        },
        location: { 
            type: String, 
            default: 'San Francisco, CA' 
        },
        about: { 
            type: String, 
            default: 'Passionate professional with expertise in technology.' 
        },
        phone: { 
            type: String, 
            default: '' 
        },
        website: { 
            type: String, 
            default: '' 
        },
        linkedin: { 
            type: String, 
            default: '' 
        },
        github: { 
            type: String, 
            default: '' 
        },
        avatar: { 
            type: String, 
            default: '' 
        },
        coverPhoto: { 
            type: String, 
            default: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop' 
        },
        skills: [{ 
            type: String 
        }],
        experience: [{
            id: { type: Number },
            title: { type: String },
            company: { type: String },
            location: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            description: { type: String }
        }],
        education: [{
            id: { type: Number },
            degree: { type: String },
            school: { type: String },
            location: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            description: { type: String }
        }],

        role: {
            type: String,
            enum: ["user", "admin", "super-admin"], 
            default: "user"                          
        },
        status: {
            type: Boolean,
            default: false
         },
         lastActive: { 
            type: Date,
            default: Date.now
        },
        profileCompleted: {
            type: Number,
            default: 0
        },
        settings: {
            defaultTargetRole: {
                type: String,
                default: "Software Engineer"
            },
            aiModel: {
                type: String,
                default: "gemini-2.5-flash"
            },
            aiTemperature: {
                type: Number,
                default: 0.2
            },
            atsScoreGoal: {
                type: Number,
                default: 85
            },
            emailNotifications: {
                type: Boolean,
                default: true
            },
            deadlineAlerts: {
                type: Boolean,
                default: true
            }
        }
    },
    { timestamps: true }
);

 
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return ;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

 
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
