// client/src/components/common/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const cleanMessage = message
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[✓✔✗✘❌⚠️ℹ️📧📋🔒🎉⏰💻🛠️🔍⚙️📊🔑📬📄👤🆕]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const colors = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-yellow-600 border-yellow-500',
    info: 'bg-blue-600 border-blue-500'
  };

  return (
    <div className={`fixed top-6 right-6 z-[200] ${colors[type]} text-white px-6 py-3.5 rounded-xl shadow-2xl border-2 min-w-[280px] max-w-md animate-slide-up`}>
      <p className="font-semibold text-sm text-center">{cleanMessage}</p>
    </div>
  );
};

export default Toast;