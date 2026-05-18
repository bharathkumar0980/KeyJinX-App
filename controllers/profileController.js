const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Log = require("../models/Logs");

/**
 * Get Authenticated User Profile
 * @route GET /api/profile
 * @description Returns the authenticated operative's public identity fields.
 * Sensitive fields (password, recoveryKey) are explicitly excluded from the response.
 */
exports.getProfile = async (req, res) => {
  try {
    const activeId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(activeId).select("-password -recoveryKey");

    if (!user) return res.status(404).json({ message: "Node not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Mainframe error fetching profile." });
  }
};

/**
 * Update User Profile
 * @route PUT /api/profile
 * @description Updates name, email, or master password.
 * A password change also triggers a vault migration on the client side;
 * this endpoint only validates the current password and persists the new hash.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const activeId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(activeId);

    let passwordChanged = false;

    // Verify the current password before allowing a master key change
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password required for modification." });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        await Log.create({
          type: "warn",
          code: "AUTH_FAIL",
          message: `Failed credential update attempt for ${user.email}`,
        }).catch(console.error);
        return res
          .status(401)
          .json({ message: "Invalid current credentials." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      passwordChanged = true;
    }

    // Enforce email uniqueness before applying the change
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ message: "Identification already registered." });
      user.email = email;
    }

    // Apply display name update
    if (name && name !== user.name) {
      user.name = name;
    }

    await user.save();
    await Log.create({
      type: "ok",
      code: "SYS_UPDATE",
      message: `Node ${user.email} updated profile matrix.`,
    }).catch(console.error);

    res.json({
      message: "Profile synchronized successfully.",
      user: { name: user.name, email: user.email },
      passwordChanged: passwordChanged,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during synchronization." });
  }
};
