// client/src/components/dashboard/RETDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Eye, Award, Trash2, RefreshCw, Upload, BarChart3, Search, X, Lock, EyeOff, Loader2, AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsHub from '../analytics/AnalyticsHub';
import AdminReviewModal from '../admin/AdminReviewModal';
import AwardsModal from '../admin/AwardsModal';
import RecentlyDeletedModal from '../admin/RecentlyDeletedModal';
import SubmitResearch from '../research/SubmitResearch';
import Toast from '../common/Toast';

const API_URL = import.meta.env.VITE_API_URL;

// ── Password-confirm delete modal ──
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, paperTitle, loading }) => {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  if (!isOpen) return null;
  const submit = async () => {
    if (!pwd.trim()) { setErr('Password is required'); return; }
    setErr('');
    const res = await onConfirm(pwd);
    if (res?.error) { setErr(res.error); } else { setPwd(''); setShow(false); }
  };
  const close = () => { setPwd(''); setShow(false); setErr(''); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 animate-scale-in">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><AlertTriangle size={20} className="text-white" /></div>
            <div><p className="font-bold text-white">Delete Paper</p><p className="text-red-100 text-xs">Requires password confirmation</p></div>
          </div>
          <button onClick={close} disabled={loading} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={18} className="text-white" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-lg text-sm text-red-800 dark:text-red-300 line-clamp-2">"{paperTitle}"</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Paper will be moved to Recycle Bin and auto-purged after 30 days.</p>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><Lock size={11} />Your Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={pwd} onChange={e => { setPwd(e.target.value); setErr(''); }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Enter your password" autoFocus
                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white" />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && <p className="text-xs text-red-600 mt-1 font-semibold">{err}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={close} disabled={loading} className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm disabled:opacity-50">Cancel</button>
            <button onClick={submit} disabled={loading || !pwd} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Status badge ──
const StatusBadge = ({ status }) => {
  const cfg = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    revision: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${cfg[status] || cfg.pending}`}>{status}</span>;
};

// ── Paper Card ──
const PaperCard = ({ paper, onReview, onAwards, onDelete, onNavigate }) => {
  const isPending = paper.status === 'pending' || paper.status === 'revision';
  const isApproved = paper.status === 'approved';
  const handleCardClick = () => { if (isApproved) onNavigate(paper._id); else if (isPending) onReview(paper); };
  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md ${(isPending || isApproved) ? 'cursor-pointer hover:-translate-y-0.5' : ''}`} onClick={handleCardClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm mb-1 leading-snug line-clamp-2 ${(isPending || isApproved) ? 'group-hover:text-navy dark:group-hover:text-accent' : ''} text-gray-900 dark:text-white transition-colors`}>{paper.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{paper.submittedBy?.firstName} {paper.submittedBy?.lastName} • {paper.category} • {paper.yearCompleted} • <Eye size={10} className="inline" /> {paper.views || 0}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={paper.status} />
            {paper.awards?.length > 0 && <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full font-semibold border border-yellow-200"><Award size={10} /> {paper.awards.length} Award{paper.awards.length > 1 ? 's' : ''}</span>}
            {isPending && <span className="text-xs text-navy dark:text-accent font-semibold">Click to review →</span>}
            {isApproved && <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Click to view →</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isApproved && <button title="Manage Awards" onClick={e => { e.stopPropagation(); onAwards(paper); }} className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition text-yellow-600"><Award size={15} /></button>}
          <button title="Delete" onClick={e => { e.stopPropagation(); onDelete(paper); }} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-500"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ──
const Pagination = ({ page, total, perPage, onPage }) => {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronLeft size={14} /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} className={`min-w-[28px] px-1.5 py-1 rounded-lg font-bold text-xs transition ${page === p ? 'bg-navy text-white' : 'border hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'}`}>{p}</button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronRight size={14} /></button>
    </div>
  );
};

// ══════════════ MAIN ══════════════
const RETDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('papers');
  const [papers, setPapers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const [reviewPaper, setReviewPaper] = useState(null);
  const [awardsPaper, setAwardsPaper] = useState(null);
  const [deletePaper, setDeletePaper] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => setToast({ show: true, message: msg, type }), []);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research?limit=500`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setPapers(d.papers || []); }
    } catch { showToast('Failed to load papers', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const counts = {
    total: papers.length,
    pending: papers.filter(p => p.status === 'pending').length,
    approved: papers.filter(p => p.status === 'approved').length,
    rejected: papers.filter(p => p.status === 'rejected').length,
    revision: papers.filter(p => p.status === 'revision').length,
  };

  const filtered = papers.filter(p => {
    const matchStatus = filter === 'all' ? true : p.status === filter;
    const matchSearch = search ? p.title?.toLowerCase().includes(search.toLowerCase()) || `${p.submittedBy?.firstName} ${p.submittedBy?.lastName}`.toLowerCase().includes(search.toLowerCase()) : true;
    return matchStatus && matchSearch;
  });
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async (password) => {
    if (!deletePaper) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const vRes = await fetch(`${API_URL}/auth/verify-password`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!vRes.ok) { setDeleteLoading(false); return { error: 'Incorrect password' }; }
      const dRes = await fetch(`${API_URL}/research/${deletePaper._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (dRes.ok) { showToast('Paper moved to Recycle Bin'); setDeletePaper(null); fetchPapers(); }
      else { return { error: 'Delete failed' }; }
    } catch { return { error: 'Connection error' }; }
    finally { setDeleteLoading(false); }
  };

  const FILTERS = [
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
    { key: 'revision', label: 'Revision', count: counts.revision },
    { key: 'all', label: 'All', count: counts.total },
  ];

  const STATS = [
    { icon: FileText, label: 'Total Papers', value: counts.total, color: 'bg-blue-500' },
    { icon: Clock, label: 'Pending Review', value: counts.pending, color: 'bg-yellow-500' },
    { icon: CheckCircle, label: 'Approved', value: counts.approved, color: 'bg-green-500' },
    { icon: XCircle, label: 'Rejected', value: counts.rejected, color: 'bg-red-500' },
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      {reviewPaper && <AdminReviewModal paper={reviewPaper} onClose={() => setReviewPaper(null)} onSuccess={() => { setReviewPaper(null); fetchPapers(); showToast('Review submitted'); }} />}
      {awardsPaper && <AwardsModal paper={awardsPaper} onClose={() => setAwardsPaper(null)} onSuccess={() => { fetchPapers(); showToast('Awards updated'); }} />}
      <DeleteConfirmModal isOpen={!!deletePaper} paperTitle={deletePaper?.title || ''} loading={deleteLoading} onClose={() => setDeletePaper(null)} onConfirm={handleDelete} />
      <RecentlyDeletedModal isOpen={showRecycleBin} onClose={() => setShowRecycleBin(false)} onRestored={() => { fetchPapers(); showToast('Paper restored'); }} />
      {showSubmit && <SubmitResearch onClose={() => setShowSubmit(false)} onSuccess={() => { setShowSubmit(false); fetchPapers(); showToast('Paper submitted'); }} />}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 px-4 sm:px-6 py-5 mb-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><FileText size={22} className="text-white" /></div>
              <div><h1 className="text-lg font-bold text-white">RET Department</h1><p className="text-teal-100 text-xs">Research, Extension &amp; Training • RET Department</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRecycleBin(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-sm font-semibold transition"><Trash2 size={15} /> Recycle Bin</button>
              <button onClick={() => setShowSubmit(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition shadow-md"><Upload size={15} /> Submit Paper</button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}><Icon size={18} className="text-white" /></div>
                  <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {[{ id: 'papers', label: 'Paper Management', icon: FileText }, { id: 'analytics', label: 'Analytics', icon: BarChart3 }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${tab === t.id ? 'bg-navy text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'analytics' && <AnalyticsHub />}

          {tab === 'papers' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={17} className="text-teal-600" />All Papers ({filtered.length})</h2>
                  <button onClick={fetchPapers} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Refresh"><RefreshCw size={15} className="text-gray-500" /></button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide">
                  {FILTERS.map(f => (
                    <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap text-xs transition ${filter === f.key ? 'bg-navy text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                      {f.label}<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>{f.count}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title or author..." className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-white focus:border-navy focus:outline-none" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
                </div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>
                ) : paginated.length === 0 ? (
                  <div className="text-center py-12"><FileText size={36} className="mx-auto text-gray-300 mb-2" /><p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No papers found</p>{filter === 'pending' && <p className="text-xs text-gray-400 mt-1">No papers pending review</p>}</div>
                ) : (
                  <div className="space-y-3">
                    {paginated.map(p => <PaperCard key={p._id} paper={p} onReview={setReviewPaper} onAwards={setAwardsPaper} onDelete={setDeletePaper} onNavigate={id => navigate(`/research/${id}`)} />)}
                  </div>
                )}
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RETDashboard;