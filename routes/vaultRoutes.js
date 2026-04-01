const express = require('express');
const router = express.Router();
const { getPasswords, addPassword } = require('../controllers/vaultController');

// Define the routes for /api/vault
router.get('/', getPasswords);
router.post('/', addPassword);

// CRITICAL: If this line is missing, server.js crashes!
module.exports = router;