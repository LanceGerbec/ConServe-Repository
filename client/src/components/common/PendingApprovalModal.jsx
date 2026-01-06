import { Clock, Mail, X, HelpCircle } from 'lucide-react';

const PendingApprovalModal = ({ isOpen, onClose, userEmail }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-yellow-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Clock size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Account Pending</h3>
              <p className="text-sm text-white/90">Awaiting Admin Approval</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⏳ Your registration was successful, but admin approval is required before you can login.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Check Your Email
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You'll receive a confirmation email at <strong>{userEmail}</strong> once approved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Clock size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Approval Time
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Usually within <strong>24-48 hours</strong> during business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <HelpCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Need Help?
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Contact support at <strong>conserve2025@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-navy hover:bg-navy-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalModal;