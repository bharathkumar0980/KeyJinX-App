const jwt = require("jsonwebtoken");
const Log = require("../models/Logs"); 
const User = require("../models/User");

/**
 * @module AuthenticateMiddleware
 * @description Extracts and verifies the JWT from the Authorization header.
 * Attaches the decoded user payload to the request object (req.user).
 * Automatically updates the user's 'lastSeen' timestamp upon successful validation.
 * Logs unauthorized access attempts to the central audit log.
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    Log.create({ type: "err", code: "AUTH_MISSING", message: `Blocked unauthorized access from IP: ${req.ip}` }).catch(console.error);
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    const activeId = decoded.userId || decoded.id || decoded._id; 
    if (activeId) {
      await User.findByIdAndUpdate(activeId, { lastSeen: new Date() });
    }
    next();
  } catch (err) {
    Log.create({ type: "err", code: "AUTH_FORGED", message: `Blocked invalid token from IP: ${req.ip}` }).catch(console.error);
    res.status(401).json({ message: "Token is not valid" });
  }
};