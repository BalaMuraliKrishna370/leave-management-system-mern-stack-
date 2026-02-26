const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserId is required"]
    },
    leaveType: {
      type: String,
      enum: {
        values: ["earned", "sick"],
        message: "Leave type must be either earned or sick"
      },
      required: [true, "Leave type is required"]
    },
    fromDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    toDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.fromDate;
        },
        message: "End date must be after start date"
      }
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      minlength: [10, "Reason must be at least 10 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"]
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected"
      },
      default: "pending"
    },
    adminComments: {
      type: String,
      maxlength: [500, "Comments cannot exceed 500 characters"]
    }
  },
  { timestamps: true }
);


leaveSchema.index({ userId: 1, createdAt: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);