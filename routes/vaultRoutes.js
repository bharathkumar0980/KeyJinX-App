const express = require("express");
const router = express.Router();
const vaultController = require("../controllers/vaultController");
const auth = require("../middleware/authenticate");

/**
 * @module VaultRoutes
 * @description Authenticated CRUD endpoints for the Zero-Knowledge Password Vault.
 * All routes are protected by JWT authentication. The server never decrypts the stored data.
 */

// Add 'auth' as the second argument to protect these routes
router.get("/", auth, vaultController.getPasswords);
router.post("/", auth, vaultController.addPassword);
router.post("/migrate", auth, vaultController.migrateVault);
router.delete("/:id", auth, vaultController.deletePassword);
router.put('/:id', auth, vaultController.updateVaultEntry);

module.exports = router;
