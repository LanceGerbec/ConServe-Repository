// client/src/pages/Explore.jsx - PROFESSIONAL ICONS VERSION
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, TrendingUp, Lightbulb, Grid, List, Award, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const fuzzyMatch = (str, pattern) => {
  const p = pattern.toLowerCase().split('');
  const s = str.toLowerCase();
  let pi = 0;
  for (let si = 0; si < s.length && pi < p.length; si++) {
    if (s[si] === p[pi]) pi++;
  }
  return pi === p.length;
};

const AwardBadge = memo(({ award, small }) => {
  const colorMap = {
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    silver: 'bg-gray-100 text-gray-800 border-gray-400',
    bronze: 'bg-orange-100 text-orange-800 border-orange-400',
    blue: 'bg-blue-100 text-blue-800 border-blue-400',
    green: 'bg-green-100 text-green-800 border-green-400',
    purple: 'bg-purple-100 text-purple-800 border-purple-400'
  };
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colorMap[award.color] || colorMap.gold} ${small ? 'text-xs' : 'text-xs'} font-bold cursor-pointer transition hover:scale-105`}>
        <Award size={small ? 10 : 12} />
        {!small && <span className="hidden sm:inline max-w-[80px] truncate">{award.name}</span>}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in">
          {award.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
});
AwardBadge.displayName = 'AwardBadge';

const PaperCard = memo(({ paper, onClick, highlight, viewMode }) => {
  const highlightText = (text) => {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  if (viewMode === 'list') {
    return (
      <div onClick={() => onClick(paper._id)} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 active:scale-[0.99] transition cursor-pointer hover:shadow-md flex gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-navy/10 to-accent/10 rounded-lg flex items-center justify-center">
          <BookOpen size={20} className="text-navy dark:text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{highlightText(paper.title)}</h3>
            <span className="px-2 py-0.5 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded text-xs font-semibold whitespace-nowrap flex-shrink-0">{paper.category}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{highlightText(paper.abstract)}</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Eye size={10} />{paper.views || 0}</div>
              {paper.yearCompleted && <div className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</div>}
            </div>
            {paper.awards?.length > 0 && (
              <div className="flex items-center gap-1">
                {paper.awards.slice(0, 2).map((award, i) => <AwardBadge key={i} award={award} small />)}
                {paper.awards.length > 2 && <span className="text-xs text-gray-500">+{paper.awards.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onClick(paper._id)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-95 transition cursor-pointer hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <span className="px-2 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded text-xs font-semibold">{paper.category}</span>
        <div className="flex items-center gap-1 text-xs text-gray-500"><Eye size={12} />{paper.views || 0}</div>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{highlightText(paper.title)}</h3>
      <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{highlightText(paper.authors.join(' • '))}</p>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{highlightText(paper.abstract)}</p>
      
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {paper.awards.slice(0, 3).map((award, i) => <AwardBadge key={i} award={award} />)}
          {paper.awards.length > 3 && <span className="text-xs text-gray-500 self-center">+{paper.awards.length - 3}</span>}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
        {paper.yearCompleted && <div className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</div>}
        {paper.subjectArea && <div className="flex items-center gap-1 max-w-[60%]"><BookOpen size={10} /><span className="truncate">{paper.subjectArea}</span></div>}
      </div>
    </div>
  );
});
PaperCard.displayName = 'PaperCard';

const TipsModal = memo(({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-navy/20" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center">
          <Lightbulb size={24} className="text-navy" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Search Tips</h3>
          <p className="text-xs text-gray-500">Master your search</p>
        </div>
        <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Search size={14} />Simple Search
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Type any keyword (diabetes, nursing, etc.)</li>
            <li>• Auto-suggestions appear as you type</li>
            <li>• Fuzzy matching finds similar terms</li>
          </ul>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
            <Sparkles size={14} />Advanced Search
          </h4>
          <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
            <li>• <code className="px-1 bg-white/50 rounded">AND</code> - diabetes AND management</li>
            <li>• <code className="px-1 bg-white/50 rounded">OR</code> - pediatric OR children</li>
            <li>• <code className="px-1 bg-white/50 rounded">NOT</code> - nursing NOT surgery</li>
          </ul>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <Award size={14} />Awards
          </h4>
          <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Hover/tap badges to see award names</li>
            <li>• Color-coded by award type</li>
            <li>• Recognized research highlighted</li>
          </ul>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-sm text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
            <ArrowUpDown size={14} />Sorting
          </h4>
          <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
            <li>• Most Viewed - Popular papers first</li>
            <li>• Alphabetical - A-Z sorting</li>
            <li>• By Date - Newest or oldest</li>
            <li>• Most Awards - Award-winning first</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
));
TipsModal.displayName = 'TipsModal';

const Explore = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchMode, setSearchMode] = useState('simple');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('exploreViewMode') || 'grid');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('exploreSortBy') || 'relevance');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [activeFilters, setActiveFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (initialLoad) fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('exploreViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('exploreSortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && searchMode === 'simple') {
      generateSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery, searchMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [res, recRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/research?status=approved&limit=100`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${import.meta.env.VITE_API_URL}/search/recommendations?limit=6`, { headers: { Authorization: `Bearer ${token}` }}).catch(() => ({ ok: false }))
      ]);
      if (res.ok) {
        const data = await res.json();
        const papers = data.papers || [];
        setPapers(papers);
        setAllPapers(papers);
        const uniqueYears = [...new Set(papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a);
        const uniqueSubjects = [...new Set(papers.map(p => p.subjectArea).filter(Boolean))].sort();
        setYears(uniqueYears);
        setSubjects(uniqueSubjects);
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.papers || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const generateSuggestions = useCallback((q) => {
    const titleMatches = allPapers.filter(p => fuzzyMatch(p.title, q)).map(p => ({ text: p.title, type: 'title' })).slice(0, 3);
    const authorMatches = [...new Set(allPapers.flatMap(p => p.authors).filter(a => fuzzyMatch(a, q)))].map(a => ({ text: a, type: 'author' })).slice(0, 2);
    const keywordMatches = [...new Set(allPapers.flatMap(p => p.keywords || []).filter(k => fuzzyMatch(k, q)))].map(k => ({ text: k, type: 'keyword' })).slice(0, 2);
    const combined = [...titleMatches, ...authorMatches, ...keywordMatches].slice(0, 5);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
  }, [allPapers]);

  const sortedPapers = useMemo(() => {
    if (!papers.length) return [];
    const sorted = [...papers];
    
    switch (sortBy) {
      case 'views-desc':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'alpha-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'alpha-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'awards-desc':
        return sorted.sort((a, b) => (b.awards?.length || 0) - (a.awards?.length || 0));
      case 'year-desc':
        return sorted.sort((a, b) => (b.yearCompleted || 0) - (a.yearCompleted || 0));
      case 'year-asc':
        return sorted.sort((a, b) => (a.yearCompleted || 0) - (b.yearCompleted || 0));
      case 'relevance':
      default:
        return sorted;
    }
  }, [papers, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    setActiveQuery(query);
    setActiveFilters(filters);
    setShowSuggestions(false);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'approved',
        ...(query && { [searchMode === 'advanced' ? 'query' : 'search']: query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea }),
        ...(filters.author && { author: filters.author }),
        ...(searchMode === 'advanced' && semantic && { semantic: 'true' })
      });
      const endpoint = searchMode === 'advanced' ? '/search/advanced' : '/research';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setTimeout(() => performSearch(), 100);
  };

  const clearAll = useCallback(() => {
    setQuery('');
    setActiveQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setActiveFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSortBy('relevance');
    setPapers(allPapers);
  }, [allPapers]);

  const activeCount = useMemo(() => 
    Object.values(activeFilters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0), 
    [activeFilters, activeQuery, semantic]
  );

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Sparkles, show: activeQuery },
    { value: 'views-desc', label: 'Most Viewed', icon: Eye, show: true },
    { value: 'date-desc', label: 'Newest First', icon: Calendar, show: true },
    { value: 'date-asc', label: 'Oldest First', icon: Calendar, show: true },
    { value: 'alpha-asc', label: 'A to Z', icon: ArrowUpDown, show: true },
    { value: 'alpha-desc', label: 'Z to A', icon: ArrowUpDown, show: true },
    { value: 'awards-desc', label: 'Most Awards', icon: Award, show: true },
    { value: 'year-desc', label: 'Year (New)', icon: Calendar, show: true },
    { value: 'year-asc', label: 'Year (Old)', icon: Calendar, show: true }
  ].filter(opt => opt.show);

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {showTips && <TipsModal onClose={() => setShowTips(false)} />}

      <div className="bg-gradient-to-r from-navy to-accent text-white p-4 mb-4 rounded-b-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Search size={24} />Explore Research
        </h1>
        <p className="text-sm text-blue-100">Discover nursing papers</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={() => setSearchMode('simple')} className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'simple' ? 'bg-navy text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Search size={16} />Simple
          </button>
          <button onClick={() => setSearchMode('advanced')} className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'advanced' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Sparkles size={16} />Advanced
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); performSearch(); }} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={searchMode === 'advanced' ? 'diabetes AND management' : 'Start typing...'}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={16} />
              </button>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-navy/20 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {s.type === 'title' && <BookOpen size={14} className="text-blue-600 flex-shrink-0" />}
                      {s.type === 'author' && <Search size={14} className="text-green-600 flex-shrink-0" />}
                      {s.type === 'keyword' && <Sparkles size={14} className="text-purple-600 flex-shrink-0" />}
                      <span className="text-sm text-gray-900 dark:text-white line-clamp-1">{s.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="submit" disabled={loading} className="py-2.5 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span className="hidden sm:inline">Search...</span></> : <><Search size={16} />Search</>}
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className={`py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${showFilters ? 'bg-navy text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              <SlidersHorizontal size={16} />Filters{activeCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>}
            </button>
          </div>

          {searchMode === 'advanced' && (
            <label className="flex items-center gap-2 p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} className="w-4 h-4 rounded" />
              <Sparkles size={14} className="text-purple-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">AI Semantic</span>
            </label>
          )}

          <button type="button" onClick={() => setShowTips(true)} className="w-full flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-left">
            <Info size={14} className="text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-800 dark:text-blue-200 font-medium">{searchMode === 'simple' ? 'Tip: Type to see suggestions • Click for all tips' : 'Use AND, OR, NOT • Click for examples'}</span>
          </button>
        </form>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Categories</option>
              <option value="Completed">Completed</option>
              <option value="Published">Published</option>
            </select>
            <select value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} placeholder="Author name" className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" onClick={clearAll} className="py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-sm flex items-center justify-center gap-1.5"><X size={14} />Clear</button>
              <button type="button" onClick={() => { performSearch(); setShowFilters(false); }} className="py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold text-sm flex items-center justify-center gap-1.5"><Filter size={14} />Apply</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 mb-3 gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0"><strong className="text-navy dark:text-accent text-base">{sortedPapers.length}</strong> papers</p>
        
        <div className="flex items-center gap-2">
          {activeCount > 0 && <button onClick={clearAll} className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 flex-shrink-0"><X size={12} />Clear</button>}
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border-2 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:border-navy focus:outline-none bg-white dark:bg-gray-700 font-semibold min-w-0"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg flex-shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : ''}`} title="Grid View">
              <Grid size={16} className={viewMode === 'grid' ? 'text-navy dark:text-accent' : 'text-gray-500'} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : ''}`} title="List View">
              <List size={16} className={viewMode === 'list' ? 'text-navy dark:text-accent' : 'text-gray-500'} />
            </button>
          </div>
        </div>
      </div>

      {!activeQuery && recommendations.length > 0 && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-600" />Recommended
          </h2>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((paper) => (
              <div 
                key={paper._id} 
                onClick={() => navigate(`/research/${paper._id}`)} 
                className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800 active:scale-95 transition cursor-pointer"
              >
                <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold mb-1">
                  {paper.category}
                </span>
                <h3 className="font-bold text-xs text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {paper.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {paper.abstract}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy mx-auto mb-2"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Searching...</p>
          </div>
        </div>
      ) : sortedPapers.length === 0 ? (
        <div className="text-center py-12 mx-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={40} className="mx-auto text-gray-400 mb-2 opacity-30" />
          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">No papers found</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Try different keywords</p>
          {activeCount > 0 && <button onClick={clearAll} className="px-5 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold text-sm">Show all</button>}
        </div>
      ) : (
        <div className={`px-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
          {sortedPapers.map((paper) => <PaperCard key={paper._id} paper={paper} onClick={(id) => navigate(`/research/${id}`)} highlight={activeQuery} viewMode={viewMode} />)}
        </div>
      )}
    </div>
  );
};

export default Explore;