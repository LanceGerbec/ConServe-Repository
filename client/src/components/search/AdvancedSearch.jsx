import { useState, useEffect } from 'react';
import { Search, Filter, X, Sparkles, BookOpen, TrendingUp, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research?status=approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const uniqueYears = [...new Set(data.papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a);
      const uniqueSubjects = [...new Set(data.papers.map(p => p.subjectArea).filter(Boolean))].sort();
      setYears(uniqueYears);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Fetch metadata error:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/recommendations?limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecommendations(data.papers || []);
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(query && { query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea }),
        ...(filters.author && { author: filters.author }),
        semantic: semantic.toString()
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/advanced?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data.papers || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false);
    setResults([]);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (query ? 1 : 0) + (semantic ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">🔍 Advanced Search</h1>
        <p className="text-blue-100">Use boolean operators (AND, OR, NOT) and field-specific search (title:, author:, keyword:, year:)</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try: "nursing AND diabetes" OR author:Smith'
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-navy text-white rounded-lg hover:bg-navy-800 transition font-semibold disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Semantic Toggle */}
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} className="w-5 h-5 rounded" />
            <Sparkles size={18} className="text-purple-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Semantic Search</span>
            <span className="text-xs text-gray-500">(AI-powered relevance ranking)</span>
          </label>

          <button type="button" onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${showFilters ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            <Filter size={18} />
            Filters
            {activeFiltersCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeFiltersCount}</span>}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <select value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject Area</label>
              <select value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm">
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Author</label>
              <input type="text" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} placeholder="Author name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
            </div>

            {activeFiltersCount > 0 && (
              <div className="md:col-span-4 flex justify-end">
                <button type="button" onClick={clearFilters} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold">
                  <X size={16} />
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Search Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">💡 Search Tips</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li><strong>Boolean:</strong> diabetes AND management, pediatric OR geriatric, nursing NOT administration</li>
          <li><strong>Field Search:</strong> title:therapy, author:Smith, keyword:pain, year:2024, subject:Pediatric</li>
          <li><strong>Phrases:</strong> "evidence-based practice" (use quotes for exact match)</li>
        </ul>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Search Results ({results.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((paper) => (
              <div key={paper._id} onClick={() => navigate(`/research/${paper._id}`)} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{paper.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{paper.abstract}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User size={12} />{paper.authors[0]}</span>
                  {paper.yearCompleted && <span className="flex items-center gap-1"><Calendar size={12} />{paper.yearCompleted}</span>}
                  <span className="px-2 py-0.5 bg-navy/10 text-navy rounded">{paper.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.length === 0 && recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-600" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((paper) => (
              <div key={paper._id} onClick={() => navigate(`/research/${paper._id}`)} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{paper.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{paper.abstract}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded">{paper.subjectArea}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4 opacity-30" />
          <p className="text-gray-600 dark:text-gray-400">No results found. Try different keywords or filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;