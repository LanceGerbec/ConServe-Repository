// client/src/components/common/NotificationConfirmModal.jsx
import { X, AlertTriangle, Trash2, CheckCheck } from 'lucide-react';

const NotificationConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
  if (!isOpen) return null;

  const config = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
      buttonText: 'Clear'
    },
    delete: {
      icon: Trash2,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonText: 'Delete'
    },
    markRead: {
      icon: CheckCheck,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'Mark Read'
    }
  };

  const { icon: Icon, iconBg, iconColor, buttonBg, buttonText } = config[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
              <Icon size={18} className={iconColor} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 ${buttonBg} text-white rounded-xl font-semibold text-sm transition shadow-md`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationConfirmModal;