const Message = require('../models/Message');

/**
 * Contact Form Submission Handler
 * @route POST /api/contact
 * @description Receives and persists a plain-text contact enquiry from the public-facing form.
 * This endpoint is unauthenticated and intentionally open for public access.
 */
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Create the new message document
        const newMessage = new Message({ name, email, subject, message});
        
        await newMessage.save();

        res.status(201).json({ 
            success: true, 
            message: "Message received! We'll get back to you soon." 
        });
    } catch (error) {
        console.error("Contact Submission Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};