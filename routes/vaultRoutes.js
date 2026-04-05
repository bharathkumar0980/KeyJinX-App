const express = require('express');
const router = express.Router();
const { getPasswords, addPassword, deletePassword } = require('../controllers/vaultController');

// Define the routes for /api/vault
router.get('/', getPasswords);
router.post('/', addPassword);
router.delete('/:id', deletePassword); // Add this line to handle DELETE requests

// CRITICAL: If this line is missing, server.js crashes!
module.exports = router;