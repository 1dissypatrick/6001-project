const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Changed from userId to username
    message: { type: String, required: true },
    fileId: { type: String },
    fileName: { type: String },
    documentName: { type: String }, // Added documentName
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);