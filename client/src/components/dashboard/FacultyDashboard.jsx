import { useState, useEffect } from 'react';
import { FileText, Clock, Eye, BookOpen, Activity, Bookmark, Calendar, Grid, List, Users, Upload } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid');
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
        pendingRes.json(),
        statsRes.json(),
        bookmarksRes.json(),
        submissionsRes.json()
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
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 md:p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`w-14 h-14 md:w-16 md:h-16 ${color} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={24} />
        </div>
        <span className="text-3xl md:text-4xl font-bold text-navy dark:text-accent">{value}</span>
      </div>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">{label}</p>
    </div>
  );

  const PaperCard = ({ paper, onRemove, isBookmark = false, isSubmission = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between mb-3 gap-3">
        <h3 
          className="font-bold text-sm md:text-base text-gray-900 dark:text-white line-clamp-2 flex-1 cursor-pointer hover:text-navy transition" 
          onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : paper._id}`}
        >
          {isBookmark ? paper.research.title : paper.title}
        </h3>
        {isSubmission && (
          <span className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${getStatusBadge(paper.status)}`}>
            {paper.status?.toUpperCase()}
          </span>
        )}
        {!isBookmark && !isSubmission && (
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap flex-shrink-0">
            PENDING
          </span>
        )}
      </div>
      
      {isBookmark ? (
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{paper.research.abstract}</p>
      ) : isSubmission ? (
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{paper.abstract}</p>
      ) : (
        <>
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">AUTHORS:</p>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">{paper.authors?.join(' • ')}</p>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{paper.abstract}</p>
        </>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {!isBookmark && !isSubmission && (
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              <span className="hidden sm:inline">{paper.submittedBy?.firstName}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span className="hidden sm:inline">{new Date(paper.createdAt).toLocaleDateString()}</span>
            <span className="sm:hidden">{new Date(paper.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
            className="text-red-600 hover:text-red-700 text-xs md:text-sm font-bold transition px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            Remove
          </button>
        ) : !isSubmission && (
          <button
            onClick={() => window.location.href = `/research/${paper._id}`}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-bold shadow-md"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Review</span>
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Welcome, {user?.firstName}! 👋</h1>
          <p className="text-blue-100 text-sm md:text-base">Faculty Dashboard</p>
        </div>

        {/* Navigation Tabs - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex flex-col sm:flex-row gap-2">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
            { id: 'activity', icon: Activity, label: 'Activity' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full sm:flex-1 px-4 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-semibold transition flex items-center justify-center gap-2 relative ${
                activeTab === tab.id 
                  ? 'bg-navy text-white shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <StatCard icon={FileText} label="My Reviews" value={stats.reviews} color="bg-blue-500" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-yellow-500" />
              <StatCard icon={Upload} label="My Submissions" value={stats.submissions} color="bg-green-600" />
            </div>

            {/* Papers Awaiting Review */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock size={22} className="text-yellow-600 flex-shrink-0" />
                  <span>Papers Awaiting Review ({filteredPending.length})</span>
                </h2>
                <input 
                  type="text" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search papers..." 
                  className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm md:text-base focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-700 dark:text-white transition"
                />
              </div>
              <div className="p-4 md:p-6">
                {filteredPending.length === 0 ? (
                  <div className="text-center py-12 md:py-16">
                    <Clock size={56} className="mx-auto text-gray-400 mb-4 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                      {search ? 'No papers found' : 'No papers pending review'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-5">
                    {filteredPending.map(paper => (
                      <PaperCard key={paper._id} paper={paper} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Submissions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload size={22} className="text-green-600 flex-shrink-0" />
                  <span>My Submissions ({filteredSubmissions.length})</span>
                </h2>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-navy text-white rounded-xl hover:bg-navy-800 transition text-sm md:text-base font-semibold shadow-lg"
                >
                  <Upload size={18} />
                  Submit Research
                </button>
              </div>
              <div className="p-4 md:p-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12 md:py-16">
                    <Upload size={56} className="mx-auto text-gray-400 mb-4 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-3 font-medium">No submissions yet</p>
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="text-navy dark:text-accent hover:underline text-sm md:text-base font-semibold"
                    >
                      Submit Your First Paper
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:gap-5">
                    {filteredSubmissions.map(p => (
                      <PaperCard key={p._id} paper={p} isSubmission />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bookmark size={22} className="text-purple-600 flex-shrink-0" />
                  <span>Bookmarked Papers ({filteredBookmarks.length})</span>
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2.5 md:p-3 rounded-xl transition ${viewMode === 'grid' ? 'bg-navy text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2.5 md:p-3 rounded-xl transition ${viewMode === 'list' ? 'bg-navy text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search bookmarks..." 
                className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm md:text-base focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div className="p-4 md:p-6">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <Bookmark size={56} className="mx-auto text-gray-400 mb-4 opacity-30" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-3 font-medium">
                    {search ? 'No bookmarks found' : 'No bookmarks yet'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => window.location.href = '/browse'}
                      className="text-navy dark:text-accent hover:underline text-sm md:text-base font-semibold"
                    >
                      Browse Papers
                    </button>
                  )}
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:gap-5' : 'space-y-4 md:space-y-5'}`}>
                  {filteredBookmarks.map(b => (
                    <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && <ActivityLogs />}
      </div>

      {/* Submit Modal */}
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