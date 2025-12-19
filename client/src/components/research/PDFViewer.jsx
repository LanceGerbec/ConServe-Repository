import { X, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const PDFViewer = ({ signedPdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const fullPdfUrl = `${API_BASE}${signedPdfUrl}`;
  
  console.log('🔗 Signed PDF URL:', fullPdfUrl);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-50 select-none">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-white/8 text-2xl font-bold rotate-[-45deg] whitespace-nowrap"
            style={{ 
              top: `${20 + i * 15}%`, 
              left: '50%', 
              transform: 'translateX(-50%) rotate(-45deg)' 
            }}
          >
            {user?.email} • {new Date().toLocaleString()}
          </div>
        ))}
      </div>

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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <ExternalLink size={18} />
            Open in Tab
          </a>
          <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-800">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center max-w-md">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
              <h3 className="text-white text-xl font-bold mb-2">Failed to Load PDF</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <a href={fullPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg">
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
          onError={() => setError('PDF failed to load')}
        />
      </div>

      <div className="bg-red-900 px-6 py-3 text-center z-40">
        <p className="text-white text-sm font-semibold">
          ⚠️ Protected Document - Viewing Tracked - Link expires in 1 hour
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;