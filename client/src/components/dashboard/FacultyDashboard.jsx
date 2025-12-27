import { useState, useEffect } from 'react';
import { Users, FileText, Shield, Activity, CheckCircle, XCircle, Trash2, Eye, AlertCircle, TrendingUp, Clock, Download, Search, Filter, ChevronDown } from 'lucide-react';
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

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: {}, research: {} });
  const [users, setUsers] = useState({ all: [], pending: [] });
  const [research, setResearch] = useState({ all: [], pending: [] });
  const [paper, setPaper] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ users: '', research: '' });
  const [modal, setModal] = useState({ show: false, data: null, action: null });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('adminReview');
    if (id) { fetchPaper(id); navigate('/dashboard', { replace: true }); }
  }, [location.search]);

  useEffect(() => { fetchData(); }, [tab]);

  const fetchPaper = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/research/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setPaper(data.paper); setShowReview(true); }
    } catch (err) { console.error('Fetch paper error:', err); }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [us, rs, pu, pr, au, ar] = await Promise.all([
        fetch(`${API}/users/stats`, { headers: h }).then(r => r.json()),
        fetch(`${API}/research/stats`, { headers: h }).then(r => r.json()),
        fetch(`${API}/users?status=pending`, { headers: h }).then(r => r.json()),
        fetch(`${API}/research?status=pending`, { headers: h }).then(r => r.json()),
        tab === 'users' ? fetch(`${API}/users`, { headers: h }).then(r => r.json()) : Promise.resolve({ users: [] }),
        tab === 'research' ? fetch(`${API}/research`, { headers: h }).then(r => r.json()) : Promise.resolve({ papers: [] })
      ]);
      setStats({ users: us, research: rs });
      setUsers({ pending: pu.users || [], all: au.users || [] });
      setResearch({ pending: pr.papers || [], all: ar.papers || [] });
    } catch (err) { showToast('Load failed', 'error'); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      res.ok ? (showToast('✅ User approved'), fetchData()) : showToast('Failed', 'error');
    } catch { showToast('Error', 'error'); }
  };

  const deleteUser = (id, name) => setModal({ show: true, data: { id, name }, action: 'deleteUser' });
  const deleteResearch = (id, title) => setModal({ show: true, data: { id, title }, action: 'deleteResearch' });

  const confirmDelete = async () => {
    const { id } = modal.data;
    const endpoint = modal.action === 'deleteUser' ? `users/${id}/reject` : `research/${id}`;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/${endpoint}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      res.ok ? (showToast('✅ Deleted'), fetchData()) : showToast('Failed', 'error');
    } catch { showToast('Error', 'error'); }
  };

  const quickApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/research/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', revisionNotes: 'Quick approval' })
      });
      res.ok ? (showToast('✅ Approved'), fetchData()) : showToast('Failed', 'error');
    } catch { showToast('Error', 'error'); }
  };

  const quickReject = (id) => setModal({ show: true, data: { id }, action: 'rejectResearch' });

  const confirmReject = async () => {
    const notes = prompt('Rejection reason:');
    if (!notes) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/research/${modal.data.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', revisionNotes: notes })
      });
      res.ok ? (showToast('✅ Rejected'), fetchData()) : showToast('Failed', 'error');
    } catch { showToast('Error', 'error'); }
  };

  const handleConfirm = () => {
    if (modal.action === 'deleteUser') confirmDelete();
    else if (modal.action === 'deleteResearch') confirmDelete();
    else if (modal.action === 'rejectResearch') confirmReject();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );

  const tabs = ['overview', 'users', 'research', 'valid-ids', 'team', 'analytics', 'logs', 'settings'];
  const statCards = [
    { icon: Users, label: 'Users', value: stats.users.totalUsers || 0, color: 'blue', change: '+12%' },
    { icon: FileText, label: 'Papers', value: stats.research.total || 0, color: 'green', change: '+8%' },
    { icon: Shield, label: 'Pending', value: (stats.users.pendingApproval || 0) + (stats.research.pending || 0), color: 'yellow', change: '-5%' },
    { icon: Activity, label: 'Active', value: stats.users.activeUsers || 0, color: 'purple', change: '+15%' }
  ];

  const getRoleBadge = (role) => {
    const colors = { admin: 'red', faculty: 'blue', student: 'green' };
    return `bg-${colors[role] || 'gray'}-100 text-${colors[role] || 'gray'}-700 dark:bg-${colors[role] || 'gray'}-900/20 dark:text-${colors[role] || 'gray'}-400`;
  };

  const getStatusBadge = (status) => {
    const colors = { approved: 'green', rejected: 'red', pending: 'yellow', revision: 'orange' };
    return `bg-${colors[status] || 'gray'}-100 text-${colors[status] || 'gray'}-700 dark:bg-${colors[status] || 'gray'}-900/20 dark:text-${colors[status] || 'gray'}-400`;
  };

  const filteredUsers = users.all.filter(u => 
    u.firstName?.toLowerCase().includes(filter.users.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.users.toLowerCase())
  );

  const filteredResearch = research.all.filter(p =>
    p.title?.toLowerCase().includes(filter.research.toLowerCase()) ||
    p.submittedBy?.firstName?.toLowerCase().includes(filter.research.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {toast.show && <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <ConfirmModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={handleConfirm}
        title={modal.action === 'deleteUser' ? 'Delete User?' : modal.action === 'deleteResearch' ? 'Delete Research?' : 'Reject Research?'}
        message={modal.action === 'deleteUser' ? `Delete "${modal.data?.name}"?` : modal.action === 'deleteResearch' ? `Delete "${modal.data?.title}"?` : 'Reject this paper?'}
        confirmText={modal.action === 'rejectResearch' ? 'Continue' : 'Delete'}
        type={modal.action === 'rejectResearch' ? 'warning' : 'danger'}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-blue-100 text-sm">Welcome, {user?.firstName}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {t === 'valid-ids' ? 'IDs' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 bg-${s.color}-500 rounded-lg flex items-center justify-center`}>
                    <s.icon className="text-white" size={20} />
                  </div>
                  <span className={`text-xs font-bold ${s.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{s.change}</span>
                </div>
                <div className="text-2xl font-bold text-navy dark:text-accent">{s.value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={20} />
                  Pending Users ({users.pending.length})
                </h2>
              </div>
              {users.pending.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pending users</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {users.pending.map(u => (
                    <div key={u._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(u.role)}`}>{u.role}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approve(u._id)} className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 text-xs font-semibold transition flex items-center justify-center gap-1">
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={() => deleteUser(u._id, `${u.firstName} ${u.lastName}`)} className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-xs font-semibold transition flex items-center justify-center gap-1">
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Research */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} />
                  Pending Research ({research.pending.length})
                </h2>
              </div>
              {research.pending.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pending research</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {research.pending.map(p => (
                    <div key={p._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">{p.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">By: {p.submittedBy?.firstName} {p.submittedBy?.lastName}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => { setPaper(p); setShowReview(true); }} className="bg-blue-500 text-white px-2 py-1.5 rounded-lg hover:bg-blue-600 text-xs font-semibold transition flex items-center justify-center gap-1">
                          <Eye size={12} /> Review
                        </button>
                        <button onClick={() => quickApprove(p._id)} className="bg-green-500 text-white px-2 py-1.5 rounded-lg hover:bg-green-600 text-xs font-semibold transition flex items-center justify-center gap-1">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => quickReject(p._id)} className="bg-red-500 text-white px-2 py-1.5 rounded-lg hover:bg-red-600 text-xs font-semibold transition flex items-center justify-center gap-1">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Users ({filteredUsers.length})</h2>
              <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-1">
                <Download size={14} /> Export
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filter.users}
                onChange={(e) => setFilter({ ...filter, users: e.target.value })}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isApproved && u.isActive ? 'bg-green-100 text-green-700' : !u.isApproved ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.isApproved && u.isActive ? 'Active' : !u.isApproved ? 'Pending' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => deleteUser(u._id, `${u.firstName} ${u.lastName}`)} className="text-red-600 hover:text-red-700 p-1">
                          <Trash2 size={16} />
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

      {/* Research Tab */}
      {tab === 'research' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Research ({filteredResearch.length})</h2>
              <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-1">
                <Download size={14} /> Export
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filter.research}
                onChange={(e) => setFilter({ ...filter, research: e.target.value })}
                placeholder="Search research..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Views</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResearch.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.submittedBy?.firstName} {p.submittedBy?.lastName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.views || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setPaper(p); setShowReview(true); }} className="text-blue-600 hover:text-blue-700 p-1">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => deleteResearch(p._id, p.title)} className="text-red-600 hover:text-red-700 p-1">
                          <Trash2 size={16} />
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

      {tab === 'valid-ids' && <ValidIdsManagement />}
      {tab === 'team' && <TeamManagement />}
      {tab === 'analytics' && <AnalyticsDashboard />}
      {tab === 'logs' && <ActivityLogs />}
      {tab === 'settings' && <SettingsManagement />}

      {showReview && paper && (
        <AdminReviewModal
          paper={paper}
          onClose={() => { setShowReview(false); setPaper(null); }}
          onSuccess={() => { fetchData(); setShowReview(false); setPaper(null); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;