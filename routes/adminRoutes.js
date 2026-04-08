const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const adminController = require('../controllers/adminController');

router.get('/stats', authenticate, authorizeAdmin, adminController.getSystemStats);
router.get('/messages', authenticate, authorizeAdmin, adminController.getMessages);

// 🛠️ NEW: Route to handle message deletion
router.delete('/messages/:id', authenticate, authorizeAdmin, adminController.deleteMessage);

module.exports = router;