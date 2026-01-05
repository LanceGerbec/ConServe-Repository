import { AlertTriangle, X } from 'lucide-react';

const ErrorModal = ({ isOpen, onClose, title = "Registration Error", errors = [] }) => {
  if (!isOpen) return null;

  const errorList = Array.isArray(errors) ? errors : [errors];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-red-500">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition">
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-2 mb-6">
            {errorList.map((error, idx) => (
              <div key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-red-500 font-bold">•</span>
                <p className="text-sm">{error}</p>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-lg">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;