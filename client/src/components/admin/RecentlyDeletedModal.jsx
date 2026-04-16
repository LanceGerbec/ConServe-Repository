// client/src/components/admin/RecentlyDeletedModal.jsx
import { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, Clock, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

const RecentlyDeletedModal = ({ isOpen, onClose, onRestored }) => {
  const [deletedPapers, setDeletedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [purging, setPurging] = useState(null);
  const [toast, setToast] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { if (isOpen) fetchDeleted(); }, [isOpen]);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/recently-deleted`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setDeletedPapers(d.papers || []); }
    } catch { showToast('Failed to load deleted papers', 'error'); }
    finally { setLoading(false); }
  };

  const handleRestore = async (paperId, title) => {
    setRestoring(paperId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}/restore`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        showToast(`✅ "${title.slice(0, 40)}..." restored`);
        setDeletedPapers(prev => prev.filter(p => p._id !== paperId));
        onRestored?.();
      } else { const d = await res.json(); showToast(d.error || 'Restore failed', 'error'); }
    } catch { showToast('Restore failed', 'error'); }
    finally { setRestoring(null); }
  };

  const handlePurge = async (paperId) => {
    if (!confirm('Permanently delete this paper? This CANNOT be undone.')) return;
    setPurging(paperId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}/purge`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { showToast('Permanently deleted'); setDeletedPapers(prev => prev.filter(p => p._id !== paperId)); }
      else { const d = await res.json(); showToast(d.error || 'Failed', 'error'); }
    } catch { showToast('Failed', 'error'); }
    finally { setPurging(null); }
  };

  const getDaysLeft = (deletedAt) => {
    const daysElapsed = Math.floor((Date.now() - new Date(deletedAt)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysElapsed);
  };

  const getDaysColor = (days) => days <= 3 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : days <= 7 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center"><Trash2 size={22} className="text-white" /></div>
            <div>
              <h2 className="text-lg font-bold text-white">Recently Deleted Papers</h2>
              <p className="text-orange-100 text-xs">Auto-purged after 30 days · {deletedPapers.length} paper{deletedPapers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDeleted} className="p-2 hover:bg-white/20 rounded-lg transition" title="Refresh"><RefreshCw size={16} className="text-white" /></button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={18} className="text-white" /></button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-5 mt-3 flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Info banner */}
        <div className="mx-5 mt-3 flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">Deleted papers are kept for <strong>30 days</strong> then permanently removed. Restore anytime before expiry.</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" /></div>
          ) : deletedPapers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={28} className="text-gray-400" /></div>
              <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">No deleted papers</p>
              <p className="text-sm text-gray-500">Deleted papers will appear here for 30 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedPapers.map(paper => {
                const daysLeft = getDaysLeft(paper.deletedAt);
                const daysColor = getDaysColor(daysLeft);
                return (
                  <div key={paper._id} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">{paper.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                          <span>{paper.authors?.join(', ')}</span>
                          <span>•</span>
                          <span>{paper.category}</span>
                          <span>•</span>
                          <span>Deleted {new Date(paper.deletedAt).toLocaleDateString()}</span>
                          {paper.deletedByName && <><span>•</span><span>by {paper.deletedByName}</span></>}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${daysColor}`}>
                          <Clock size={10} />{daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRestore(paper._id, paper.title)}
                          disabled={restoring === paper._id || purging === paper._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition"
                        >
                          {restoring === paper._id ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw size={13} />}
                          Restore
                        </button>
                        <button
                          onClick={() => handlePurge(paper._id)}
                          disabled={restoring === paper._id || purging === paper._id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition"
                        >
                          {purging === paper._id ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={13} />}
                          Purge
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="w-full py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentlyDeletedModal;