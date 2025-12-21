import { X, AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'success', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      borderColor: 'border-red-500'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      borderColor: 'border-green-500'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      borderColor: 'border-yellow-500'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      borderColor: 'border-blue-500'
    }
  };

  const style = typeStyles[type];
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-gray-200 dark:border-gray-700">
        {/* Header with Icon */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
              <IconComponent className={style.iconColor} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg ${style.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;