// client/src/components/research/ResearchList.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Eye, Calendar, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ResearchList = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: 'approved' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, [filters]);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ 
        search, 
        ...filters 
      }).toString();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPapers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or keywords..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
        >
          <Filter size={20} />
          Filters
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
        >
          Search
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
              >
                <option value="">All Categories</option>
                <option value="Completed">Completed</option>
                <option value="Published">Published</option>
              </select>
            </div>
            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setFilters({ category: '', status: 'approved' }); setSearch(''); }}
              className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Clear All
            </button>
            <button
              onClick={() => { fetchPapers(); setShowFilters(false); }}
              className="flex-1 px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-800 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Found <span className="font-bold text-navy">{papers.length}</span> research papers
        </p>
      </div>

      {/* Papers Grid */}
      {papers.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No papers found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div
              key={paper._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = `/research/${paper._id}`}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-navy/10 text-navy px-3 py-1 rounded-full font-semibold">
                  {paper.category}
                </span>
                <div className="flex items-center text-xs text-gray-500">
                  <Eye size={14} className="mr-1" />
                  {paper.views || 0}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-navy transition">
                {paper.title}
              </h3>

              {/* Authors */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <User size={14} className="mr-1" />
                <span className="line-clamp-1">{paper.authors.join(', ')}</span>
              </div>

              {/* Abstract */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {paper.abstract}
              </p>

              {/* Keywords */}
              {paper.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {paper.keywords.slice(0, 3).map((keyword, i) => (
                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                  {paper.keywords.length > 3 && (
                    <span className="text-xs text-gray-500">+{paper.keywords.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Calendar size={14} className="mr-1" />
                {new Date(paper.createdAt).toLocaleDateString()}
              </div>

              {/* Status Badge (Admin only) */}
              {user?.role === 'admin' && paper.status !== 'approved' && (
                <div className="mt-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    paper.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    paper.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {paper.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchList;