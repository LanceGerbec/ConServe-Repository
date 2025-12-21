import { useState, useEffect } from 'react';
import { Users, FileText, Shield, Activity, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import ActivityLogs from '../analytics/ActivityLogs';
import SettingsManagement from '../admin/SettingsManagement';
import ValidStudentIdsManagement from '../admin/ValidStudentIdsManagement';
import ValidFacultyIdsManagement from '../admin/ValidFacultyIdsManagement';
import AdminReviewModal from '../admin/AdminReviewModal';
import TeamManagement from '../admin/TeamManagement';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIXED: Handle adminReview URL parameter
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
      console.error('❌ Fetch paper error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [userStats, researchStats, pendingUsersData, pendingResearchData, allUsersData, allResearchData] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/research/stats`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/users?status=pending`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/research?status=pending`, { headers }).then(r => r.json()),
        activeTab === 'users' ? fetch(`${API_URL}/users`, { headers }).then(r => r.json()) : Promise.resolve({ users: [] }),
        activeTab === 'research' ? fetch(`${API_URL}/research`, { headers }).then(r => r.json()) : Promise.resolve({ papers: [] })
      ]);
      setStats({ users: userStats, research: researchStats });
      setPendingUsers(pendingUsersData.users || []);
      setPendingResearch(pendingResearchData.papers || []);
      setAllUsers(allUsersData.users || []);
      setAllResearch(allResearchData.papers || []);
      setError('');
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Failed to load data');
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
        alert('✅ User approved');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Delete "${userName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('✅ User deleted');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleDeleteResearch = async (researchId, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${researchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('✅ Research deleted');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleReviewPaper = (paper) => {
    setSelectedPaper(paper);
    setShowReviewModal(true);
  };

  const handleQuickApprove = async (researchId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${researchId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', revisionNotes: 'Quick approval' })
      });
      if (res.ok) {
        alert('✅ Approved');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleQuickReject = async (researchId) => {
    const notes = prompt('Rejection reason:');
    if (!notes) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${researchId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', revisionNotes: notes })
      });
      if (res.ok) {
        alert('✅ Rejected');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

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
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Welcome, {user?.firstName}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex gap-2 overflow-x-auto">
        {['overview', 'users', 'research', 'student-ids', 'faculty-ids', 'team', 'analytics', 'logs', 'settings'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === tab ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {adminStats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Users</h2>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending users</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingUsers.map((u) => (
                    <div key={u._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{u.role} | {u.studentId}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleApproveUser(u._id)} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
                          <CheckCircle size={16} className="inline mr-1" /> Approve
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
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
                    <div key={paper._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">{paper.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleReviewPaper(paper)} className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm">
                          <Eye size={14} className="inline mr-1" /> Review
                        </button>
                        <button onClick={() => handleQuickApprove(paper._id)} className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm">
                          <CheckCircle size={14} className="inline mr-1" /> Approve
                        </button>
                        <button onClick={() => handleQuickReject(paper._id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm">
                          <XCircle size={14} className="inline mr-1" /> Reject
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

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Users ({allUsers.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {allUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isApproved && u.isActive ? 'bg-green-100 text-green-700' : !u.isApproved ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.isApproved && u.isActive ? 'Active' : !u.isApproved ? 'Pending' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Research ({allResearch.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {allResearch.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{paper.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paper.status === 'approved' ? 'bg-green-100 text-green-700' : paper.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{paper.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{paper.views || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleReviewPaper(paper)} className="text-blue-600 hover:text-blue-700">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDeleteResearch(paper._id, paper.title)} className="text-red-600 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'student-ids' && <ValidStudentIdsManagement />}
      {activeTab === 'faculty-ids' && <ValidFacultyIdsManagement />}
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
  );
};

export default AdminDashboard;