import { useState, useEffect } from 'react';
import { FileText, Eye, Calendar, User, Search, X, Upload, Clock, TrendingUp, BookOpen, CheckCircle, XCircle, AlertCircle, Plus, Filter } from 'lucide-react';

// Mock API - Replace with your actual API calls
const API_URL = 'http://localhost:5000/api';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ reviews: 0, pending: 0, submissions: 0 });
  const [pendingPapers, setPendingPapers] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/reviews/stats`, { headers: h });
      const statsData = await statsRes.json();
      
      // Fetch pending papers
      const pendingRes = await fetch(`${API_URL}/reviews/pending`, { headers: h });
      const pendingData = await pendingRes.json();
      
      // Fetch my submissions
      const submissionsRes = await fetch(`${API_URL}/research/my-submissions`, { headers: h });
      const submissionsData = await submissionsRes.json();
      
      // Fetch my reviews
      const reviewsRes = await fetch(`${API_URL}/reviews/my-reviews`, { headers: h });
      const reviewsData = await reviewsRes.json();
      
      setStats({
        reviews: statsData.totalReviews || 0,
        pending: pendingData.count || 0,
        submissions: submissionsData.count || 0
      });
      
      setPendingPapers(pendingData.papers || []);
      setMySubmissions(submissionsData.papers || []);
      setMyReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      revision: 'bg-orange-100 text-orange-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''} transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        <span className="text-3xl font-bold text-navy dark:text-accent">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {label}
        {onClick && <span className="ml-2 text-xs text-navy dark:text-accent">• Click to view</span>}
      </p>
    </div>
  );

  const PaperCard = ({ paper, onReview, type = 'pending' }) => (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 hover:text-navy dark:hover:text-accent transition">
          {paper.title}
        </h3>
        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(paper.status)}`}>
          {paper.status.toUpperCase()}
        </span>
      </div>
      
      <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{paper.authors?.join(' • ')}</p>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{paper.abstract}</p>
      
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          {new Date(paper.createdAt).toLocaleDateString()}
        </div>
        {paper.category && (
          <div className="flex items-center gap-1">
            <FileText size={14} />
            {paper.category}
          </div>
        )}
        {paper.status === 'approved' && (
          <div className="flex items-center gap-1">
            <Eye size={14} />
            {paper.views || 0} views
          </div>
        )}
      </div>
      
      {type === 'pending' && (
        <button 
          onClick={() => onReview(paper)}
          className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          Review Paper
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const filteredPending = pendingPapers.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.authors?.some(a => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Faculty! 👋</h1>
        <p className="text-blue-100">Review research papers and manage your submissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={FileText} 
          label="My Reviews" 
          value={stats.reviews} 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={Clock} 
          label="Pending Review" 
          value={stats.pending} 
          color="bg-yellow-500" 
        />
        <StatCard 
          icon={Upload} 
          label="My Submissions" 
          value={stats.submissions} 
          color="bg-green-500"
          onClick={() => setShowSubmissionsModal(true)}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Submit Research</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload your research paper</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/browse'}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Browse Repository</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Explore research papers</p>
          </button>
        </div>
      </div>

      {/* Papers Awaiting Review */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={24} />
            Papers Awaiting Review ({filteredPending.length})
          </h2>
        </div>

        {pendingPapers.length > 0 && (
          <div className="mb-4">
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
        )}

        {filteredPending.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No papers pending review</p>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {filteredPending.map((paper) => (
              <PaperCard 
                key={paper._id} 
                paper={paper} 
                onReview={(p) => { setSelectedPaper(p); setShowReviewModal(true); }}
                type="pending"
              />
            ))}
          </div>
        )}
      </div>

      {/* My Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions ({mySubmissions.length})</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your submitted research papers</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {mySubmissions.length === 0 ? (
                <div className="text-center py-16">
                  <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No submissions yet</p>
                  <button 
                    onClick={() => { setShowSubmissionsModal(false); setShowSubmitModal(true); }} 
                    className="mt-4 text-navy dark:text-accent hover:underline font-semibold"
                  >
                    Submit Your First Research
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {mySubmissions.map((paper) => (
                    <PaperCard key={paper._id} paper={paper} type="submission" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder modals */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Submit Research</h3>
              <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Use the SubmitResearch component here</p>
            <button onClick={() => setShowSubmitModal(false)} className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold">
              Close
            </button>
          </div>
        </div>
      )}

      {showReviewModal && selectedPaper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Paper</h3>
              <button onClick={() => { setShowReviewModal(false); setSelectedPaper(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{selectedPaper.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Use your review component here</p>
            <button onClick={() => { setShowReviewModal(false); setSelectedPaper(null); }} className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;