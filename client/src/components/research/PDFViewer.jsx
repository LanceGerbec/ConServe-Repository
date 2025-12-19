import { useState } from 'react';
import { X, AlertCircle, FileText, ExternalLink, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState(false);

  // Direct PDF URL - browsers will handle it
  const directPdfUrl = pdfUrl;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-50 select-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 text-4xl font-bold rotate-[-45deg] whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()} • ConServe
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold line-clamp-1">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">Viewing as: {user?.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
          <X size={20} />
        </button>
      </div>

      {/* PDF Container */}
      <div className="flex-1 relative overflow-hidden bg-gray-800">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Cannot Display PDF</h3>
            <p className="text-gray-400 mb-6">Click below to open the PDF</p>
            <a 
              href={directPdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-navy text-white px-8 py-3 rounded-lg hover:bg-navy-800"
            >
              <ExternalLink size={18} />
              Open PDF
            </a>
          </div>
        ) : (
          <iframe
            src={directPdfUrl}
            className="w-full h-full border-0"
            title={paperTitle}
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-red-900/90 px-6 py-3 text-center z-40 border-t border-red-800">
        <p className="text-white text-sm font-semibold">
          ⚠️ Protected Document - Unauthorized Distribution Prohibited
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;