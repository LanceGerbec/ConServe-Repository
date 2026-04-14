// client/src/components/dashboard/RETDashboard.jsx
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { FileText, CheckCircle, XCircle, FileEdit, Eye, Search, X, Shield, Activity, BarChart3, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminReviewModal from '../admin/AdminReviewModal';
import AnalyticsHub from '../analytics/AnalyticsHub';
import Toast from '../common/Toast';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = memo(({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon className="text-white" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{value}</div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</p>
      </div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

const PaperCard = memo(({ paper, onReview }) => (
  <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 text-sm">{paper.title}</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
    <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-3">{paper.abstract}</p>
    <div className="flex items-center justify-between">
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        paper.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
        paper.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
        paper.status === 'revision' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      }`}>{paper.status?.toUpperCase()}</span>
      <button onClick={() => onReview(paper)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold transition shadow-sm">
        <Eye size={14} />Review
      </button>
    </div>
  </div>
));
PaperCard.displayName = 'PaperCard';

const Pagination = memo(({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  if (totalItems === 0) return null;
  return (
    <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs text-gray-500">Showing {start}–{end} of {totalItems}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <ChevronLeft size={14} />
        </button>
        <span className="px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-300">{currentPage}/{totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
});
Pagination.displayName = 'Pagination';

const RETDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const showToast = useCallback((msg, type = 'success') => setToast({ show: true, message: msg, type }), []);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await fetch(`${API_URL}/research?limit=1000${statusParam}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch { showToast('Failed to load papers', 'error'); }
    finally { setLoading(false); }
  }, [activeTab, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { fetchPapers(); setPage(1); }, [fetchPapers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const filtered = useMemo(() =>
    papers.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.submittedBy?.firstName?.toLowerCase().includes(search.toLowerCase())),
    [papers, search]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleReview = useCallback((paper) => { setSelectedPaper(paper); setShowReviewModal(true); }, []);

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock, badge: stats.pending, color: 'text-yellow-600' },
    { id: 'approved', label: 'Approved', icon: CheckCircle, badge: stats.approved, color: 'text-green-600' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, badge: stats.rejected, color: 'text-red-600' },
    { id: 'all', label: 'All Papers', icon: FileText, badge: stats.total, color: 'text-blue-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600' },
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 p-4 sm:p-6 mb-4 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="hidden sm:block flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <Shield size={28} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-100 mb-0.5">Welcome,</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{user?.firstName} {user?.lastName}</h1>
              <p className="text-xs text-emerald-200 font-medium">RET Department — Research, Extension & Training</p>
              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-100"><Clock size={12} className="text-yellow-300" /><span className="font-bold text-white">{stats.pending}</span> Pending</span>
                <span className="w-px h-3 bg-emerald-400/30" />
                <span className="flex items-center gap-1.5 text-emerald-100"><CheckCircle size={12} className="text-green-300" /><span className="font-bold text-white">{stats.approved}</span> Approved</span>
                <span className="w-px h-3 bg-emerald-400/30" />
                <span className="flex items-center gap-1.5 text-emerald-100"><FileText size={12} className="text-blue-300" /><span className="font-bold text-white">{stats.total}</span> Total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 mb-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
            <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-gradient-to-br from-green-500 to-green-600" />
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-gradient-to-br from-red-500 to-red-600" />
            <StatCard icon={FileText} label="Total Papers" value={stats.total} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap text-sm transition-all ${activeTab === tab.id ? 'bg-emerald-700 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-md'}`}>
                <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : tab.color} />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' ? (
            <AnalyticsHub />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText size={18} className="text-emerald-600" />
                    {tabs.find(t => t.id === activeTab)?.label} ({filtered.length})
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by title or author..." className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-emerald-500 focus:outline-none dark:bg-gray-900 dark:text-white" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
                </div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" /></div>
                ) : paginated.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{search ? 'No papers match your search' : `No ${activeTab} papers`}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {paginated.map(paper => <PaperCard key={paper._id} paper={paper} onReview={handleReview} />)}
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewModal && selectedPaper && (
        <AdminReviewModal
          paper={selectedPaper}
          onClose={() => { setShowReviewModal(false); setSelectedPaper(null); }}
          onSuccess={() => { fetchPapers(); fetchStats(); setShowReviewModal(false); setSelectedPaper(null); showToast('Review submitted successfully'); }}
        />
      )}
    </>
  );
};

export default RETDashboard;