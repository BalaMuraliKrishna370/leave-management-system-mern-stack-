const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"]
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["employee", "admin"],
        message: "Role must be either employee or admin"
      },
      default: "employee"
    },
    earnedLeaves: {
      type: Number,
      default: 12,
      min: 0,
      max: 30
    },
    sickLeaves: {
      type: Number,
      default: 12,
      min: 0,
      max: 30
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);