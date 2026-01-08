import { useState, useEffect, useRef } from 'react';
import { FileText, Clock, Eye, BookOpen, Activity, Bookmark, Calendar, Users, Upload, Search, X, ChevronRight, Filter, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SubmitResearch from '../research/SubmitResearch';
import EditResearch from '../research/EditResearch';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';
import Tooltip from '../common/Tooltip';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [stats, setStats] = useState({ reviews: 0, pending: 0, submissions: 0, totalPapers: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showReviewedPapers, setShowReviewedPapers] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const reviewsRef = useRef(null);
  const submissionsRef = useRef(null);
  const bookmarksRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get('facultyReview');
    if (reviewId) {
      window.location.href = `/research/${reviewId}`;
      navigate('/dashboard', { replace: true });
    }
}, [location.search, navigate]);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, statsRes, reviewsRes, bookmarksRes, submissionsRes] = await Promise.all([
        fetch(`${API_URL}/reviews/pending`, { headers }),
        fetch(`${API_URL}/reviews/stats`, { headers }),
        fetch(`${API_URL}/reviews/my-reviews`, { headers }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers }),
        fetch(`${API_URL}/research/my-submissions`, { headers })
      ]);
      const [pending, reviewStats, reviews, bookmarksData, submissionsData] = await Promise.all([
        pendingRes.json(), statsRes.json(), reviewsRes.json(), bookmarksRes.json(), submissionsRes.json()
      ]);
      
      setPendingPapers(pending.papers || []);
      setMyReviews(reviews.reviews || []);
      setBookmarks(bookmarksData.bookmarks || []);
      setSubmissions(submissionsData.papers || []);
      
      const totalApprovedPapers = (pending.papers || []).length;
      const unreviewedCount = (pending.papers || []).filter(p => !p.reviewedByCurrentUser).length;
      const myReviewsCount = reviews.count || 0;
      
      setStats({ 
        reviews: myReviewsCount,
        pending: unreviewedCount,
        submissions: submissionsData.count || 0,
        totalPapers: totalApprovedPapers
      });
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, researchId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/bookmarks/toggle/${researchId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
      showToast('Bookmark removed', 'success');
    } catch (error) {
      showToast('Failed to remove', 'error');
    }
  };

  const [deleteModal, setDeleteModal] = useState({ show: false, paperId: null, title: '' });

const handleDeleteRejected = async (paperId, title) => {
  setDeleteModal({ show: true, paperId, title });
};

