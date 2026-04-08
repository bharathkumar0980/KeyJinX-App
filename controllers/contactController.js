const Message = require('../models/Message');

exports.submitContactForm = async (req, res) => {
    try {
        console.log("📥 Received Contact Data:", req.body);
        const { name, email, subject, message } = req.body;

        // Create the new message document
        const newMessage = new Message({ name, email, subject, message});
        
        await newMessage.save();
        console.log("✅ Message saved to MongoDB");

        res.status(201).json({ 
            success: true, 
            message: "Message received! We'll get back to you soon." 
        });
    } catch (error) {
        console.error("Contact Submission Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};