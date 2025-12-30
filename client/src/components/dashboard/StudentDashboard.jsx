// client/src/components/dashboard/StudentDashboard.jsx - COMPLETE FILE
import { useState, useEffect } from 'react';
import { BookOpen, Upload, Calendar, Eye, Activity, Bookmark, Grid, List, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import ActivityLogs from '../analytics/ActivityLogs';
import Toast from '../common/Toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({ submissions: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'bookmarks') fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const headers = { 'Authorization': `Bearer ${token}` };

      const [submissionsRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/research/my-submissions`, { headers }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers })
      ]);

      if (!submissionsRes.ok || !bookmarksRes.ok) throw new Error('Fetch failed');

      const [submissionsData, bookmarksData] = await Promise.all([
        submissionsRes.json(),
        bookmarksRes.json()
      ]);

      setSubmissions(submissionsData.papers || []);
      setBookmarks(bookmarksData.bookmarks || []);
      
      const totalViews = (submissionsData.papers || []).reduce((sum, p) => sum + (p.views || 0), 0);
      setStats({ submissions: submissionsData.count || 0, views: totalViews });
    } catch (error) {
      console.error('Fetch error:', error);
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
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredSubmissions = submissions.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredBookmarks = bookmarks.filter(b => b.research?.title?.toLowerCase().includes(search.toLowerCase()));

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div onClick={onClick} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all ${onClick ? 'cursor-pointer group' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg ${onClick ? 'group-hover:scale-110 transition' : ''}`}>
          <Icon className="text-white" size={24} />
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-navy dark:text-accent">{value}</div>
          {onClick && <ArrowRight className="ml-auto text-gray-400 group-hover:text-navy group-hover:translate-x-1 transition" size={20} />}
        </div>
      </div>
      <p className="text-base text-gray-600 dark:text-gray-400 font-semibold">{label}</p>
    </div>
  );

  const PaperCard = ({ paper, onRemove, isBookmark = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between mb-3 gap-3">
        <h3 
          className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 flex-1 cursor-pointer hover:text-navy transition" 
          onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : paper._id}`}
        >
          {isBookmark ? paper.research.title : paper.title}
        </h3>
        {!isBookmark && (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap ${getStatusBadge(paper.status)}`}>
            {paper.status?.toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {isBookmark ? paper.research.abstract : paper.abstract}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(paper.createdAt).toLocaleDateString()}
          </span>
          {!isBookmark && paper.status === 'approved' && (
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              {paper.views || 0}
            </span>
          )}
        </div>
        {isBookmark && (
          <button onClick={() => onRemove(paper._id, paper.research._id)} className="text-red-600 hover:text-red-700 text-sm font-bold transition">
            Remove
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-navy to-accent text-white rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-blue-100">Student Dashboard</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', badge: bookmarks.length },
            { id: 'activity', icon: Activity, label: 'Activity' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 relative ${activeTab === tab.id ? 'bg-navy text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <tab.icon size={18} />
              {tab.label}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard icon={Upload} label="My Submissions" value={stats.submissions} color="bg-blue-600" onClick={() => window.scrollTo({ top: document.getElementById('submissions-section')?.offsetTop, behavior: 'smooth' })} />
              <StatCard icon={Eye} label="Total Views" value={stats.views} color="bg-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setShowSubmitModal(true)} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition text-left group">
                <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                  <Upload className="text-white" size={28} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Submit Research</h3>
                <p className="text-gray-600 dark:text-gray-400">Upload your research paper</p>
              </button>

              <button onClick={() => window.location.href = '/browse'} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition text-left group">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                  <BookOpen className="text-white" size={28} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Browse Papers</h3>
                <p className="text-gray-600 dark:text-gray-400">Explore the repository</p>
              </button>
            </div>

            <div id="submissions-section" className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Upload size={22} className="text-blue-600" />
                    My Submissions ({filteredSubmissions.length})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><Grid size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><List size={18} /></button>
                  </div>
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search submissions..." className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-navy focus:outline-none" />
              </div>
              <div className="p-6">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-16">
                    <Upload size={56} className="mx-auto text-gray-400 mb-4 opacity-30" />
                    <p className="text-gray-600 mb-3">{search ? 'No submissions found' : 'No submissions yet'}</p>
                    {!search && <button onClick={() => setShowSubmitModal(true)} className="text-navy hover:underline font-semibold">Submit Your First Paper</button>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">{filteredSubmissions.map(p => <PaperCard key={p._id} paper={p} />)}</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bookmark size={22} className="text-purple-600" />
                  Bookmarked Papers ({filteredBookmarks.length})
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><Grid size={18} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><List size={18} /></button>
                </div>
              </div>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-navy focus:outline-none" />
            </div>
            <div className="p-6">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark size={56} className="mx-auto text-gray-400 mb-4 opacity-30" />
                  <p className="text-gray-600 mb-3">{search ? 'No bookmarks found' : 'No bookmarks yet'}</p>
                  {!search && <button onClick={() => window.location.href = '/browse'} className="text-navy hover:underline font-semibold">Browse Papers</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">{filteredBookmarks.map(b => <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />)}</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityLogs />}
      </div>

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => { setShowSubmitModal(false); fetchData(); }} />}
    </>
  );
};

export default StudentDashboard;