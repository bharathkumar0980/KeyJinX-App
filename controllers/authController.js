const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Vault = require("../models/Vault");

/**
 * Registration Handler
 * @route POST /api/auth/register
 * @description Creates a new user account (operative).
 * Crucially, generates a one-time-viewable recovery key. Both the master password 
 * and the recovery key are hashed using bcrypt before database storage.
 */
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Operative already exists." });
    }

    // Cryptographic Key Generation: Create a high-entropy recovery key (Format: KJX-XXXX-XXXX-XXXX)
    const rawRecoveryKey = `KJX-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)
      .join("-")}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Security: Hash the recovery key so even DB admins cannot view it natively
    const hashedRecoveryKey = await bcrypt.hash(rawRecoveryKey, salt);

    // Persist to database
    user = new User({
      email,
      password: hashedPassword,
      recoveryKey: hashedRecoveryKey, // Ensure this field is in your User.js model!
    });
    await user.save();

    // Final transmission: Send the raw recovery key to the client. This is the ONLY time this key will ever exist in plain text.
    res.status(201).json({
      message: "Vault Key Forged Successfully!",
      recoveryKey: rawRecoveryKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * Login Handler
 * @route POST /api/auth/login
 * @description Authenticates the user against their bcrypt-hashed master password.
 * Issues a JWT upon success, embedding the user's role for frontend RBAC routing.
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // Embedded role used by frontend for UI state rendering
        email: user.email, // Attached for backend auditing contexts
      },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "1d" },
    );

    res.status(200).json({ token, message: "Access Granted" });
  } catch (error) {
    res.status(500).json({ message: "Login error." });
  }
};
/**
 * Emergency Password Reset Handler
 * @route POST /api/auth/reset-password
 * @description Permits recovery of an account using the recovery key. 
 * Because the system is Zero-Knowledge and relies on the master password to derive the vault encryption key, 
 * resetting the master password permanently invalidates all previously encrypted vault entries. 
 * Therefore, this endpoint intentionally PURGES the user's vault to prevent cryptographic deadlocks.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, recoveryKey, newPassword } = req.body;

    // Locate the compromised/locked account
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Operative not found." });

    // Cryptographic validation of the provided recovery key
    const isMatch = await bcrypt.compare(recoveryKey, user.recoveryKey);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Recovery Key." });

    // ZERO-KNOWLEDGE ENFORCEMENT: Purge all existing vault entries.
    // The old data is permanently inaccessible because the decryption key (derived from the old password) is lost.
    await Vault.deleteMany({ user: user._id });

    // Persist the newly forged master password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      message: "Password reset successful. Vault has been wiped for security.",
    });
  } catch (error) {
    res.status(500).json({ message: "Reset protocol failed." });
  }
};
