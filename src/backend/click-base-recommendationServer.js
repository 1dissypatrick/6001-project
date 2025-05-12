const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { NlpManager } = require('node-nlp');
const natural = require('natural');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Click Schema and Model
const userClickSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  subjects: { type: Map, of: Number, default: {} },
  educationLevels: { type: Map, of: Number, default: {} },
  materialTypes: { type: Map, of: Number, default: {} },
});
const UserClick = mongoose.model('UserClick', userClickSchema);

// Expanded subject keywords with new subjects
const subjectKeywords = {
  'Chinese Language Education': [
    'chinese language', 'mandarin', 'cantonese', 'chinese literature', 'hanzi', 'pinyin',
    'chinese', 'mandarin course', 'cantonese pronunciation', 'chinese characters',
    'chinese grammar', 'chinese culture', 'learn chinese', 'mandarin speaking',
    'chinese writing', 'pinyin tones', 'chinese vocabulary', 'cantonese learning'
  ],
  'English Language Education': [
    'english language', 'grammar', 'vocabulary', 'english literature', 'writing skills',
    'esl', 'english', 'english grammar', 'english writing', 'english speaking',
    'essay writing', 'reading comprehension', 'learn english', 'english pronunciation',
    'english vocabulary', 'grammar exercises', 'esl teaching', 'english idioms'
  ],
  'Mathematics Education': [
    'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'math', 'maths',
    'mathematics', 'calculus derivatives', 'geometry shapes', 'probability', 'linear algebra',
    'math education', 'algebraic equations', 'trigonometric functions', 'stats',
    'mathematical', 'calculus integrals', 'math tutorial', 'algebr'
  ],
  'Science Education': [
    'physics', 'chemistry', 'biology', 'astronomy', 'earth science', 'science',
    'quantum mechanics', 'photosynthesis', 'genetics', 'thermodynamics',
    'chemical reactions', 'environmental science', 'science education', 'biology cells',
    'physics mechanics', 'astronomy stars', 'chem', 'scientific method'
  ],
  'Social and Humanistic Education': [
    'sociology', 'psychology', 'anthropology', 'philosophy', 'humanities', 'social studies',
    'social science', 'cultural anthropology', 'psychology behavior', 'philosophy ethics',
    'sociology theories', 'social theory', 'psych', 'philosophical', 'sociological',
    'humanistic studies', 'cultural studies', 'psychology cognition', 'humanities overview'
  ],
  'Physical Education': [
    'physical education', 'sports', 'fitness', 'exercise', 'athletics', 'health',
    'physical fitness', 'sports training', 'exercise routines', 'health education',
    'sports science', 'athletic training', 'fitness coaching', 'physical activity',
    'sports skills', 'health and fitness', 'exercise science', 'athletics programs'
  ],
  'Arts and Humanities': [
    'art', 'music', 'literature', 'theater', 'visual arts', 'humanities', 'shakespeare',
    'art history', 'music theory', 'literature analysis', 'theater performance',
    'classical music', 'arts education', 'literary criticism', 'visual art techniques',
    'music composition', 'art appreciation', 'theater history', 'lit'
  ],
  'History': [
    'romance of the three kingdoms', 'world war', 'civil war', 'ancient rome', 'revolution',
    'history', 'three kingdoms', 'ancient egypt', 'han dynasty', 'qing dynasty',
    'roman empire', 'medieval europe', 'world history', 'historical events',
    'colonial america', 'dynasty', 'ancient history', 'egyptian pyramids', 'histor'
  ],
  'Business and Communication': [
    'business', 'marketing', 'communication', 'management', 'economics', 'finance',
    'business finance', 'marketing strategies', 'management skills', 'business communication',
    'public relations', 'biz', 'econ', 'financial analysis', 'marketing campaigns',
    'corporate communication', 'business leadership', 'economics policies'
  ],
  'Career and Technical Education': [
    'vocational training', 'technical education', 'career skills', 'trade skills',
    'engineering', 'computer science', 'coding', 'programming', 'technical skills',
    'engineering design', 'coding bootcamp', 'tech education', 'programing',
    'career training', 'technical training', 'engineering technology', 'code', 'cs',
    'vocational courses', 'trade certification', 'computer programming', 'coding skills',
    'engineering projects', 'engineering basics'
  ],
  'General Studies': [
    'general studies', 'interdisciplinary', 'liberal arts', 'study skills', 'academic writing',
    'critical thinking', 'research skills', 'general education', 'study techniques',
    'academic skills', 'liberal arts education', 'study strategies', 'general knowledge',
    'academic research', 'interdisciplinary studies', 'crit thinking', 'academics',
    'writing for college', 'interdisciplinary research', 'critical analysis',
    'general studies course'
  ],
  'Computer Science Education': [
    'computer science', 'coding', 'programming', 'algorithms', 'data structures',
    'software development', 'machine learning', 'artificial intelligence', 'cs',
    'python programming', 'java programming', 'web development', 'database systems',
    'cybersecurity', 'computer networks', 'ai', 'ml', 'coding tutorials',
    'software engineering', 'algorithm design', 'data science', 'comp sci'
  ],
  'Environmental Education': [
    'environmental science', 'ecology', 'sustainability', 'climate change', 'conservation',
    'environmental studies', 'green energy', 'biodiversity', 'renewable energy',
    'pollution', 'ecosystems', 'environmental policy', 'climate science', 'eco',
    'sustainable development', 'wildlife conservation', 'environmental education',
    'global warming', 'recycling', 'carbon footprint'
  ],
  'Health Education': [
    'health education', 'nutrition', 'mental health', 'public health', 'wellness',
    'disease prevention', 'healthcare', 'fitness', 'hygiene', 'epidemiology',
    'healthy lifestyle', 'mental wellness', 'nutrition science', 'health promotion',
    'preventive medicine', 'health awareness', 'wellbeing', 'diet and nutrition',
    'stress management', 'public health campaigns'
  ]
};

