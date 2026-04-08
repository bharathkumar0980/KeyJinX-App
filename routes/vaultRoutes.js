const express = require("express");
const router = express.Router();
const vaultController = require("../controllers/vaultController");
const auth = require("../middleware/authenticate"); // Import the bouncer

// Add 'auth' as the second argument to protect these routes
router.get("/", auth, vaultController.getPasswords);
router.post("/", auth, vaultController.addPassword);
router.delete("/:id", auth, vaultController.deletePassword);
router.put('/:id', auth, vaultController.updateVaultEntry);

module.exports = router;
