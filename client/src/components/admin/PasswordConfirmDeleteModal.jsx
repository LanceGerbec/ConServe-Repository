// client/src/components/admin/PasswordConfirmDeleteModal.jsx
import { useState } from 'react';
import { X, AlertTriangle, Trash2, Eye, EyeOff, Lock, Shield } from 'lucide-react';

const PasswordConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message = 'This action cannot be undone.', itemCount = 1, loading = false }) => {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password.trim()) { setError('Password is required'); return; }
    setError('');
    const result = await onConfirm(password);
    if (result?.error) { setError(result.error); setPassword(''); }
  };

  const handleClose = () => { setPassword(''); setError(''); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-red-100 text-xs">Password verification required</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={loading} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800 dark:text-red-300">⚠️ Permanent Action</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{message}</p>
              {itemCount > 1 && <p className="text-xs font-bold text-red-800 dark:text-red-300 mt-1">Deleting {itemCount} item{itemCount > 1 ? 's' : ''}.</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Lock size={14} /> Enter your admin password to confirm
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                placeholder="Your password..."
                autoFocus
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-xl text-sm focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-red-500'}`}
              />
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading || !password.trim()} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</> : <><Trash2 size={15} />Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmDeleteModal;