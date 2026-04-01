const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new operative
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Operative already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: "Vault Key Forged Successfully!" });
    } catch (error) {
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