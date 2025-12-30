// client/src/components/dashboard/FacultyDashboard.jsx - COMPLETE VERSION
import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Eye, BookOpen, Activity, Search, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ reviews: 0, pending: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [approvedPapers, setApprovedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reviewId = params.get('facultyReview');
    if (reviewId) {
      fetchPaperForReview(reviewId);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'overview') fetchData();
  }, [activeTab]);

  const fetchPaperForReview = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}`, {
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

      const [pendingRes, reviewsRes, approvedRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/reviews/pending`, { headers }),
        fetch(`${API_URL}/reviews/my-reviews`, { headers }),
        fetch(`${API_URL}/research?status=approved&limit=10`, { headers }),
        fetch(`${API_URL}/reviews/stats`, { headers })
      ]);

      const [pending, reviews, approved, reviewStats] = await Promise.all([
        pendingRes.json(),
        reviewsRes.json(),
        approvedRes.json(),
        statsRes.json()
      ]);

      setPendingPapers(pending.papers || []);
      setMyReviews(reviews.reviews || []);
      setApprovedPapers(approved.papers || []);
      setStats({
        reviews: reviewStats.totalReviews || 0,
        pending: pending.count || 0
      });
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaper = (paper) => {
    window.location.href = `/research/${paper._id}`;
  };

  const filteredPending = pendingPapers.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.submittedBy?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    p.submittedBy?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const statCards = [
    { icon: FileText, label: 'My Reviews', value: stats.reviews, color: 'bg-blue-500' },
    { icon: Clock, label: 'Pending Review', value: stats.pending, color: 'bg-yellow-500' },
    { icon: CheckCircle, label: 'Approved Papers', value: approvedPapers.length, color: 'bg-green-500' }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.firstName}! 👋</h1>
          <p className="text-blue-100 text-sm">Faculty Dashboard - Review & Manage Research</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
          {['overview', 'activity'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab 
                  ? 'bg-navy text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'overview' ? (
                <>
                  <BookOpen size={16} className="inline mr-2" />
                  Overview
                </>
              ) : (
                <>
                  <Activity size={16} className="inline mr-2" />
                  Activity Logs
                </>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="text-white" size={20} />
                    </div>
                    <span className="text-2xl font-bold text-navy dark:text-accent">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pending Papers for Review */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock size={24} className="text-yellow-600" />
                    Papers Awaiting Review ({filteredPending.length})
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search papers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>

              <div className="p-4">
                {filteredPending.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {search ? 'No papers match your search' : 'No papers pending review'}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="mt-3 text-navy dark:text-accent hover:underline text-sm font-semibold"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPending.map((paper) => (
                      <div
                        key={paper._id}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">
                            {paper.title}
                          </h3>
                          <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-semibold whitespace-nowrap">
                            PENDING
                          </span>
                        </div>

                        <div className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {paper.authors?.join(' • ')}
                          </p>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {paper.abstract}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(paper.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <button
                            onClick={() => handleViewPaper(paper)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle size={24} className="text-green-600" />
                  My Recent Reviews ({myReviews.length})
                </h2>
              </div>

              <div className="p-4">
                {myReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReviews.slice(0, 5).map((review) => (
                      <div
                        key={review._id}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">
                            {review.research?.title || 'Untitled'}
                          </h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            review.decision === 'approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : review.decision === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {review.decision?.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {review.comments}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recently Approved Papers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={24} className="text-navy" />
                  Recently Approved Papers
                </h2>
              </div>

              <div className="p-4">
                {approvedPapers.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No approved papers yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {approvedPapers.slice(0, 6).map((paper) => (
                      <div
                        key={paper._id}
                        onClick={() => handleViewPaper(paper)}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                      >
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                          {paper.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {paper.views || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(paper.approvedDate || paper.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && <ActivityLogs />}
      </div>
    </>
  );
};

export default FacultyDashboard;