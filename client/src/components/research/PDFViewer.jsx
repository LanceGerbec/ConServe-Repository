import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    console.log('📄 Loading PDF:', pdfUrl);
    
    // Disable right-click
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable screenshot shortcuts
    const disableScreenshot = (e) => {
      // Disable Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Screenshots are disabled for security reasons');
      }
      // Disable Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('Printing is disabled for security reasons');
      }
      // Disable Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert('Saving is disabled for security reasons');
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableScreenshot);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableScreenshot);
    };
  }, [pdfUrl]);

  const handleLoad = () => {
    console.log('✅ PDF loaded successfully');
    setLoading(false);
    setError(false);
  };

  const handleError = (e) => {
    console.error('❌ PDF load failed:', e);
    setLoading(false);
    setError(true);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Watermark Overlay - Multiple layers */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Top watermark */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-white/10 text-2xl font-bold rotate-[-45deg] select-none whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()} • ConServe
        </div>
        
        {/* Center watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 text-4xl font-bold rotate-[-45deg] select-none whitespace-nowrap">
          {user?.email} • {new Date().toLocaleString()}
        </div>
        
        {/* Bottom watermark */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/10 text-2xl font-bold rotate-[-45deg] select-none whitespace-nowrap">
          ConServe • {user?.email} • Protected Document
        </div>

        {/* Grid watermarks */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-8">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center justify-center text-white/5 text-xl font-bold rotate-[-45deg] select-none"
            >
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
        
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="text-white" size={18} />
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="text-white" size={18} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 relative overflow-auto bg-gray-800">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-lg">Loading PDF...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-30">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <p className="text-xl mb-2">Failed to load PDF</p>
            <p className="text-gray-400 mb-6">The document could not be displayed</p>
            
            <div className="flex gap-3">
              <a 
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-800 transition"
              >
                <Download size={18} />
                Open in New Tab
              </a>
              <button
                onClick={onClose}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* PDF Embed */}
        <div className="flex items-center justify-center min-h-full p-8">
          <div 
            className="bg-white shadow-2xl relative"
            style={{ 
              width: `${zoom}%`,
              minWidth: '600px',
              maxWidth: '1200px'
            }}
          >
            <embed
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              className="w-full min-h-screen"
              onLoad={handleLoad}
              onError={handleError}
            />
            
            {/* Overlay to prevent direct interaction */}
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* Additional watermark on PDF */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-900/5 text-6xl font-bold rotate-[-45deg] select-none whitespace-nowrap">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Warning */}
      <div className="bg-red-900/90 px-6 py-3 text-center z-40 border-t border-red-800">
        <p className="text-white text-sm font-semibold flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          ⚠️ Protected Document - Watermarked • Screenshots Disabled • Unauthorized Distribution Prohibited
        </p>
      </div>

      {/* Disable selection globally */}
      <style>{`
        body { user-select: none !important; }
        * { user-select: none !important; }
        embed { pointer-events: auto; }
      `}</style>
    </div>
  );
};

export default PDFViewer;