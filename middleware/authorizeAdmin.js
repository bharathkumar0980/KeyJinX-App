/**
 * @module AuthorizeAdminMiddleware
 * @description Enforces Role-Based Access Control (RBAC) specifically for root-level administrative routes.
 * Must be executed sequentially AFTER authenticate.js, relying on the presence of req.user.
 */
module.exports = (req, res, next) => {
    // Validate that the authenticated user possesses the highest system clearance
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