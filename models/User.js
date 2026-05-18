const mongoose = require("mongoose");

/**
 * @module User
 * @description Mongoose schema for Operatives (Users).
 * Stores identity information, encrypted master passwords, and cryptographic recovery keys.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Unknown Operative", // Fallback for legacy accounts without names
    },
    email: {
      type: String,
      required: true,
      unique: true, // Enforces single account per email address
      trim: true,
      lowercase: true,
    },
    password: {
      type: String, // BCrypt hashed master password
      required: true,
    },
    recoveryKey: { 
      type: String, // BCrypt hashed one-time recovery key
      required: true 
    },
    /**
     * Role-Based Access Control (RBAC) definitions:
     * - Client: Standard user with personal vault access.
     * - The Admin: Root user with telemetry and system override access.
     * - Leecher: Restricted user (future implementation).
     */
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
  { timestamps: true }, // Automatically appends 'createdAt' and 'updatedAt' fields
);

module.exports = mongoose.model("User", userSchema);
