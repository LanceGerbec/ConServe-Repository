import { useState } from 'react';
import { X, Lock, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';

const PasswordConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, description, loading }) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!password.trim()) { setErr('Password is required'); return; }
    setErr('');
    const result = await onConfirm(password, reason);
    if (result?.error) { setErr(result.error); return; }
    setPassword(''); setReason('');
  };

  const handleClose = () => {
    setPassword(''); setReason(''); setErr(''); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 animate-scale-in">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title || 'Confirm Delete'}</h3>
                <p className="text-red-100 text-xs mt-0.5">This action requires verification</p>
              </div>
            </div>
            <button onClick={handleClose} disabled={loading} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {description && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-lg text-sm text-red-800 dark:text-red-300">
              {description}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
              <Lock size={12} /> Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Policy violation, duplicate account..."
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
              <Lock size={12} /> Your Admin Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErr(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your password to confirm"
                className="w-full px-3 py-2.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:border-red-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && <p className="text-xs text-red-600 mt-1 font-semibold">{err}</p>}
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-3 text-xs text-orange-800 dark:text-orange-300">
            <strong>Note:</strong> User will be moved to recycle bin and auto-deleted after 30 days if not restored.
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading || !password} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmDeleteModal;