import { useState, useEffect } from 'react';
import { Users, FileText, Shield, Activity, CheckCircle, XCircle, Trash2, Eye, Bookmark, Grid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import ActivityLogs from '../analytics/ActivityLogs';
import SettingsManagement from '../admin/SettingsManagement';
import ValidIdsManagement from '../admin/ValidIdsManagement';
import AdminReviewModal from '../admin/AdminReviewModal';
import TeamManagement from '../admin/TeamManagement';
import ConfirmModal from '../common/ConfirmModal';
import Toast from '../common/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    users: { totalUsers: 0, pendingApproval: 0, activeUsers: 0 },
    research: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [allUsers, setAllUsers] = useState([]);
  const [allResearch, setAllResearch] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingResearch, setPendingResearch] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, action: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const adminReviewId = params.get('adminReview');
    if (adminReviewId) {
      fetchPaperForReview(adminReviewId);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [userStats, researchStats, pendingUsersData, pendingResearchData, allUsersData, allResearchData, bookmarksData] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/research/stats`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/users?status=pending`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/research?status=pending`, { headers }).then(r => r.json()),
        activeTab === 'users' ? fetch(`${API_URL}/users`, { headers }).then(r => r.json()) : Promise.resolve({ users: [] }),
        activeTab === 'research' ? fetch(`${API_URL}/research`, { headers }).then(r => r.json()) : Promise.resolve({ papers: [] }),
        activeTab === 'bookmarks' ? fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers }).then(r => r.json()) : Promise.resolve({ bookmarks: [] })
      ]);
      setStats({ users: userStats, research: researchStats });
      setPendingUsers(pendingUsersData.users || []);
      setPendingResearch(pendingResearchData.papers || []);
      setAllUsers(allUsersData.users || []);
      setAllResearch(allResearchData.papers || []);
      setBookmarks(bookmarksData.bookmarks || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('User approved successfully', 'success');
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to approve user', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      data: { userId, userName },
      action: 'deleteUser'
    });
  };

  const confirmDeleteUser = async () => {
    const { userId } = confirmModal.data;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('User deleted successfully', 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Connection error', 'error');
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

  const handleConfirmAction = () => {
    if (confirmModal.action === 'deleteUser') confirmDeleteUser();
  };

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
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        title="Delete User?"
        message={`Are you sure you want to delete "${confirmModal.data?.userName}"?`}
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-4 animate-fade-in">
        <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">Welcome, {user?.firstName}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex gap-2 overflow-x-auto">
          {['overview', 'users', 'research', 'bookmarks', 'valid-ids', 'team', 'analytics', 'logs', 'settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-navy text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'valid-ids' ? 'Valid IDs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'bookmarks' && bookmarks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                  {bookmarks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {adminStats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Users</h2>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending users</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingUsers.map((u) => (
                      <div key={u._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleApproveUser(u._id)} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold">
                            <CheckCircle size={16} className="inline mr-1" /> Approve
                          </button>
                          <button onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold">
                            <XCircle size={16} className="inline mr-1" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Research</h2>
                {pendingResearch.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending research</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingResearch.map((paper) => (
                      <div key={paper._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">{paper.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
                        <button onClick={() => window.location.href = `/research/${paper._id}`} className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold">
                          <Eye size={14} className="inline mr-1" /> Review
                        </button>
                      </div>
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
                My Bookmarks ({filteredBookmarks.length})
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
                    <div key={b._id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                      <h3 
                        className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 cursor-pointer hover:text-navy transition" 
                        onClick={() => window.location.href = `/research/${b.research._id}`}
                      >
                        {b.research.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{b.research.abstract}</p>
                      <button 
                        onClick={() => handleRemoveBookmark(b._id, b.research._id)} 
                        className="text-red-600 hover:text-red-700 text-xs font-bold transition"
                      >
                        Remove
                      </button>
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
            onSuccess={() => { fetchData(); setShowReviewModal(false); setSelectedPaper(null); }}
          />
        )}
      </div>
    </>
  );
};

export default AdminDashboard;