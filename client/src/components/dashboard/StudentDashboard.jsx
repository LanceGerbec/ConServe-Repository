import { useState, useEffect } from 'react';
import { BookOpen, Upload, TrendingUp, X, Calendar, Tag, User, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ submissions: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/my-submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSubmissions(data.papers || []);
      setStats({ submissions: data.count || 0 });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const quickActions = [
    { icon: Upload, label: 'Submit Research', color: 'bg-navy', desc: 'Upload your research paper', action: () => setShowSubmitModal(true) },
    { icon: BookOpen, label: 'Browse Papers', color: 'bg-blue-500', desc: 'Explore the repository', action: () => window.location.href = '/browse' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Student Dashboard - Manage your research journey</p>
      </div>

      {/* Single Stat Card - Clickable */}
      <div 
        onClick={() => setShowSubmissionsModal(true)}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <Upload size={28} className="text-blue-600" />
          <span className="text-3xl font-bold text-navy dark:text-accent">{stats.submissions}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          My Submissions
          <span className="ml-2 text-xs text-navy dark:text-accent">• Click to view</span>
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyViewed />
        
        <div className="bg-gradient-to-br from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Submissions</span>
              <span className="text-3xl font-bold">{stats.submissions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions ({submissions.length})</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All your submitted research papers</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {submissions.length === 0 ? (
                <div className="text-center py-16">
                  <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No submissions yet</p>
                  <button onClick={() => { setShowSubmissionsModal(false); setShowSubmitModal(true); }} className="mt-4 text-navy dark:text-accent hover:underline font-semibold">
                    Submit Your First Research
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((paper) => (
                    <div key={paper._id} onClick={() => window.location.href = `/research/${paper._id}`} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 flex-1 hover:text-navy dark:hover:text-accent">{paper.title}</h3>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(paper.status)}`}>{paper.status.toUpperCase()}</span>
                      </div>
                      <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{paper.authors.join(' • ')}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{paper.abstract}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1"><Calendar size={14} />{new Date(paper.createdAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1"><Tag size={14} />{paper.category}</div>
                        {paper.subjectArea && <div className="flex items-center gap-1"><BookOpen size={14} />{paper.subjectArea}</div>}
                        {paper.status === 'approved' && <div className="flex items-center gap-1"><Eye size={14} />{paper.views || 0} views</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Research Modal */}
      {showSubmitModal && (
        <SubmitResearch 
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => { setShowSubmitModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;