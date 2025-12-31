import { useState, useEffect } from 'react';
import { FileText, Clock, Eye, BookOpen, Activity, Bookmark, Calendar, Users, Upload, Search, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SubmitResearch from '../research/SubmitResearch';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [stats, setStats] = useState({ reviews: 0, pending: 0, submissions: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get('facultyReview');
    if (reviewId) {
      window.location.href = `/research/${reviewId}`;
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, statsRes, bookmarksRes, submissionsRes] = await Promise.all([
        fetch(`${API_URL}/reviews/pending`, { headers }),
        fetch(`${API_URL}/reviews/stats`, { headers }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers }),
        fetch(`${API_URL}/research/my-submissions`, { headers })
      ]);
      const [pending, reviewStats, bookmarksData, submissionsData] = await Promise.all([
        pendingRes.json(), statsRes.json(), bookmarksRes.json(), submissionsRes.json()
      ]);
      setPendingPapers(pending.papers || []);
      setBookmarks(bookmarksData.bookmarks || []);
      setSubmissions(submissionsData.papers || []);
      setStats({
        reviews: reviewStats.totalReviews || 0,
        pending: pending.count || 0,
        submissions: submissionsData.count || 0
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

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPending = pendingPapers.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBookmarks = bookmarks.filter(b =>
    b.research?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSubmissions = submissions.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-100 dark:border-gray-700 transition-all active:scale-95">
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-md`}>
          <Icon className="text-white" size={22} />
        </div>
        <div className="text-3xl font-bold text-navy dark:text-accent">{value}</div>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
    </div>
  );

  const PaperCard = ({ paper, onRemove, isBookmark = false, isSubmission = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 active:scale-98 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 
            className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 mb-2 active:text-navy cursor-pointer" 
            onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : paper._id}`}
          >
            {isBookmark ? paper.research.title : paper.title}
          </h3>
        </div>
        {isSubmission && (
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${getStatusBadge(paper.status)}`}>
            {paper.status?.toUpperCase()}
          </span>
        )}
        {!isBookmark && !isSubmission && (
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg text-xs font-bold whitespace-nowrap">
            PENDING
          </span>
        )}
      </div>
      
      {!isBookmark && !isSubmission && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">BY:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
            {paper.authors?.join(' • ')}
          </p>
        </div>
      )}
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {isBookmark ? paper.research.abstract : paper.abstract}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
          {!isBookmark && !isSubmission && (
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
        {isBookmark ? (
          <button 
            onClick={() => onRemove(paper._id, paper.research._id)} 
            className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition active:scale-95"
          >
            Remove
          </button>
        ) : !isSubmission && (
          <button
            onClick={() => window.location.href = `/research/${paper._id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-bold shadow-md active:scale-95"
          >
            <Eye size={14} />
            Review
          </button>
        )}
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        {/* Mobile Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Welcome,</h1>
              <p className="text-lg font-semibold text-blue-100">{user?.firstName}!</p>
            </div>
          </div>
          <p className="text-sm text-blue-100 opacity-90 mt-2">Faculty Dashboard</p>
        </div>

        {/* Mobile Tabs */}
        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', icon: BookOpen, label: 'Overview' },
              { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
              { id: 'activity', icon: Activity, label: 'Activity' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-navy text-white shadow-lg scale-105' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md active:scale-95'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4">
                <StatCard icon={FileText} label="My Reviews" value={stats.reviews} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
                <StatCard icon={Upload} label="My Submissions" value={stats.submissions} color="bg-gradient-to-br from-green-500 to-green-600" />
              </div>

              {/* Pending Papers */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-yellow-600" />
                    Pending Review ({filteredPending.length})
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search papers..." 
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900"
                    />
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {filteredPending.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {search ? 'No papers found' : 'No pending papers'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPending.map(paper => <PaperCard key={paper._id} paper={paper} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* My Submissions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Upload size={20} className="text-green-600" />
                      My Submissions ({filteredSubmissions.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-navy text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-all"
                  >
                    <Upload size={18} />
                    Submit Research
                  </button>
                </div>
                <div className="p-4">
                  {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">No submissions yet</p>
                      <button
                        onClick={() => setShowSubmitModal(true)}
                        className="text-navy dark:text-accent font-semibold hover:underline"
                      >
                        Submit Your First Paper
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSubmissions.map(p => <PaperCard key={p._id} paper={p} isSubmission />)}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bookmark size={20} className="text-purple-600" />
                  Bookmarked Papers ({filteredBookmarks.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bookmarks..." 
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bookmark size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">
                      {search ? 'No bookmarks found' : 'No bookmarks yet'}
                    </p>
                    {!search && (
                      <button onClick={() => window.location.href = '/explore'} className="text-navy dark:text-accent font-semibold hover:underline">
                        Browse Papers
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookmarks.map(b => <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && <ActivityLogs />}
        </div>
      </div>

      {showSubmitModal && (
        <SubmitResearch 
          onClose={() => setShowSubmitModal(false)} 
          onSuccess={() => { 
            setShowSubmitModal(false); 
            fetchData(); 
          }} 
        />
      )}
    </>
  );
};

export default FacultyDashboard;