const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const File = require('./models/File'); // Ensure this model includes fields for fileName, documentName, subjects, educationLevel, materialTypes, and date
const authenticateUser = require('./middleware/authenticateUser');

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
const upload = multer({ storage });

app.use('/uploads', express.static('D:/6000 project/my-app/uploads'));

app.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
    try {
        const { documentName, subjects, educationLevel, materialTypes } = req.body;

        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        if (!documentName || !subjects || !educationLevel || !materialTypes) {
            return res.status(400).send('Missing form fields');
        }

        const newFile = new File({
            fileName: req.file.originalname,
            documentName,
            subjects: JSON.parse(subjects),
            materialTypes: JSON.parse(materialTypes),
            educationLevel,
            username: req.username // Use the username from the middleware
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

// Start server
app.listen(PORT, () => {
    console.log(`Upload server is running on port ${PORT}`);
});
