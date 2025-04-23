const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5002; // Using a different port than your other servers

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (same database as your other services)
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Click Schema and Model
const userClickSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  subjects: { type: Map, of: Number, default: {} },
  educationLevels: { type: Map, of: Number, default: {} }
});
const UserClick = mongoose.model('UserClick', userClickSchema);

// Get user's click data
app.get('/api/user-clicks/:username', async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const data = await UserClick.findOne({ username });
    res.status(200).json(data || {
      subjects: {},
      educationLevels: {}
    });
  } catch (error) {
    console.error('Error fetching user clicks:', error);
    res.status(500).json({ message: 'Error fetching click data' });
  }
});

// Track a click
app.post('/api/track-click', async (req, res) => {
  try {
    const { username, type, value } = req.body;
    
    if (!username || !type || !value) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await UserClick.findOneAndUpdate(
      { username },
      { $inc: { [`${type}.${value}`]: 1 } },
      { upsert: true, new: true }
    );
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ message: 'Error tracking click' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Recommendation server running on http://localhost:${PORT}`);
});