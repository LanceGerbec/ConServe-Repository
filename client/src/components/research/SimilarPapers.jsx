import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';

const SimilarPapers = ({ paperId }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paperId) fetchSimilar();
  }, [paperId]);

  const fetchSimilar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/similar/${paperId}?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
      }
    } catch (error) {
      console.error('Similar papers error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );

  if (papers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={24} className="text-purple-600" />
        Similar Papers
      </h2>
      <div className="space-y-3">
        {papers.map(p => (
          <a key={p._id} href={`/research/${p._id}`} className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">{p.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{p.abstract}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{p.authors?.[0]}</span>
              {p.yearCompleted && <span>• {p.yearCompleted}</span>}
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {p.views || 0}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Add to Header.jsx navLinks array:
// { path: '/search', label: 'Advanced Search' }

export default SimilarPapers;