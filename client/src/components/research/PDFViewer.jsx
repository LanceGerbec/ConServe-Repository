import { X, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  
  // Build full backend URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const fullPdfUrl = `${backendUrl}${pdfUrl}`;

  console.log('PDF URL:', fullPdfUrl);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-50 select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 text-4xl font-bold rotate-[-45deg]">
          {user?.email} • {new Date().toLocaleString()}
        </div>
      </div>

      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          
           <a href={fullPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <ExternalLink size={18} />
            <span className="text-sm">Open</span>
          </a>
          <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-800">
        <iframe
          src={fullPdfUrl}
          className="w-full h-full border-0"
          title={paperTitle}
        />
      </div>

      <div className="bg-red-900 px-6 py-3 text-center z-40">
        <p className="text-white text-sm font-semibold">
          ⚠️ Protected Document - Unauthorized Distribution Prohibited
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;