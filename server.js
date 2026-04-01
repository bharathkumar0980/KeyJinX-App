require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const vaultRoutes = require('./routes/vaultRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express
const app = express();

// Connect to MongoDB Atlas
connectDB();

// --- MIDDLEWARE ---
// Allows the server to understand JSON data sent from your frontend
app.use(express.json());

// Serves your HTML, CSS, and JS files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
// Links your vault logic (GET/POST/DELETE) to the /api/vault endpoint
app.use('/api/vault', vaultRoutes);

// Links your authentication logic (Login/Register) to the /api/auth endpoint
app.use('/api/auth', authRoutes);

// --- FRONTEND ROUTING ---
// Ensures that refreshing the page or manual navigation points to index.html
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Hextech Server humming at: http://localhost:${PORT}`);
});