const confirmDelete = async () => {
  const { paperId, title } = deleteModal;
  setDeleteModal({ show: false, paperId: null, title: '' });
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/research/${paperId}/author-delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete');
    }
    
    setSubmissions(prev => prev.filter(p => p._id !== paperId));
    setStats(prev => ({ ...prev, submissions: prev.submissions - 1 }));
    showToast('Paper deleted successfully', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

  const scrollToSection = (ref, tab) => {
    setActiveTab(tab);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      revision: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getReviewBadge = (paper) => {
    if (paper.reviewedByCurrentUser) {
      return <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-xs font-bold whitespace-nowrap">✓ REVIEWED</span>;
}
if (paper.totalReviewsCount > 0) {
return <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold whitespace-nowrap">{paper.totalReviewsCount} REVIEW{paper.totalReviewsCount !== 1 ? 'S' : ''}</span>;
}
return <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg text-xs font-bold whitespace-nowrap">PENDING</span>;
};
const filteredPending = pendingPapers
.filter(p => showReviewedPapers || !p.reviewedByCurrentUser)
.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
const filteredReviews = myReviews.filter(r => r.research?.title?.toLowerCase().includes(search.toLowerCase()));
const filteredBookmarks = bookmarks.filter(b => b.research?.title?.toLowerCase().includes(search.toLowerCase()));
const filteredSubmissions = submissions.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
<div
  onClick={onClick}
  className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border-2 border-gray-100 dark:border-gray-700 transition-all ${
    onClick ? 'active:scale-95 cursor-pointer hover:shadow-lg' : ''
  }`}
>

<div className="flex items-center gap-2 sm:gap-3">
<div
  className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
>
<Icon className="text-white" size={18} />
</div>
<div className="flex-1 min-w-0">
<div className="text-xl sm:text-2xl font-bold text-navy dark:text-accent">{value}</div>
<p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</p>
</div>
{onClick && <ChevronRight className="text-gray-400 flex-shrink-0" size={16} />}
</div>
</div>
);
const PaperCard = ({ paper, onRemove, isBookmark = false, isSubmission = false, isReview = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-md border border-gray-200 dark:border-gray-700 active:scale-98 transition-all">
    <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-3">
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 mb-2 active:text-navy cursor-pointer" onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : isReview ? paper.research._id : paper._id}`}>
          {isBookmark ? paper.research.title : isReview ? paper.research.title : paper.title}
        </h3>
        {/* AUTHORS LIST */}
        {!isReview && (
          <div className="mb-2 flex items-start gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">BY:</span>
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
              {isBookmark ? paper.research.authors?.join(', ') : paper.authors?.join(', ')}
            </p>
          </div>
        )}
      </div>
      {isSubmission ? (
        <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold whitespace-nowrap self-start ${getStatusBadge(paper.status)}`}>
          {paper.status?.toUpperCase()}
        </span>
      ) : !isBookmark && !isReview && (
        <div className="self-start">{getReviewBadge(paper)}</div>
      )}
    </div>
    
    {!isBookmark && !isSubmission && !isReview && (
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">SUBMITTED BY:</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
          {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
        </p>
      </div>
    )}
    
    {isReview && (
      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">YOUR REVIEW</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{paper.comments}</p>
      </div>
    )}
    
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
      {isBookmark ? paper.research.abstract : isReview ? paper.research.abstract : paper.abstract}
    </p>
    
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
        {!isBookmark && !isSubmission && !isReview && (
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {paper.submittedBy?.firstName}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          {new Date(paper.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {isSubmission && paper.status === 'approved' && (
          <span className="flex items-center gap-1.5">
            <Eye size={14} />
            {paper.views || 0}
          </span>
        )}
      </div>
      
      <div className="w-full sm:w-auto flex gap-2">
        {isBookmark ? (
          <button onClick={() => onRemove(paper._id, paper.research._id)} className="w-full sm:w-auto px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition active:scale-95">
            Remove
          </button>
        ) : isSubmission && paper.status === 'rejected' ? (
          <button 
            onClick={() => handleDeleteRejected(paper._id, paper.title)} 
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition active:scale-95"
          >
            <Trash2 size={14} />
            Delete
          </button>
        ) : !isSubmission && !isReview ? (
          <button onClick={() => window.location.href = `/research/${paper._id}`} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-bold shadow-md active:scale-95">
            <Eye size={14} />{paper.reviewedByCurrentUser ? 'View' : 'Review'}
          </button>
        ) : isReview && (
          <button onClick={() => window.location.href = `/research/${paper.research._id}`} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition text-xs font-bold shadow-md active:scale-95">
            <Eye size={14} />View
          </button>
        )}
      </div>
    </div>
  </div>
);
if (loading) {
return (
<div className="flex items-center justify-center h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
</div>
);
}
return (
<>
{toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}
  <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-400 rounded-full blur-3xl"></div>
    </div>

    <div className="relative flex items-center gap-3 sm:gap-6">
      <div className="hidden xs:block flex-shrink-0">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-2xl ring-2 sm:ring-4 ring-white/20 transform transition-transform hover:scale-105">
          <span className="text-base sm:text-lg md:text-2xl font-bold text-white tracking-tight">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1 sm:mb-2">
          <p className="text-xs sm:text-sm font-medium text-blue-100 mb-0.5">Welcome,</p>
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-0.5 truncate">{user?.firstName} {user?.lastName}</h1>
          <p className="text-xs sm:text-sm text-blue-200 font-medium">Faculty Dashboard</p>
        </div>

        <div className="w-full max-w-md h-px bg-gradient-to-r from-blue-400/50 via-blue-300/30 to-transparent my-2"></div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 text-blue-100">
            <FileText size={12} className="text-blue-300 flex-shrink-0" />
            <span className="font-semibold text-white">{stats.reviews}</span>
            <span className="text-blue-200">Review{stats.reviews !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3 bg-blue-400/30"></div>
          <div className="flex items-center gap-1.5 text-blue-100">
            <Clock size={12} className="text-yellow-300 flex-shrink-0" />
            <span className="font-semibold text-white">{stats.pending}</span>
            <span className="text-blue-200">Pending</span>
          </div>
          <div className="w-px h-3 bg-blue-400/30"></div>
          <div className="flex items-center gap-1.5 text-blue-100">
            <Upload size={12} className="text-green-300 flex-shrink-0" />
            <span className="font-semibold text-white">{stats.submissions}</span>
            <span className="text-blue-200">Paper{stats.submissions !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <Activity size={14} className="text-green-300" />
        <span className="text-xs font-semibold text-white">Active</span>
      </div>
    </div>
  </div>

  <div className="px-3 sm:px-4 mb-4 sm:mb-6">
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {[
        { id: 'overview', icon: BookOpen, label: 'Overview' },
        { id: 'reviews', icon: FileText, label: 'Reviews', badge: stats.reviews + stats.pending },
        { id: 'submissions', icon: Upload, label: 'Submissions', badge: stats.submissions },
        { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
        { id: 'activity', icon: Activity, label: 'Activity' }
      ].map(tab => (
        <button key={tab.id} onClick={() => {
          setActiveTab(tab.id);
          if (tab.id === 'reviews') scrollToSection(reviewsRef, 'reviews');
          if (tab.id === 'submissions') scrollToSection(submissionsRef, 'submissions');
          if (tab.id === 'bookmarks') scrollToSection(bookmarksRef, 'bookmarks');
        }} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm ${activeTab === tab.id ? 'bg-navy text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md active:scale-95'}`}>
          <tab.icon size={16} />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
          {tab.badge > 0 && (
            <span className="px-1.5 py-0.5 bg-[#FFB27F] text-white text-xs font-bold rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>

  <div className="px-3 sm:px-4 space-y-4 sm:space-y-6">
    {activeTab === 'overview' && (
      <>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <button onClick={() => setShowSubmitModal(true)} className="bg-gradient-to-br from-navy to-blue-700 text-white p-4 sm:p-6 rounded-2xl shadow-lg active:scale-95 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Submit Research</h3>
                <p className="text-xs sm:text-sm text-blue-100 opacity-90">Upload your paper</p>
              </div>
              <ChevronRight size={18} className="opacity-70" />
            </div>
          </button>

          <button onClick={() => window.location.href = '/explore'} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 active:scale-95 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <BookOpen className="text-blue-600" size={20} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-0.5 sm:mb-1">Browse Papers</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Explore repository</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </button>
        </div>
      </>
    )}

    {activeTab === 'reviews' && (
      <div ref={reviewsRef} className="space-y-4 sm:space-y-6 scroll-mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-green-600" />
                <span className="hidden sm:inline">Approved Papers - Ready for Review</span>
                <span className="sm:hidden">Approved Papers</span>
              </h2>
              <Tooltip content={`${stats.pending} paper${stats.pending !== 1 ? 's' : ''} need your review`} position="bottom">
                <div className="flex items-center gap-1 text-navy dark:text-accent cursor-help">
                  <span className="font-bold text-sm">({filteredPending.length})</span>
                  <Info size={14} />
                </div>
              </Tooltip>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                ℹ️ These papers have been approved by admin. Your review is optional and advisory.
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search papers..." className="w-full pl-9 pr-9 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={showReviewedPapers}
                onChange={(e) => setShowReviewedPapers(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
              />
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-navy dark:group-hover:text-accent transition">
                  Show papers I've reviewed
                </span>
              </div>
            </label>
          </div>

          <div className="p-3 sm:p-4 max-h-96 overflow-y-auto">
            {filteredPending.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock size={28} className="text-gray-400" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {search ? 'No papers found' : !showReviewedPapers ? 'No unreviewed papers' : 'No approved papers yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">{filteredPending.map(paper => <PaperCard key={paper._id} paper={paper} />)}</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                My Reviews
              </h2>
              <Tooltip content={`You submitted ${stats.reviews} review${stats.reviews !== 1 ? 's' : ''}`} position="bottom">
                <div className="flex items-center gap-1 text-navy dark:text-accent cursor-help">
                  <span className="font-bold text-sm">({filteredReviews.length})</span>
                  <Info size={14} />
                </div>
              </Tooltip>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText size={28} className="text-gray-400" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">{filteredReviews.map(review => <PaperCard key={review._id} paper={review} isReview />)}</div>
            )}
          </div>
        </div>
      </div>
    )}

    {activeTab === 'submissions' && (
      <div ref={submissionsRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-4">
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload size={18} className="text-green-600" />
                My Submissions
              </h2>
              <Tooltip content={`You have ${stats.submissions} paper${stats.submissions !== 1 ? 's' : ''}`} position="bottom">
                <div className="flex items-center gap-1 text-navy dark:text-accent cursor-help">
                  <span className="font-bold text-sm">({filteredSubmissions.length})</span>
                  <Info size={14} />
                </div>
              </Tooltip>
            </div>
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-navy text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-all text-sm">
            <Upload size={16} />Submit Research
          </button>
        </div>
        <div className="p-3 sm:p-4">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Upload size={28} className="text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">No submissions yet</p>
              <button onClick={() => setShowSubmitModal(true)} className="text-sm sm:text-base text-navy dark:text-accent font-semibold hover:underline">Submit Your First Paper</button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">{filteredSubmissions.map(p => <PaperCard key={p._id} paper={p} isSubmission />)}</div>
          )}
        </div>
      </div>
    )}

    {activeTab === 'bookmarks' && (
      <div ref={bookmarksRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-4">
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bookmark size={18} className="text-purple-600" />
              Bookmarks
            </h2>
            <Tooltip content={`You have ${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`} position="bottom">
              <div className="flex items-center gap-1 text-navy dark:text-accent cursor-help">
                <span className="font-bold text-sm">({filteredBookmarks.length})</span>
                <Info size={14} />
              </div>
            </Tooltip>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full pl-9 pr-9 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Bookmark size={28} className="text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">{search ? 'No bookmarks found' : 'No bookmarks yet'}</p>
              {!search && <button onClick={() => window.location.href = '/explore'} className="text-sm sm:text-base text-navy dark:text-accent font-semibold hover:underline">Browse Papers</button>}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">{filteredBookmarks.map(b => <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />)}</div>
          )}
        </div>
      </div>
    )}

    {activeTab === 'activity' && <ActivityLogs />}
  </div>

  {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => { setShowSubmitModal(false); fetchData(); }} />}
  
  {showEditModal && editingPaper && (
    <EditResearch 
      research={editingPaper}
      onClose={() => {
        setShowEditModal(false);
        setEditingPaper(null);
}}
onSuccess={() => {
setShowEditModal(false);
setEditingPaper(null);
fetchData();
}}
/>
)}
</>
);
};

{/* Delete Confirmation Modal */}
{deleteModal.show && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200 dark:border-red-800 animate-scale-in">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-900/20">
            <Trash2 size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Delete Rejected Paper?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This action cannot be undone. The paper and its PDF will be permanently deleted.
            </p>
          </div>
          <button 
            onClick={() => setDeleteModal({ show: false, paperId: null, title: '' })}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paper to delete:</p>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">
            {deleteModal.title}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal({ show: false, paperId: null, title: '' })}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}

export default FacultyDashboard;