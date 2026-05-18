require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

/**
 * Route Module Imports
 * These modules define the API endpoints for various subsystems.
 */
const vaultRoutes = require('./routes/vaultRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
connectDB();

/**
 * 1. Global Middleware
 * Must be registered before routes to parse incoming JSON payloads.
 */
app.use(express.json()); 

/**
 * 2. API Route Registration
 * Registered before static files to ensure API requests are intercepted early
 * and not accidentally resolved to a static directory.
 */
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

/**
 * 3. Static Asset Serving
 * Exposes the 'public' directory for frontend assets (HTML, CSS, JS).
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 4. Frontend Routing (Catch-All)
 * Uses a negative lookahead regex to match all routes EXCEPT those starting with /api.
 * This ensures that direct URL navigation (e.g., /manager) serves the SPA's entry point,
 * allowing client-side routing to take over without interfering with backend APIs.
 */
app.get(/^((?!\/api).)*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Hextech Server humming at: http://localhost:${PORT}`);
});

const Log = require("./models/Logs"); // Adjust the path if necessary

/**
 * Database Connection & Initialization
 * Establishes connection to MongoDB and writes a boot-up log entry.
 */
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    
    try {
      // Record server startup sequence in the persistent system log
      await Log.create({
        type: "ok",
        code: "SYS_BOOT",
        message: "Mainframe server initialized and connected to database."
      });
    } catch (err) {
      console.error("Failed to write boot log:", err);
    }
  })
  .catch(err => console.log(err));