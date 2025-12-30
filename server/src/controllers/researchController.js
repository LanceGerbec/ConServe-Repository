import natural from 'natural';
import { removeStopwords } from 'stopword';
import Research from '../models/Research.js';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Build search query from boolean expression
export const buildBooleanQuery = (query) => {
  if (!query) return {};

  // Parse boolean operators: AND, OR, NOT
  const parts = query.match(/(".*?"|[^"\s]+)/g) || [];
  const conditions = [];
  let currentOp = '$and';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].replace(/"/g, '');
    
    if (part.toUpperCase() === 'AND') {
      currentOp = '$and';
      continue;
    }
    if (part.toUpperCase() === 'OR') {
      currentOp = '$or';
      continue;
    }
    if (part.toUpperCase() === 'NOT') {
      const nextPart = parts[i + 1]?.replace(/"/g, '');
      if (nextPart) {
        conditions.push({
          $nor: [
            { title: { $regex: nextPart, $options: 'i' } },
            { abstract: { $regex: nextPart, $options: 'i' } },
            { keywords: { $regex: nextPart, $options: 'i' } }
          ]
        });
        i++;
      }
      continue;
    }

    // Check for field-specific search (field:value)
    if (part.includes(':')) {
      const [field, value] = part.split(':');
      const fieldMap = {
        title: 'title',
        author: 'authors',
        keyword: 'keywords',
        year: 'yearCompleted',
        category: 'category',
        subject: 'subjectArea'
      };
      
      if (fieldMap[field.toLowerCase()]) {
        const mappedField = fieldMap[field.toLowerCase()];
        if (mappedField === 'yearCompleted') {
          conditions.push({ [mappedField]: parseInt(value) });
        } else {
          conditions.push({ [mappedField]: { $regex: value, $options: 'i' } });
        }
      }
    } else {
      // General search
      conditions.push({
        $or: [
          { title: { $regex: part, $options: 'i' } },
          { abstract: { $regex: part, $options: 'i' } },
          { authors: { $regex: part, $options: 'i' } },
          { keywords: { $regex: part, $options: 'i' } }
        ]
      });
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  
  return currentOp === '$and' ? { $and: conditions } : { $or: conditions };
};

// Calculate TF-IDF similarity
export const calculateSimilarity = async (searchText, papers) => {
  const tfidf = new TfIdf();
  
  // Add documents
  papers.forEach(paper => {
    const text = `${paper.title} ${paper.abstract} ${paper.keywords?.join(' ')}`;
    tfidf.addDocument(text);
  });
  
  // Add search query
  tfidf.addDocument(searchText);
  
  // Calculate scores
  const scores = papers.map((paper, idx) => {
    let score = 0;
    tfidf.listTerms(papers.length).forEach(term => {
      const queryScore = tfidf.tfidf(term.term, papers.length);
      const docScore = tfidf.tfidf(term.term, idx);
      score += queryScore * docScore;
    });
    return { paper, score };
  });
  
  return scores.sort((a, b) => b.score - a.score);
};

// Extract key terms from text
export const extractKeyTerms = (text) => {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = removeStopwords(tokens);
  
  // Count frequency
  const freq = {};
  filtered.forEach(token => {
    freq[token] = (freq[token] || 0) + 1;
  });
  
  // Sort by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
};

// Find similar papers
export const findSimilarPapers = async (paperId, limit = 5) => {
  const paper = await Research.findById(paperId);
  if (!paper) return [];
  
  const paperText = `${paper.title} ${paper.abstract} ${paper.keywords?.join(' ')}`;
  const keyTerms = extractKeyTerms(paperText);
  
  // Find papers with similar keywords/terms
  const similar = await Research.find({
    _id: { $ne: paperId },
    status: 'approved',
    $or: [
      { keywords: { $in: keyTerms } },
      { subjectArea: paper.subjectArea },
      { category: paper.category }
    ]
  })
  .limit(limit * 2)
  .select('title abstract keywords authors views yearCompleted subjectArea category');
  
  // Calculate similarity scores
  const scored = await calculateSimilarity(paperText, similar);
  return scored.slice(0, limit).map(s => s.paper);
};

// Get recommendations based on user behavior
export const getRecommendations = async (userId, limit = 10) => {
  try {
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const Bookmark = (await import('../models/Bookmark.js')).default;
    
    // Get user's bookmarks and views
    const [bookmarks, viewLogs] = await Promise.all([
      Bookmark.find({ user: userId }).populate('research'),
      AuditLog.find({ 
        user: userId, 
        action: 'RESEARCH_VIEWED' 
      }).limit(50)
    ]);
    
    // Extract viewed paper IDs
    const viewedIds = viewLogs
      .map(log => log.resourceId)
      .filter(Boolean);
    
    const bookmarkedIds = bookmarks
      .map(b => b.research?._id)
      .filter(Boolean);
    
    // Get all interacted papers
    const interactedIds = [...new Set([...viewedIds, ...bookmarkedIds])];
    
    if (interactedIds.length === 0) {
      // Return trending papers for new users
      return Research.find({ status: 'approved' })
        .sort({ views: -1 })
        .limit(limit)
        .select('title abstract keywords authors views yearCompleted subjectArea');
    }
    
    const interactedPapers = await Research.find({ 
      _id: { $in: interactedIds } 
    }).select('keywords subjectArea category');
    
    // Extract common keywords and subjects
    const allKeywords = interactedPapers.flatMap(p => p.keywords || []);
    const allSubjects = interactedPapers.map(p => p.subjectArea).filter(Boolean);
    
    const keywordFreq = {};
    allKeywords.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });
    
    const topKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([kw]) => kw);
    
    // Find recommended papers
    const recommended = await Research.find({
      _id: { $nin: interactedIds },
      status: 'approved',
      $or: [
        { keywords: { $in: topKeywords } },
        { subjectArea: { $in: allSubjects } }
      ]
    })
    .sort({ views: -1 })
    .limit(limit)
    .select('title abstract keywords authors views yearCompleted subjectArea category');
    
    return recommended;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
};

// Advanced search with all features
export const advancedSearch = async (params) => {
  const { query, category, yearCompleted, subjectArea, author, semantic = false, limit = 50 } = params;
  let searchQuery = { status: 'approved' };
  if (category) searchQuery.category = category;
  if (yearCompleted) searchQuery.yearCompleted = parseInt(yearCompleted);
  if (subjectArea) searchQuery.subjectArea = { $regex: subjectArea, $options: 'i' };
  if (author) searchQuery.authors = { $regex: author, $options: 'i' };
  if (query) {
    if (query.includes('AND') || query.includes('OR') || query.includes('NOT') || query.includes(':')) {
      const boolQuery = buildBooleanQuery(query);
      searchQuery = { ...searchQuery, ...boolQuery };
    } else {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { abstract: { $regex: query, $options: 'i' } },
        { authors: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ];
    }
  }
  let papers = await Research.find(searchQuery).populate('submittedBy', 'firstName lastName').limit(limit).select('title abstract keywords authors views yearCompleted subjectArea category createdAt');
  if (semantic && query && papers.length > 0) {
    const scored = await calculateSimilarity(query, papers);
    papers = scored.map(s => s.paper);
  }
  return papers;
};

router.get('/stats', auth, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Research.countDocuments(),
      Research.countDocuments({ status: 'pending' }),
      Research.countDocuments({ status: 'approved' }),
      Research.countDocuments({ status: 'rejected' })
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research stats' });
  }
});