const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const profileController = require('../controllers/profileController');

// Clean, readable routing
router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);

module.exports = router;