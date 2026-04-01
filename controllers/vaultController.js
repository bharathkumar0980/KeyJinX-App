const Vault = require('../models/Vault');

exports.getPasswords = async (req, res) => {
    try {
        const passwords = await Vault.find();
        res.status(200).json(passwords);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Could not fetch passwords" });
    }
};

exports.addPassword = async (req, res) => {
    try {
        const { website, username, password } = req.body;
        
        const newEntry = new Vault({
            website,
            username,
            password
        });
        
        await newEntry.save();
        console.log("✅ SUCCESS: Data saved to MongoDB!"); // We want to see this!
        res.status(201).json(newEntry);
    } catch (error) {
        console.error("❌ DB SAVE ERROR:", error.message); // This will tell us exactly what is wrong
        res.status(500).json({ message: "Could not save password" });
    }
};