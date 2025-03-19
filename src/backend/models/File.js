const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileName: String,
    documentName: String,
    subjects: [String], // Array of strings for subjects
    materialTypes: [String], // Array of strings for material types
    educationLevel: String,
    date: { type: Date, default: Date.now }, // Auto-set the date
    username: { type: String, required: true } // Store username
});

module.exports = mongoose.model('File', fileSchema);
