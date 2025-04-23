const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;
const SALT_ROUNDS = 10;

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
    role: { type: String, default: 'user' } // 'user' or 'admin'
});

// Add this admin creation endpoint (run once to create admin)
app.post('/create-admin', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin account already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

        // Create admin user
        const admin = new User({
            emailAddress: 'admin@example.com',
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        res.status(201).send('Admin account created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin account' });
    }
});


const User = mongoose.model('User', UserSchema);

// Registration Endpoint
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create and save the new user
        const user = new User({ emailAddress, username, password: hashedPassword });
        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An error occurred while registering. Please try again later.' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                return res.status(200).json({ 
                    username, 
                    role: user.role,  // Add this line
                    message: 'Login successful!' 
                });
            }
        }
        return res.status(400).json({ message: 'Invalid username or password' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred while logging in.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

