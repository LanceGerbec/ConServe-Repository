import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Eye } from 'lucide-react';

const RecentlyViewed = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recent');

  useEffect(() => {
    fetchPapers();
  }, [tab]);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = tab === 'recent' ? 'recently-viewed' : 'trending';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === 'recent' 
                ? 'bg-navy text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock size={16} className="inline mr-2" />
            Recent
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === 'trending' 
                ? 'bg-navy text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Trending
          </button>
        </div>
      </div>

      {papers.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No papers yet</p>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <a
              key={paper._id}
              href={`/research/${paper._id}`}
              className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                {paper.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                {paper.authors.join(', ')}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {paper.views}
                </span>
                <span className="px-2 py-1 bg-navy/10 text-navy rounded-full">
                  {paper.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;