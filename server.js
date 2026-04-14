require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const vaultRoutes = require('./routes/vaultRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
connectDB();

// --- 1. MIDDLEWARE (MUST BE FIRST) ---
app.use(express.json()); 

// --- 2. API ROUTES (MUST BE SECOND) ---
// We put these here so the server checks for data requests first
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// --- 3. STATIC FILES (THIRD) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- 4. FRONTEND ROUTING (LAST) ---
/**
 * Using a Regex ensures that only non-API routes 
 * return the index.html file.
 */
app.get(/^((?!\/api).)*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Hextech Server humming at: http://localhost:${PORT}`);
});

const Log = require("./models/Logs"); // Adjust the path if necessary

// Inside your mongoose.connect().then(...) block:
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    
    // 🛠️ Log the server startup to the database
    try {
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