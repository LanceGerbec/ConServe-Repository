import { useState, useEffect } from 'react';
import { FileCheck, MessageSquare, Award, Eye, Upload, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalReviews: 0, approved: 0, rejected: 0, revisions: 0 });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/reviews/stats`, { headers });
      const statsData = await statsRes.json();
      
      setStats(statsData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: MessageSquare, label: 'Total Reviews', value: stats.totalReviews, color: 'bg-green-500' },
    { icon: Award, label: 'Approved', value: stats.approved, color: 'bg-purple-500' },
    { icon: FileCheck, label: 'Revisions', value: stats.revisions, color: 'bg-orange-500' },
    { icon: TrendingUp, label: 'Rejected', value: stats.rejected, color: 'bg-red-500' }
  ];

  const quickActions = [
    { 
      icon: Upload, 
      label: 'Submit Research', 
      desc: 'Upload your research paper',
      color: 'from-green-500 to-green-600',
      action: () => setShowSubmitModal(true)
    },
    { 
      icon: BookOpen, 
      label: 'Browse & Review', 
      desc: 'View and review approved papers',
      color: 'from-blue-500 to-blue-600',
      action: () => window.location.href = '/browse'
    },
    { 
      icon: Eye, 
      label: 'My Reviews', 
      desc: 'See papers you have reviewed',
      color: 'from-purple-500 to-purple-600',
      action: () => window.location.href = '/browse'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Prof. {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Faculty Dashboard - Review approved papers and submit your research</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md mb-4`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-600" />
          Faculty Review Process
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>1. Browse Papers:</strong> Go to Browse page to see all approved research papers</p>
          <p><strong>2. Review Papers:</strong> Click the "Review" button (visible to faculty only) on any paper</p>
          <p><strong>3. Submit Feedback:</strong> Provide ratings and detailed suggestions for improvement</p>
          <p><strong>4. Track Reviews:</strong> Your review statistics are displayed above</p>
        </div>
        <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Note:</strong> Faculty reviews are suggestions. The admin makes the final approval decision.
          </p>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyViewed />
        
        {/* Activity Summary */}
        <div className="bg-gradient-to-br from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Activity Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span>Total Reviews Submitted</span>
              <span className="text-3xl font-bold">{stats.totalReviews}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span>Papers Approved</span>
              <span className="text-3xl font-bold">{stats.approved}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <span>Revisions Requested</span>
              <span className="text-3xl font-bold">{stats.revisions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Papers Rejected</span>
              <span className="text-3xl font-bold">{stats.rejected}</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/browse'}
            className="w-full mt-6 bg-white text-navy px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
          >
            Browse Papers to Review
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitResearch
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => { setShowSubmitModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;