const Vault = require("../models/Vault");

// GET: Server blindly returns the encrypted database documents
exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Vault.find({ user: req.user.id });
    res.status(200).json(passwords);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Could not fetch passwords" });
  }
};

// POST: Server blindly saves the pre-encrypted password
exports.addPassword = async (req, res) => {
  try {
    const { website, username, password } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not identified" });
    }

    // 🛠️ NO SERVER ENCRYPTION HERE! The 'password' is already encrypted by the browser.
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

exports.updateVaultEntry = async (req, res) => {
  try {
    const { website, username, password } = req.body;
    const entryId = req.params.id;

    const updatedEntry = await Vault.findOneAndUpdate(
      { _id: entryId, user: req.user.id },
      { website, username, password }, // 🛠️ Saving blind ciphertext
      { new: true },
    );

    if (!updatedEntry)
      return res.status(404).json({ message: "Entry not found" });
    res.status(200).json({ message: "Vault recalibrated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Update failed." });
  }
};

// POST: Bulk update the vault (Used for Cryptographic Migrations)
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