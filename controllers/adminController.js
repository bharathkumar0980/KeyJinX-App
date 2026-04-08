const User = require('../models/User');
const Vault = require('../models/Vault');
const Contact = require('../models/Contact'); // Assuming you have a Contact model
const mongoose = require('mongoose');

exports.getSystemStats = async (req, res) => {
    try {
        // 1. Total User Count (Active Clients)
        const totalUsers = await User.countDocuments({ role: 'Client' });

        // 2. Total Credentials Stored
        const totalPasswords = await Vault.countDocuments();

        // 3. Database Connection Status
        const dbStatus = mongoose.connection.readyState === 1 ? 'Operational' : 'Disconnected';

        // 4. Database Size (Approximate)
        const stats = await mongoose.connection.db.stats();
        const dbSizeMB = (stats.dataSize / (1024 * 1024)).toFixed(2); // Convert bytes to MB

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalPasswords,
                dbStatus,
                dbSize: `${dbSizeMB} MB`,
                serverTime: new Date().toLocaleString()
            }
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Failed to retrieve mainframe statistics." });
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        // Fetch all messages from the contact form
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Could not retrieve support comms." });
    }
};