// ============================================
// FILE: client/src/components/dashboard/FacultyDashboard.jsx
// ============================================
import { FileCheck, MessageSquare, TrendingUp, Users, Eye, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: FileCheck, label: 'Pending Reviews', value: '0', color: 'bg-orange-500', trend: '+0%' },
    { icon: MessageSquare, label: 'Comments Given', value: '0', color: 'bg-blue-500', trend: '+0%' },
    { icon: Award, label: 'Approved Papers', value: '0', color: 'bg-green-500', trend: '+0%' },
    { icon: Users, label: 'Students Mentored', value: '0', color: 'bg-purple-500', trend: '+0%' }
  ];

  const pendingReviews = [
    { title: 'Awaiting your review...', author: 'No pending reviews', status: 'info' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-blue-100">Welcome, Prof. {user?.firstName} {user?.lastName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className="text-sm font-semibold text-green-600">{stat.trend}</span>
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Submissions for Review</h2>
            <FileCheck className="text-gray-400" size={24} />
          </div>
          <div className="space-y-4">
            {pendingReviews.map((review, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{review.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">By: {review.author}</p>
                <div className="text-center py-4 text-gray-500">
                  <p>No pending reviews at the moment</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-navy text-white px-4 py-3 rounded-lg hover:bg-navy-800 transition text-left flex items-center">
                <FileCheck size={20} className="mr-3" />
                <span>Review Submissions</span>
              </button>
              <button className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition text-left flex items-center">
                <Eye size={20} className="mr-3" />
                <span>View Analytics</span>
              </button>
              <button className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition text-left flex items-center">
                <Award size={20} className="mr-3" />
                <span>Approved Papers</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Your Impact</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              You've helped shape the quality of research in our repository.
            </p>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-1">0</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total reviews completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;