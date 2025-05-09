const natural = require('natural');

// Load test queries
const testQueries = require('./testQueries');

// Expanded keyword-based subject mapping
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
    'mathematical', 'calculus integrals', 'math tutorial', 'algebr' // Typos
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
    'humanistic studies', 'cultural studies', 'psychology cognition'
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
    'engineering design', 'coding bootcamp', 'tech education', 'programing', // Typos
    'career training', 'technical training', 'engineering technology', 'code', 'cs'
  ],
  'General Studies': [
    'general studies', 'interdisciplinary', 'liberal arts', 'study skills', 'academic writing',
    'critical thinking', 'research skills', 'general education', 'study techniques',
    'academic skills', 'liberal arts education', 'study strategies', 'general knowledge',
    'academic research', 'interdisciplinary studies', 'crit thinking', 'academics'
  ],
};

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Train Bayes Classifier with preprocessing
const classifier = new natural.BayesClassifier();
testQueries.slice(0, 160).forEach(({ query, expected }) => { // Use 80% for training
  if (expected) {
    const tokens = tokenizer.tokenize(query.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    const ngrams = natural.NGrams.bigrams(stemmedTokens).map(ngram => ngram.join(' '));
    classifier.addDocument([...stemmedTokens, ...ngrams], expected);
  }
});
classifier.train();

// Function to classify query (enhanced hybrid approach)
const classifyQuery = (query) => {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  const ngrams = natural.NGrams.bigrams(stemmedTokens).map(ngram => ngram.join(' '));

  // Keyword-based matching with fuzzy matching
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    for (const keyword of keywords) {
      if (
        tokens.some((token) => keyword.includes(token) || token.includes(keyword)) ||
        stemmedTokens.some((token) => natural.JaroWinklerDistance(token, stemmer.stem(keyword)) > 0.75)
      ) {
        return subject;
      }
    }
  }

  // Bayes classifier with confidence thresholding
  const classifications = classifier.getClassifications([...stemmedTokens, ...ngrams]);
  const topClassification = classifications[0];
  if (topClassification.value > 0.3) { // Confidence threshold
    return topClassification.label;
  }
  return null;
};

// Test accuracy on held-out test set
const testAccuracy = () => {
  let correct = 0;
  const total = testQueries.slice(160).length; // Test on 20% (40 queries)
  const incorrectCases = [];

  console.log('Testing query classification accuracy with enhanced hybrid approach...\n');
  testQueries.slice(160).forEach(({ query, expected }, index) => {
    const predicted = classifyQuery(query);
    const isCorrect = predicted === expected;

    if (isCorrect) {
      correct++;
    } else {
      const tokens = tokenizer.tokenize(query.toLowerCase());
      const stemmedTokens = tokens.map(token => stemmer.stem(token));
      incorrectCases.push({
        query,
        expected,
        predicted,
        tokens,
        stemmedTokens,
      });
    }

    console.log(
      `Query ${index + 1}: "${query}"\n` +
      `  Expected: ${expected || 'None'}\n` +
      `  Predicted: ${predicted || 'None'}\n` +
      `  Correct: ${isCorrect ? 'Yes' : 'No'}\n`
    );
  });

  const accuracy = (correct / total) * 100;
  console.log(`\nSummary:`);
  console.log(`Total Queries: ${total}`);
  console.log(`Correct Predictions: ${correct}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%\n`);

  if (incorrectCases.length > 0) {
    console.log('Incorrect Predictions:');
    incorrectCases.forEach(({ query, expected, predicted, tokens, stemmedTokens }, index) => {
      console.log(
        `${index + 1}. Query: "${query}"\n` +
        `   Expected: ${expected || 'None'}\n` +
        `   Predicted: ${predicted || 'None'}\n` +
        `   Tokens: ${tokens.join(', ')}\n` +
        `   Stemmed Tokens: ${stemmedTokens.join(', ')}\n`
      );
    });
  } else {
    console.log('No incorrect predictions.');
  }
};

// Run the test
testAccuracy();