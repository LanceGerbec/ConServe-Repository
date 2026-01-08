// client/src/components/analytics/TrendAnalysis.jsx - ENHANCED VERSION
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Clock, Download, RefreshCw, Filter } from 'lucide-react';

const TrendAnalysis = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [data, setData] = useState({
    loginTrends: { dailyTrends: [], peakHours: [], roleBreakdown: {}, summary: {} },
    weeklySubmissions: { weeklyData: [], categoryBreakdown: {}, roleBreakdown: {}, comparison: {} }
  });

  useEffect(() => {
    fetchTrendData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchTrendData, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dateRange, roleFilter, autoRefresh]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;
      
      const [loginRes, weeklyRes] = await Promise.all([
        fetch(`${API_URL}/analytics/login-trends?days=${dateRange}&role=${roleFilter}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/analytics/weekly-submissions?weeks=8`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [loginData, weeklyData] = await Promise.all([
        loginRes.json(),
        weeklyRes.json()
      ]);

      setData({
        loginTrends: loginData,
        weeklySubmissions: weeklyData
      });
    } catch (error) {
      console.error('Trend data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (dataType) => {
    let csv = '';
    let filename = '';

    if (dataType === 'login') {
      csv = [
        ['Date', 'Logins', 'Logouts', 'Student', 'Faculty', 'Admin'].join(','),
        ...data.loginTrends.dailyTrends.map(d => [
          d.date, d.logins, d.logouts, d.student, d.faculty, d.admin
        ].join(','))
      ].join('\n');
      filename = `login-trends-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      csv = [
        ['Week', 'Total', 'Approved', 'Pending', 'Rejected', 'Student', 'Faculty'].join(','),
        ...data.weeklySubmissions.weeklyData.map(d => [
          d.week, d.total, d.approved, d.pending, d.rejected, d.student, d.faculty
        ].join(','))
      ].join('\n');
      filename = `weekly-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
              <option value="admin">Admins Only</option>
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded accent-navy"
              />
              <span className="text-gray-700 dark:text-gray-300">Auto-refresh (30s)</span>
            </label>
          </div>

          <button
            onClick={fetchTrendData}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Login/Logout Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Login Activity</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Last {dateRange} days • {data.loginTrends.summary.totalLogins} total logins</p>
            </div>
          </div>
          <button
            onClick={() => exportCSV('login')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
            title="Export CSV"
          >
            <Download size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.loginTrends.dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} name="Logins" />
            <Line type="monotone" dataKey="logouts" stroke="#ef4444" strokeWidth={2} name="Logouts" />
            {roleFilter === 'all' && (
              <>
                <Line type="monotone" dataKey="student" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="Students" />
                <Line type="monotone" dataKey="faculty" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="Faculty" />
                <Line type="monotone" dataKey="admin" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="5 5" name="Admins" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{data.loginTrends.summary.totalLogins}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Logins</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{data.loginTrends.summary.avgLoginsPerDay}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg/Day</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{data.loginTrends.peakHours[0]?.hour || 'N/A'}:00</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Peak Hour</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{data.loginTrends.roleBreakdown.student || 0}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Student Logins</p>
          </div>
        </div>
      </div>

      {/* Weekly Submissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Submission Trends</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This week: {data.weeklySubmissions.comparison.thisWeek} • Growth: 
                <span className={`ml-1 font-bold ${data.weeklySubmissions.comparison.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.weeklySubmissions.comparison.growth}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => exportCSV('weekly')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
            title="Export CSV"
          >
            <Download size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.weeklySubmissions.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Weekly Comparison */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <p className="text-xs opacity-90 mb-1">This Week</p>
            <p className="text-3xl font-bold">{data.weeklySubmissions.comparison.thisWeek}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <p className="text-xs opacity-90 mb-1">Last Week</p>
            <p className="text-3xl font-bold">{data.weeklySubmissions.comparison.lastWeek}</p>
          </div>
        </div>
      </div>

      {/* Role & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-600" />
            Submissions by Role
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Students', value: data.weeklySubmissions.roleBreakdown.student || 0 },
                  { name: 'Faculty', value: data.weeklySubmissions.roleBreakdown.faculty || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
<div className="space-y-3">
{Object.entries(data.weeklySubmissions.categoryBreakdown).map(([category, count], idx) => (
<div key={category} className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div
  className="w-3 h-3 rounded-full"
  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
></div>

<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
</div>
<span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
</div>
))}
</div>
</div>
</div>
{/* Peak Hours */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
        <Clock className="text-orange-600" size={20} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Peak Login Hours</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Most active times of the day</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data.loginTrends.peakHours.slice(0, 5)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(hour) => `${hour}:00`} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
        <Tooltip />
        <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
);
};
export default TrendAnalysis;