// Initialize NLP manager with stemming
const nlpManager = new NlpManager({ languages: ['en'], forceNER: true, nlu: { useNoneFeature: true, useStemming: true } });

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Train NLP model with sample queries (using a small set for initialization)
const trainNlpModel = async () => {
  const sampleQueries = [
    { query: 'learn mandarin speaking', subject: 'Chinese Language Education' },
    { query: 'english grammar exercises', subject: 'English Language Education' },
    { query: 'calculus derivatives', subject: 'Mathematics Education' },
    { query: 'quantum mechanics basics', subject: 'Science Education' },
    { query: 'cultural anthropology', subject: 'Social and Humanistic Education' },
    { query: 'sports training', subject: 'Physical Education' },
    { query: 'shakespeare analysis', subject: 'Arts and Humanities' },
    { query: 'world war history', subject: 'History' },
    { query: 'marketing strategies', subject: 'Business and Communication' },
    { query: 'coding bootcamp', subject: 'Career and Technical Education' },
    { query: 'critical thinking skills', subject: 'General Studies' },
    { query: 'python programming', subject: 'Computer Science Education' },
    { query: 'climate change impacts', subject: 'Environmental Education' },
    { query: 'nutrition basics', subject: 'Health Education' },
    { query: 'random topic', subject: 'None' }
  ];

  sampleQueries.forEach(({ query, subject }) => {
    const tokens = tokenizer.tokenize(query.toLowerCase());
    const bigrams = natural.NGrams.bigrams(tokens).map(ngram => ngram.join(' '));
    const trigrams = natural.NGrams.trigrams(tokens).map(ngram => ngram.join(' '));
    nlpManager.addDocument('en', [...tokens, ...bigrams, ...trigrams].join(' '), subject);
  });

  await nlpManager.train();
  nlpManager.save('model.nlp');
};

