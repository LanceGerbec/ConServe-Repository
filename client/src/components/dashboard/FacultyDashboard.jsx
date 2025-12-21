// client/src/components/dashboard/FacultyDashboard.jsx
import { useState, useEffect } from 'react';
import { FileCheck, MessageSquare, Award, Users, Eye, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewForm from '../review/ReviewForm';
import SubmitResearch from '../research/SubmitResearch';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalReviews: 0, approved: 0, rejected: 0, revisions: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const facultyReviewId = params.get('facultyReview');
    if (facultyReviewId) {
      fetchPaperForReview(facultyReviewId);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPaperForReview = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPaper(data.paper);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Fetch paper error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, approvedRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/reviews/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/research?status=approved`, { headers })
      ]);
      
      const statsData = await statsRes.json();
      const approvedData = await approvedRes.json();
      
      setStats(statsData);
      setPendingPapers(approvedData.papers || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: FileCheck, label: 'Available for Review', value: pendingPapers.length, color: 'bg-blue-500' },
    { icon: MessageSquare, label: 'Total Reviews', value: stats.totalReviews, color: 'bg-green-500' },
    { icon: Award, label: 'Approved', value: stats.approved, color: 'bg-purple-500' },
    { icon: Users, label: 'Revisions', value: stats.revisions, color: 'bg-orange-500' }
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
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-md mb-4`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <div className="text-3xl font-bold text-navy dark:text-accent mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setShowSubmitModal(true)} className="flex items-center justify-center gap-3 bg-green-500 text-white p-6 rounded-xl shadow-md hover:bg-green-600 hover:shadow-xl transition-all duration-300">
          <Upload size={24} />
          <span className="font-bold text-lg">Submit Research</span>
        </button>
        <a href="/browse" className="flex items-center justify-center gap-3 bg-blue-500 text-white p-6 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-xl transition-all duration-300">
          <Eye size={24} />
          <span className="font-bold text-lg">Browse Papers</span>
        </a>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Approved Papers - Ready for Faculty Review</h2>
        {pendingPapers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileCheck size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No approved papers available for review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPapers.map((paper) => (
              <div key={paper._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex-1 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{paper.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
                  <p className="text-xs text-gray-500 mt-1">Approved: {new Date(paper.approvedDate || paper.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.location.href = `/research/${paper._id}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                    <Eye size={16} />
                    View
                  </button>
                  <button onClick={() => { setSelectedPaper(paper); setShowReviewModal(true); }} className="flex-1 flex items-center justify-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition">
                    <MessageSquare size={16} />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && selectedPaper && (
        <ReviewForm
          paper={selectedPaper}
          onClose={() => { setSelectedPaper(null); setShowReviewModal(false); }}
          onSuccess={fetchData}
        />
      )}

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