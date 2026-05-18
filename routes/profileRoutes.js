const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const profileController = require('../controllers/profileController');

/**
 * @module ProfileRoutes
 * @description Authenticated endpoints for reading and updating the operative's own profile.
 * All routes require a valid JWT via the `authenticate` middleware.
 */
// Clean, readable routing
router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);

module.exports = router;