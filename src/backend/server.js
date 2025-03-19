const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// User Schema
const UserSchema = new mongoose.Schema({
    emailAddress: String,
    username: String,
    password: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    const { emailAddress, username, password, confirmPassword } = req.body;

    try {
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }

        // Check for duplicate emailAddress or username
        const existingEmail = await User.findOne({ emailAddress });
        const existingUsername = await User.findOne({ username });

        if (existingEmail) {
            return res.status(400).json({ message: 'Email address is already in use. Please try another one.' });
        }

        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken. Please choose a different one.' });
        }

        // Create and save the new user
        const user = new User({ emailAddress, username, password });
        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An error occurred while registering. Please try again later.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user) {
        if (user.password === password) {
            return res.status(200).json({ username, message: 'Login successful!' });
        } else {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
    } else {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
