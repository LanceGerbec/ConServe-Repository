// client/src/pages/Browse.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, X, Eye, Calendar, Bookmark, BookOpen, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Browse = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => { fetchPapers(); }, [search, filters]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'approved',
        ...(search && { search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea })
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/research?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        
        // Extract unique years and subjects
        const uniqueYears = [...new Set(data.papers.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b - a);
        const uniqueSubjects = [...new Set(data.papers.map(p => p.subjectArea).filter(Boolean))].sort();
        setYears(uniqueYears);
        setSubjects(uniqueSubjects);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', yearCompleted: '', subjectArea: '' });
    setSearch('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Research Repository</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse and discover nursing research papers from NEUST College of Nursing</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, or keywords..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              showFilters 
                ? 'bg-navy text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <SlidersHorizontal size={20} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">All Categories</option>
                <option value="Completed">Completed</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year Completed</label>
              <select
                value={filters.yearCompleted}
                onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject Area</label>
              <select
                value={filters.subjectArea}
                onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  <X size={16} />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found <strong className="text-navy dark:text-accent">{papers.length}</strong> research papers
        </p>
      </div>

      {/* Papers Grid */}
      {papers.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4 opacity-30" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">No research papers found</p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-navy dark:text-accent hover:underline font-semibold text-sm">
              Clear filters to see all papers
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <div
              key={paper._id}
              onClick={() => navigate(`/research/${paper._id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded text-xs font-semibold">
                  {paper.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={12} />
                  {paper.views || 0}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-navy dark:group-hover:text-accent transition">
                {paper.title}
              </h3>

              {/* Authors */}
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                  {paper.authors.join(' • ')}
                </p>
              </div>

              {/* Abstract */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {paper.abstract}
              </p>

              {/* Meta Info */}
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

              {/* Keywords */}
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

export default Browse;