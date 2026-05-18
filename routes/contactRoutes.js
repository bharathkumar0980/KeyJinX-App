const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/**
 * @module ContactRoutes
 * @description Public (unauthenticated) endpoint for submitting contact form enquiries.
 */

// POST /api/contact
router.post('/', contactController.submitContactForm);

module.exports = router;