// client/src/components/common/PasswordDeleteModal.jsx
import { useState } from 'react';
import { X, Trash2, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const PasswordDeleteModal = ({ isOpen, onClose, onConfirm, title = 'Delete Research Paper', message = 'This action cannot be undone.', itemName = '' }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onConfirm(password);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setPassword(''); setError(''); setShowPassword(false); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200 dark:border-red-800 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center"><Trash2 size={22} className="text-white" /></div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-xs text-red-100 mt-0.5">Confirm your identity to proceed</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X size={18} className="text-white" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Warning: This will move the paper to Recently Deleted</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{message}</p>
            </div>
          </div>

          {/* Item name */}
          {itemName && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Paper to delete:</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{itemName}</p>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <Lock size={14} className="inline mr-1" />Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder="Your account password"
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-xl focus:outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-red-500'}`}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading || !password.trim()}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
              {loading ? 'Verifying...' : 'Delete Paper'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordDeleteModal;