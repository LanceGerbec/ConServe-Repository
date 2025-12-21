import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Share2, Quote, Check, AlertTriangle, XCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';
import ProtectedPDFViewer from '../components/research/ProtectedPDFViewer';

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchPaper = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error || 'Access denied');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Failed to load research paper');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPaper(data.paper);

      // Only check bookmark for approved papers
      if (data.paper.status === 'approved') {
        checkBookmark();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookmarks/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Check bookmark error:', error);
    }
  };

  const toggleBookmark = async () => {
    if (paper.status !== 'approved') {
      showToast('Only approved papers can be bookmarked', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookmarks/toggle/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
      showToast(data.bookmarked ? '✓ Added to favorites!' : '✓ Removed from favorites!');
    } catch (error) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleShare = async () => {
    if (paper.status !== 'approved') {
      showToast('Only approved papers can be shared', 'error');
      return;
    }

    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, url: shareUrl });
        showToast('✓ Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('✓ Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast('Failed to share', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  // ACCESS DENIED - Show error for non-approved papers
  const isAuthor = paper?.submittedBy?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canAccess = paper?.status === 'approved' || isAuthor || isAdmin;

  if (error || !canAccess) {
    const statusInfo = {
      rejected: {
        icon: XCircle,
        color: 'red',
        title: 'Research Not Available',
        message: 'This research paper has been rejected and is no longer available for viewing.',
        bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-500'
      },
      pending: {
        icon: AlertTriangle,
        color: 'yellow',
        title: 'Research Under Review',
        message: 'This research paper is currently under review and not yet available for public viewing.',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
      },
      default: {
        icon: Lock,
        color: 'gray',
        title: 'Access Denied',
        message: error || 'Only approved research papers can be viewed.',
        bgClass: 'bg-gray-50 dark:bg-gray-900/20 border-gray-500'
      }
    };

    const info = statusInfo[paper?.status] || statusInfo.default;
    const IconComponent = info.icon;

    return (
      <div className="max-w-3xl mx-auto text-center py-16 animate-fade-in">
        <div className={`${info.bgClass} rounded-2xl p-12 shadow-xl border-2`}>
          <IconComponent className={`mx-auto text-${info.color}-500 mb-6`} size={80} />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {info.title}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {info.message}
          </p>
          
          {user?.role === 'faculty' && paper?.status === 'pending' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded mb-6 text-left">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Note for Faculty:</strong> You can review pending papers from the Dashboard under "Pending Reviews".
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/browse')} 
              className="flex items-center gap-2 bg-navy text-white px-8 py-3 rounded-xl hover:bg-navy-800 transition font-semibold shadow-lg"
            >
              <ArrowLeft size={20} />
              Browse Approved Papers
            </button>
            
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // APPROVED PAPER OR AUTHORIZED USER - Show full details
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <Check size={20} />
          <span>{toast.message}</span>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center text-navy hover:text-navy-700 mb-6 transition">
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        {/* Status Badge for non-approved papers */}
        {paper.status !== 'approved' && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            paper.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
            'bg-red-50 dark:bg-red-900/20 border-red-500'
          }`}>
            <p className="font-bold text-gray-900 dark:text-white">
              ⚠️ {paper.status.toUpperCase()} PAPER
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {isAuthor ? 'This is your submission. Only you and admins can view this.' : 
               isAdmin ? 'Admin preview - This paper is not publicly visible yet.' : ''}
            </p>
          </div>
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
          {paper.status === 'approved' && (
            <div className="flex items-center">
              <Eye size={16} className="mr-2" />
              <span>{paper.views} views</span>
            </div>
          )}
          <div className="flex items-center">
            <Tag size={16} className="mr-2" />
            <span>{paper.category}</span>
          </div>
        </div>

        {/* Action Buttons - Only for Approved Papers */}
        {paper.status === 'approved' && (
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
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        )}

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

      {/* PDF Viewer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Full Document</h2>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-8 text-center border-2 border-dashed border-red-300 dark:border-red-700">
          <FileText className="mx-auto text-red-600 mb-4" size={64} />
          <p className="text-gray-900 dark:text-white mb-2 font-bold text-lg">
            🔒 View-Only Protected Document
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
            {paper.status === 'approved' 
              ? 'This PDF is strictly for viewing only. All protection measures are active.' 
              : '⚠️ Preview Mode - This paper is not yet approved for public viewing'}
          </p>
          
          <button
            onClick={() => setShowPDF(true)}
            className="inline-flex items-center justify-center gap-2 bg-navy text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition shadow-lg"
          >
            <FileText size={20} />
            Open Viewer (View Only)
          </button>
        </div>
      </div>

      {showPDF && (
        <ProtectedPDFViewer 
          signedPdfUrl={paper.signedPdfUrl}
          paperTitle={paper.title}
          onClose={() => setShowPDF(false)}
        />
      )}

      {showCitation && paper.status === 'approved' && (
        <CitationModal
          paper={paper}
          onClose={() => setShowCitation(false)}
        />
      )}
    </div>
  );
};

export default ResearchDetail;