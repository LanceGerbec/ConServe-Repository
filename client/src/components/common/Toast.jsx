// client/src/components/common/Toast.jsx
import { CheckCircle, X, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-600',
      border: 'border-green-600'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-600',
      border: 'border-red-600'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-600',
      border: 'border-yellow-600'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-600',
      border: 'border-blue-600'
    }
  };

  const style = styles[type];
  const IconComponent = style.icon;

  return (
    <div className={`fixed top-6 right-6 z-[200] ${style.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md animate-slide-up border-2 ${style.border}`}>
      <IconComponent size={24} className="flex-shrink-0" />
      <p className="flex-1 font-medium text-sm leading-tight">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;