const express = require('express');
const mongoose = require('mongoose');
const ClickCounts = require('./models/ClickCounts'); // Import the ClickCounts model

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

// Fetch click counts
app.get('/api/clickCounts', async (req, res) => {
  try {
    let clickCounts = await ClickCounts.findOne();
    if (!clickCounts) {
      // If no document exists, create a new one
      clickCounts = new ClickCounts();
      await clickCounts.save();
    }
    res.json(clickCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch click counts' });
  }
});

// Update click counts
app.post('/api/clickCounts', async (req, res) => {
  try {
    const { type, value } = req.body;

    // Find or create the click counts document
    let clickCounts = await ClickCounts.findOne();
    if (!clickCounts) {
      clickCounts = new ClickCounts();
    }

    // Increment the count for the given type and value
    if (type === 'subjects') {
      clickCounts.subjects.set(value, (clickCounts.subjects.get(value) || 0) + 1);
    } else if (type === 'educationLevels') {
      clickCounts.educationLevels.set(value, (clickCounts.educationLevels.get(value) || 0) + 1);
    }

    // Save the updated click counts
    await clickCounts.save();

    // Return the updated click counts
    res.json(clickCounts);
  } catch (error) {
    console.error('Error updating click counts:', error);
    res.status(500).json({ error: 'Failed to update click counts' });
  }
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});