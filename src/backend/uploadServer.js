const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const File = require('./models/File'); // Ensure this model includes fields for fileName, documentName, subjects, educationLevel, materialTypes, and date
const Notification = require('./models/Notification'); 
const authenticateUser = require('./middleware/authenticateUser');
// const natural = require('natural');
// const { stopwords } = require('natural');
// const tokenizer = new natural.WordTokenizer();

const app = express();
const PORT = process.env.UPLOAD_PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // To parse form data

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define where the file will be stored
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    },
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (adjust as needed)
});

app.use('/uploads', express.static('D:/6000 project/my-app/uploads'));

app.post('/upload', authenticateUser, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverPage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { documentName, subjects, educationLevel, materialTypes } = req.body;

        if (!req.files.file || !req.files.file[0]) {
            return res.status(400).send('No file uploaded');
        }
        if (!documentName || !subjects || !educationLevel || !materialTypes) {
            return res.status(400).send('Missing form fields');
        }

        const newFile = new File({
            fileName: req.files.file[0].originalname,
            documentName,
            subjects: JSON.parse(subjects),
            materialTypes: JSON.parse(materialTypes),
            educationLevel,
            username: req.username,
            coverPage: req.files.coverPage ? req.files.coverPage[0].originalname : null
        });
        await newFile.save();

        res.status(201).send('Resource uploaded successfully');
    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).send('Error uploading resource');
    }
});

app.get('/files', async (req, res) => {
    const { all } = req.query; // Check if the 'all' query parameter is provided
    const username = req.headers.username;

    try {
        let files;
        if (all === 'true') {
            // Fetch all files if 'all' is true
            files = await File.find();
        } else {
            // Fetch files for the logged-in username
            if (!username) {
                return res.status(400).json({ message: 'Username is required!' });
            }
            files = await File.find({ username });
        }

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).send('Error fetching files');
    }
});

// New endpoint to fetch all files
app.get('/all-files', async (req, res) => {
    try {
        const files = await File.find(); // Fetch all files from the database
        res.status(200).json({ files });
    } catch (error) {
        console.error('Error fetching all files:', error);
        res.status(500).send('Error fetching all files');
    }
});

app.delete('/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // First find the file to get the owner info
        const file = await File.findOne({ _id: fileId });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete the file
        await File.deleteOne({ _id: fileId });

        // Create a notification for the user
        const notification = new Notification({
            username: file.username, // Using username instead of userId
            message: `Your file "${file.documentName}" (${file.fileName}) was deleted by an admin`,
            fileId: file._id,
            fileName: file.fileName,
            documentName: file.documentName
        });
        await notification.save();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

app.delete('/user/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // First find the file to get the owner info
        const file = await File.findOne({ _id: fileId });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete the file
        await File.deleteOne({ _id: fileId });

        // Create a notification for the user
        const notification = new Notification({
            username: file.username, // Using username instead of userId
            message: `Your file "${file.documentName}" (${file.fileName}) was deleted by yourself`,
            fileId: file._id,
            fileName: file.fileName,
            documentName: file.documentName
        });
        await notification.save();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

app.patch('/user/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { documentName } = req.body;

        const updatedFile = await File.findByIdAndUpdate(
            fileId,
            { documentName },
            { new: true }
        );

        if (!updatedFile) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).json(updatedFile);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ message: 'Error updating file' });
    }
});

// Get notifications by username
app.get('/notifications/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const notifications = await Notification.find({ username })
            .sort({ createdAt: -1 }) // Newest first
            .exec();
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});
// Add this new endpoint for batch marking notifications as read
app.put('/notifications/mark-all-read/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await Notification.updateMany(
            { username, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ 
            message: `${result.modifiedCount} notifications marked as read` 
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ 
            message: 'Error marking all notifications as read' 
        });
    }
});

// Add this endpoint to your backend (server.js or routes file)
app.put('/notifications/:id/mark-read', async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            { $set: { read: true } },
            { new: true } // Return the updated document
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            notification: updatedNotification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            message: 'Error marking notification as read',
            error: error.message 
        });
    }
});

// Get unread count by username
app.get('/notifications/:username/unread-count', async (req, res) => {
    try {
        const { username } = req.params;
        const count = await Notification.countDocuments({ 
            username, 
            read: false 
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        res.status(500).json({ message: 'Error counting unread notifications' });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Upload server is running on port ${PORT}`);
});
