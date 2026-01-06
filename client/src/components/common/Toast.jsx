// client/src/components/common/Toast.jsx
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Remove ALL emojis and informal characters from message
  const cleanMessage = message
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emoticons
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[✓✔✗✘❌⚠️ℹ️]/g, '')          // Common symbols
    .replace(/\s+/g, ' ')                    // Multiple spaces to single
    .trim();

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
      <IconComponent size={22} className="flex-shrink-0" />
      <p className="flex-1 font-medium text-sm leading-tight">{cleanMessage}</p>
    </div>
  );
};

export default Toast;