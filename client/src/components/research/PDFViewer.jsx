import { X, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const PDFViewer = ({ signedPdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [iframeError, setIframeError] = useState(false);
  const [screenshotAttempt, setScreenshotAttempt] = useState(0);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const fullPdfUrl = `${API_BASE}${signedPdfUrl}`;

  const logViolation = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const researchId = signedPdfUrl.split('/')[3];
      
      await fetch(`${API_BASE}/research/log-violation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ researchId, violationType: type })
      });
    } catch (err) {
      console.error('Failed to log violation:', err);
    }
  };

  useEffect(() => {
    const preventContext = (e) => {
      e.preventDefault();
      e.stopPropagation();
      logViolation('right_click');
      alert('⚠️ Right-click is disabled. This document is protected.');
      return false;
    };

    const preventKeys = (e) => {
      if (
        (e.ctrlKey && ['s', 'p', 'S', 'P', 'u', 'U'].includes(e.key)) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))
      ) {
        e.preventDefault();
        setScreenshotAttempt(prev => prev + 1);
        logViolation('keyboard_shortcut');
        alert('🚫 This action is disabled. All attempts are logged.');
        return false;
      }
    };

    const detectScreenshot = () => {
      setScreenshotAttempt(prev => prev + 1);
      logViolation('screenshot_attempt');
    };

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') detectScreenshot();
    });
    window.addEventListener('blur', detectScreenshot);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
      window.removeEventListener('blur', detectScreenshot);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
      {/* Subtle Watermark */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/30 font-mono text-xs whitespace-nowrap"
            style={{
              top: `${(i * 10) % 90}%`,
              left: `${(i * 15) % 85}%`,
              transform: 'rotate(-30deg)',
            }}
          >
            {user?.email} • {new Date().toLocaleDateString()}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gray-900 px-6 py-3 flex items-center justify-between z-50 border-b border-gray-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="text-white flex-shrink-0" size={20} />
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm truncate">{paperTitle}</h3>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex-shrink-0 ml-4"
        >
          <X size={18} />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {(error || iframeError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-white text-lg font-bold mb-2">Failed to Load PDF</h3>
              <p className="text-gray-400 mb-4 text-sm">{error || 'Unable to display PDF'}</p>
              <button 
                onClick={onClose}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        <iframe
          src={fullPdfUrl}
          className="w-full h-full border-0"
          title={paperTitle}
          sandbox="allow-same-origin allow-scripts"
          onError={() => {
            setIframeError(true);
            setError('PDF failed to load');
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-red-600 px-6 py-2 text-center z-50 border-t border-red-700">
        <p className="text-white text-xs font-semibold">
          🔒 PROTECTED • Download/Print Disabled • Screenshot Detection Active • Link Expires in 1 Hour
          {screenshotAttempt > 0 && ` • ${screenshotAttempt} Violation(s) Logged`}
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;