// client/src/components/analytics/AnalyticsDashboard.jsx - UPDATED with likes/bookmarks/citations
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Eye, Activity, Clock, Calendar, Download, RefreshCw, ChevronDown, ChevronRight, BarChart3, ArrowUp, ArrowDown, Heart, Bookmark, Quote } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [expandedSections, setExpandedSections] = useState({ trends: true, submissions: false });
  const [data, setData] = useState({
    dashboard: { totalPapers: 0, totalUsers: 0, totalViews: 0, totalLikes: 0, totalBookmarks: 0, totalCitations: 0, monthlyData: [], topPapers: [], topLiked: [] },
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
      const [dashboard, loginTrends, weeklySubmissions] = await Promise.all([dashRes.json(), loginRes.json(), weeklyRes.json()]);
      setData({ dashboard, loginTrends, weeklySubmissions });
    } catch (error) { console.error('Analytics error:', error); }
    finally { setLoading(false); }
  };

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const exportData = (type) => {
    let csv = '';
    if (type === 'login') {
      csv = [['Date', 'Logins', 'Logouts'].join(','), ...data.loginTrends.dailyTrends.map(d => [d.date, d.logins, d.logouts].join(','))].join('\n');
    } else if (type === 'weekly') {
      csv = [['Week', 'Total', 'Approved', 'Pending'].join(','), ...data.weeklySubmissions.weeklyData.map(d => [d.week, d.total, d.approved, d.pending].join(','))].join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type}-${Date.now()}.csv`; a.click();
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><BarChart3 className="text-white" size={24} /></div>
            <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2><p className="text-sm text-gray-600 dark:text-gray-400">Real-time system insights</p></div>
          </div>
          <div className="flex items-center gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold focus:border-blue-600 focus:outline-none bg-white dark:bg-gray-700">
              <option value="7">7 Days</option><option value="14">14 Days</option><option value="30">30 Days</option><option value="60">60 Days</option><option value="90">90 Days</option>
            </select>
            <button onClick={fetchAllData} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" title="Refresh"><RefreshCw size={18} /></button>
          </div>
        </div>
      </div>

      {/* Quick Stats — now 7 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { icon: FileText, label: 'Total Papers', value: data.dashboard.totalPapers, color: 'from-blue-500 to-blue-600' },
          { icon: Users, label: 'Active Users', value: data.dashboard.totalUsers, color: 'from-green-500 to-green-600' },
          { icon: Eye, label: 'Total Views', value: data.dashboard.totalViews, color: 'from-purple-500 to-purple-600' },
          { icon: Heart, label: 'Total Likes', value: data.dashboard.totalLikes, color: 'from-red-500 to-rose-500' },
          { icon: Bookmark, label: 'Total Saved', value: data.dashboard.totalBookmarks, color: 'from-indigo-500 to-indigo-600' },
          { icon: Quote, label: 'Total Cited', value: data.dashboard.totalCitations, color: 'from-teal-500 to-teal-600' },
          { icon: TrendingUp, label: 'This Month', value: data.dashboard.monthlyData?.[data.dashboard.monthlyData.length - 1]?.submissions || 0, color: 'from-orange-500 to-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-200 dark:border-gray-700">
            <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2 shadow-md`}><stat.icon className="text-white" size={17} /></div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">{data.loginTrends.summary.totalLogins} total • Avg {data.loginTrends.summary.avgLoginsPerDay}/day</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); exportData('login'); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"><Download size={16} /></button>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">This week: {data.weeklySubmissions.comparison.thisWeek} • {data.weeklySubmissions.comparison.growth}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); exportData('weekly'); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"><Download size={16} /></button>
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
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4"><p className="text-xs opacity-90 mb-1"><ArrowUp size={12} className="inline" /> This Week</p><p className="text-3xl font-bold">{data.weeklySubmissions.comparison.thisWeek}</p></div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4"><p className="text-xs opacity-90 mb-1"><ArrowDown size={12} className="inline" /> Last Week</p><p className="text-3xl font-bold">{data.weeklySubmissions.comparison.lastWeek}</p></div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600" />Monthly Trend</h3>
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

      {/* Top Papers & Top Liked & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top by Views */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Eye size={18} className="text-purple-600" />Most Viewed</h3>
          <div className="space-y-2">
            {data.dashboard.topPapers?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-xs font-medium line-clamp-1 flex-1">{p.title}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600 flex items-center gap-0.5"><Eye size={9} />{p.views}</span>
                  <span className="text-xs font-bold text-red-500 flex items-center gap-0.5"><Heart size={9} />{p.likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top by Likes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Heart size={18} className="text-red-500" />Most Liked</h3>
          <div className="space-y-2">
            {data.dashboard.topLiked?.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-xs font-medium line-clamp-1 flex-1">{p.title}</span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-xs font-bold text-red-500 flex items-center gap-0.5"><Heart size={9} className="fill-current" />{p.likes || 0}</span>
                  <span className="text-xs font-bold text-indigo-500 flex items-center gap-0.5"><Bookmark size={9} />{p.bookmarks || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" />Engagement Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Views', value: data.dashboard.totalViews, color: 'bg-purple-500', icon: Eye },
              { label: 'Likes', value: data.dashboard.totalLikes, color: 'bg-red-500', icon: Heart },
              { label: 'Bookmarks', value: data.dashboard.totalBookmarks, color: 'bg-indigo-500', icon: Bookmark },
              { label: 'Citations', value: data.dashboard.totalCitations, color: 'bg-teal-500', icon: Quote },
            ].map((item, i) => {
              const total = (data.dashboard.totalViews || 1);
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300"><item.icon size={12} />{item.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users size={18} className="text-indigo-600" />Submissions by Role</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{ name: 'Students', value: data.weeklySubmissions.roleBreakdown.student || 0 }, { name: 'Faculty', value: data.weeklySubmissions.roleBreakdown.faculty || 0 }]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={70} dataKey="value">
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