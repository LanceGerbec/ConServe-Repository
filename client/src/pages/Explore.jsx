// client/src/pages/Explore.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, X, Eye, Calendar, Bookmark, BookOpen, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState('simple'); // 'simple' or 'advanced'
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => { fetchPapers(); }, [query, filters, semantic, searchMode]);

  const fetchPapers = async () => {
    setLoading(true);
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
        
        if (!years.length) {
          const uniqueYears = [...new Set(data.papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a);
          const uniqueSubjects = [...new Set(data.papers.map(p => p.subjectArea).filter(Boolean))].sort();
          setYears(uniqueYears);
          setSubjects(uniqueSubjects);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false);
  };

  const activeCount = Object.values(filters).filter(Boolean).length + (query ? 1 : 0) + (semantic ? 1 : 0);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Research</h1>
        <p className="text-gray-600 dark:text-gray-400">Search and discover nursing research papers</p>
      </div>

      {/* Search Bar with Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setSearchMode('simple')} 
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${searchMode === 'simple' ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Search size={16} className="inline mr-2" />
            Simple
          </button>
          <button 
            onClick={() => setSearchMode('advanced')} 
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${searchMode === 'advanced' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <Sparkles size={16} className="inline mr-2" />
            Advanced
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'advanced' ? 'Try: diabetes AND management OR author:Smith' : 'Search by title, author, or keywords...'}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${showFilters ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            <SlidersHorizontal size={20} />
            Filters
            {activeCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>}
          </button>
        </div>

        {searchMode === 'advanced' && (
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} className="w-4 h-4" />
            <Sparkles size={16} className="text-purple-600" />
            <span className="text-sm font-semibold">AI Semantic Search</span>
          </label>
        )}

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Categories</option>
              <option value="Completed">Completed</option>
              <option value="Published">Published</option>
            </select>
            <select value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="px-3 py-2 border rounded-lg">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} placeholder="Author name" className="px-3 py-2 border rounded-lg" />
            {activeCount > 0 && (
              <button onClick={clearAll} className="col-span-full text-red-600 font-semibold text-sm">
                <X size={16} className="inline" /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found <strong className="text-navy dark:text-accent">{papers.length}</strong> papers
        </p>
      </div>

      {papers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4 opacity-30" />
          <p className="text-gray-600 dark:text-gray-400">No papers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <div
              key={paper._id}
              onClick={() => navigate(`/research/${paper._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-navy/10 text-navy rounded text-xs font-semibold">{paper.category}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={12} />
                  {paper.views || 0}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-navy transition">{paper.title}</h3>
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{paper.authors.join(' • ')}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{paper.abstract}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 pt-3 border-t">
                {paper.yearCompleted && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {paper.yearCompleted}
                  </div>
                )}
                {paper.subjectArea && (
                  <span className="line-clamp-1">{paper.subjectArea}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;