import User from '../models/User.js';
import path from 'path';
import fs from 'fs';


export const getProfile = async (req, res) => {
  try {
const userId = req.params.userId || req.user._id;

const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      title: user.title || 'Software Engineer',
      location: user.location || 'San Francisco, CA',
      about: user.about || 'Passionate professional with expertise in technology.',
      phone: user.phone || '',
      website: user.website || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      avatar: user.avatar || user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d6efd&color=fff&size=150`,
      coverPhoto: user.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop',
      skills: user.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      experience: user.experience || [
        {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: 'Present',
          description: 'Working on innovative projects and building scalable applications.'
        }
      ],
      education: user.education || [
        {
          id: 1,
          degree: 'Bachelor of Science in Computer Science',
          school: 'University Name',
          location: 'City, State',
          startDate: '2016-09',
          endDate: '2020-05',
          description: 'Graduated with honors.'
        }
      ]
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      title,
      location,
      about,
      email,
      phone,
      website,
      linkedin,
      github,
      skills,
      experience,
      education
    } = req.body;

    
const userId = req.params.userId || req.user._id;
const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    
    user.name = name ?? user.name;
    user.title = title ?? user.title;
    user.location = location ?? user.location;
    user.about = about ?? user.about;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.website = website ?? user.website;
    user.linkedin = linkedin ?? user.linkedin;
    user.github = github ?? user.github;
    user.skills = skills ?? user.skills;
    user.experience = experience ?? user.experience;
    user.education = education ?? user.education;

    await user.save();

    console.log('Profile updated successfully:', user._id);

    res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        title: user.title,
        location: user.location,
        about: user.about,
        phone: user.phone,
        website: user.website,
        linkedin: user.linkedin,
        github: user.github,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        skills: user.skills,
        experience: user.experience,
        education: user.education
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const imageType = req.query.type || req.body.type;

    if (!imageType || !['avatar', 'cover'].includes(imageType)) {
      return res.status(400).json({ msg: 'Invalid image type. Use "avatar" or "cover"' });
    }


    const imageUrl = `/uploads/${imageType === 'avatar' ? 'avatars' : 'covers'}/${req.file.filename}`;

const userId = req.params.userId || req.user._id;
const user = await User.findById(userId);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ msg: 'User not found' });
    }

    const oldImageField = imageType === 'avatar' ? user.avatar : user.coverPhoto;
    if (oldImageField && oldImageField.startsWith('/uploads/')) {
      const oldImagePath = path.join(process.cwd(), oldImageField);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('Old image deleted:', oldImagePath);
      }
    }

    const updateField = imageType === 'avatar' ? 'avatar' : 'coverPhoto';
    user[updateField] = imageUrl;
    await user.save();

    console.log(`${imageType} uploaded successfully for user:`, user._id);

    res.json({
      success: true,
      url: imageUrl,
      msg: `${imageType === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully`
    });
  } catch (err) {
    console.error('Upload Image Error:', err);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }

    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Default settings if empty
    if (!user.settings) {
      user.settings = {
        defaultTargetRole: "Software Engineer",
        aiModel: "gemini-2.5-flash",
        aiTemperature: 0.2,
        atsScoreGoal: 85,
        emailNotifications: true,
        deadlineAlerts: true
      };
      await user.save();
    }

    res.json({
      success: true,
      settings: user.settings,
      socials: {
        github: user.github || "",
        linkedin: user.linkedin || "",
        website: user.website || "",
      }
    });
  } catch (err) {
    console.error("Get Settings Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const {
      settings,
      socials,
      currentPassword,
      newPassword
    } = req.body;

    // 1. Update settings fields
    if (settings) {
      user.settings = {
        ...user.settings,
        ...settings
      };
    }

    // 2. Update socials
    if (socials) {
      user.github = socials.github !== undefined ? socials.github : user.github;
      user.linkedin = socials.linkedin !== undefined ? socials.linkedin : user.linkedin;
      user.website = socials.website !== undefined ? socials.website : user.website;
    }

    // 3. Update password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: "Current password is required to change password" });
      }

      if (user.password) {
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid current password" });
        }
      }

      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      msg: "Settings updated successfully",
      settings: user.settings,
      socials: {
        github: user.github,
        linkedin: user.linkedin,
        website: user.website
      }
    });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};