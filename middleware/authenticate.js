// Auto-generated file
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get the token from the header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. ATTACH THE USER TO THE REQUEST (This fixes your error!)
        // Add this right before req.user = decoded;
        console.log("🛠️ DEBUG: Decoded Token Payload:", decoded);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};