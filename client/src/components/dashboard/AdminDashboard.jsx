// client/src/components/dashboard/AdminDashboard.jsx
import { useState, useEffect, useCallback, memo } from 'react';
import { Users, FileText, Shield, Activity, CheckCircle, XCircle, Eye, Bookmark, Grid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import ActivityLogs from '../analytics/ActivityLogs';
import SettingsManagement from '../admin/SettingsManagement';
import ValidIdsManagement from '../admin/ValidIdsManagement';
import AdminReviewModal from '../admin/AdminReviewModal';
import TeamManagement from '../admin/TeamManagement';
import Toast from '../common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Memoized stat card component
const StatCard = memo(({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
    <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
      <Icon className="text-white" size={24} />
    </div>
    <div className="text-3xl font-bold text-navy dark:text-accent mb-1">{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{label}</div>
  </div>
));

// Memoized pending user card
const PendingUserCard = memo(({ user, onApprove, onReject }) => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition bg-gray-50 dark:bg-gray-900">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{user.firstName} {user.lastName}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
    <p className="text-xs text-gray-500 mb-3">ID: {user.studentId} • {user.role}</p>
    <div className="flex gap-2">
      <button onClick={() => onApprove(user._id)} className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold flex items-center justify-center gap-1">
        <CheckCircle size={14} /> Approve
      </button>
      <button onClick={() => onReject(user._id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold flex items-center justify-center gap-1">
        <XCircle size={14} /> Reject
      </button>
    </div>
  </div>
));

// Memoized pending research card
const PendingResearchCard = memo(({ paper, onReview }) => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition bg-gray-50 dark:bg-gray-900">
    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 text-sm">{paper.title}</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{paper.abstract}</p>
    <button onClick={() => onReview(paper)} className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold flex items-center justify-center gap-1">
      <Eye size={14} /> Review
    </button>
  </div>
));

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({ users: { totalUsers: 0, pendingApproval: 0, activeUsers: 0 }, research: { total: 0, pending: 0, approved: 0, rejected: 0 } });
  const [allUsers, setAllUsers] = useState([]);
  const [allResearch, setAllResearch] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingResearch, setPendingResearch] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [search, setSearch] = useState('');

  const showToast = useCallback((msg, type = 'success') => setToast({ show: true, message: msg, type }), []);

  // Check URL params for review request
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const adminReviewId = params.get('adminReview');
    if (adminReviewId) {
      fetchPaperForReview(adminReviewId);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch paper for review
  const fetchPaperForReview = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPaper(data.paper);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Fetch paper error:', error);
    }
  };

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [userStatsRes, researchStatsRes, pendingUsersRes, pendingResearchRes, allUsersRes, allResearchRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers }),
        fetch(`${API_URL}/research/stats`, { headers }),
        fetch(`${API_URL}/users?status=pending`, { headers }),
        fetch(`${API_URL}/research?status=pending`, { headers }),
        activeTab === 'users' ? fetch(`${API_URL}/users`, { headers }) : Promise.resolve(null),
        activeTab === 'research' ? fetch(`${API_URL}/research`, { headers }) : Promise.resolve(null),
        activeTab === 'bookmarks' ? fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers }) : Promise.resolve(null)
      ]);

      const [userStats, researchStats, pendingUsersData, pendingResearchData] = await Promise.all([
        userStatsRes.json(),
        researchStatsRes.json(),
        pendingUsersRes.json(),
        pendingResearchRes.json()
      ]);

      setStats({
        users: userStats || { totalUsers: 0, pendingApproval: 0, activeUsers: 0 },
        research: researchStats || { total: 0, pending: 0, approved: 0, rejected: 0 }
      });

      setPendingUsers(pendingUsersData.users || []);
      setPendingResearch(pendingResearchData.papers || []);

      // Only fetch additional data if on specific tabs
      if (activeTab === 'users' && allUsersRes) {
        const allUsersData = await allUsersRes.json();
        setAllUsers(allUsersData.users || []);
      }
      if (activeTab === 'research' && allResearchRes) {
        const allResearchData = await allResearchRes.json();
        setAllResearch(allResearchData.papers || []);
      }
      if (activeTab === 'bookmarks' && bookmarksRes) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle approve user
  const handleApproveUser = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('✅ User approved');
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to approve', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  }, [showToast, fetchData]);

  // Handle reject user
  const handleRejectUser = useCallback(async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('✅ User deleted');
        fetchData();
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  }, [showToast, fetchData]);

  // Handle review paper
  const handleReviewPaper = useCallback((paper) => {
    setSelectedPaper(paper);
    setShowReviewModal(true);
  }, []);

  // Handle remove bookmark
  const handleRemoveBookmark = useCallback(async (bookmarkId, researchId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/bookmarks/toggle/${researchId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
      showToast('✅ Bookmark removed');
    } catch (error) {
      showToast('Failed to remove', 'error');
    }
  }, [showToast]);

  const filteredBookmarks = bookmarks.filter(b =>
    b.research?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const adminStats = [
    { icon: Users, label: 'Total Users', value: stats.users.totalUsers, color: 'bg-blue-500' },
    { icon: FileText, label: 'Total Papers', value: stats.research.total, color: 'bg-green-500' },
    { icon: Shield, label: 'Pending', value: stats.users.pendingApproval + stats.research.pending, color: 'bg-yellow-500' },
    { icon: Activity, label: 'Active Users', value: stats.users.activeUsers, color: 'bg-purple-500' }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} duration={3000} />}

      <div className="space-y-4 animate-fade-in">
        <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-blue-100">Welcome, {user?.firstName}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex gap-2 overflow-x-auto">
          {['overview', 'users', 'research', 'bookmarks', 'valid-ids', 'team', 'analytics', 'logs', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition whitespace-nowrap text-sm ${activeTab === tab ? 'bg-navy text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {tab === 'valid-ids' ? 'Valid IDs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'bookmarks' && bookmarks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">{bookmarks.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {adminStats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pending Users */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={20} /> Pending Users ({pendingUsers.length})
                </h2>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending users</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingUsers.map((u) => (
                      <PendingUserCard key={u._id} user={u} onApprove={handleApproveUser} onReject={handleRejectUser} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Research */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} /> Pending Research ({pendingResearch.length})
                </h2>
                {pendingResearch.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending research</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingResearch.map((paper) => (
                      <PendingResearchCard key={paper._id} paper={paper} onReview={handleReviewPaper} />
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
                <Bookmark size={20} className="text-purple-600" /> My Bookmarks ({filteredBookmarks.length})
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <Grid size={16} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <List size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus:outline-none dark:bg-gray-700 dark:text-white" />
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">{search ? 'No bookmarks found' : 'No bookmarks yet'}</p>
                  {!search && <button onClick={() => window.location.href = '/explore'} className="text-navy dark:text-accent hover:underline text-sm font-semibold">Browse Papers</button>}
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}`}>
                  {filteredBookmarks.map(b => (
                    <div key={b._id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 cursor-pointer hover:text-navy transition" onClick={() => window.location.href = `/research/${b.research._id}`}>{b.research.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{b.research.abstract}</p>
                      <button onClick={() => handleRemoveBookmark(b._id, b.research._id)} className="text-red-600 hover:text-red-700 text-xs font-bold transition">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'valid-ids' && <ValidIdsManagement />}
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'logs' && <ActivityLogs />}
        {activeTab === 'settings' && <SettingsManagement />}

        {showReviewModal && selectedPaper && (
          <AdminReviewModal
            paper={selectedPaper}
            onClose={() => { setShowReviewModal(false); setSelectedPaper(null); }}
            onSuccess={() => { fetchData(); setShowReviewModal(false); setSelectedPaper(null); showToast('✅ Review submitted'); }}
          />
        )}
      </div>
    </>
  );
};

AdminDashboard.displayName = 'AdminDashboard';
StatCard.displayName = 'StatCard';
PendingUserCard.displayName = 'PendingUserCard';
PendingResearchCard.displayName = 'PendingResearchCard';

export default AdminDashboard;