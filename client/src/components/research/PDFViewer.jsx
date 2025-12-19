import { X, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  
  // CRITICAL: Build correct URL without double /api
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Remove /api prefix from pdfUrl if it exists, then rebuild
  const cleanPath = pdfUrl.replace(/^\/api/, '');
  const fullPdfUrl = `${API_BASE}${cleanPath}`;
  
  console.log('🔗 PDF URL:', fullPdfUrl);
  console.log('📍 API_BASE:', API_BASE);
  console.log('📄 Original pdfUrl:', pdfUrl);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-50 select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-white/10 text-3xl font-bold rotate-[-45deg] whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white/10 text-3xl font-bold rotate-[-45deg] whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()}
        </div>
        <div className="absolute top-3/4 left-1/2 -translate-x-1/2 text-white/10 text-3xl font-bold rotate-[-45deg] whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()}
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold line-clamp-1">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href={fullPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition"
          >
            <ExternalLink size={18} />
            Open in Tab
          </a>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-gray-800">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center max-w-md">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
              <h3 className="text-white text-xl font-bold mb-2">Failed to Load PDF</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <a 
                href={fullPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                <ExternalLink size={18} />
                Open Directly
              </a>
            </div>
          </div>
        )}
        
        <iframe
          src={fullPdfUrl}
          className="w-full h-full border-0"
          title={paperTitle}
          onError={() => setError('PDF failed to load. Click "Open in Tab" to view directly.')}
        />
      </div>

      {/* Footer Warning */}
      <div className="bg-red-900 px-6 py-3 text-center z-40">
        <p className="text-white text-sm font-semibold">
          ⚠️ Protected Document - Viewing Tracked - Unauthorized Distribution Prohibited
        </p>
      </div>

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-20 left-4 bg-black/80 text-white text-xs p-3 rounded z-50 max-w-md">
          <p className="font-bold mb-1">Debug Info:</p>
          <p className="break-all">API: {API_BASE}</p>
          <p className="break-all">Path: {cleanPath}</p>
          <p className="break-all">Full: {fullPdfUrl}</p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;