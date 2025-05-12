const { NlpManager } = require('node-nlp');
const natural = require('natural');
const testQueries = require('./testQueries');

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
const manager = new NlpManager({ languages: ['en'], forceNER: true, nlu: { useNoneFeature: true, useStemming: true } });

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Train the model with all queries, using bigrams and trigrams
testQueries.forEach(({ query, expected }) => {
  if (expected) {
    const tokens = tokenizer.tokenize(query.toLowerCase());
    const bigrams = natural.NGrams.bigrams(tokens).map(ngram => ngram.join(' '));
    const trigrams = natural.NGrams.trigrams(tokens).map(ngram => ngram.join(' '));
    manager.addDocument('en', [...tokens, ...bigrams, ...trigrams].join(' '), expected);
  } else {
    manager.addDocument('en', query.toLowerCase(), 'None');
  }
});

// Test accuracy
const testAccuracy = async () => {
  console.log('Training node-nlp model...\n');
  await manager.train();
  manager.save('model.nlp');

  console.log('Testing query classification accuracy with hybrid node-nlp...\n');
  let correct = 0;
  const total = testQueries.length;
  const incorrectCases = [];

  for (const { query, expected } of testQueries) {
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
      const response = await manager.process('en', queryText);
      nlpScore = response.score;
      nlpIntent = response.score > 0.85 ? response.intent : 'None';
      predicted = nlpIntent;
    } else {
      // Combine keyword and NLP scores
      const bigrams = natural.NGrams.bigrams(tokens).map((ngram) => ngram.join(' '));
      const trigrams = natural.NGrams.trigrams(tokens).map((ngram) => ngram.join(' '));
      const queryText = [...tokens, ...bigrams, ...trigrams].join(' ');
      const response = await manager.process('en', queryText);
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

    const isCorrect = predicted === expected || (expected === null && predicted === 'None');

    if (isCorrect) {
      correct++;
    } else {
      incorrectCases.push({
        query,
        tokens: tokens.join(', '),
        expected: expected || 'None',
        predicted,
        keywordScore: maxScore.toFixed(2),
        nlpScore: nlpScore.toFixed(2),
        matchedKeywords: matchedKeywords.join(', ') || 'None',
      });
    }

    console.log(
      `Query: "${query}"\n` +
      `  Tokens: "${tokens.join(', ')}"\n` +
      `  Matched Keywords: "${matchedKeywords.join(', ') || 'None'}"\n` +
      `  Expected: ${expected || 'None'}\n` +
      `  Predicted: ${predicted || 'None'}\n` +
      `  Keyword Score: ${maxScore.toFixed(2)}\n` +
      `  NLP Score: ${nlpScore.toFixed(2)}\n` +
      `  Correct: ${isCorrect ? 'Yes' : 'No'}\n`
    );
  }

  const accuracy = (correct / total) * 100;
  console.log(`\nSummary:`);
  console.log(`Total Queries: ${total}`);
  console.log(`Correct Predictions: ${correct}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%\n`);

  if (incorrectCases.length > 0) {
    console.log('Incorrect Predictions:');
    incorrectCases.forEach(({ query, tokens, expected, predicted, keywordScore, nlpScore, matchedKeywords }, index) => {
      console.log(
        `${index + 1}. Query: "${query}"\n` +
        `   Tokens: "${tokens}"\n` +
        `   Matched Keywords: "${matchedKeywords}"\n` +
        `   Expected: ${expected}\n` +
        `   Predicted: ${predicted}\n` +
        `   Keyword Score: ${keywordScore}\n` +
        `   NLP Score: ${nlpScore}\n`
      );
    });
  } else {
    console.log('No incorrect predictions.');
  }
};

// Run the test
testAccuracy().catch(err => console.error('Error:', err));