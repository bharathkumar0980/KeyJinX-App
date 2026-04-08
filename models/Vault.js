const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    // THE DIGITAL NAMETAG
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Vault', vaultSchema);