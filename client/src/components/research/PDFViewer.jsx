// client/src/components/research/PDFViewer.jsx
import { useState, useEffect } from 'react';
import { X, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewerMethod, setViewerMethod] = useState('google');

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    const disableScreenshot = (e) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.key === 'p')) {
        e.preventDefault();
        alert('This action is disabled for security reasons');
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableScreenshot);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableScreenshot);
    };
  }, []);

  const viewers = {
    google: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`,
    mozilla: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`,
    iframe: `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 text-4xl font-bold rotate-[-45deg] whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()} • ConServe
        </div>
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center justify-center text-white/5 text-xl font-bold rotate-[-45deg]">
              {user?.email}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold line-clamp-1">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">Protected Document • Viewing as: {user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition">
            <ExternalLink size={18} />
          </a>
          <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 relative overflow-hidden bg-gray-800">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-lg">Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-30 p-8">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Failed to Load PDF</h3>
            <div className="flex flex-col gap-3 w-full max-w-md">
              <button onClick={() => { setViewerMethod('google'); setError(false); setLoading(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Try Google Docs Viewer
              </button>
              <button onClick={() => { setViewerMethod('mozilla'); setError(false); setLoading(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                Try Mozilla PDF Viewer
              </button>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-800">
                <ExternalLink size={18} />
                Open in New Tab
              </a>
              <button onClick={onClose} className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                Close
              </button>
            </div>
          </div>
        )}

        <iframe
          key={viewerMethod}
          src={viewers[viewerMethod]}
          className="w-full h-full border-0"
          onLoad={() => { setLoading(false); setError(false); }}
          onError={() => { setLoading(false); setError(true); }}
          title={paperTitle}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>

      {/* Footer */}
      <div className="bg-red-900/90 px-6 py-3 text-center z-40 border-t border-red-800">
        <p className="text-white text-sm font-semibold flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          ⚠️ Protected Document - Watermarked • Unauthorized Distribution Prohibited
        </p>
      </div>

      <style>{`
        body { user-select: none !important; }
        * { user-select: none !important; }
      `}</style>
    </div>
  );
};

export default PDFViewer;