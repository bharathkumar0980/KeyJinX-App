const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
    type: String,
    default: "Unknown Operative" // Gives existing users a default name
  },
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate accounts allowed
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryKey: { type: String, required: true },
    role: {
      type: String,
      default: "Client",
      enum: ["Client", "The Admin", "Leecher"],
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
); // Automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model("User", userSchema);
