const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Vault = require('../models/Vault');

// @desc    Register a new operative
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Operative already exists." });
        }

        // 1. Generate a raw Recovery Key (Format: KJX-XXXX-XXXX-XXXX)
        const rawRecoveryKey = `KJX-${crypto.randomBytes(6).toString('hex').toUpperCase().match(/.{1,4}/g).join('-')}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 2. Hash the Recovery Key exactly like a password
        const hashedRecoveryKey = await bcrypt.hash(rawRecoveryKey, salt);

        // 3. Save both to the database
        user = new User({ 
            email, 
            password: hashedPassword,
            recoveryKey: hashedRecoveryKey // Ensure this field is in your User.js model!
        });
        await user.save();
        
        // 4. Send the PLAIN key back ONLY THIS ONCE
        res.status(201).json({ 
            message: "Vault Key Forged Successfully!",
            recoveryKey: rawRecoveryKey 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// @desc    Authenticate operative & get token
// @route   POST /api/auth/login
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
            { id: user._id }, 
            process.env.JWT_SECRET || 'secret_key_123', 
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, message: "Access Granted" });
    } catch (error) {
        res.status(500).json({ message: "Login error." });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { email, recoveryKey, newPassword } = req.body;

        // 1. Find the operative
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Operative not found." });

        // 2. Verify the Recovery Key
        const isMatch = await bcrypt.compare(recoveryKey, user.recoveryKey);
        if (!isMatch) return res.status(401).json({ message: "Invalid Recovery Key." });

        // 3. THE BRUTAL WIPE: Delete all passwords linked to this user
        // We do this because the old passwords were encrypted with the LOST password!
        await Vault.deleteMany({ user: user._id });

        // 4. Hash and save the new Master Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ 
            message: "Password reset successful. Vault has been wiped for security." 
        });

    } catch (error) {
        res.status(500).json({ message: "Reset protocol failed." });
    }
};