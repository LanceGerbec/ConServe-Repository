import { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, Clock, User, AlertTriangle, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import PasswordConfirmDeleteModal from './PasswordConfirmDeleteModal';

const API_URL = import.meta.env.VITE_API_URL;

const RecentlyDeletedUsersModal = ({ isOpen, onClose, onRestored }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPermDelete, setShowPermDelete] = useState(null); // DeletedUser doc

  useEffect(() => { if (isOpen) fetchDeleted(); }, [isOpen]);

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deleted-users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleRestore = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deleted-users/restore/${id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { fetchDeleted(); onRestored?.(); }
    } catch { }
    finally { setActionLoading(false); }
  };

  const handlePermDelete = async (password) => {
    if (!showPermDelete) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/deleted-users/permanent/${showPermDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) { setActionLoading(false); return { error: data.error }; }
      setShowPermDelete(null);
      fetchDeleted();
    } catch { return { error: 'Connection error' }; }
    finally { setActionLoading(false); }
  };

  const daysLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const roleColor = (role) => role === 'faculty'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border-2 border-gray-200 dark:border-gray-700 animate-scale-in">

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <RotateCcw size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recently Deleted Users</h2>
                <p className="text-orange-100 text-xs">Auto-deleted after 30 days • {users.length} user{users.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchDeleted} disabled={loading} className="p-2 hover:bg-white/20 rounded-lg transition">
                <RefreshCw size={16} className={`text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mx-4 mt-4 flex-shrink-0 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl text-xs text-orange-800 dark:text-orange-300">
            <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
            <span>Deleted users are kept for <strong>30 days</strong> before permanent removal. Restore anytime within this window.</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <RotateCcw size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No recently deleted users</p>
                <p className="text-xs text-gray-400 mt-1">Deleted users will appear here for 30 days</p>
              </div>
            ) : (
              users.map(u => {
                const days = daysLeft(u.expiresAt);
                const urgent = days <= 3;
                return (
                  <div key={u._id} className={`bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-2 transition ${urgent ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.studentId}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleColor(u.role)}`}>{u.role}</span>
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${urgent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                              <Clock size={10} />{days}d left
                            </span>
                            {u.reason && <span className="text-xs text-gray-400 italic truncate max-w-[120px]">"{u.reason}"</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Deleted by: {u.deletedBy?.firstName} {u.deletedBy?.lastName} · {new Date(u.deletedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleRestore(u._id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          <RotateCcw size={12} />Restore
                        </button>
                        <button
                          onClick={() => setShowPermDelete(u)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          <Trash2 size={12} />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button onClick={onClose} className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Close
            </button>
          </div>
        </div>
      </div>

      <PasswordConfirmDeleteModal
        isOpen={!!showPermDelete}
        onClose={() => setShowPermDelete(null)}
        onConfirm={handlePermDelete}
        title="Permanently Delete User"
        description={`This will permanently delete "${showPermDelete?.firstName} ${showPermDelete?.lastName}" and cannot be undone.`}
        loading={actionLoading}
      />
    </>
  );
};

export default RecentlyDeletedUsersModal;