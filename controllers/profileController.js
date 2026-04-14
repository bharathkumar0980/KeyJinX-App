const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Log = require("../models/Logs");

// @desc    Fetch current user profile
// @route   GET /api/profile
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

// @desc    Update user profile matrix
// @route   PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const activeId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(activeId);

    let passwordChanged = false;

    // 1. Handle Password Change
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

    // 2. Handle Email Change
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ message: "Identification already registered." });
      user.email = email;
    }

    // 3. Handle Name Change
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
