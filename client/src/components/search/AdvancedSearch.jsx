import { useState, useEffect } from 'react';
import { Search, X, Sparkles, BookOpen, TrendingUp, HelpCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../common/Toast';

// Add to client/src/App.jsx:
// import AdvancedSearch from './components/search/AdvancedSearch';
// Add route: <Route path="/search" element={<ProtectedRoute><Layout><AdvancedSearch /></Layout></ProtectedRoute>} />

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [semantic, setSemantic] = useState(false);
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [papers, setPapers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchRecommendations(); }, []);

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/search/recommendations?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.papers || []);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() && !Object.values(filters).some(Boolean)) {
      showToast('Please enter search terms or apply filters', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ query, semantic: semantic.toString(), ...filters });
      const res = await fetch(`${API}/search/advanced?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
        if (data.papers.length === 0) {
          showToast('No results found. Try different keywords.', 'info');
        }
      } else {
        showToast('Search failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setPapers([]);
    setSemantic(false);
  };

  const examples = [
    { label: 'Boolean: nursing AND pain', query: 'nursing AND pain', desc: 'Must contain both terms' },
    { label: 'Field: author:Smith', query: 'author:Smith', desc: 'Search specific field' },
    { label: 'Exclude: care NOT elderly', query: 'care NOT elderly', desc: 'Exclude terms' }
  ];

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles size={32} />
            Advanced Search
          </h1>
          <p className="text-blue-100">Boolean queries • Field search • Semantic AI • Recommendations</p>
        </div>

        {/* Search Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "nursing AND pain", "author:Smith", "care NOT elderly"'
                className="w-full pl-12 pr-32 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg focus:border-navy focus:outline-none dark:bg-gray-700"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <button type="button" onClick={() => setShowHelp(!showHelp)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Show help">
                  <HelpCircle size={20} className="text-gray-500" />
                </button>
                {query && (
                  <button type="button" onClick={clearAll} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <X size={20} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Help Panel */}
            {showHelp && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 animate-slide-up">
                <h3 className="font-bold text-sm mb-3 text-blue-900 dark:text-blue-300">Search Syntax Help</h3>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">AND</code> - Both terms must appear</div>
                  <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">OR</code> - Either term can appear</div>
                  <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">NOT</code> - Exclude term</div>
                  <div><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">field:value</code> - Search in specific field (title, author, keyword, year, category, subject)</div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold mb-2">Quick Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex, i) => (
                      <button key={i} type="button" onClick={() => { setQuery(ex.query); setShowHelp(false); }} className="text-xs bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition border border-blue-200 dark:border-blue-700" title={ex.desc}>
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none dark:bg-gray-700 text-sm">
                <option value="">All Categories</option>
                <option value="Completed">Completed</option>
                <option value="Published">Published</option>
              </select>
              <input type="number" placeholder="Year" value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none dark:bg-gray-700 text-sm" />
              <input type="text" placeholder="Subject Area" value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none dark:bg-gray-700 text-sm" />
              <input type="text" placeholder="Author" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none dark:bg-gray-700 text-sm" />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} className="w-4 h-4" />
                <Zap size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">AI Semantic Search</span>
              </label>
              <button type="submit" disabled={loading} className="flex-1 bg-navy text-white px-8 py-3 rounded-xl hover:bg-navy-800 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search size={20} />}
                {loading ? 'Searching...' : 'Search'}
              </button>
              {(query || Object.values(filters).some(Boolean)) && (
                <button type="button" onClick={clearAll} className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {papers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Results ({papers.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map(p => (
                <div key={p._id} onClick={() => navigate(`/research/${p._id}`)} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{p.abstract}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{p.authors[0]}</span>
                    <span>{p.yearCompleted || new Date(p.createdAt).getFullYear()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={24} className="text-orange-600" />
              Recommended For You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(p => (
                <div key={p._id} onClick={() => navigate(`/research/${p._id}`)} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{p.abstract}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{p.authors[0]}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} />{p.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdvancedSearch;