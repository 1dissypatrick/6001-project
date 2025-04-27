const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5002; // Using a different port than your other servers
const natural = require('natural');
const tfidf = new natural.TfIdf();
const stopwords = require('natural').stopwords;

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

// Add this to your existing recommendation server
app.post('/api/content-recommendations', async (req, res) => {
  try {
    const { username, currentFileId } = req.body;
    
    // 1. Get all files from database
    const allFiles = await File.find({});
    
    // 2. Get current file details
    const currentFile = await File.findById(currentFileId);
    if (!currentFile) {
      return res.status(404).json({ message: 'Current file not found' });
    }
    
    // 3. Combine content features for analysis
    const currentContent = [
      currentFile.documentName,
      currentFile.subjects.join(' '),
      currentFile.educationLevel,
      currentFile.materialTypes.join(' ')
    ].join(' ');
    
    // 4. Process all files to build TF-IDF model
    const fileDocuments = [];
    allFiles.forEach(file => {
      const docContent = [
        file.documentName,
        file.subjects.join(' '),
        file.educationLevel,
        file.materialTypes.join(' ')
      ].join(' ');
      
      fileDocuments.push({
        id: file._id,
        content: docContent
      });
      
      // Add document to TF-IDF
      tfidf.addDocument(docContent);
    });
    
    // 5. Find similar documents
    const similarities = [];
    const currentDocIndex = fileDocuments.findIndex(d => d.id === currentFileId);
    
    fileDocuments.forEach((doc, index) => {
      if (index !== currentDocIndex) {
        let similarity = 0;
        tfidf.tfidfs(currentContent, (i, measure) => {
          if (i === index) similarity = measure;
        });
        similarities.push({
          fileId: doc.id,
          similarity
        });
      }
    });
    
    // 6. Sort by similarity and combine with click data
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // 7. Get user's click data to combine with content similarity
    let userClickData = { subjects: {}, educationLevels: {} };
    if (username) {
      const userClicks = await UserClick.findOne({ username });
      if (userClicks) userClickData = userClicks;
    }
    
    // 8. Combine scores (50% content similarity, 50% user preferences)
    const recommendations = similarities.map(item => {
      const file = allFiles.find(f => f._id.equals(item.fileId));
      const subjectScore = file.subjects.reduce((sum, subject) => {
        return sum + (userClickData.subjects.get(subject) || 0);
      }, 0);
      
      const levelScore = userClickData.educationLevels.get(file.educationLevel) || 0;
      
      return {
        ...file.toObject(),
        combinedScore: (item.similarity * 0.5) + 
                      ((subjectScore + levelScore) * 0.5)
      };
    }).sort((a, b) => b.combinedScore - a.combinedScore);
    
    res.status(200).json(recommendations.slice(0, 20)); // Return top 20
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Recommendation server running on http://localhost:${PORT}`);
  });