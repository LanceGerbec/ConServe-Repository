import { useState, useEffect } from 'react';
import { Sparkles, Eye, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SimilarPapers = ({ paperId }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSimilar();
  }, [paperId]);

  const fetchSimilar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/similar/${paperId}?limit=4`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (error) {
      console.error('Similar papers error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || papers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Sparkles size={24} className="text-purple-600" />
        Similar Papers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((paper) => (
          <div key={paper._id} onClick={() => navigate(`/research/${paper._id}`)} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{paper.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{paper.abstract}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={12} />{paper.yearCompleted || new Date(paper.createdAt).getFullYear()}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{paper.views || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarPapers;