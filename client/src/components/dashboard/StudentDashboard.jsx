import { useState, useEffect } from 'react';
import { BookOpen, Upload, X, Calendar, Tag, Eye, Activity, Bookmark, Grid, List, Search, Filter } from 'lucide-react';
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
  const [stats, setStats] = useState({ submissions: 0, bookmarks: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'bookmarks') fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [submissionsRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/research/my-submissions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/bookmarks/my-bookmarks`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [submissionsData, bookmarksData] = await Promise.all([
        submissionsRes.json(),
        bookmarksRes.json()
      ]);

      setSubmissions(submissionsData.papers || []);
      setBookmarks(bookmarksData.bookmarks || []);
      
      const totalViews = submissionsData.papers?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      setStats({
        submissions: submissionsData.count || 0,
        bookmarks: bookmarksData.count || 0,
        views: totalViews
      });
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, researchId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/bookmarks/toggle/${researchId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
      setStats(prev => ({ ...prev, bookmarks: prev.bookmarks - 1 }));
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

  const filteredSubmissions = submissions.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(b =>
    b.research?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''} transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        <span className="text-2xl font-bold text-navy dark:text-accent">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
    </div>
  );

  const PaperCard = ({ paper, onRemove, isBookmark = false }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1 cursor-pointer hover:text-navy" onClick={() => window.location.href = `/research/${isBookmark ? paper.research._id : paper._id}`}>
            {isBookmark ? paper.research.title : paper.title}
          </h3>
          {!isBookmark && (
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(paper.status)}`}>
              {paper.status?.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {isBookmark ? paper.research.abstract : paper.abstract}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(paper.createdAt).toLocaleDateString()}</span>
            {!isBookmark && paper.status === 'approved' && (
              <span className="flex items-center gap-1"><Eye size={12} />{paper.views || 0}</span>
            )}
          </div>
          {isBookmark && (
            <button onClick={() => onRemove(paper._id, paper.research._id)} className="text-red-600 hover:text-red-700 text-xs font-semibold">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="space-y-4 animate-fade-in">
        <div className="bg-gradient-to-r from-navy to-accent text-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-blue-100 text-sm">Student Dashboard</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
          {[
            { id: 'overview', icon: BookOpen, label: 'Overview' },
            { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
            { id: 'activity', icon: Activity, label: 'Activity' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Upload} label="My Submissions" value={stats.submissions} color="bg-blue-600" onClick={() => setActiveTab('overview')} />
              <StatCard icon={Bookmark} label="Bookmarked" value={stats.bookmarks} color="bg-purple-600" onClick={() => setActiveTab('bookmarks')} />
              <StatCard icon={Eye} label="Total Views" value={stats.views} color="bg-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setShowSubmitModal(true)} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition text-left group">
                <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Upload className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Submit Research</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload your research paper</p>
              </button>

              <button onClick={() => window.location.href = '/browse'} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition text-left group">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Browse Papers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explore the repository</p>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Submissions ({filteredSubmissions.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><Grid size={16} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><List size={16} /></button>
                </div>
              </div>
              <div className="p-4">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search submissions..." className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-sm" />
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Upload size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No submissions yet</p>
                  </div>
                ) : (
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}`}>
                    {filteredSubmissions.map(p => <PaperCard key={p._id} paper={p} />)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bookmark size={20} className="text-purple-600" />
                Bookmarked Papers ({filteredBookmarks.length})
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><Grid size={16} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}><List size={16} /></button>
              </div>
            </div>
            <div className="p-4">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmarks..." className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-sm" />
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No bookmarks yet</p>
                  <button onClick={() => window.location.href = '/browse'} className="mt-3 text-navy hover:underline text-sm font-semibold">
                    Browse Papers
                  </button>
                </div>
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}`}>
                  {filteredBookmarks.map(b => <PaperCard key={b._id} paper={b} isBookmark onRemove={handleRemoveBookmark} />)}
                </div>
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