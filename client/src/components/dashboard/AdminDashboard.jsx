// client/src/components/dashboard/AdminDashboard.jsx
import { useState, useEffect, useCallback, memo } from 'react';
import { Users, FileText, Shield, Activity, CheckCircle, XCircle, Eye, Bookmark, Search, X, Calendar, User as UserIcon } from 'lucide-react';
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

const StatCard = memo(({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-4 mb-3">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-md`}>
        <Icon className="text-white" size={22} />
      </div>
      <div className="text-3xl font-bold text-navy dark:text-accent">{value}</div>
    </div>
    <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{label}</div>
  </div>
));

const PendingUserCard = memo(({ user, onApprove, onReject }) => (
  <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 active:scale-98 transition-all">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{user.firstName} {user.lastName}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
    <p className="text-xs text-gray-500 mb-3">ID: {user.studentId} • {user.role}</p>
    <div className="flex gap-2">
      <button onClick={() => onApprove(user._id)} className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-xl hover:bg-green-600 text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all">
        <CheckCircle size={16} /> Approve
      </button>
      <button onClick={() => onReject(user._id)} className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all">
        <XCircle size={16} /> Reject
      </button>
    </div>
  </div>
));

const PendingResearchCard = memo(({ paper, onReview }) => (
  <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 active:scale-98 transition-all">
    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 text-sm">{paper.title}</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{paper.abstract}</p>
    <button onClick={() => onReview(paper)} className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all">
      <Eye size={16} /> Review
    </button>
  </div>
));

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [search, setSearch] = useState('');

  const showToast = useCallback((msg, type = 'success') => 
    setToast({ show: true, message: msg, type }), []
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const adminReviewId = params.get('adminReview');
    if (adminReviewId) {
      fetchPaperForReview(adminReviewId);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

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

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Always fetch stats and pending items for overview
      const [userStatsRes, researchStatsRes, pendingUsersRes, pendingResearchRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers }),
        fetch(`${API_URL}/research/stats`, { headers }),
        fetch(`${API_URL}/users?status=pending`, { headers }),
        fetch(`${API_URL}/research?status=pending`, { headers })
      ]);

      const [userStats, researchStats, pendingUsersData, pendingResearchData] = await Promise.all([
        userStatsRes.json(), researchStatsRes.json(), pendingUsersRes.json(), pendingResearchRes.json()
      ]);

      setStats({
        users: userStats || { totalUsers: 0, pendingApproval: 0, activeUsers: 0 },
        research: researchStats || { total: 0, pending: 0, approved: 0, rejected: 0 }
      });

      setPendingUsers(pendingUsersData.users || []);
      setPendingResearch(pendingResearchData.papers || []);

      // Fetch all users when Users tab is active
      if (activeTab === 'users') {
        const usersRes = await fetch(`${API_URL}/users`, { headers });
        const usersData = await usersRes.json();
        setAllUsers(usersData.users || []);
      }
      
      // Fetch all research when Papers tab is active
      if (activeTab === 'research') {
        const researchRes = await fetch(`${API_URL}/research`, { headers });
        const researchData = await researchRes.json();
        setAllResearch(researchData.papers || []);
      }

      // Fetch bookmarks when Bookmarks tab is active
      if (activeTab === 'bookmarks') {
        const bookmarksRes = await fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers });
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleReviewPaper = useCallback((paper) => {
    setSelectedPaper(paper);
    setShowReviewModal(true);
  }, []);

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

  const filteredUsers = allUsers.filter(u => 
    search ? (u.firstName?.toLowerCase().includes(search.toLowerCase()) || 
              u.lastName?.toLowerCase().includes(search.toLowerCase()) || 
              u.email?.toLowerCase().includes(search.toLowerCase())) : true
  );

  const filteredResearch = allResearch.filter(p => 
    search ? p.title?.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
      </div>
    );
  }

  const adminStats = [
    { icon: Users, label: 'Total Users', value: stats.users.totalUsers, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { icon: FileText, label: 'Total Papers', value: stats.research.total, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { icon: Shield, label: 'Pending', value: stats.users.pendingApproval + stats.research.pending, color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    { icon: Activity, label: 'Active Users', value: stats.users.activeUsers, color: 'bg-gradient-to-br from-purple-500 to-purple-600' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'research', label: 'Papers' },
    { id: 'bookmarks', label: 'Bookmarks', badge: bookmarks.length },
    { id: 'valid-ids', label: 'Valid IDs' },
    { id: 'team', label: 'Team' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'logs', label: 'Logs' },
    { id: 'settings', label: 'Settings' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} duration={3000} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        <div className="bg-gradient-to-br from-navy via-blue-700 to-accent text-white p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-blue-100 opacity-90">Welcome, {user?.firstName}</p>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${
                  activeTab === tab.id 
                    ? 'bg-navy text-white shadow-lg scale-105' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md active:scale-95'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 gap-4">
                {adminStats.map((stat, i) => <StatCard key={i} {...stat} />)}
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    Pending Users ({pendingUsers.length})
                  </h2>
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No pending users</div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pendingUsers.map(u => <PendingUserCard key={u._id} user={u} onApprove={handleApproveUser} onReject={handleRejectUser} />)}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-green-600" />
                    Pending Research ({pendingResearch.length})
                  </h2>
                  {pendingResearch.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No pending research</div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pendingResearch.map(paper => <PendingResearchCard key={paper._id} paper={paper} onReview={handleReviewPaper} />)}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  All Users ({filteredUsers.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={18} /></button>}
                </div>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No users found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map(u => (
                      <div key={u._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {u.isApproved ? 'APPROVED' : 'PENDING'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>ID: {u.studentId}</span>
                          <span>Role: {u.role}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} />{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-green-600" />
                  All Papers ({filteredResearch.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search papers..." className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={18} /></button>}
                </div>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {filteredResearch.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No papers found</div>
                ) : (
                  <div className="space-y-3">
                    {filteredResearch.map(p => (
                      <div key={p._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-navy transition" onClick={() => navigate(`/research/${p._id}`)}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">{p.title}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ml-2 whitespace-nowrap ${getStatusBadge(p.status)}`}>
                            {p.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{p.abstract}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><UserIcon size={12} />{p.submittedBy?.firstName}</span>
                          <span className="flex items-center gap-1"><Eye size={12} />{p.views || 0}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} />{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bookmark size={20} className="text-purple-600" />
                  My Bookmarks ({bookmarks.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={18} /></button>}
                </div>
              </div>
              <div className="p-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bookmark size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No bookmarks yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map(b => (
                      <div key={b._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 cursor-pointer active:text-navy" onClick={() => navigate(`/research/${b.research._id}`)}>{b.research.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{b.research.abstract}</p>
                        <button onClick={() => handleRemoveBookmark(b._id, b.research._id)} className="text-red-600 hover:text-red-700 text-xs font-bold active:scale-95 transition">Remove</button>
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
        </div>
      </div>

      {showReviewModal && selectedPaper && (
        <AdminReviewModal
          paper={selectedPaper}
          onClose={() => { setShowReviewModal(false); setSelectedPaper(null); }}
          onSuccess={() => { 
            fetchData(); 
            setShowReviewModal(false); 
            setSelectedPaper(null); 
            showToast('✅ Review submitted'); 
          }}
        />
      )}
    </>
  );
};

AdminDashboard.displayName = 'AdminDashboard';
StatCard.displayName = 'StatCard';
PendingUserCard.displayName = 'PendingUserCard';
PendingResearchCard.displayName = 'PendingResearchCard';

export default AdminDashboard;