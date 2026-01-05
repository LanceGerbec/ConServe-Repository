import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, title, message, actionText = "Go to Login", onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-green-500">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition">
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CheckCircle size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{message}</p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📧 <strong>Check your email</strong> for updates on your account approval status.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Close
            </button>
            <button onClick={onAction} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition shadow-lg">
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;