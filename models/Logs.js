const mongoose = require("mongoose");
/**
 * @module Logs
 * @description Mongoose schema for the centralized system audit log.
 * Utilizes a Time-To-Live (TTL) index to automatically purge records older than 7 days,
 * ensuring the database doesn't bloat with stale telemetry.
 */
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