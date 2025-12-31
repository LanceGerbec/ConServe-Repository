// client/src/pages/Explore.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchMode, setSearchMode] = useState('simple');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [activeFilters, setActiveFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Initial load - fetch all papers
  useEffect(() => {
    if (initialLoad) {
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research?status=approved&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        
        // Extract metadata
        const uniqueYears = [...new Set(data.papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a);
        const uniqueSubjects = [...new Set(data.papers.map(p => p.subjectArea).filter(Boolean))].sort();
        setYears(uniqueYears);
        setSubjects(uniqueSubjects);
      }

      // Fetch recommendations
      const recRes = await fetch(`${import.meta.env.VITE_API_URL}/search/recommendations?limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const performSearch = async () => {
    setLoading(true);
    setActiveQuery(query);
    setActiveFilters(filters);
    
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

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const clearAll = () => {
    setQuery('');
    setActiveQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setActiveFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false);
    fetchInitialData(); // Reload all papers
  };

  const applyFilters = () => {
    performSearch();
    setShowFilters(false);
  };

  const activeCount = Object.values(activeFilters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0);

  const InfoTooltip = ({ text }) => (
    <div className="group relative inline-block">
      <button type="button" className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
        <Info size={14} className="text-blue-600 dark:text-blue-400" />
      </button>
      <div className="absolute left-0 bottom-full mb-2 w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        {text}
      </div>
    </div>
  );

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading research papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-4 md:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Research</h1>
        <p className="text-gray-600 dark:text-gray-400">Search and discover nursing research papers</p>
      </div>

      {/* Search Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setSearchMode('simple')} 
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              searchMode === 'simple' 
                ? 'bg-navy text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Search size={18} />
            Simple Search
          </button>
          <button 
            onClick={() => setSearchMode('advanced')} 
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              searchMode === 'advanced' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Sparkles size={18} />
            Advanced Search
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch}>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchMode === 'advanced' 
                  ? 'Try: diabetes AND management OR author:Smith' 
                  : 'Search by title, author, or keywords...'
                }
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              {query && (
                <button 
                  type="button"
                  onClick={() => setQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                showFilters 
                  ? 'bg-navy text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <SlidersHorizontal size={20} />
              <span className="hidden md:inline">Filters</span>
              {activeCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* AI Semantic Search Toggle */}
          {searchMode === 'advanced' && (
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={semantic} 
                  onChange={(e) => setSemantic(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <Sparkles size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Semantic Search</span>
              </label>
              <InfoTooltip text="AI understands the meaning of your query and ranks results by relevance, not just keyword matching. Best for finding conceptually similar papers." />
            </div>
          )}

          {/* Search Tips */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              {searchMode === 'simple' ? (
                <p><strong>Tip:</strong> Press Enter or click Search to find papers. Use filters for more precise results.</p>
              ) : (
                <p><strong>Advanced Tips:</strong> Use AND, OR, NOT operators • Field search: title:therapy, author:Smith, year:2024 • Use quotes for exact phrases</p>
              )}
            </div>
          </div>
        </form>

        {/* Filters Dropdown */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                  <InfoTooltip text="Filter by research status: Completed (thesis/capstone) or Published (in journals)" />
                </label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  <option value="Completed">Completed</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Year
                  <InfoTooltip text="Filter papers by completion year" />
                </label>
                <select 
                  value={filters.yearCompleted} 
                  onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} 
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject Area
                  <InfoTooltip text="Filter by nursing specialty (Pediatric, Adult Health, etc.)" />
                </label>
                <select 
                  value={filters.subjectArea} 
                  onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} 
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Author
                  <InfoTooltip text="Search by author name (partial matches work)" />
                </label>
                <input 
                  type="text" 
                  value={filters.author} 
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })} 
                  placeholder="Author name" 
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-gray-700 dark:text-gray-300"
              >
                <X size={16} />
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold shadow-md"
              >
                <Filter size={16} />
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found <strong className="text-navy dark:text-accent text-lg">{papers.length}</strong> research papers
        </p>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <X size={14} />
            Clear search
          </button>
        )}
      </div>

      {/* Recommendations (shown when no search active) */}
      {!activeQuery && recommendations.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-600" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((paper) => (
              <div
                key={paper._id}
                onClick={() => navigate(`/research/${paper._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
              >
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">
                  {paper.category}
                </span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-2 mb-2 line-clamp-2">{paper.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{paper.abstract}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {paper.subjectArea && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{paper.subjectArea}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Papers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-navy mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">Searching...</p>
          </div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4 opacity-30" />
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No papers found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Try different keywords or adjust your filters</p>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold shadow-md"
            >
              Clear filters and show all papers
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <div
              key={paper._id}
              onClick={() => navigate(`/research/${paper._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded text-xs font-semibold">
                  {paper.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={12} />
                  {paper.views || 0}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-navy dark:group-hover:text-accent transition">
                {paper.title}
              </h3>

              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                  {paper.authors.join(' • ')}
                </p>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {paper.abstract}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                {paper.yearCompleted && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {paper.yearCompleted}
                  </div>
                )}
                {paper.subjectArea && (
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span className="line-clamp-1">{paper.subjectArea}</span>
                  </div>
                )}
              </div>

              {paper.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {paper.keywords.slice(0, 3).map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      {kw}
                    </span>
                  ))}
                  {paper.keywords.length > 3 && (
                    <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                      +{paper.keywords.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;