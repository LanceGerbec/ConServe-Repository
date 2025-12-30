// client/src/components/dashboard/StudentDashboard.jsx - UPDATED
import { useState, useEffect } from 'react';
import { BookOpen, Upload, X, Calendar, Tag, Eye, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';
import ActivityLogs from '../analytics/ActivityLogs';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ submissions: 0 });

  useEffect(() => {
    if (activeTab === 'overview') fetchData();
  }, [activeTab]);

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
    <div className="space-y-4 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-blue-100 text-sm">Student Dashboard</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
        {['overview', 'activity'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {tab === 'overview' ? <BookOpen size={16} className="inline mr-2" /> : <Activity size={16} className="inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div onClick={() => setShowSubmissionsModal(true)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition">
            <div className="flex items-center justify-between mb-2">
              <Upload size={24} className="text-blue-600" />
              <span className="text-2xl font-bold text-navy dark:text-accent">{stats.submissions}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">My Submissions <span className="ml-2 text-xs text-navy dark:text-accent">• Click to view</span></p>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <button key={i} onClick={action.action} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition text-left group">
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                    <action.icon className="text-white" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{action.label}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recently Viewed */}
          <RecentlyViewed />
        </>
      )}

      {activeTab === 'activity' && <ActivityLogs />}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Submissions ({submissions.length})</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All your submitted research papers</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">No submissions yet</p>
                  <button onClick={() => { setShowSubmissionsModal(false); setShowSubmitModal(true); }} className="mt-3 text-navy dark:text-accent hover:underline font-semibold text-sm">Submit Your First Research</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map(p => (
                    <div key={p._id} onClick={() => window.location.href = `/research/${p._id}`} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">{p.title}</h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(p.status)}`}>{p.status.toUpperCase()}</span>
                      </div>
                      <div className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{p.authors.join(' • ')}</p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{p.abstract}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1"><Calendar size={12} />{new Date(p.createdAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1"><Tag size={12} />{p.category}</div>
                        {p.subjectArea && <div className="flex items-center gap-1"><BookOpen size={12} />{p.subjectArea}</div>}
                        {p.status === 'approved' && <div className="flex items-center gap-1"><Eye size={12} />{p.views || 0} views</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => { setShowSubmitModal(false); fetchData(); }} />}
    </div>
  );
};

export default StudentDashboard;