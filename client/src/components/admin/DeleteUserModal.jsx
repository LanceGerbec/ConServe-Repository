// client/src/components/admin/DeleteUserModal.jsx
import { X, AlertTriangle, User, Mail, IdCard, Shield, FileText, Trash2 } from 'lucide-react';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, user, loading = false }) => {
  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'admin';
  const hasSubmissions = user.submittedPapers > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Delete User?</h3>
              <p className="text-sm text-red-100">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* User Details Card */}
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-xs font-bold text-red-800 dark:text-red-400 mb-3">
              ⚠️ You are about to delete:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-900 dark:text-red-300">
                <User size={16} className="flex-shrink-0" />
                <span className="font-semibold">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-900 dark:text-red-300">
                <Mail size={16} className="flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-900 dark:text-red-300">
                <IdCard size={16} className="flex-shrink-0" />
                <span className="font-mono">{user.studentId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-900 dark:text-red-300">
                <Shield size={16} className="flex-shrink-0" />
                <span className="capitalize font-semibold">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Admin Warning */}
          {isAdmin && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-lg">
              <p className="text-xs font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                <Shield size={14} />
                Cannot delete admin accounts
              </p>
            </div>
          )}

          {/* Submissions Warning */}
          {hasSubmissions && !isAdmin && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-2 mb-1">
                <FileText size={14} />
                User has {user.submittedPapers} submitted paper{user.submittedPapers > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500">
                Papers will remain but author link will be removed
              </p>
            </div>
          )}

          {/* ID Revert Info */}
          {!isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-400">
                ℹ️ {user.role === 'faculty' ? 'Faculty' : 'Student'} ID <strong>{user.studentId}</strong> will be reverted to unused
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || isAdmin}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;