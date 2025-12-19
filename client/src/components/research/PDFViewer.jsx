import { X, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const PDFViewer = ({ signedPdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [iframeError, setIframeError] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const fullPdfUrl = `${API_BASE}${signedPdfUrl}`;

  console.log('🔗 PDF Viewer:', { signedPdfUrl, fullPdfUrl });

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey && ['s', 'p', 'S', 'P'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
      {/* Enhanced Watermark */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/8 font-bold whitespace-nowrap"
            style={{
              top: `${(i * 7) % 95}%`,
              left: `${(i * 13) % 95}%`,
              transform: 'rotate(-45deg)',
              fontSize: `${18 + (i % 4) * 4}px`,
            }}
          >
            {user?.email} • {new Date().toLocaleString()}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40 border-b-2 border-red-600">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="text-white flex-shrink-0" size={24} />
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold truncate">{paperTitle}</h3>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex-shrink-0 ml-4"
        >
          <X size={20} />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {(error || iframeError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
              <h3 className="text-white text-xl font-bold mb-2">Failed to Load PDF</h3>
              <p className="text-gray-400 mb-4">
                {error || 'The PDF could not be loaded. The link may have expired or the file is unavailable.'}
              </p>
              <div className="space-y-3">
                
                <a href={fullPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Try Opening in New Tab
                </a>
                <button 
                  onClick={onClose}
                  className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        <iframe
          src={fullPdfUrl}
          className="w-full h-full border-0"
          title={paperTitle}
          allow="fullscreen"
          onError={() => {
            console.error('❌ Iframe failed to load');
            setIframeError(true);
            setError('PDF failed to load');
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-red-600 px-6 py-3 text-center z-40 border-t-2 border-red-700">
        <p className="text-white text-sm font-bold">
          🔒 PROTECTED DOCUMENT • All views are logged and tracked • Link expires in 1 hour
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;