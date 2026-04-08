const express = require('express');
const router = express.Router();

// Import the middlewares
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

// Import the controller (we'll create this next)
const adminController = require('../controllers/adminController');

// All routes here require both Authentication and "The Admin" Authorization
router.get('/stats', authenticate, authorizeAdmin, adminController.getSystemStats);
router.get('/messages', authenticate, authorizeAdmin, adminController.getContactMessages);

module.exports = router;