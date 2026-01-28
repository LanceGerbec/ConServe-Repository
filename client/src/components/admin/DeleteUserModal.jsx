import { X, AlertTriangle, Trash2, User } from 'lucide-react';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full border-2 border-red-500">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-white">Delete User?</h3>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
            <p className="text-xs font-bold text-red-800 dark:text-red-400 mb-2">⚠️ Deleting:</p>
            <div className="space-y-1 text-xs text-red-700 dark:text-red-300">
              <div className="font-bold">{user.firstName} {user.lastName}</div>
              <div className="flex items-center gap-1">
                <User size={12} /> {user.email}
              </div>
              <div className="font-mono">ID: {user.studentId}</div>
            </div>
          </div>
          
          {user.isUsed && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded">
              <p className="text-xs font-bold text-orange-800 dark:text-orange-400">🔗 This ID is currently registered</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border-2 rounded-lg font-bold text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-sm"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;