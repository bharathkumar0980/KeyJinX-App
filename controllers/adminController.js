const User = require("../models/User");
const Vault = require("../models/Vault");
const Message = require("../models/Message");
const Log = require("../models/Logs"); 
const mongoose = require("mongoose");
const os = require("os");

// --- REAL CPU TRACKER ---
let currentCPUUsage = 0;
function calculateCPU() {
  const cpus = os.cpus();
  let idle = 0, total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) { total += cpu.times[type]; }
    idle += cpu.times.idle;
  }
  return { idle, total };
}
let startMeasure = calculateCPU();
setInterval(() => {
  const endMeasure = calculateCPU();
  const idleDifference = endMeasure.idle - startMeasure.idle;
  const totalDifference = endMeasure.total - startMeasure.total;
  currentCPUUsage = 100 - ~~(100 * idleDifference / totalDifference);
  startMeasure = endMeasure;
}, 2000); 

// --- API ENDPOINTS ---
exports.getSystemStats = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const [onlineCount, totalUsers, totalPasswords, dbStats, totalIntrusions, recentIntrusions] = await Promise.all([
      User.countDocuments({ lastSeen: { $gte: fiveMinutesAgo } }),
      User.countDocuments({}),
      Vault.countDocuments(),
      mongoose.connection.db.stats(),
      Log.countDocuments({ type: "err" }), 
      Log.countDocuments({ type: "err", createdAt: { $gte: oneMinuteAgo } }) 
    ]);

    // Format helper function
    const formatBytes = (bytes) => {
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${bytes} B`;
    };

    const logicalSize = dbStats.dataSize + (dbStats.indexSize || 0);

    res.status(200).json({
      success: true,
      stats: {
        onlineUsers: onlineCount,
        totalUsers: totalUsers,
        totalPasswords,
        totalLogicalSize: formatBytes(logicalSize),
        dataSize: formatBytes(dbStats.dataSize),           
        indexSize: formatBytes(dbStats.indexSize || 0), 
        storageSize: formatBytes(dbStats.storageSize || 0), 
        totalIntrusions: totalIntrusions,
        recentIntrusions: recentIntrusions,
        firewallStatus: recentIntrusions > 10 ? "LOCKDOWN" : "STRICT",
        dbStatus: mongoose.connection.readyState === 1 ? "Operational" : "Offline",
        serverMem: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(0),
        serverCpu: currentCPUUsage 
      },
    });
  } catch (error) {
    console.error("Mainframe Stats Error:", error);
    res.status(500).json({ success: false, message: "Internal System Error" });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(30);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Log retrieval failed" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    await Log.create({ type: "warn", code: "DATA_PURGE", message: `Transmission ${req.params.id.substring(0,6)} deleted.`});
    res.status(200).json({ success: true, message: "Packet purged." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to purge packet." });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching users" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Client", "The Admin", "Leecher"].includes(role)) return res.status(400).json({ message: "Invalid role specified." });
    if (req.user.userId === req.params.id) return res.status(403).json({ message: "Cannot change own role." });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    await Log.create({ 
      type: role === "The Admin" ? "warn" : "ok", 
      code: "AUTH_OVERRIDE", 
      message: `Clearance for ${user.email} updated to ${role}` 
    });

    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: "Server Error updating role" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: "Comms link failure." });
  }
};