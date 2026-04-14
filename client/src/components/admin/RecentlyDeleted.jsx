// client/src/components/admin/RecentlyDeleted.jsx
import { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw, Clock, AlertTriangle, X, RotateCcw } from 'lucide-react';
import Toast from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;

const getDaysLeft = (deletedAt) => {
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const RecentlyDeleted = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, paperId: null });
  const [restoring, setRestoring] = useState(null);

  const showToast = useCallback((msg, type = 'success') => setToast({ show: true, message: msg, type }), []);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/recently-deleted`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch { showToast('Failed to load recently deleted', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  const handleRestore = async (paperId) => {
    setRestoring(paperId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}/restore`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { showToast('Paper restored successfully'); fetchDeleted(); }
      else { const d = await res.json(); showToast(d.error || 'Failed to restore', 'error'); }
    } catch { showToast('Connection error', 'error'); }
    finally { setRestoring(null); }
  };

  const handlePermanentDelete = async (paperId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${paperId}/permanent`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { showToast('Permanently deleted'); fetchDeleted(); }
      else { const d = await res.json(); showToast(d.error || 'Failed', 'error'); }
    } catch { showToast('Connection error', 'error'); }
    finally { setConfirmModal({ isOpen: false, paperId: null }); }
  };

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, paperId: null })}
        onConfirm={() => handlePermanentDelete(confirmModal.paperId)}
        title="Permanently Delete?"
        message="This will permanently delete the paper and its PDF. This CANNOT be undone."
        confirmText="Delete Forever"
        type="danger"
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" />
            Recently Deleted ({papers.length})
          </h2>
          <button onClick={fetchDeleted} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Refresh">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Papers are automatically deleted after 30 days</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Restore within the countdown period to recover. Original PDF and data are preserved.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent" /></div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Trash2 size={40} className="mx-auto text-gray-300 mb-3 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No recently deleted papers</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Deleted papers will appear here for 30 days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => {
              const daysLeft = getDaysLeft(paper.deletedAt);
              const isUrgent = daysLeft <= 3;
              return (
                <div key={paper._id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 shadow-sm ${isUrgent ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} transition-all`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{paper.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                          <Clock size={10} className="inline mr-1" />{daysLeft}d left
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">By: {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Deleted: {new Date(paper.deletedAt).toLocaleDateString()} by {paper.deletedBy?.firstName} {paper.deletedBy?.lastName}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleRestore(paper._id)} disabled={restoring === paper._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-sm">
                        {restoring === paper._id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw size={13} />}
                        Restore
                      </button>
                      <button onClick={() => setConfirmModal({ isOpen: true, paperId: paper._id })}
                        className="flex items-center gap-1 px-2 py-1.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  {isUrgent && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-1">
                        <AlertTriangle size={11} />Expiring soon — restore before it's permanently deleted
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default RecentlyDeleted;