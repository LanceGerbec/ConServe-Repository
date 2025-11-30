import { useState, useEffect } from 'react';
import { FileCheck, MessageSquare, Award, Users, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../review/ReviewForm';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalReviews: 0, approved: 0, rejected: 0, revisions: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, pendingRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/reviews/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/pending`, { headers })
      ]);

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();

      setStats(statsData);
      setPendingPapers(pendingData.papers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: FileCheck, label: 'Pending Reviews', value: pendingPapers.length, color: 'bg-orange-500' },
    { icon: MessageSquare, label: 'Total Reviews', value: stats.totalReviews, color: 'bg-blue-500' },
    { icon: Award, label: 'Approved', value: stats.approved, color: 'bg-green-500' },
    { icon: Users, label: 'Revisions', value: stats.revisions, color: 'bg-purple-500' }
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
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-blue-100">Welcome, Prof. {user?.firstName} {user?.lastName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Submissions for Review</h2>
        {pendingPapers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileCheck size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No pending reviews at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPapers.map((paper) => (
              <div key={paper._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{paper.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = `/research/${paper._id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => setSelectedPaper(paper)}
                    className="flex-1 flex items-center justify-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition"
                  >
                    <MessageSquare size={16} />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPaper && (
        <ReviewForm
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;