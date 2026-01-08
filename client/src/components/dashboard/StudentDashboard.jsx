import { useState, useEffect, useRef } from 'react';
import { BookOpen, Upload, Calendar, Eye, Activity, Bookmark, Search, X, ChevronRight, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import EditResearch from '../research/EditResearch';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({ submissions: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const submissionsRef = useRef(null);
  const bookmarksRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'submissions' || activeTab === 'bookmarks') fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [submissionsRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/research/my-submissions`, { headers }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers })
      ]);
      const [submissionsData, bookmarksData] = await Promise.all([submissionsRes.json(), bookmarksRes.json()]);
      setSubmissions(submissionsData.papers || []);
      setBookmarks(bookmarksData.bookmarks || []);
      const totalViews = (submissionsData.papers || []).reduce((sum, p) => sum + (p.views || 0), 0);
      setStats({ submissions: submissionsData.count || 0, views: totalViews });
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, researchId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/bookmarks/toggle/${researchId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
      showToast('Bookmark removed', 'success');
    } catch (error) {
      showToast('Failed to remove', 'error');
    }
  };

  const handleDeleteRejected = async (paperId, title) => {
  if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/research/${paperId}/author-delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete');
    }
    
    setSubmissions(prev => prev.filter(p => p._id !== paperId));
    setStats(prev => ({ ...prev, submissions: prev.submissions - 1 }));
    showToast('Paper deleted successfully', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

  const scrollToSection = (ref, tab) => {
    setActiveTab(tab);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      revision: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredSubmissions = submissions.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredBookmarks = bookmarks.filter(b => b.research?.title?.toLowerCase().includes(search.toLowerCase()));

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border-2 border-gray-100 dark:border-gray-700 transition-all ${onClick ? 'active:scale-95 cursor-pointer hover:shadow-lg' : ''}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
          <Icon className="text-white" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xl sm:text-2xl font-bold text-navy dark:text-accent">{value}</div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</p>
        </div>
        {onClick && <ChevronRight className="text-gray-400 flex-shrink-0" size={16} />}
      </div>
    </div>
  );

 const PaperCard = ({ paper, onRemove, isBookmark = false, isSubmission = false, isReview = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-md border border-gray-200 dark:border-gray-700 active:scale-98 transition-all">
    <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-3">
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 mb-2 active:text-navy cursor-pointer" onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : isReview ? paper.research._id : paper._id}`}>
          {isBookmark ? paper.research.title : isReview ? paper.research.title : paper.title}
        </h3>
        {/* AUTHORS LIST */}
        <div className="mb-2 flex items-start gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">BY:</span>
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
            {isBookmark ? paper.research.authors?.join(', ') : isReview ? paper.research.authors?.join(', ') : paper.authors?.join(', ')}
          </p>
        </div>
      </div>
      {isSubmission && (
        <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold whitespace-nowrap self-start ${getStatusBadge(paper.status)}`}>
          {paper.status?.toUpperCase()}
        </span>
      )}
    </div>
    
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
      {isBookmark ? paper.research.abstract : isReview ? paper.research.abstract : paper.abstract}
    </p>
    
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span className="hidden sm:inline">{new Date(paper.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="sm:hidden">{new Date(paper.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
        </span>
        {isSubmission && paper.status === 'approved' && (
          <span className="flex items-center gap-1.5">
            <Eye size={14} />
            {paper.views || 0}
          </span>
        )}
      </div>
      
      <div className="w-full sm:w-auto flex gap-2">
        {isBookmark ? (
          <button onClick={() => onRemove(paper._id, paper.research._id)} className="w-full sm:w-auto px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition active:scale-95">
            Remove
          </button>
        ) : isSubmission && paper.status === 'rejected' && (
          <button 
            onClick={() => handleDeleteRejected(paper._id, paper.title)} 
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition active:scale-95"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative flex items-center gap-3 sm:gap-6">
            <div className="hidden xs:block flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-2xl ring-2 sm:ring-4 ring-white/20 transform transition-transform hover:scale-105">
                <span className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-1 sm:mb-2">
                <p className="text-xs sm:text-sm font-medium text-blue-100 mb-0.5 sm:mb-1">Welcome back,</p>
                <h1 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 truncate">{user?.firstName} {user?.lastName}</h1>
                <p className="text-xs sm:text-sm text-blue-200 font-medium">Student Dashboard</p>
              </div>

              <div className="w-full max-w-md h-px bg-gradient-to-r from-blue-400/50 via-blue-300/30 to-transparent my-2 sm:my-3"></div>

              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-100">
                  <Upload size={14} className="text-blue-300 flex-shrink-0" />
                  <span className="font-semibold text-white">{stats.submissions}</span>
                  <span className="text-blue-200 hidden sm:inline">Submission{stats.submissions !== 1 ? 's' : ''}</span>
                  <span className="text-blue-200 sm:hidden">Paper{stats.submissions !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-blue-400/30"></div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-100">
                  <Eye size={14} className="text-blue-300 flex-shrink-0" />
                  <span className="font-semibold text-white">{stats.views}</span>
                  <span className="text-blue-200">Views</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Activity size={16} className="text-green-300" />
              <span className="text-xs sm:text-sm font-semibold text-white">Active</span>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', icon: BookOpen, label: 'Overview' },
              { id: 'submissions', icon: FileText, label: 'Submissions', badge: stats.submissions },
              { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
              { id: 'activity', icon: Activity, label: 'Activity' }
            ].map(tab => (
              <button key={tab.id} onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'submissions') scrollToSection(submissionsRef, 'submissions');
                if (tab.id === 'bookmarks') scrollToSection(bookmarksRef, 'bookmarks');
              }} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm ${activeTab === tab.id ? 'bg-navy text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md active:scale-95'}`}>
                <tab.icon size={16} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-[#FFB27F] text-white text-xs font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 sm:px-4 space-y-4 sm:space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <button onClick={() => setShowSubmitModal(true)} className="bg-gradient-to-br from-navy to-blue-700 text-white p-4 sm:p-6 rounded-2xl shadow-lg active:scale-95 transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-base sm:text-lg mb-0.5 sm:mb-1">Submit Research</h3>
                    <p className="text-xs sm:text-sm text-blue-100 opacity-90">Upload your paper</p>
                  </div>
                  <ChevronRight size={18} className="opacity-70 flex-shrink-0" />
                </div>
              </button>

              <button onClick={() => window.location.href = '/explore'} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 active:scale-95 transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-blue-600" size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-0.5 sm:mb-1">Browse Papers</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Explore repository</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </div>
              </button>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div ref={submissionsRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-4">
              <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Upload size={18} className="text-blue-600" />
                  My Submissions ({filteredSubmissions.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search submissions..." className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Upload size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">{search ? 'No submissions found' : 'No submissions yet'}</p>
                    {!search && <button onClick={() => setShowSubmitModal(true)} className="text-sm sm:text-base text-navy dark:text-accent font-semibold hover:underline">Submit Your First Paper</button>}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">{filteredSubmissions.map(p => <PaperCard key={p._id} paper={p} isSubmission />)}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div ref={bookmarksRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-4">
              <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Bookmark size={18} className="text-purple-600" />
                  Bookmarked Papers ({filteredBookmarks.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-navy focus:ring-4 focus:ring-navy/10 focus:outline-none dark:bg-gray-900" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Bookmark size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-medium">{search ? 'No bookmarks found' : 'No bookmarks yet'}</p>
                    {!search && <button onClick={() => window.location.href = '/explore'} className="text-sm sm:text-base text-navy dark:text-accent font-semibold hover:underline">Browse Papers</button>}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">{filteredBookmarks.map(b => <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />)}</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && <ActivityLogs />}
        </div>
      </div>

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => { setShowSubmitModal(false); fetchData(); }} />}
      
      {showEditModal && editingPaper && (
        <EditResearch 
          research={editingPaper}
          onClose={() => {
            setShowEditModal(false);
            setEditingPaper(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingPaper(null);
            fetchData();
          }}
        />
      )}
    </>
  );
};

export default StudentDashboard;