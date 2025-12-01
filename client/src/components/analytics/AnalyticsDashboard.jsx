import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Eye } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  const statCards = [
    { icon: FileText, label: 'Total Papers', value: stats?.totalPapers || 0, color: 'bg-blue-500' },
    { icon: Users, label: 'Active Users', value: stats?.totalUsers || 0, color: 'bg-green-500' },
    { icon: Eye, label: 'Total Views', value: stats?.totalViews || 0, color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'This Month', value: stats?.monthlyData?.[stats.monthlyData.length - 1]?.submissions || 0, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Submissions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.monthlyData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submissions" stroke="#1e3a8a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Viewed Papers</h3>
          <div className="space-y-3">
            {stats?.topPapers?.map((paper, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{paper.title}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{paper.views} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {stats?.recentSubmissions?.map((paper, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{paper.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;