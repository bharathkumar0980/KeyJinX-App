const Vault = require("../models/Vault");
const SECRET_KEY = process.env.ENCRYPTION_KEY;

exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Vault.find({ user: req.user.id });

    const decryptedData = passwords.map(entry => {
            const bytes = CryptoJS.AES.decrypt(entry.password, SECRET_KEY);
            const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
            return { ...entry._doc, password: originalPassword };
        });
        
    res.status(200).json(passwords);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Could not fetch passwords" });
  }
};

exports.addPassword = async (req, res) => {
    // Add this at the top of addPassword
    console.log("🛠️ DEBUG: req.user value:", req.user);
  try {
    const { website, username, password } = req.body;

    // 1. Ensure req.user exists (from your auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not identified" });
    }

    const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const newEntry = new Vault({
      website,
      username,
      password: encryptedPassword,
      user: req.user.id, // <--- CRITICAL: This must match your JWT payload key
    });

    await newEntry.save();
    console.log("✅ SUCCESS: Data saved for user", req.user.userId);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("❌ DB SAVE ERROR:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deletePassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Tell MongoDB to find this ID and delete it
    const deletedPassword = await Vault.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    // If the ID wasn't in the database
    if (!deletedPassword) {
      return res
        .status(404)
        .json({ message: "Credential not found in the vault." });
    }

    // Success!
    res.status(200).json({ message: "Credential successfully vaporized." });
  } catch (error) {
    console.error("❌ DB DELETE ERROR:", error);
    res.status(500).json({ message: "Server error during vaporization." });
  }
};

exports.updateVaultEntry = async (req, res) => {
    try {
        const { website, username, password } = req.body;
        const entryId = req.params.id;

        const updatedEntry = await Vault.findOneAndUpdate(
            { _id: entryId, user: req.user.id }, // Security: Must own the entry
            { website, username, password },
            { new: true } // Return the updated document
        );

        if (!updatedEntry) return res.status(404).json({ message: "Entry not found" });

        res.status(200).json({ message: "Vault recalibrated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Update failed." });
    }
};