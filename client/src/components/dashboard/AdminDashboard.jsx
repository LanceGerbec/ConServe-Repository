// ============================================
// FILE: client/src/components/dashboard/AdminDashboard.jsx - UPDATED
// ============================================
import { useState, useEffect } from 'react';
import { Users, FileText, Shield, Activity, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: { totalUsers: 0, pendingApproval: 0, activeUsers: 0 },
    research: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingResearch, setPendingResearch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch user stats
      const userStatsRes = await fetch(`${import.meta.env.VITE_API_URL}/users/stats`, { headers });
      const userStats = await userStatsRes.json();

      // Fetch research stats
      const researchStatsRes = await fetch(`${import.meta.env.VITE_API_URL}/research/stats`, { headers });
      const researchStats = await researchStatsRes.json();

      // Fetch pending users
      const pendingUsersRes = await fetch(`${import.meta.env.VITE_API_URL}/users?status=pending`, { headers });
      const pendingUsersData = await pendingUsersRes.json();

      // Fetch pending research
      const pendingResearchRes = await fetch(`${import.meta.env.VITE_API_URL}/research?status=pending`, { headers });
      const pendingResearchData = await pendingResearchRes.json();

      setStats({ users: userStats, research: researchStats });
      setPendingUsers(pendingUsersData.users || []);
      setPendingResearch(pendingResearchData.papers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const handleApproveResearch = async (researchId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${researchId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleRejectResearch = async (researchId) => {
    const notes = prompt('Enter rejection reason:');
    if (!notes) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${researchId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected', revisionNotes: notes })
      });

      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Reject error:', error);
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
    { icon: Users, label: 'Total Users', value: stats.users.totalUsers, color: 'bg-blue-500', change: `+${stats.users.pendingApproval}` },
    { icon: FileText, label: 'Total Papers', value: stats.research.total, color: 'bg-green-500', change: `+${stats.research.pending}` },
    { icon: Shield, label: 'Pending Approvals', value: stats.users.pendingApproval + stats.research.pending, color: 'bg-yellow-500', change: '0' },
    { icon: Activity, label: 'Active Users', value: stats.users.activeUsers, color: 'bg-purple-500', change: '0' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Welcome, {user?.firstName} - System Administrator</p>
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>System Status: All services operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending User Approvals</h2>
            <UserCheck className="text-gray-400" size={24} />
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No pending user approvals</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingUsers.map((u) => (
                <div key={u._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {u.firstName} {u.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Role: <span className="font-semibold">{u.role}</span> | ID: {u.studentId}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveUser(u._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectUser(u._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Research */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Research Approvals</h2>
            <FileText className="text-gray-400" size={24} />
          </div>
          
          {pendingResearch.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No pending research approvals</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingResearch.map((paper) => (
                <div key={paper._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Category: {paper.category}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveResearch(paper._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectResearch(paper._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;