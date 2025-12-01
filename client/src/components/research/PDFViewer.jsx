import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Download, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div className="transform -rotate-45 text-white/10 text-4xl font-bold whitespace-nowrap select-none">
          {user?.email} • {new Date().toLocaleString()} • ConServe
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold line-clamp-1">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">Protected Document</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="absolute inset-0 top-16 flex items-center justify-center p-4">
        {loading && (
          <div className="text-white flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p>Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="text-white text-center">
            <FileText size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">Failed to load PDF</p>
            <p className="text-gray-400 mb-4">There was an error loading the document</p>
            
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition"
            <a>
              Open in New Tab
            </a>
          </div>
        )}

        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full bg-white rounded-lg shadow-2xl"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          title={paperTitle}
        />
      </div>

      {/* Footer Warning */}
      <div className="absolute bottom-0 left-0 right-0 bg-red-900/90 p-3 text-center z-40">
        <p className="text-white text-sm font-semibold">
          ⚠️ This document is watermarked and protected. Unauthorized distribution is prohibited.
        </p>
      </div>

      {/* Disable right-click and selection */}
      <style>{`
        iframe { user-select: none; pointer-events: auto; }
        body { user-select: none; }
      `}</style>
    </div>
  );
};

export default PDFViewer;