// Run training on server start
trainNlpModel().catch(err => console.error('Error training NLP model:', err));

// Function to classify query into a subject
const classifyQuery = async (query) => {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  let predicted = null;
  let maxScore = 0;
  let matchedKeywords = [];

  // Keyword-based matching with weighted scoring
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    let score = 0;
    const stemmedKeywords = keywords.map(k => k.split(' ').map(w => stemmer.stem(w)).join(' '));
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const stemmedKeyword = stemmedKeywords[i];
      const keywordTokens = keyword.split(' ');
      const isHighlyDiscriminative = [
        'pinyin', 'hanzi', 'calculus', 'quantum mechanics', 'coding', 'machine learning',
        'climate change', 'nutrition', 'data structures'
      ].includes(keyword);
      const jaroWinkler = stemmedTokens.some((token) =>
        stemmedKeyword.split(' ').some((kt) => natural.JaroWinklerDistance(token, kt) > 0.95)
      );
      if (
        stemmedTokens.some((token) => stemmedKeyword.includes(token) || token.includes(stemmedKeyword)) ||
        jaroWinkler
      ) {
        score += isHighlyDiscriminative ? 2.0 : (keywordTokens.length > 1 ? 1.5 : 1.0);
        matchedKeywords.push(keyword);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      predicted = subject;
    } else if (score === maxScore && score > 0) {
      // Resolve tie by checking for more specific keywords
      const specificKeywords = subjectKeywords[subject].filter(k => k.includes(' '));
      const currentSpecific = subjectKeywords[predicted].filter(k => k.includes(' '));
      predicted = specificKeywords.length > currentSpecific.length ? subject : predicted;
    }
  }

  // Combine with node-nlp if no strong keyword match
  let nlpScore = 0;
  let nlpIntent = 'None';
  if (!predicted || maxScore < 2) {
    const bigrams = natural.NGrams.bigrams(tokens).map((ngram) => ngram.join(' '));
    const trigrams = natural.NGrams.trigrams(tokens).map((ngram) => ngram.join(' '));
    const queryText = [...tokens, ...bigrams, ...trigrams].join(' ');
    const response = await nlpManager.process('en', queryText);
    nlpScore = response.score;
    nlpIntent = response.score > 0.85 ? response.intent : 'None';
    predicted = nlpIntent;
  } else {
    // Combine keyword and NLP scores
    const bigrams = natural.NGrams.bigrams(tokens).map((ngram) => ngram.join(' '));
    const trigrams = natural.NGrams.trigrams(tokens).map((ngram) => ngram.join(' '));
    const queryText = [...tokens, ...bigrams, ...trigrams].join(' ');
    const response = await nlpManager.process('en', queryText);
    nlpScore = response.score;
    nlpIntent = response.score > 0.85 ? response.intent : 'None';
    const combinedScore = maxScore * 0.4 + nlpScore * 0.6;
    predicted = combinedScore > 0.85 ? (nlpIntent !== 'None' ? nlpIntent : predicted) : 'None';
  }

  // Post-processing rules
  if (predicted === 'General Studies' && tokens.some(t => ['coding', 'programming', 'algorithms'].includes(t))) {
    predicted = 'Computer Science Education';
  }
  if (predicted === 'Physical Education' && tokens.some(t => ['nutrition', 'mental health'].includes(t))) {
    predicted = 'Health Education';
  }

  return predicted === 'None' ? null : predicted;
};

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
      materialTypes: {},
    });
  } catch (error) {
    console.error('Error fetching user clicks:', error);
    res.status(500).json({ message: 'Error fetching click data' });
  }
});

// Track click or search endpoint
app.post('/api/track-click', async (req, res) => {
  try {
    const { username, type, value, source, query } = req.body;

    if (!username || (!type && !query) || (!value && !query)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (source === 'search' && query) {
      // Handle search query
      const subject = await classifyQuery(query);

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