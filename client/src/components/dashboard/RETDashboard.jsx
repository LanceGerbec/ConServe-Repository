import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle, XCircle, Clock, Award, BarChart3, Upload,
  Eye, Trash2, Search, RefreshCw, Shield, TrendingUp, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminReviewModal from '../admin/AdminReviewModal';
import AwardsModal from '../admin/AwardsModal';
import AnalyticsHub from '../analytics/AnalyticsHub';
import SubmitResearch from '../research/SubmitResearch';
import Toast from '../common/Toast';
import RecentlyDeletedModal from '../admin/RecentlyDeletedModal';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-black text-gray-900 dark:text-white">{value ?? 0}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || map.pending}`}>
      {status?.toUpperCase()}
    </span>
  );
};

const RETDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('papers');
  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showAwards, setShowAwards] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showMsg = (message, type = 'success') => setToast({ show: true, message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [sRes, pRes] = await Promise.all([
        fetch(`${API_URL}/research/stats`, { headers: h }),
        fetch(`${API_URL}/research?limit=500`, { headers: h }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (pRes.ok) { const d = await pRes.json(); setPapers(d.papers || []); }
    } catch { showMsg('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredPapers = papers.filter(p => {
    const byStatus = statusFilter === 'all' || p.status === statusFilter;
    const bySearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.authors?.join(' ').toLowerCase().includes(search.toLowerCase());
    return byStatus && bySearch;
  });

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Move "${title.slice(0, 50)}..." to Recently Deleted (recoverable for 30 days)?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { showMsg('Paper moved to Recently Deleted'); fetchData(); }
      else { const d = await res.json(); showMsg(d.error || 'Delete failed', 'error'); }
    } catch { showMsg('Connection error', 'error'); }
  };

  const tabs = [
    { id: 'papers', label: 'Paper Management', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const statCards = [
    { label: 'Total Papers', value: stats.total, color: 'bg-blue-500', icon: BookOpen },
    { label: 'Pending Review', value: stats.pending, color: 'bg-yellow-500', icon: Clock },
    { label: 'Approved', value: stats.approved, color: 'bg-green-500', icon: CheckCircle },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-500', icon: XCircle },
  ];

  const statusCounts = { pending: 0, approved: 0, rejected: 0, revision: 0 };
  papers.forEach(p => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++; });

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-blue-700 p-5 mb-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RET Department</h1>
                <p className="text-teal-200 text-xs">Research, Extension & Training • {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRecycleBin(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs transition border border-white/20">
                <Trash2 size={14} /> Recycle Bin
              </button>
              <button onClick={() => setShowSubmit(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-teal-700 rounded-xl font-bold text-sm hover:bg-teal-50 transition shadow">
                <Upload size={15} /> Submit Paper
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                  activeTab === t.id ? 'bg-navy dark:bg-teal-700 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow'
                }`}>
                <t.icon size={15} />{t.label}
              </button>
            ))}
          </div>

          {/* Papers Tab */}
          {activeTab === 'papers' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <FileText size={16} className="text-teal-600" />
                    All Papers ({filteredPapers.length})
                  </h3>
                  <button onClick={fetchData} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <RefreshCw size={15} className="text-gray-500" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: 'pending', label: `Pending (${statusCounts.pending})` },
                    { val: 'approved', label: `Approved (${statusCounts.approved})` },
                    { val: 'rejected', label: `Rejected (${statusCounts.rejected})` },
                    { val: 'revision', label: `Revision (${statusCounts.revision})` },
                    { val: 'all', label: `All (${papers.length})` },
                  ].map(s => (
                    <button key={s.val} onClick={() => setStatusFilter(s.val)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        statusFilter === s.val ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>{s.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:border-teal-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white" />
                </div>
              </div>

              {/* Paper List */}
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
              ) : filteredPapers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No papers found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPapers.map(p => (
                    <div key={p._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1.5 leading-snug">{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>{p.submittedBy?.firstName} {p.submittedBy?.lastName}</span>
                            {p.category && <><span>•</span><span>{p.category}</span></>}
                            {p.yearCompleted && <><span>•</span><span>{p.yearCompleted}</span></>}
                            <span className="flex items-center gap-0.5"><Eye size={9} />{p.views || 0}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={p.status} />
                            {p.awards?.length > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                                <Award size={9} />{p.awards.length} Award{p.awards.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => { setSelectedPaper(p); setShowReview(true); }}
                            title="Review / Manage Status"
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => { setSelectedPaper(p); setShowAwards(true); }}
                            title="Manage Awards"
                            className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 transition">
                            <Award size={14} />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.title)}
                            title="Delete (move to recycle bin)"
                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsHub />}
        </div>
      </div>

      {/* Modals */}
      {showReview && selectedPaper && (
        <AdminReviewModal paper={selectedPaper}
          onClose={() => { setShowReview(false); setSelectedPaper(null); }}
          onSuccess={() => { fetchData(); setShowReview(false); setSelectedPaper(null); showMsg('Review submitted successfully'); }} />
      )}
      {showAwards && selectedPaper && (
        <AwardsModal paper={selectedPaper}
          onClose={() => { setShowAwards(false); setSelectedPaper(null); }}
          onSuccess={() => { fetchData(); setShowAwards(false); setSelectedPaper(null); showMsg('Awards updated'); }} />
      )}
      {showSubmit && (
        <SubmitResearch onClose={() => setShowSubmit(false)}
          onSuccess={() => { setShowSubmit(false); fetchData(); showMsg('Paper submitted for review'); }} />
      )}
      <RecentlyDeletedModal isOpen={showRecycleBin} onClose={() => setShowRecycleBin(false)}
        onRestored={() => { fetchData(); showMsg('Paper restored successfully'); }} />
    </>
  );
};

export default RETDashboard;