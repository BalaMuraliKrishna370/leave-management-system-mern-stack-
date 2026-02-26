const Leave = require("../models/Leave");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    
    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    
    if (reason.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Reason must be at least 10 characters"
      });
    }

    
    const user = await User.findById(req.user.id);
    const balanceToCheck = leaveType === "earned" ? user.earnedLeaves : user.sickLeaves;

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const MAX_DAYS = 30;

    
    if (balanceToCheck > MAX_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Balance exceeds ${MAX_DAYS} days; please contact administrator`
      });
    }

    if (diffDays > MAX_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Cannot request more than ${MAX_DAYS} days in one application`
      });
    }

    if (balanceToCheck <= 0) {
      return res.status(400).json({
        success: false,
        message: `No ${leaveType} leaves available`
      });
    }

    if (diffDays > balanceToCheck) {
      return res.status(400).json({
        success: false,
        message: `You don't have enough ${leaveType} leaves for this period`
      });
    }

  
    const leave = await Leave.create({
      userId: req.user.id,
      leaveType,
      fromDate: start,
      toDate: end,
      reason
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to apply leave"
    });
  }
};
exports.myLeaves = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    
    let filter = { userId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        total,
        page,
        pages: Math.ceil(total / limit),
        leaves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leaves"
    });
  }
};
exports.leaveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        earnedLeaves: user.earnedLeaves,
        sickLeaves: user.sickLeaves,
        totalLeaves: user.earnedLeaves + user.sickLeaves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leave balance"
    });
  }
};
exports.getAllLeaves = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const keyword = req.query.keyword;

    
    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (keyword) {
      filter.reason = { $regex: keyword, $options: "i" };
    }

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        total,
        page,
        pages: Math.ceil(total / limit),
        leaves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leave requests"
    });
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const leaveId = req.params.id;

    
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'"
      });
    }

    
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Leave request has already been processed"
      });
    }

    leave.status = status;
    if (adminComments) {
      leave.adminComments = adminComments;
    }

    
    if (status === "approved") {
      const user = await User.findById(leave.userId);
      const daysRequested = Math.ceil(
        (leave.toDate - leave.fromDate) / (1000 * 60 * 60 * 24)
      );

      if (leave.leaveType === "earned") {
        if (user.earnedLeaves < daysRequested) {
          return res.status(400).json({
            success: false,
            message: "Insufficient earned leaves"
          });
        }
        user.earnedLeaves -= daysRequested;
      } else {
        if (user.sickLeaves < daysRequested) {
          return res.status(400).json({
            success: false,
            message: "Insufficient sick leaves"
          });
        }
        user.sickLeaves -= daysRequested;
      }

      await user.save();

    
      try {
        const transporter = getEmailTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Leave Request Approved ✓",
          html: `
            <h2>Hello ${user.name},</h2>
            <p>Your leave request has been <strong>APPROVED</strong>.</p>
            <p><strong>Leave Details:</strong></p>
            <ul>
              <li>Type: ${leave.leaveType}</li>
              <li>From: ${leave.fromDate.toDateString()}</li>
              <li>To: ${leave.toDate.toDateString()}</li>
              <li>Reason: ${leave.reason}</li>
            </ul>
            ${adminComments ? `<p><strong>Admin Comments:</strong> ${adminComments}</p>` : ""}
            <p>Best regards,<br/>Leave Management System</p>
          `
        });
      } catch (emailError) {
        console.log("Email sending failed:", emailError);
  
      }
    } else if (status === "rejected") {
      
      try {
        const user = await User.findById(leave.userId);
        const transporter = getEmailTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Leave Request Rejected ✗",
          html: `
            <h2>Hello ${user.name},</h2>
            <p>Your leave request has been <strong>REJECTED</strong>.</p>
            <p><strong>Leave Details:</strong></p>
            <ul>
              <li>Type: ${leave.leaveType}</li>
              <li>From: ${leave.fromDate.toDateString()}</li>
              <li>To: ${leave.toDate.toDateString()}</li>
            </ul>
            ${adminComments ? `<p><strong>Reason:</strong> ${adminComments}</p>` : ""}
            <p>Best regards,<br/>Leave Management System</p>
          `
        });
      } catch (emailError) {
        console.log("Email sending failed:", emailError);
        
      }
    }

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update leave status"
    });
  }
};
exports.analytics = async (req, res) => {
  try {
    const total = await Leave.countDocuments();
    const approved = await Leave.countDocuments({ status: "approved" });
    const pending = await Leave.countDocuments({ status: "pending" });
    const rejected = await Leave.countDocuments({ status: "rejected" });

  
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyLeaves = await Leave.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    
    const earnedCount = await Leave.countDocuments({ leaveType: "earned" });
    const sickCount = await Leave.countDocuments({ leaveType: "sick" });

    res.status(200).json({
      success: true,
      data: {
        totalRequests: total,
        approved,
        pending,
        rejected,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
        currentMonthRequests: monthlyLeaves,
        byType: {
          earned: earnedCount,
          sick: sickCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics"
    });
  }
};
