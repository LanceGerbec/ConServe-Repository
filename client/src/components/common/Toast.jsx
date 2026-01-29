import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const cleanMessage = message.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[✓✔✗✘❌⚠️ℹ️📧📋🔒🎉⏰💻🛠️🔍⚙️📊🔑📬📄👤🆕]/g, '').replace(/\s+/g, ' ').trim();

  const config = {
    success: { Icon: CheckCircle, bg: 'bg-green-600', border: 'border-green-500' },
    error: { Icon: XCircle, bg: 'bg-red-600', border: 'border-red-500' },
    warning: { Icon: AlertTriangle, bg: 'bg-yellow-600', border: 'border-yellow-500' },
    info: { Icon: Info, bg: 'bg-blue-600', border: 'border-blue-500' }
  };

  const { Icon, bg, border } = config[type];

  return (
    <div className={`fixed top-6 right-6 z-[200] ${bg} text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md animate-slide-up border-2 ${border}`}>
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 font-medium text-sm leading-tight">{cleanMessage}</p>
    </div>
  );
};

export default Toast;