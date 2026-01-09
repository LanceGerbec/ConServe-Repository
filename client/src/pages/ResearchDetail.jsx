import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Share2, Quote, Check, AlertTriangle, XCircle, Lock, MessageSquare, Award, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';
import ProtectedPDFViewer from '../components/research/ProtectedPDFViewer';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsModal from '../components/review/ReviewsModal';
import SimilarPapers from '../components/research/SimilarPapers';
import AwardsModal from '../components/admin/AwardsModal';

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => { fetchPaper(); fetchReviews(); }, [id]);

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
      if (data.paper.status === 'approved') checkBookmark();
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
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
      console.error('Bookmark check error:', error);
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
      showToast(data.bookmarked ? 'Bookmarked!' : 'Removed!');
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const handleShare = async () => {
    if (paper.status !== 'approved') {
      showToast('Only approved papers can be shared', 'error');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, url: window.location.href });
        showToast('Shared!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Failed to share', 'error');
    }
  };

  const handleViewPDF = () => {
    if (!paper?.pdfUrl && !paper?.fileUrl) {
      showToast('PDF not available', 'error');
      return;
    }
    setShowPDF(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-blue-500"></div>
      </div>
    );
  }

  const isAuthor = paper?.submittedBy?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const canAccess = paper?.status === 'approved' || isAuthor || isAdmin;
  const canSeeReviews = isAuthor || isAdmin || isFaculty;

  if (error || !canAccess) {
    const statusInfo = {
      rejected: { icon: XCircle, color: 'red', title: 'Research Not Available', message: 'This research paper has been rejected.', bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700' },
      pending: { icon: Clock, color: 'yellow', title: 'Research Under Review', message: 'This research paper is under review.', bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-700' },
      default: { icon: Lock, color: 'gray', title: 'Access Denied', message: error || 'Only approved research can be viewed.', bgClass: 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-700' }
    };

    const info = statusInfo[paper?.status] || statusInfo.default;
    const IconComponent = info.icon;

    return (
      <div className="px-4 py-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className={`${info.bgClass} rounded-2xl p-8 shadow-xl border-2 text-center max-w-2xl mx-auto`}>
          <IconComponent className={`mx-auto text-${info.color}-500 dark:text-${info.color}-400 mb-4`} size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{info.title}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{info.message}</p>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/explore')} className="flex items-center justify-center gap-2 bg-navy dark:bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-navy-800 dark:hover:bg-blue-700 transition font-semibold shadow-lg">
              <ArrowLeft size={18} />Browse Papers
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold shadow-lg">
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safe display of author names
  const authorNames = paper?.authors?.join(', ') || 'Unknown';
  const submitterName = paper?.submittedBy ? `${paper.submittedBy.firstName || ''} ${paper.submittedBy.lastName || ''}`.trim() || 'Unknown' : 'Unknown';

  return (
    <div className="min-h-screen pb-6 bg-gray-50 dark:bg-gray-950">
      {toast.show && (
        <div className={`fixed top-20 right-4 left-4 md:left-auto md:w-auto z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white animate-slide-up`}>
          <Check size={18} /><span className="text-sm">{toast.message}</span>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center text-navy dark:text-blue-400 hover:text-navy-700 dark:hover:text-blue-300 mb-4 px-4 py-2">
        <ArrowLeft size={18} className="mr-2" />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mx-4 mb-4 overflow-hidden">
        <div className="p-4 space-y-4">
          {paper.status !== 'approved' && (
            <div className={`p-3 rounded-lg border-l-4 flex items-center gap-2 ${paper.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600' : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600'}`}>
              <AlertTriangle size={16} className={paper.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'} />
              <p className="font-bold text-xs text-gray-900 dark:text-white">{paper.status.toUpperCase()} PAPER</p>
            </div>
          )}

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
            {paper.title}
          </h1>

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-500" />
              <span className="break-words">{authorNames}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-500" />
              <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
            </div>
            {paper.status === 'approved' && (
              <div className="flex items-center gap-2">
                <Eye size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-500" />
                <span>{paper.views} views</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tag size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-500" />
              <span>{paper.category}</span>
            </div>
          </div>

          {paper.status === 'approved' && (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={toggleBookmark} 
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${bookmarked ? 'bg-navy dark:bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
                {bookmarked ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={() => setShowCitation(true)} 
                className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition text-gray-700 dark:text-gray-300"
              >
                <Quote size={16} />
                Cite
              </button>
              <button 
                onClick={handleShare} 
                className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition text-gray-700 dark:text-gray-300"
              >
                <Share2 size={16} />
                Share
              </button>
              {isFaculty && (
                <button 
                  onClick={() => setShowReviewModal(true)} 
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 text-sm font-semibold transition"
                >
                  <MessageSquare size={16} />
                  Review
                </button>
              )}
            </div>
          )}

          {isAdmin && (
            <button 
              onClick={() => setShowAwardsModal(true)} 
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 text-sm font-semibold transition"
            >
              <Award size={16} />
              Manage Awards
            </button>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Abstract</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words">
              {paper.abstract}
            </p>
          </div>

          {canSeeReviews && reviews.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowReviewsModal(true)}
                className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                      Faculty Reviews ({reviews.length})
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Click to view all reviews
                    </p>
                  </div>
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition">
                  →
                </div>
              </button>
            </div>
          )}

          {paper.awards?.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Award size={18} className="text-yellow-600 dark:text-yellow-500" />
                Awards & Recognition
              </h2>
              <div className="flex flex-wrap gap-2">
                {paper.awards.map((award, i) => {
                  const colorMap = {
                    gold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600',
                    silver: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-500 dark:border-gray-600',
                    bronze: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-500 dark:border-orange-600',
                    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-500 dark:border-blue-600',
                    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-500 dark:border-green-600',
                    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-500 dark:border-purple-600'
                  };
                  return (
                    <div key={i} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border-2 ${colorMap[award.color] || colorMap.gold} font-bold text-sm`}>
                      <Award size={16} />
                      {award.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {paper.keywords?.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, i) => (
                  <span key={i} className="px-2 py-1 bg-navy/10 dark:bg-blue-500/20 text-navy dark:text-blue-400 rounded-full text-xs font-semibold break-words">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paper.subjectArea && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Subject Area</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{paper.subjectArea}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mx-4 mb-4 overflow-hidden">
        <div className="p-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Full Document</h2>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 text-center border-2 border-dashed border-red-300 dark:border-red-700">
            <FileText className="mx-auto text-red-600 dark:text-red-500 mb-3" size={48} />
            <p className="text-gray-900 dark:text-white mb-1 font-bold text-sm flex items-center justify-center gap-2">
              <Lock size={16} />
              View-Only Protected Document
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-xs">
              {paper.status === 'approved' ? 'PDF is strictly for viewing only.' : 'Preview Mode'}
            </p>
            <button 
              onClick={handleViewPDF} 
              className="inline-flex items-center justify-center gap-2 bg-navy dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-navy-800 dark:hover:bg-blue-700 shadow-lg text-sm font-semibold w-full md:w-auto"
            >
              <FileText size={18} />
              Open Viewer
            </button>
          </div>
        </div>
      </div>

      {paper.status === 'approved' && (
        <div className="mx-4">
          <SimilarPapers paperId={paper._id} />
        </div>
      )}

      {showPDF && (paper.pdfUrl || paper.fileUrl) && (
        <ProtectedPDFViewer 
          pdfUrl={paper.pdfUrl || paper.fileUrl}
          paperTitle={paper.title}
          onClose={() => setShowPDF(false)}
        />
      )}

      {showCitation && paper.status === 'approved' && (
        <CitationModal paper={paper} onClose={() => setShowCitation(false)} />
      )}

      {showReviewModal && isFaculty && (
        <ReviewForm 
          paper={paper} 
          onClose={() => setShowReviewModal(false)} 
          onSuccess={() => { setShowReviewModal(false); fetchPaper(); fetchReviews(); }} 
        />
      )}

      {showReviewsModal && (
        <ReviewsModal
          isOpen={showReviewsModal}
          onClose={() => setShowReviewsModal(false)}
          reviews={reviews}
          onDelete={() => {
            fetchReviews();
            fetchPaper();
          }}
        />
      )}

      {showAwardsModal && isAdmin && (
        <AwardsModal 
          paper={paper} 
          onClose={() => setShowAwardsModal(false)} 
          onSuccess={fetchPaper} 
        />
      )}
    </div>
  );
};

export default ResearchDetail;