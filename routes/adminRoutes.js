const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const adminController = require('../controllers/adminController');

router.get('/stats', authenticate, authorizeAdmin, adminController.getSystemStats);
router.get('/messages', authenticate, authorizeAdmin, adminController.getMessages);
router.delete('/messages/:id', authenticate, authorizeAdmin, adminController.deleteMessage);

// 🛠️ NEW: Routes for User Management
router.get('/users', authenticate, authorizeAdmin, adminController.getUsers);
router.put('/users/:id/role', authenticate, authorizeAdmin, adminController.updateUserRole);

// 🛠️ NEW: Route for Logs
router.get('/logs', authenticate, authorizeAdmin, adminController.getLogs);

module.exports = router;