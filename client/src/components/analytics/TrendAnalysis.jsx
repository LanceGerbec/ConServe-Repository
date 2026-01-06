// client/src/components/analytics/TrendAnalysis.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Award, Clock, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';

const TrendAnalysis = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    userGrowth: [],
    submissions: [],
    approvalRate: [],
    categories: [],
    peakHours: [],
    topContributors: []
  });

  useEffect(() => {
    fetchTrendData();
  }, [dateRange]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/trends?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Trend data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Growth Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Growth Trend</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">New user registrations over time</p>
            </div>
          </div>
          <button onClick={fetchTrendData} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition">
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Students" />
            <Line type="monotone" dataKey="faculty" stroke="#10b981" strokeWidth={2} name="Faculty" />
            <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Research Submissions Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <FileText className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Research Submissions</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Submission trends by status</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.submissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Approved" />
            <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Pending" />
            <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Rejected" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <PieChartIcon className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Categories</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Research by category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Contributors */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Award className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Contributors</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Most active users</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.topContributors.slice(0, 5).map((user, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                    idx === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.submissions} submissions</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600">{user.approvalRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approval Rate Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <Clock className="text-orange-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Approval Rate Trend</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Research approval percentage over time</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.approvalRate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} name="Approval Rate (%)" />
            <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target (80%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendAnalysis;