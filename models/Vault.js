const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
    // We will make this 'required: true' later when Auth is finished!
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vault', vaultSchema);