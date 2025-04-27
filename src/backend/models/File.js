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

// const mongoose = require('mongoose');
// const natural = require('natural');
// const { stopwords } = require('natural');
// const tokenizer = new natural.WordTokenizer();

// const fileSchema = new mongoose.Schema({
//     fileName: String,
//     documentName: String,
//     subjects: [String],
//     materialTypes: [String],
//     educationLevel: String,
//     date: { 
//         type: Date, 
//         default: Date.now 
//     },
//     username: { 
//         type: String, 
//         required: true 
//     },
//     coverPage: String,
//     // New fields for content-based recommendations
//     contentKeywords: {
//         type: [String],
//         default: []
//     },
//     contentVector: {
//         type: [Number],
//         default: []
//     },
//     // Optional: Add a text index for better search
//     fullText: String
// });

// // Pre-save hook to automatically generate content features
// fileSchema.pre('save', function(next) {
//     const file = this;
    
//     try {
//         // Combine all text content
//         const fullContent = [
//             file.documentName,
//             ...file.subjects,
//             file.educationLevel,
//             ...file.materialTypes
//         ].join(' ').toLowerCase();
        
//         // Tokenize and process content
//         const tokens = tokenizer.tokenize(fullContent);
//         const keywords = tokens
//             .filter(token => 
//                 token.length > 3 && 
//                 !stopwords.includes(token) &&
//                 /^[a-z]+$/.test(token) // Only keep alphabetic tokens
//             )
//             .slice(0, 20); // Keep top 20 keywords
            
//         file.contentKeywords = keywords;
//         file.fullText = fullContent; // Store full text for indexing
        
//         // Note: You would typically generate the contentVector here using a more
//         // advanced NLP technique (like word embeddings or TF-IDF weights)
//         // This is just a placeholder implementation
//         file.contentVector = keywords.map(() => Math.random()); // Replace with real vector
        
//         next();
//     } catch (error) {
//         console.error('Error processing file content:', error);
//         next(error);
//     }
// });

// // Create text index for search
// fileSchema.index({
//     documentName: 'text',
//     subjects: 'text',
//     educationLevel: 'text',
//     materialTypes: 'text',
//     contentKeywords: 'text',
//     fullText: 'text'
// }, {
//     weights: {
//         documentName: 10,
//         subjects: 5,
//         contentKeywords: 3,
//         fullText: 1
//     },
//     name: 'text_search_index'
// });

// module.exports = mongoose.model('File', fileSchema);