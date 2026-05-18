const mongoose = require('mongoose');
/**
 * @module Vault
 * @description Mongoose schema for the Zero-Knowledge Vault.
 * The `password` field exclusively stores client-side AES-256 ciphertext.
 * The server never possesses the plaintext or the decryption key.
 */
const vaultSchema = new mongoose.Schema({
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    /**
     * The Digital Nametag (Foreign Key)
     * Links the encrypted payload to the specific Operative (User).
     * Ensures strict tenant isolation during queries.
     */
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Vault', vaultSchema);