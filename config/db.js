const mongoose = require('mongoose');
/**
 * @module DatabaseConfig
 * @description Establishes the asynchronous connection to the MongoDB cluster.
 * Critical initialization step required before the server begins accepting requests.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;