import Research from '../models/Research.js';
import AuditLog from '../models/AuditLog.js';
import Bookmark from '../models/Bookmark.js';
import natural from 'natural';
import { removeStopwords } from 'stopword';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

const buildBooleanQuery = (query) => {
  if (!query) return {};
  const parts = query.match(/(".*?"|[^"\s]+)/g) || [];
  const conditions = [];
  let currentOp = '$and';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].replace(/"/g, '');
    
    if (part.toUpperCase() === 'AND') { currentOp = '$and'; continue; }
    if (part.toUpperCase() === 'OR') { currentOp = '$or'; continue; }
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

const calculateSimilarity = (searchText, papers) => {
  const tfidf = new TfIdf();
  
  papers.forEach(paper => {
    const text = `${paper.title} ${paper.abstract} ${paper.keywords?.join(' ')}`;
    tfidf.addDocument(text);
  });
  
  tfidf.addDocument(searchText);
  
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

const extractKeyTerms = (text) => {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = removeStopwords(tokens);
  
  const freq = {};
  filtered.forEach(token => {
    freq[token] = (freq[token] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
};

export const advancedSearch = async (req, res) => {
  try {
    const { query, category, yearCompleted, subjectArea, author, semantic = false, limit = 50 } = req.query;
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
    
    let papers = await Research.find(searchQuery)
      .populate('submittedBy', 'firstName lastName')
      .limit(parseInt(limit))
      .select('title abstract keywords authors views yearCompleted subjectArea category createdAt');
    
    if (semantic === 'true' && query && papers.length > 0) {
      const scored = calculateSimilarity(query, papers);
      papers = scored.map(s => s.paper);
    }
    
    await AuditLog.create({
      user: req.user._id,
      action: 'ADVANCED_SEARCH',
      resource: 'Research',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details: { query, resultCount: papers.length }
    });
    
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

export const findSimilarPapers = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    const paper = await Research.findById(id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    
    const paperText = `${paper.title} ${paper.abstract} ${paper.keywords?.join(' ')}`;
    const keyTerms = extractKeyTerms(paperText);
    
    const similar = await Research.find({
      _id: { $ne: id },
      status: 'approved',
      $or: [
        { keywords: { $in: keyTerms } },
        { subjectArea: paper.subjectArea },
        { category: paper.category }
      ]
    })
    .limit(limit * 2)
    .select('title abstract keywords authors views yearCompleted subjectArea category');
    
    const scored = calculateSimilarity(paperText, similar);
    const papers = scored.slice(0, limit).map(s => s.paper);
    
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Similar papers error:', error);
    res.status(500).json({ error: 'Failed to find similar papers' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id;
    
    const [bookmarks, viewLogs] = await Promise.all([
      Bookmark.find({ user: userId }).populate('research'),
      AuditLog.find({ user: userId, action: 'RESEARCH_VIEWED' }).limit(50)
    ]);
    
    const viewedIds = viewLogs.map(log => log.resourceId).filter(Boolean);
    const bookmarkedIds = bookmarks.map(b => b.research?._id).filter(Boolean);
    const interactedIds = [...new Set([...viewedIds, ...bookmarkedIds])];
    
    if (interactedIds.length === 0) {
      const papers = await Research.find({ status: 'approved' })
        .sort({ views: -1 })
        .limit(limit)
        .select('title abstract keywords authors views yearCompleted subjectArea');
      return res.json({ papers, count: papers.length });
    }
    
    const interactedPapers = await Research.find({ _id: { $in: interactedIds } })
      .select('keywords subjectArea category');
    
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
    
    const papers = await Research.find({
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
    
    res.json({ papers, count: papers.length });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};