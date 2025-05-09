const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const natural = require('natural');

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
  educationLevels: { type: Map, of: Number, default: {} },
  materialTypes: { type: Map, of: Number, default: {} }, // Added for materialTypes
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
      educationLevels: {},
      materialTypes: {}, // Include materialTypes in default response
    });
  } catch (error) {
    console.error('Error fetching user clicks:', error);
    res.status(500).json({ message: 'Error fetching click data' });
  }
});

// // Track a click
// app.post('/api/track-click', async (req, res) => {
//   try {
//     const { username, type, value } = req.body;
    
//     if (!username || !type || !value) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Validate type to prevent arbitrary field updates
//     const validTypes = ['subjects', 'educationLevels', 'materialTypes'];
//     if (!validTypes.includes(type)) {
//       return res.status(400).json({ message: 'Invalid type' });
//     }

//     const result = await UserClick.findOneAndUpdate(
//       { username },
//       { $inc: { [`${type}.${value}`]: 1 } },
//       { upsert: true, new: true }
//     );
    
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.error('Error tracking click:', error);
//     res.status(500).json({ message: 'Error tracking click' });
//   }
// });
// Keyword-based subject mapping (can be expanded)
const subjectKeywords = {
  'Chinese Language Education': [
    'chinese language',
    'mandarin',
    'cantonese',
    'chinese literature',
    'hanzi',
    'pinyin',
  ],
  'English Language Education': [
    'english language',
    'grammar',
    'vocabulary',
    'english literature',
    'writing skills',
    'esl',
  ],
  'Mathematics Education': [
    'algebra',
    'calculus',
    'geometry',
    'trigonometry',
    'statistics',
    'math',
  ],
  'Science Education': [
    'physics',
    'chemistry',
    'biology',
    'astronomy',
    'earth science',
    'science',
  ],
  'Social and Humanistic Education': [
    'sociology',
    'psychology',
    'anthropology',
    'philosophy',
    'humanities',
    'social studies',
  ],
  'Physical Education': [
    'physical education',
    'sports',
    'fitness',
    'exercise',
    'athletics',
    'health',
  ],
  'Arts and Humanities': [
    'art',
    'music',
    'literature',
    'theater',
    'visual arts',
    'humanities',
    'shakespeare',
  ],
  'History': [
    'romance of the three kingdoms',
    'world war',
    'civil war',
    'ancient rome',
    'revolution',
    'history',
  ],
  'Business and Communication': [
    'business',
    'marketing',
    'communication',
    'management',
    'economics',
    'finance',
  ],
  'Career and Technical Education': [
    'vocational training',
    'technical education',
    'career skills',
    'trade skills',
    'engineering',
    'computer science',
  ],
  'General Studies': [
    'general studies',
    'interdisciplinary',
    'liberal arts',
    'study skills',
    'academic writing',
  ],
};

// Function to classify query into a subject
const classifyQuery = (query) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(query.toLowerCase());

  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    for (const keyword of keywords) {
      if (tokens.some((token) => keyword.includes(token) || token.includes(keyword))) {
        return subject;
      }
    }
  }
  return null; // No subject matched
};

// Track click or search endpoint
app.post('/api/track-click', async (req, res) => {
  try {
    const { username, type, value, source, query } = req.body;

    if (!username || (!type && !query) || (!value && !query)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (source === 'search' && query) {
      // Handle search query
      const subject = classifyQuery(query);

      if (!subject) {
        return res.status(200).json({ success: true, message: 'No subject matched for query' });
      }

      const result = await UserClick.findOneAndUpdate(
        { username },
        { $inc: { [`subjects.${subject}`]: 1 } },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, data: result, subject });
    }

    // Existing click tracking logic
    const validTypes = ['subjects', 'educationLevels', 'materialTypes'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
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