import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Share2, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  useEffect(() => {
    fetchPaper();
    checkBookmark();
  }, [id]);

  const fetchPaper = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPaper(data.paper);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookmarks/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Check bookmark error:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookmarks/toggle/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Paper Not Found</h2>
        <button onClick={() => navigate('/browse')} className="text-navy hover:underline">
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 select-none">
        <div className="h-full w-full flex items-center justify-center rotate-[-45deg] text-navy text-2xl font-bold whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()}
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="flex items-center text-navy hover:text-navy-700 mb-6 transition">
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        {paper.status !== 'approved' && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
            paper.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            paper.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {paper.status.toUpperCase()}
          </span>
        )}

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{paper.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center">
            <User size={16} className="mr-2" />
            <span>{paper.authors.join(', ')}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Eye size={16} className="mr-2" />
            <span>{paper.views} views</span>
          </div>
          <div className="flex items-center">
            <Tag size={16} className="mr-2" />
            <span>{paper.category}</span>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              bookmarked
                ? 'bg-navy text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Bookmark size={18} className={bookmarked ? 'fill-current' : ''} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            onClick={() => setShowCitation(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Quote size={18} />
            Cite
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Share2 size={18} />
            Share
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Abstract</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {paper.abstract}
          </p>
        </div>

        {paper.keywords?.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {paper.subjectArea && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Subject Area</h2>
            <p className="text-gray-700 dark:text-gray-300">{paper.subjectArea}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Full Document</h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">PDF viewer will be implemented in Phase 4</p>
          
            href={paper.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition"
          <a>
            View on Cloudinary (Temporary)
          </a>
        </div>
      </div>

      {showCitation && <CitationModal paper={paper} onClose={() => setShowCitation(false)} />}

      <style>{`
        * { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
      `}</style>
    </div>
  );
};

export default ResearchDetail;