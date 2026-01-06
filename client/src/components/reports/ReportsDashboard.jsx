import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Users, Activity, Download, Filter, Calendar, TrendingUp, FileSpreadsheet, Eye, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ReportsDashboard() {
  const [activeReport, setActiveReport] = useState('overview');
  const [researchData, setResearchData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', role: 'all', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchReports(); }, [activeReport, filters]);

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (activeReport === 'overview' || activeReport === 'research') {
        const res = await fetch(`${API_URL}/reports/research?status=${filters.status}&startDate=${filters.startDate}&endDate=${filters.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setResearchData(data);
      }
      if (activeReport === 'overview' || activeReport === 'users') {
        const res = await fetch(`${API_URL}/reports/users?role=${filters.role}&startDate=${filters.startDate}&endDate=${filters.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUserData(data);
      }
      if (activeReport === 'overview' || activeReport === 'activity') {
        const res = await fetch(`${API_URL}/reports/activity?startDate=${filters.startDate}&endDate=${filters.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setActivityData(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (reportType) => {
    setGenerating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reports/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportType, filters })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('PDF generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCSV = async (reportType) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/reports/${reportType}?format=csv&status=${filters.status}&role=${filters.role}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${Date.now()}.csv`;
    a.click();
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'research', label: 'Research', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Analytics & Reports
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate comprehensive reports with charts</p>
          </div>
          {generating && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Generating...</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap text-sm transition ${
                activeReport === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(activeReport === 'research' || activeReport === 'overview') && (
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            {(activeReport === 'users' || activeReport === 'overview') && (
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              placeholder="End Date"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={40} className="animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeReport === 'overview' && researchData && userData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <FileText size={32} className="mb-2 opacity-80" />
                    <div className="text-3xl font-bold">{researchData.summary.total}</div>
                    <div className="text-sm opacity-90">Total Papers</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <Users size={32} className="mb-2 opacity-80" />
                    <div className="text-3xl font-bold">{userData.summary.total}</div>
                    <div className="text-sm opacity-90">Total Users</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <Eye size={32} className="mb-2 opacity-80" />
                    <div className="text-3xl font-bold">{researchData.summary.totalViews}</div>
                    <div className="text-sm opacity-90">Total Views</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Research by Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Approved', value: researchData.summary.approved },
                        { name: 'Pending', value: researchData.summary.pending },
                        { name: 'Rejected', value: researchData.summary.rejected }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Users by Role</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Students', value: userData.summary.students },
                            { name: 'Faculty', value: userData.summary.faculty },
                            { name: 'Admins', value: userData.summary.admins }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Research Report */}
            {activeReport === 'research' && researchData && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF('research')}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadCSV('research')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <FileSpreadsheet size={18} />
                    Download CSV
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{researchData.summary.total}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{researchData.summary.approved}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{researchData.summary.pending}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{researchData.summary.rejected}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{researchData.summary.totalViews}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Authors</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {researchData.papers.map(paper => (
                        <tr key={paper._id}>
                          <td className="px-4 py-3 text-sm">{paper.title}</td>
                          <td className="px-4 py-3 text-sm">{paper.authors.slice(0, 2).join(', ')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              paper.status === 'approved' ? 'bg-green-100 text-green-800' :
                              paper.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>{paper.status}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">{paper.views || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Report */}
            {activeReport === 'users' && userData && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF('users')}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadCSV('users')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <FileSpreadsheet size={18} />
                    Download CSV
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{userData.summary.total}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{userData.summary.students}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{userData.summary.faculty}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Faculty</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{userData.summary.admins}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{userData.summary.approved}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {userData.users.map(user => (
                        <tr key={user._id}>
                          <td className="px-4 py-3 text-sm">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">{user.role}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>{user.isApproved ? 'APPROVED' : 'PENDING'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Report */}
            {activeReport === 'activity' && activityData && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF('activity')}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadCSV('activity')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    <FileSpreadsheet size={18} />
                    Download CSV
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Summary</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{activityData.summary.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Activities</div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {activityData.logs.map(log => (
                        <tr key={log._id}>
                          <td className="px-4 py-3 text-sm font-semibold">{log.action}</td>
                          <td className="px-4 py-3 text-sm">{log.user?.firstName} {log.user?.lastName}</td>
                          <td className="px-4 py-3 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}