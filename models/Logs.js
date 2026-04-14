const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["ok", "warn", "err"],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // Automatically deletes logs older than 7 days
  }
});

module.exports = mongoose.model("Log", logSchema);