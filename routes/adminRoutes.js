const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const adminController = require('../controllers/adminController');

/**
 * @module AdminRoutes
 * @description Defines the RESTful API endpoints for the root administration dashboard.
 * All routes in this module are protected by the `authenticate` (JWT validation) 
 * and `authorizeAdmin` (RBAC) middleware sequence.
 */

router.get('/stats', authenticate, authorizeAdmin, adminController.getSystemStats);
router.get('/messages', authenticate, authorizeAdmin, adminController.getMessages);
router.delete('/messages/:id', authenticate, authorizeAdmin, adminController.deleteMessage);

// User Identity and Access Management (IAM) Routes
router.get('/users', authenticate, authorizeAdmin, adminController.getUsers);
router.put('/users/:id/role', authenticate, authorizeAdmin, adminController.updateUserRole);

// Security and Audit Log Routes
router.get('/logs', authenticate, authorizeAdmin, adminController.getLogs);

module.exports = router;