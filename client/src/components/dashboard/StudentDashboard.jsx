// ============================================
// FILE: client/src/components/dashboard/StudentDashboard.jsx - UPDATED
// ============================================
import { useState } from 'react'; // ADD THIS
import { BookOpen, Upload, Heart, Bell, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch'; // ADD THIS

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false); // ADD THIS

 const quickActions = [
  { icon: Upload, label: 'Submit Research', color: 'bg-navy', desc: 'Upload your research paper', action: 'submit' },
  { icon: BookOpen, label: 'Browse Papers', color: 'bg-blue-500', desc: 'Explore the repository', action: 'browse' }, // MODIFIED
  { icon: Heart, label: 'My Favorites', color: 'bg-red-500', desc: 'Saved research papers' },
  { icon: Bell, label: 'Notifications', color: 'bg-yellow-500', desc: 'View updates', badge: '3' }
];

  const recentActivity = [
    { action: 'Viewed', title: 'Impact of Telehealth on Patient Care', time: '2 hours ago' },
    { action: 'Bookmarked', title: 'Nursing Leadership in Crisis', time: '1 day ago' },
    { action: 'Searched', title: 'Mental Health Nursing', time: '3 days ago' }
  ];

  // Update handleQuickAction function:
const handleQuickAction = (action) => {
  if (action === 'submit') {
    setShowSubmitModal(true);
  } else if (action === 'browse') {
    window.location.href = '/browse'; // ADD THIS
  }
};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Student Dashboard - Manage your research journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'My Submissions', value: '0', icon: Upload, color: 'text-blue-600' },
          { label: 'Favorites', value: '0', icon: Heart, color: 'text-red-600' },
          { label: 'Papers Read', value: '0', icon: BookOpen, color: 'text-green-600' },
          { label: 'Pending Reviews', value: '0', icon: Clock, color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={stat.color} size={28} />
              <span className="text-3xl font-bold text-navy">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - MODIFIED */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={() => handleQuickAction(action.action)} // ADD THIS
              className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              {action.badge && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Submissions</h2>
            <button className="text-sm text-navy hover:text-navy-700 font-semibold">View All →</button>
          </div>
          <div className="text-center py-8">
            <Upload className="mx-autotext-gray-400 mb-3" size={48} />
<p className="text-gray-600 dark:text-gray-400 mb-4">No submissions yet</p>
<button
onClick={() => setShowSubmitModal(true)} // ADD THIS
className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy-800 transition"
>
Submit Your First Research
</button>
</div>
</div>{/* Recent Activity */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        <TrendingUp className="text-gray-400" size={20} />
      </div>
      <div className="space-y-4">
        {recentActivity.map((activity, i) => (
          <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <div className="w-2 h-2 bg-navy rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.action}: <span className="text-gray-600 dark:text-gray-400">{activity.title}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Help Section */}
  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-navy p-6 rounded-lg">
    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Need Help Getting Started?</h3>
    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
      Check out our comprehensive guide on how to submit your research paper.
    </p>
    <button className="text-navy hover:text-navy-700 font-semibold text-sm">
      View Submission Guide →
    </button>
  </div>

  {/* ADD THIS MODAL */}
  {showSubmitModal && (
    <SubmitResearch 
      onClose={() => setShowSubmitModal(false)}
      onSuccess={() => {
        setShowSubmitModal(false);
        // Optionally refresh submissions list
      }}
    />
  )}
</div>
);
};
export default StudentDashboard;