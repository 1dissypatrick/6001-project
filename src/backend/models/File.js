const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileName: String,
    documentName: String,
    subjects: [String],
    materialTypes: [String],
    educationLevel: String,
    date: { type: Date, default: Date.now },
    username: { type: String, required: true },
    coverPage: String // Store the filename of the cover page image
});

module.exports = mongoose.model('File', fileSchema);
