// client/src/components/analytics/AnalyticsDashboard.jsx - ENHANCED EFFICIENT VERSION
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Eye, Activity, Clock, Calendar, Download, RefreshCw, ChevronDown, ChevronRight, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [expandedSections, setExpandedSections] = useState({ trends: true, submissions: false });
  const [data, setData] = useState({
    dashboard: { totalPapers: 0, totalUsers: 0, totalViews: 0, monthlyData: [], topPapers: [] },
    loginTrends: { dailyTrends: [], peakHours: [], roleBreakdown: {}, summary: {} },
    weeklySubmissions: { weeklyData: [], categoryBreakdown: {}, roleBreakdown: {}, comparison: {} }
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchAllData(); }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [dashRes, loginRes, weeklyRes] = await Promise.all([
        fetch(`${API_URL}/analytics/dashboard`, { headers }),
        fetch(`${API_URL}/analytics/login-trends?days=${dateRange}`, { headers }),
        fetch(`${API_URL}/analytics/weekly-submissions?weeks=8`, { headers })
      ]);

      const [dashboard, loginTrends, weeklySubmissions] = await Promise.all([
        dashRes.json(), loginRes.json(), weeklyRes.json()
      ]);

      setData({ dashboard, loginTrends, weeklySubmissions });
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const exportData = (type) => {
    let csv = '';
    if (type === 'login') {
      csv = [
        ['Date', 'Logins', 'Logouts'].join(','),
        ...data.loginTrends.dailyTrends.map(d => [d.date, d.logins, d.logouts].join(','))
      ].join('\n');
    } else if (type === 'weekly') {
      csv = [
        ['Week', 'Total', 'Approved', 'Pending'].join(','),
        ...data.weeklySubmissions.weeklyData.map(d => [d.week, d.total, d.approved, d.pending].join(','))
      ].join('\n');
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time system insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-gray-700"
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
            </select>

            <button onClick={fetchAllData} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" title="Refresh">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Papers', value: data.dashboard.totalPapers, color: 'from-blue-500 to-blue-600' },
          { icon: Users, label: 'Active Users', value: data.dashboard.totalUsers, color: 'from-green-500 to-green-600' },
          { icon: Eye, label: 'Total Views', value: data.dashboard.totalViews, color: 'from-purple-500 to-purple-600' },
          { icon: TrendingUp, label: 'This Month', value: data.dashboard.monthlyData?.[data.dashboard.monthlyData.length - 1]?.submissions || 0, color: 'from-orange-500 to-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3 shadow-md`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Login Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button onClick={() => toggleSection('trends')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={20} />
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Login Activity Trends</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {data.loginTrends.summary.totalLogins} total • Avg {data.loginTrends.summary.avgLoginsPerDay}/day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); exportData('login'); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition">
              <Download size={16} />
            </button>
            {expandedSections.trends ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </button>

        {expandedSections.trends && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.loginTrends.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="logouts" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Total', value: data.loginTrends.summary.totalLogins, color: 'blue' },
                { label: 'Avg/Day', value: data.loginTrends.summary.avgLoginsPerDay, color: 'green' },
                { label: 'Peak', value: `${data.loginTrends.peakHours[0]?.hour || 'N/A'}:00`, color: 'orange' },
                { label: 'Students', value: data.loginTrends.roleBreakdown.student || 0, color: 'purple' }
              ].map((s, i) => (
                <div key={i} className={`bg-${s.color}-50 dark:bg-${s.color}-900/20 rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Submissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button onClick={() => toggleSection('submissions')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-600" size={20} />
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Weekly Submissions</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This week: {data.weeklySubmissions.comparison.thisWeek} • {data.weeklySubmissions.comparison.growth}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); exportData('weekly'); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition">
              <Download size={16} />
            </button>
            {expandedSections.submissions ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </button>

        {expandedSections.submissions && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weeklySubmissions.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                <p className="text-xs opacity-90 mb-1"><ArrowUp size={12} className="inline" /> This Week</p>
                <p className="text-3xl font-bold">{data.weeklySubmissions.comparison.thisWeek}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                <p className="text-xs opacity-90 mb-1"><ArrowDown size={12} className="inline" /> Last Week</p>
                <p className="text-3xl font-bold">{data.weeklySubmissions.comparison.lastWeek}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" />Monthly Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.dashboard.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="submissions" stroke="#1e40af" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Papers & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye size={18} className="text-purple-600" />Top Papers
          </h3>
          <div className="space-y-3">
            {data.dashboard.topPapers?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm font-medium line-clamp-1 flex-1">{p.title}</span>
                <span className="text-sm font-bold text-purple-600 ml-2">{p.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />By Role
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Students', value: data.weeklySubmissions.roleBreakdown.student || 0 },
                  { name: 'Faculty', value: data.weeklySubmissions.roleBreakdown.faculty || 0 }
                ]}
                cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70} dataKey="value"
              >
                {[0, 1].map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;