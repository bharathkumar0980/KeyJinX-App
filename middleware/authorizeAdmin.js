// middleware/authorizeAdmin.js

module.exports = (req, res, next) => {
    // This runs AFTER authenticate.js, so req.user is already available
    if (req.user && req.user.role === 'The Admin') {
        console.log(`🔓 Admin Access: ${req.user.email}`);
        next();
    } else {
        console.warn(`🛑 Unauthorized attempt by: ${req.user ? req.user.role : 'Guest'}`);
        return res.status(403).json({ 
            message: "Access Denied: High-level clearance required for The Admin." 
        });
    }
};