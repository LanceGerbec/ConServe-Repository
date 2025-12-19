import { X, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const fullUrl = `${import.meta.env.VITE_API_URL}${pdfUrl}?token=${token}`;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} />
          <div>
            <h3 className="text-white font-semibold">{paperTitle}</h3>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-800 text-white rounded-lg">
          <X size={20} />
        </button>
      </div>

      <iframe src={fullUrl} className="flex-1 w-full border-0" title={paperTitle} />

      <div className="bg-red-900 px-6 py-3 text-center">
        <p className="text-white text-sm font-semibold">⚠️ Protected Document</p>
      </div>
    </div>
  );
};

export default PDFViewer;