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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={22} />
        </div>
        <span className="text-3xl font-bold text-navy dark:text-accent">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{label}</p>
    </div>
  );

  const PaperCard = ({ paper, onRemove, isBookmark = false, isSubmission = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 
          className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1 cursor-pointer hover:text-navy transition" 
          onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : paper._id}`}
        >
          {isBookmark ? paper.research.title : paper.title}
        </h3>
        {isSubmission && (
          <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusBadge(paper.status)}`}>
            {paper.status?.toUpperCase()}
          </span>
        )}
      </div>
      {isBookmark ? (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{paper.research.abstract}</p>
      ) : isSubmission ? (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{paper.abstract}</p>
      ) : (
        <>
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{paper.authors?.join(' • ')}</p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{paper.abstract}</p>
        </>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
          {!isBookmark && !isSubmission && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {paper.submittedBy?.firstName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(paper.createdAt).toLocaleDateString()}
          </span>
          {isSubmission && paper.status === 'approved' && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {paper.views || 0}
            </span>
          )}
        </div>
        {isBookmark ? (
          <button 
            onClick={() => onRemove(paper._id, paper.research._id)} 
            className="text-red-600 hover:text-red-700 text-xs font-bold transition"
          >
            Remove
          </button>
        ) : !isSubmission && (
          <button
            onClick={() => window.location.href = `/research/${paper._id}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-bold"
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4 animate-fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.firstName}! 👋</h1>
          <p className="text-blue-100 text-sm">Faculty Dashboard</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
            { id: 'activity', icon: Activity, label: 'Activity' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 relative ${
                activeTab === tab.id 
                  ? 'bg-navy text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={FileText} label="My Reviews" value={stats.reviews} color="bg-blue-500" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-yellow-500" />
              <StatCard icon={Upload} label="My Submissions" value={stats.submissions} color="bg-green-600" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock size={20} className="text-yellow-600" />
                  Papers Awaiting Review ({filteredPending.length})
                </h2>
                <input 
                  type="text" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search papers..." 
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="p-4">
                {filteredPending.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {search ? 'No papers found' : 'No papers pending review'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPending.map(paper => (
                      <PaperCard key={paper._id} paper={paper} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload size={20} className="text-green-600" />
                  My Submissions ({filteredSubmissions.length})
                </h2>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition text-sm font-semibold shadow-md"
                >
                  <Upload size={16} />
                  Submit Research
                </button>
              </div>
              <div className="p-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">No submissions yet</p>
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="text-navy dark:text-accent hover:underline text-sm font-semibold"
                    >
                      Submit Your First Paper
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSubmissions.map(p => (
                      <PaperCard key={p._id} paper={p} isSubmission />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bookmark size={20} className="text-purple-600" />
                Bookmarked Papers ({filteredBookmarks.length})
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search bookmarks..." 
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none dark:bg-gray-700 dark:text-white"
              />
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">
                    {search ? 'No bookmarks found' : 'No bookmarks yet'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => window.location.href = '/browse'}
                      className="text-navy dark:text-accent hover:underline text-sm font-semibold"
                    >
                      Browse Papers
                    </button>
                  )}
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}`}>
                  {filteredBookmarks.map(b => (
                    <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityLogs />}
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