// client/src/components/admin/CleanOrphanedModal.jsx
import { X, RefreshCw, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const CleanOrphanedModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'student', // 'student' or 'faculty'
  loading = false,
  orphanedCount = 0
}) => {
  if (!isOpen) return null;

  const typeLabel = type === 'student' ? 'Student' : 'Faculty';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-orange-500 animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {loading ? (
                <RefreshCw size={32} className="text-white animate-spin" />
              ) : (
                <AlertCircle size={32} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Clean Orphaned IDs</h3>
              <p className="text-sm text-orange-100">
                {typeLabel} ID Management
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
              <AlertCircle size={14} />
              What are orphaned IDs?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-500 leading-relaxed">
              Orphaned IDs are marked as "used" but linked to deleted user accounts. 
              Cleaning will mark them as unused so they can be registered again.
            </p>
          </div>

          {/* Status */}
          {orphanedCount > 0 ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-lg">
              <p className="text-sm font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                <Trash2 size={16} />
                Found {orphanedCount} orphaned {typeLabel} ID{orphanedCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">
                These IDs will be reverted to unused status
              </p>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-sm font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                <CheckCircle size={16} />
                No orphaned IDs found
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                All used IDs are properly linked to active accounts
              </p>
            </div>
          )}

          {/* What will happen */}
          {orphanedCount > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-300 mb-2">
                What will happen:
              </p>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Mark {orphanedCount} ID{orphanedCount > 1 ? 's' : ''} as unused</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Remove deleted user references</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>IDs become available for new registrations</span>
                </li>
              </ul>
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
              disabled={loading || orphanedCount === 0}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Clean {orphanedCount} ID{orphanedCount > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanOrphanedModal;