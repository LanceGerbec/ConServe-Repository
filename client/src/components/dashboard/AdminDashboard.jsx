// ============================================
// FILE: client/src/components/dashboard/AdminDashboard.jsx
// ============================================
import { Users, FileText, Shield, BarChart, Activity, UserCheck, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const adminStats = [
    { icon: Users, label: 'Total Users', value: '0', color: 'bg-blue-500', change: '+0' },
    { icon: FileText, label: 'Total Papers', value: '0', color: 'bg-green-500', change: '+0' },
    { icon: Shield, label: 'Pending Approvals', value: '0', color: 'bg-yellow-500', change: '0' },
    { icon: Activity, label: 'Active Today', value: '0', color: 'bg-purple-500', change: '0' }
  ];

  const recentActions = [
    { type: 'user', action: 'User registration pending', user: 'System', time: 'Just now', status: 'pending' },
    { type: 'paper', action: 'Paper submission pending', user: 'System', time: 'Just now', status: 'pending' }
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

      {/* Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
            <UserCheck className="text-gray-400" size={24} />
          </div>
          <div className="space-y-3">
            <button className="w-full bg-navy text-white px-4 py-3 rounded-lg hover:bg-navy-800 transition text-left flex items-center justify-between">
              <span className="flex items-center">
                <UserCheck size={18} className="mr-3" />
                Pending Approvals
              </span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">0</span>
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <Users size={18} className="mr-3" />
              All Users
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <Shield size={18} className="mr-3" />
              Manage Roles
            </button>
          </div>
        </div>

        {/* Paper Management */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paper Management</h2>
            <FileText className="text-gray-400" size={24} />
          </div>
          <div className="space-y-3">
            <button className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition text-left flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle size={18} className="mr-3" />
                Pending Review
              </span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">0</span>
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <FileText size={18} className="mr-3" />
              All Papers
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <XCircle size={18} className="mr-3" />
              Rejected Papers
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Settings</h2>
            <Shield className="text-gray-400" size={24} />
          </div>
          <div className="space-y-3">
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <BarChart size={18} className="mr-3" />
              Analytics
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <Shield size={18} className="mr-3" />
              Security Logs
            </button>
            <button className="w-full border-2 border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left flex items-center">
              <Activity size={18} className="mr-3" />
              Site Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent System Activity</h2>
        <div className="space-y-3">
          {recentActions.map((action, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  action.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                }`}>
                  {action.type === 'user' ? <UserCheck size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{action.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">By: {action.user}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.time}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  action.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {action.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;