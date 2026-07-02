import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Invite from "../models/Invite.js";

export const getReportStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalResumes = await Resume.countDocuments();
    const totalInvites = await Invite.countDocuments();

    // Average ATS Score
    const avgAtsResult = await Resume.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$atsScore" } } }
    ]);
    const avgAtsScore = avgAtsResult.length > 0 ? Math.round(avgAtsResult[0].avgScore) : 0;

    // Growth Data (Last 6 Months)
    const growthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedGrowth = growthData.map(item => ({
      month: monthNames[item._id - 1],
      count: item.count
    }));

    res.status(200).json({
      stats: {
        totalUsers,
        totalAdmins,
        totalResumes,
        totalInvites,
        avgAtsScore
      },
      growth: formattedGrowth
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
