const User = require('../models/User');
const Vault = require('../models/Vault'); 
const Message = require('../models/Message'); 
const mongoose = require('mongoose');
const os = require('os'); // 🛠️ Node's built-in Operating System module

exports.getSystemStats = async (req, res) => {
    try {
        const [totalUsers, totalPasswords, dbStats] = await Promise.all([
            User.countDocuments({ role: 'Client' }),
            Vault.countDocuments(),
            mongoose.connection.db.stats()
        ]);

        const dbSizeMB = (dbStats.dataSize / (1024 * 1024)).toFixed(2);
        const dbStatus = mongoose.connection.readyState === 1 ? 'Operational' : 'Offline';

        // 🛠️ Calculate REAL Server RAM (Memory) Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePct = ((usedMem / totalMem) * 100).toFixed(0);

        res.status(200).json({
            success: true,
            stats: { 
                totalUsers, 
                totalPasswords, 
                dbSize: dbSizeMB, 
                dbStatus,
                serverMem: memUsagePct // Send real RAM usage to frontend
            }
        });
    } catch (error) {
        console.error("Mainframe Stats Error:", error);
        res.status(500).json({ success: false, message: "Internal System Error" });
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

// 🛠️ NEW: Function to permanently delete a message
exports.deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Packet purged." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to purge packet." });
    }
};