const mongoose = require('mongoose');
/**
 * @module Message
 * @description Mongoose schema for contact form submissions.
 * These are the plain-text inquiries sent to the Admin Dashboard.
 */
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);