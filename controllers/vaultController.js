const Vault = require("../models/Vault");

/**
 * Retrieve Vault Entries
 * @route GET /api/vault
 * @description Returns the encrypted vault documents for the authenticated user.
 * The server acts only as a storage medium; it has zero knowledge of the decrypted contents.
 */
exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Vault.find({ user: req.user.id });
    res.status(200).json(passwords);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Could not fetch passwords" });
  }
};

/**
 * Store New Vault Entry
 * @route POST /api/vault
 * @description Saves a new credential entry. The password field must be pre-encrypted 
 * by the client before transit. The server blindly persists the ciphertext.
 */
exports.addPassword = async (req, res) => {
  try {
    const { website, username, password } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not identified" });
    }

    // ZERO-KNOWLEDGE ARCHITECTURE: The 'password' field is already encrypted ciphertext from the browser. No server-side encryption occurs here.
    const newEntry = new Vault({
      website,
      username,
      password: password,
      user: req.user.id,
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("❌ DB SAVE ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Delete Vault Entry
 * @route DELETE /api/vault/:id
 * @description Permanently vaporizes a credential entry from the database.
 */
exports.deletePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPassword = await Vault.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deletedPassword)
      return res.status(404).json({ message: "Credential not found." });
    res.status(200).json({ message: "Credential successfully vaporized." });
  } catch (error) {
    res.status(500).json({ message: "Server error during vaporization." });
  }
};

/**
 * Update Vault Entry
 * @route PUT /api/vault/:id
 * @description Updates an existing entry. The incoming password must be pre-encrypted ciphertext.
 */
exports.updateVaultEntry = async (req, res) => {
  try {
    const { website, username, password } = req.body;
    const entryId = req.params.id;

    const updatedEntry = await Vault.findOneAndUpdate(
      { _id: entryId, user: req.user.id },
      { website, username, password }, // Persisting blind ciphertext
      { new: true },
    );

    if (!updatedEntry)
      return res.status(404).json({ message: "Entry not found" });
    res.status(200).json({ message: "Vault recalibrated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Update failed." });
  }
};

/**
 * Vault Migration
 * @route POST /api/vault/migrate
 * @description Used for bulk cryptographic migrations (e.g., when a user changes their master password).
 * Accepts an array of re-encrypted ciphertexts and updates all database entries sequentially.
 */
exports.migrateVault = async (req, res) => {
    try {
        const { encryptedVault } = req.body;
        
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

        // Iterate through the array and update every single entry blindly
        const updatePromises = encryptedVault.map(entry => {
            return Vault.findOneAndUpdate(
                { _id: entry._id, user: req.user.id },
                { password: entry.password } // The newly re-encrypted ciphertext
            );
        });

        await Promise.all(updatePromises);
        
        res.status(200).json({ message: "Vault successfully re-encrypted." });
    } catch (error) {
        console.error("Migration Error:", error);
        res.status(500).json({ message: "Vault migration failed." });
    }
};