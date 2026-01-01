// client/src/pages/Explore.jsx - ULTRA OPTIMIZED
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// Memoized Paper Card
const PaperCard = memo(({ paper, onClick }) => (
  <div onClick={() => onClick(paper._id)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:scale-95 transition cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <span className="px-2 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded text-xs font-semibold">{paper.category}</span>
      <div className="flex items-center gap-1 text-xs text-gray-500"><Eye size={12} />{paper.views || 0}</div>
    </div>
    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{paper.title}</h3>
    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{paper.authors.join(' • ')}</p>
    </div>
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{paper.abstract}</p>
    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
      {paper.yearCompleted && <div className="flex items-center gap-1"><Calendar size={11} />{paper.yearCompleted}</div>}
      {paper.subjectArea && <div className="flex items-center gap-1"><BookOpen size={11} /><span className="line-clamp-1">{paper.subjectArea}</span></div>}
    </div>
    {paper.keywords?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {paper.keywords.slice(0, 2).map((kw, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{kw}</span>)}
        {paper.keywords.length > 2 && <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">+{paper.keywords.length - 2}</span>}
      </div>
    )}
  </div>
));
PaperCard.displayName = 'PaperCard';

const Explore = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (debouncedQuery || Object.values(filters).some(v => v)) performSearch(); }, [debouncedQuery, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [res, recRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/research?status=approved&limit=100`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${import.meta.env.VITE_API_URL}/search/recommendations?limit=6`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        setYears([...new Set(data.papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a));
        setSubjects([...new Set(data.papers.map(p => p.subjectArea).filter(Boolean))].sort());
      }
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.papers || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'approved',
        ...(debouncedQuery && { search: debouncedQuery }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research?${params}`, { headers: { Authorization: `Bearer ${token}` }});
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

  const clearAll = useCallback(() => {
    setQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    fetchData();
  }, []);

  const handlePaperClick = useCallback((id) => navigate(`/research/${id}`), [navigate]);

  const activeCount = useMemo(() => 
    Object.values(filters).filter(Boolean).length + (query ? 1 : 0), 
    [filters, query]
  );

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-accent text-white p-4 mb-4 rounded-b-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">🔍 Explore Research</h1>
        <p className="text-sm text-blue-100">Discover nursing papers</p>
      </div>

      {/* Search Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 mx-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search papers..." className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
          {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setShowFilters(!showFilters)} className={`py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${showFilters ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <SlidersHorizontal size={16} />Filters{activeCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>}
          </button>
          {activeCount > 0 && <button type="button" onClick={clearAll} className="py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-sm flex items-center justify-center gap-2"><X size={14} />Clear</button>}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Categories</option>
              <option value="Completed">Completed</option>
              <option value="Published">Published</option>
            </select>
            <select value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} placeholder="Author name" className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-navy dark:text-accent text-base">{papers.length}</strong> papers</p>
      </div>

      {/* Recommendations */}
      {!query && !Object.values(filters).some(v => v) && recommendations.length > 0 && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-purple-600" />Recommended</h2>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((paper) => (
              <div key={paper._id} onClick={() => handlePaperClick(paper._id)} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800 active:scale-95 transition cursor-pointer">
                <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold mb-2">{paper.category}</span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">{paper.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{paper.abstract}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Papers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto mb-3"></div><p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Loading...</p></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 mx-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">No papers found</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-4">Try different keywords</p>
          {activeCount > 0 && <button onClick={clearAll} className="px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold text-sm">Show all papers</button>}
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {papers.map((paper) => <PaperCard key={paper._id} paper={paper} onClick={handlePaperClick} />)}
        </div>
      )}
    </div>
  );
};

export default Explore;