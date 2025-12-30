import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Eye, BookOpen, Activity, Bookmark, Search, Calendar, Grid, List, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({ reviews: 0, pending: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
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
    if (activeTab === 'overview' || activeTab === 'bookmarks') fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingRes, reviewsRes, statsRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/reviews/pending`, { headers }),
        fetch(`${API_URL}/reviews/my-reviews`, { headers }),
        fetch(`${API_URL}/reviews/stats`, { headers }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers })
      ]);

      const [pending, reviews, reviewStats, bookmarksData] = await Promise.all([
        pendingRes.json(),
        reviewsRes.json(),
        statsRes.json(),
        bookmarksRes.json()
      ]);

      setPendingPapers(pending.papers || []);
      setMyReviews(reviews.reviews || []);
      setBookmarks(bookmarksData.bookmarks || []);
      setStats({
        reviews: reviewStats.totalReviews || 0,
        pending: pending.count || 0
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

  const filteredPending = pendingPapers.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(b =>
    b.research?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        <span className="text-2xl font-bold text-navy dark:text-accent">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.firstName}! 👋</h1>
          <p className="text-blue-100 text-sm">Faculty Dashboard</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
            { id: 'activity', icon: Activity, label: 'Activity' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 relative ${
                activeTab === tab.id 
                  ? 'bg-navy text-white' 
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Only 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard 
                icon={FileText} 
                label="My Reviews" 
                value={stats.reviews} 
                color="bg-blue-500" 
              />
              <StatCard 
                icon={Clock} 
                label="Pending Review" 
                value={stats.pending} 
                color="bg-yellow-500" 
              />
            </div>

            {/* Papers Awaiting Review */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-navy focus:outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="p-4">
                {filteredPending.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {search ? 'No papers found' : 'No papers pending review'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPending.map(paper => (
                      <div 
                        key={paper._id} 
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">
                            {paper.title}
                          </h3>
                          <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-semibold whitespace-nowrap">
                            PENDING
                          </span>
                        </div>
                        <div className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {paper.authors?.join(' • ')}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {paper.abstract}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(paper.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => window.location.href = `/research/${paper._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Bookmarks Tab */}
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
                  className={`p-2 rounded transition ${
                    viewMode === 'grid' 
                      ? 'bg-navy text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded transition ${
                    viewMode === 'list' 
                      ? 'bg-navy text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-sm focus:border-navy focus:outline-none dark:bg-gray-700 dark:text-white"
              />
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
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
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
                    : 'space-y-3'
                }`}>
                  {filteredBookmarks.map(b => (
                    <div 
                      key={b._id} 
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                    >
                      <h3 
                        className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 cursor-pointer hover:text-navy transition" 
                        onClick={() => window.location.href = `/research/${b.research._id}`}
                      >
                        {b.research.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {b.research.abstract}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={() => handleRemoveBookmark(b._id, b.research._id)} 
                          className="text-red-600 hover:text-red-700 text-xs font-semibold transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && <ActivityLogs />}
      </div>
    </>
  );
};

export default FacultyDashboard;